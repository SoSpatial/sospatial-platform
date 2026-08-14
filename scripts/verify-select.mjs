/**
 * /data/select 검증 촬영
 *   reference/03-data-select.png 는 인구·사회 + 이동인구 + 행정동 + 서울특별시(6열)
 *   + 2024 + 변수 2개 체크 상태로 캡처돼 있으므로, 같은 state 를 클릭으로 재현한 뒤
 *   촬영해서 비교한다. 진입 직후(5열) 상태도 따로 남긴다.
 *
 *   ⚠ 필터 리스트 스크롤바는 원본에 스타일링이 없어 네이티브다 — 캡처 환경에 따라
 *   모양·폭이 달라지는 환경 차이 후보 (CLAUDE.md "원본과 달라지는 부분" 7번과 동류).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(OUT, { recursive: true })
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

/*
  reference 는 클래식(항상 표시) 스크롤바 환경에서 캡처됐다 — 필터 리스트 우측에
  15px 스크롤바가 보인다(실측 x 305-320 등 5개 컬럼). headless Chromium 은 오버레이
  스크롤바(스크롤 중에만 표시)이고 --disable-features 로도 바뀌지 않음을 확인했다.
  원본 CSS 에는 스크롤바 스타일링이 없으므로 이는 환경 차이다 (<select> 화살표와 동류).
  → 아래 diff 에서 해당 밴드를 마스킹한 수치를 함께 낸다. 두 수치를 모두 보고할 것.
*/
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

const BASE = process.env.BASE_URL || 'http://localhost:3000'
await page.goto(BASE + '/data/select?topic=' + encodeURIComponent('인구·사회'))
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

/*
  ⚠ fullPage 캡처는 captureBeyondViewport 리사이즈로 pageEnter 애니메이션을
  리스타트해 중간 프레임(디밍+3px 하강)을 잡을 수 있다 — 실측으로 확인됨.
  reference 는 정적 최종 상태이므로 animations:'disabled' 로 완료 상태를 찍는다.
*/
const shot = (file) =>
  page.screenshot({ path: path.join(OUT, file), fullPage: true, animations: 'disabled' })

// ① 진입 직후 (5열, 빈 테이블)
await shot('impl-data-select-entry.png')

// ② reference 상태 재현
await page.getByRole('button', { name: '이동인구', exact: true }).click()
await page.getByRole('button', { name: '행정동', exact: true }).click()
await page.getByRole('button', { name: '서울특별시', exact: true }).click()
await page.getByRole('button', { name: '2024', exact: true }).click()
const checkRow = async (name) => {
  await page
    .locator('div:has(> input[type=checkbox])', { hasText: name })
    .locator('input[type=checkbox]')
    .check()
}
await checkRow('생활인구 (시간별)')
await checkRow('유동인구 (OD)')
await page.waitForTimeout(400)
console.log('6열 모드                :', await page.locator('text=세부 지역 선택').isVisible())
console.log('선택 카운트             :', (await page.locator('text=개 선택').innerText()).trim())
await shot('impl-data-select.png')

// ③ 차분
await page.setContent('<body></body>')
const cmp = await page.evaluate(
  async ([refSrc, implSrc]) => {
    const load = (s) =>
      new Promise((r, j) => {
        const i = new Image()
        i.onload = () => r(i)
        i.onerror = j
        i.src = s
      })
    const ref = await load(refSrc)
    const impl = await load(implSrc)
    const W = Math.min(ref.width, impl.width)
    const H = Math.min(ref.height, impl.height)
    const mk = () => {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      return c
    }
    const ca = mk()
    const cb = mk()
    ca.getContext('2d').drawImage(ref, 0, 0)
    cb.getContext('2d').drawImage(impl, 0, 0)
    const a = ca.getContext('2d').getImageData(0, 0, W, H).data
    const b = cb.getContext('2d').getImageData(0, 0, W, H).data
    const px = (buf, x, y) => {
      const i = (y * W + x) * 4
      return [buf[i], buf[i + 1], buf[i + 2]]
    }
    const dl = (p, q) => Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]))
    /*
      reference 스크롤바 밴드 (CSS px, scan-row y=350 실측) — 스크롤 가능한 5개
      컬럼(주제/단위/지역/세부지역/년도) 우측 16px × 리스트 세로 구간.
      환경 차이이므로 마스킹 수치를 병기한다.
    */
    const SCROLLBAR_X = [
      [304, 320],
      [704, 720],
      [904, 920],
      [1104, 1120],
      [1304, 1320],
    ]
    const SCROLLBAR_Y = [244, 466]
    const inScrollbar = (cssX, cssY) =>
      cssY >= SCROLLBAR_Y[0] &&
      cssY < SCROLLBAR_Y[1] &&
      SCROLLBAR_X.some(([x0, x1]) => cssX >= x0 && cssX < x1)
    let n = 0
    let nTol = 0
    let nTolMasked = 0
    let maskedArea = 0
    let sum = 0
    const rowHits = new Map()
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const masked = inScrollbar(x / 2, y / 2)
        if (masked) maskedArea++
        const p = px(a, x, y)
        const d = dl(p, px(b, x, y))
        sum += d
        if (d > 16) {
          n++
          let best = d
          for (const dy of [-2, -1, 1, 2]) {
            const yy = y + dy
            if (yy < 0 || yy >= H) continue
            const dd = dl(p, px(b, x, yy))
            if (dd < best) best = dd
          }
          if (best > 16) {
            nTol++
            if (!masked) nTolMasked++
            const band = Math.floor(y / 2 / 20) * 20
            rowHits.set(band, (rowHits.get(band) ?? 0) + 1)
          }
        }
      }
    }
    const hotRows = [...rowHits.entries()]
      .sort((p, q) => q[1] - p[1])
      .slice(0, 10)
      .map(([cssY, count]) => ({ cssY, px: count }))
    return {
      refCssHeight: ref.height / 2,
      implCssHeight: impl.height / 2,
      comparedArea: `${W}x${H}`,
      diffPercent: +((n / (W * H)) * 100).toFixed(3),
      diffPercentAligned: +((nTol / (W * H)) * 100).toFixed(3),
      diffPercentAlignedNoScrollbar: +((nTolMasked / (W * H - maskedArea)) * 100).toFixed(3),
      avgDelta: +(sum / (W * H)).toFixed(2),
      hotRows,
    }
  },
  [
    toDataUrl(path.join(process.cwd(), 'reference', '03-data-select.png')),
    toDataUrl(path.join(OUT, 'impl-data-select.png')),
  ]
)
console.log('\n차분 (reference 상태 재현):', JSON.stringify(cmp, null, 2))

await browser.close()
