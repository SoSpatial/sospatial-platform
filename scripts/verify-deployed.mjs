/**
 * 배포 후 점검 — 실제 배포 URL 로 전부 확인한다.
 *
 * 사용: node scripts/verify-deployed.mjs https://sospatial-platform.vercel.app [--meta-only]
 *
 * 확인 항목
 *   1. 12개 라우트 응답 (실 콘텐츠 10 + 플레이스홀더 2), 404 없음
 *   2. og:url / og:image / metadataBase 의 절대 URL
 *   3. sitemap.xml / robots.txt 의 절대 URL (sitemap 7개 라우트 — /data 포함)
 *   4. OG 이미지 직접 접근 — 200 + PNG 1200x630
 *   5. favicon / apple-touch-icon 200
 *   6. Pretendard 실제 로드 여부 (document.fonts + 폭 실측)
 *   7. noindex 유지 — /data/select /projects /maps /terms /privacy (작업 화면·플레이스홀더)
 *   8. 2단계 화면 픽셀·computed 검증 — 화면별 지정 스크립트를 BASE_URL 로 위임 실행
 *      (CLAUDE.md 2단계 "완료 범위와 검증 방식" — 스크립트가 화면마다 다르므로
 *       여기서 직접 찍지 않고 반드시 해당 스크립트를 호출한다. --meta-only 로 생략 가능)
 *
 * 1단계 6페이지의 픽셀 차분은 로컬=배포 동일이 이미 확인됐다 (CLAUDE.md 1단계 기준선).
 * 필요 시 BASE_URL 을 주고 verify-page.mjs / verify-upload.mjs 를 개별 실행한다.
 */
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const BASE = (process.argv[2] || '').replace(/\/$/, '')
if (!BASE) {
  console.error('사용: node scripts/verify-deployed.mjs <배포 URL> [--meta-only]')
  process.exit(1)
}
const META_ONLY = process.argv.includes('--meta-only')
const origin = new URL(BASE).origin

/** sitemap 에 있어야 하는 라우트 (lib/site.ts SITEMAP_ROUTES 와 일치해야 한다) */
const ROUTES = ['/', '/api', '/data', '/request', '/request/source', '/request/upload', '/request/describe', '/terms', '/privacy']
/** noindex 여야 하는 라우트 — 작업 화면 3 + 인증 화면 2 (CLAUDE.md 색인 정책.
 *  /terms /privacy 는 3단계 5번에서 실 내용이 채워져 색인 대상으로 이동) */
const NOINDEX = ['/data/select', '/projects', '/maps', '/login', '/signup']

