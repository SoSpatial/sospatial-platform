/**
 * 배포 준비 항목 실측 — head 태그, noindex, 마우스 클릭 포커스, 고대비 모드
 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ── head 태그 ────────────────────────────────────────────────────
await page.goto('http://localhost:3000/')
await page.waitForLoadState('networkidle')
const head = await page.evaluate(() => {
  const g = (sel, attr) => [...document.querySelectorAll(sel)].map((e) => e.getAttribute(attr))
  return {
    lang: document.documentElement.lang,
    title: document.title,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogType: document.querySelector('meta[property="og:type"]')?.content,
    ogUrl: document.querySelector('meta[property="og:url"]')?.content,
    ogLocale: document.querySelector('meta[property="og:locale"]')?.content,
    ogSiteName: document.querySelector('meta[property="og:site_name"]')?.content,
    twCard: document.querySelector('meta[name="twitter:card"]')?.content,
    preconnect: g('link[rel="preconnect"]', 'href'),
    icons: g('link[rel="icon"], link[rel="apple-touch-icon"]', 'href'),
  }
})
console.log('■ head (홈)')
console.log(JSON.stringify(head, null, 2))

// ── 플레이스홀더 noindex ──────────────────────────────────────────
console.log('\n■ 플레이스홀더 robots 메타')
for (const r of ['/data', '/projects', '/maps', '/terms', '/privacy', '/', '/request']) {
  await page.goto('http://localhost:3000' + r)
  const m = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content ?? '(없음)')
  console.log(`   ${r.padEnd(11)} ${m}`)
}

// ── 마우스 클릭 포커스 (source 폼 전 컨트롤) ────────────────────
console.log('\n■ 마우스 클릭 시 포커스 링 (/request/source)')
await page.goto('http://localhost:3000/request/source')
await page.waitForLoadState('networkidle')
const controls = await page.locator('input, select, textarea').all()
for (const el of controls.slice(0, 12)) {
  await el.click({ force: true })
  const r = await el.evaluate((e) => {
    const cs = getComputedStyle(e)
    return {
      tag: e.tagName.toLowerCase() + (e.type ? `[${e.type}]` : ''),
      fv: e.matches(':focus-visible'),
      // outline-style 이 none 이면 폭 값과 무관하게 링은 그려지지 않는다
      drawn: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
      style: `${cs.outlineStyle} ${cs.outlineWidth}`,
    }
  })
  console.log(`   ${r.tag.padEnd(20)} :focus-visible ${r.fv ? 'O' : 'X'}  링 ${r.drawn ? '그려짐' : '없음'}  (${r.style})`)
}

// ── 고대비 모드 ──────────────────────────────────────────────────
console.log('\n■ prefers-contrast: more')
for (const mode of [null, 'more']) {
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, contrast: mode ?? 'no-preference' })
  await p2.goto('http://localhost:3000/request/source')
  await p2.waitForLoadState('networkidle')
  const v = await p2.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    const counter = [...document.querySelectorAll('*')].find((e) =>
      /^\d+\s*\/\s*\d+$/.test(e.textContent?.trim() || '')
    )
    return {
      ink25: cs.getPropertyValue('--color-ink-25').trim(),
      ink30: cs.getPropertyValue('--color-ink-30').trim(),
      counterColor: counter ? getComputedStyle(counter).color : '(없음)',
      counterText: counter?.textContent?.trim(),
    }
  })
  console.log(`   ${mode ?? 'no-preference'}:`, JSON.stringify(v))
  await p2.close()
}

await browser.close()