let fail = 0
const bad = (msg) => {
  fail++
  return `✗ ${msg}`
}
const ok = (msg) => `✓ ${msg}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ── 1. 라우트 응답 ────────────────────────────────────────────────
console.log('■ 라우트 응답')
for (const r of [...ROUTES, ...NOINDEX]) {
  const res = await page.goto(BASE + r, { waitUntil: 'domcontentloaded' })
  const s = res.status()
  console.log(`   ${s === 200 ? ok('') : bad('')}${r.padEnd(19)} ${s}`)
}
{
  const res = await page.goto(BASE + '/이런-라우트는-없다', { waitUntil: 'domcontentloaded' })
  console.log(`   ${res.status() === 404 ? ok('') : bad('')}없는 경로            ${res.status()} (404 여야 정상)`)
}

// ── 2. 메타 절대 URL ──────────────────────────────────────────────
console.log('\n■ 메타 절대 URL')
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
const meta = await page.evaluate(() => {
  const c = (s) => document.querySelector(s)?.getAttribute('content') ?? null
  return {
    ogUrl: c('meta[property="og:url"]'),
    ogImage: c('meta[property="og:image"]'),
    twImage: c('meta[name="twitter:image"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    icon: document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? null,
    apple: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ?? null,
  }
})
for (const [k, v] of Object.entries(meta)) {
  if (v === null) {
    console.log(`   - ${k.padEnd(10)} (없음)`)
    continue
  }
  const abs = v.startsWith('http')
  const right = !abs || v.startsWith(origin)
  console.log(`   ${right ? ok('') : bad('')}${k.padEnd(10)} ${v}`)
  if (abs && !right) console.log(`     ↑ ${origin} 로 시작해야 한다`)
}

// ── 3. sitemap / robots ───────────────────────────────────────────
console.log('\n■ sitemap.xml / robots.txt')
for (const f of ['/sitemap.xml', '/robots.txt']) {
  const res = await page.request.get(BASE + f)
  const body = await res.text()
  const urls = [...body.matchAll(/https?:\/\/[^\s<"]+/g)]
    .map((m) => m[0])
    // sitemap 의 xmlns 는 스펙이 정한 고정 URL 이라 오리진 검사 대상이 아니다
    .filter((u) => !u.startsWith('http://www.sitemaps.org/'))
  const wrong = urls.filter((u) => !u.startsWith(origin))
  console.log(`   ${res.status() === 200 && !wrong.length ? ok('') : bad('')}${f} ${res.status()} — URL ${urls.length}개`)
  if (wrong.length) console.log(`     다른 오리진: ${[...new Set(wrong)].join(', ')}`)
  else if (urls.length) console.log(`     예: ${urls[0]}`)
}
{
  const res = await page.request.get(BASE + '/sitemap.xml')
  const body = await res.text()
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(origin, '') || '/')
  const missing = ROUTES.filter((r) => !locs.includes(r))
  const extra = locs.filter((l) => !ROUTES.includes(l))
  console.log(`   ${!missing.length && !extra.length ? ok('') : bad('')}sitemap 라우트 ${locs.length}개`)
  if (missing.length) console.log(`     누락: ${missing.join(', ')}`)
  if (extra.length) console.log(`     불필요: ${extra.join(', ')}`)
}

// ── 4. OG 이미지 실물 ─────────────────────────────────────────────
console.log('\n■ OG 이미지 직접 접근')
{
  const res = await page.request.get(meta.ogImage)
  const buf = Buffer.from(await res.body())
  const isPng = buf.subarray(1, 4).toString() === 'PNG'
  const w = isPng ? buf.readUInt32BE(16) : 0
  const h = isPng ? buf.readUInt32BE(20) : 0
  const good = res.status() === 200 && w === 1200 && h === 630
  console.log(`   ${good ? ok('') : bad('')}${res.status()} ${res.headers()['content-type']} ${w}x${h} ${(buf.length / 1024).toFixed(1)}KB`)
}

// ── 5. 아이콘 ─────────────────────────────────────────────────────
console.log('\n■ 아이콘')
for (const [label, href] of [['icon.svg', meta.icon], ['apple-icon', meta.apple]]) {
  const res = await page.request.get(new URL(href, BASE).href)
  console.log(`   ${res.status() === 200 ? ok('') : bad('')}${label.padEnd(11)} ${res.status()} ${res.headers()['content-type']}`)
}

// ── 6. Pretendard 로드 ────────────────────────────────────────────
console.log('\n■ Pretendard 로드 여부')
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const font = await page.evaluate(() => {
  const loaded = [...document.fonts].filter((f) => f.family.includes('Pretendard') && f.status === 'loaded')
  // 같은 텍스트를 Pretendard 로, 그리고 폴백으로 재서 폭이 다른지 본다
  const mk = (family) => {
    const s = document.createElement('span')
    s.textContent = '흩어진 공간 데이터를 바로 쓸 수 있게'
    s.style.cssText = `position:absolute;white-space:pre;font-size:40px;font-family:${family}`
    document.body.appendChild(s)
    const w = s.getBoundingClientRect().width
    s.remove()
    return +w.toFixed(1)
  }
  // ★ 실제 스택("Pretendard Variable" …)으로 재야 한다.
  //   'Pretendard' 로만 재면 그 이름의 페이스가 없어 폴백 폭이 잡히고,
  //   폴백끼리 비교하게 돼 검사가 무의미해진다.
  const stack = getComputedStyle(document.body).fontFamily
  return {
    faces: loaded.length,
    families: [...new Set(loaded.map((f) => f.family))],
    bodyFontFamily: stack,
    wActual: mk(stack),
    wFallback: mk('serif'),
    wSans: mk('sans-serif'),
  }
})
// 로드된 페이스가 있고, 실제 스택 폭이 어떤 폴백 폭과도 다르면 Pretendard 로 렌더된 것이다
const fontOk = font.faces > 0 && font.wActual !== font.wFallback && font.wActual !== font.wSans
console.log(`   ${fontOk ? ok('') : bad('')}로드된 Pretendard face ${font.faces}개 ${JSON.stringify(font.families)}`)
console.log(`     body font-family: ${font.bodyFontFamily}`)
console.log(`     한글 40px 폭 — 실제 ${font.wActual} / serif ${font.wFallback} / sans-serif ${font.wSans}`)

// ── 7. noindex 유지 (작업 화면 + 플레이스홀더) ────────────────────
console.log('\n■ noindex 유지')
for (const r of NOINDEX) {
  await page.goto(BASE + r, { waitUntil: 'domcontentloaded' })
  const m = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content ?? '(없음)')
  console.log(`   ${m.includes('noindex') ? ok('') : bad('')}${r.padEnd(13)} ${m}`)
}
// 색인 대상은 noindex 가 없어야 한다 — /data 가 2단계에서 해제됐는지 확인
for (const r of ['/', '/data']) {
  await page.goto(BASE + r, { waitUntil: 'domcontentloaded' })
  const m = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content ?? '(없음)')
  console.log(`   ${m.includes('noindex') ? bad('') : ok('')}${r.padEnd(13)} ${m} (noindex 없어야 정상)`)
}

await browser.close()

// ── 8. 2단계 화면 검증 스크립트 위임 실행 ─────────────────────────
//   각 스크립트가 BASE_URL 환경변수로 배포 URL 을 받아 로컬과 동일한 절차로 잰다.
//   차분 수치의 합격 기준은 CLAUDE.md "회귀 기준선 (신규 4화면)" 표와의 대조 —
//   여기서 자동 판정하지 않고 출력을 그대로 남긴다 (select 는 스크롤바 마스킹 수치,
//   maps 는 blur 환경 차이 등 화면별 해석 규칙이 표에 붙어 있기 때문).
if (!META_ONLY) {
  const STAGE2 = [
    ['data landing', 'verify-page.mjs', ['/data', '02-data-landing.png', 'data-deployed']],
    ['data select', 'verify-select.mjs', []],
    ['projects 목록·상세', 'verify-projects.mjs', []],
    ['maps', 'verify-maps.mjs', []],
    ['저장·공유 모달 (computed 59항목)', 'verify-modals.mjs', []],
  ]
  for (const [label, script, args] of STAGE2) {
    console.log(`\n■ 2단계 — ${label} (${script})`)
    const r = spawnSync(process.execPath, [path.join('scripts', script), ...args], {
      env: { ...process.env, BASE_URL: BASE },
      stdio: 'inherit',
    })
    if (r.status !== 0) {
      fail++
      console.log(`✗ ${script} 종료 코드 ${r.status}`)
    }
  }
  console.log('\n※ 위 차분 수치는 CLAUDE.md "회귀 기준선 (신규 4화면)" 표와 대조할 것.')
}

console.log(`\n${fail === 0 ? '전부 통과' : `실패 ${fail}건`}`)
process.exit(fail === 0 ? 0 : 1)
