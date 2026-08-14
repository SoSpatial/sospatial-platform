/**
 * /projects 검증 촬영
 *   reference 04(목록)·05(상세)는 시드 3건 상태로 캡처돼 있다 — 시드는 앱에 없으므로
 *   (원본도 초기 상태는 빈 목록) localStorage 주입으로 같은 상태를 재현한 뒤 비교한다.
 *   시드의 결함(빈 desc, shareColors 에 없는 '공유받음' → fallback 회색, region 에
 *   "서울특별시 강남구" 한 문자열)까지 reference 실측 그대로다 — 고치지 말 것.
 *
 *   목록은 1행 체크박스가 체크된 상태(04 실측), 상세는 1행(서울 상권 분석 2024).
 *   fullPage 캡처는 animations:'disabled' (CLAUDE.md 검증 절차 — pageEnter 리스타트 방지).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(OUT, { recursive: true })
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const SEED = [
  {
    id: 1,
    name: '서울 상권 분석 2024',
    starred: true,
    date: '2024.11.12',
    sharing: '내가 공유',
    variables: [
      { name: '유동인구 총계', desc: '', unit: '행정동', region: '서울특별시 강남구', subRegion: '', year: '2024' },
      { name: '카드매출 총액', desc: '', unit: '행정동', region: '서울특별시 강남구', subRegion: '', year: '2024' },
      { name: '사업체 수', desc: '', unit: '행정동', region: '서울특별시 강남구', subRegion: '', year: '2024' },
    ],
  },
  { id: 2, name: '부산 교통량 추이', starred: false, date: '2024.10.28', sharing: '공유 안함', variables: [] },
  { id: 3, name: '전국 인구밀도 비교', starred: false, date: '2024.09.03', sharing: '공유받음', variables: [] },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.addInitScript((seed) => {
  localStorage.setItem('sospatial_projects', JSON.stringify(seed))
}, SEED)

const BASE = process.env.BASE_URL || 'http://localhost:3000'
await page.goto(BASE + '/projects')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

const shot = (file) =>
  page.screenshot({ path: path.join(OUT, file), fullPage: true, animations: 'disabled' })

// ① 목록 — 1행 체크 (04 실측 상태). 체크박스는 래퍼 div 가 클릭을 받는다 (:884)
const row1 = page.locator('div:has(> div > input[type=checkbox])', {
  hasText: '서울 상권 분석 2024',
})
await row1.locator('> div').first().click()
console.log('행 수                   :', (await page.locator('div:has(> div > input[type=checkbox])').count()) - 1)
await shot('impl-projects-list.png')

// ② 상세 — 1행 클릭
await page.getByText('서울 상권 분석 2024', { exact: true }).click()
await page.waitForTimeout(300)
console.log('상세 진입               :', await page.getByText('저장일 2024.11.12', { exact: false }).isVisible())
await shot('impl-projects-detail.png')

// ③ 차분 ×2
await page.setContent('<body></body>')
const diff = async (refFile, implFile) =>
  page.evaluate(
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
      const dl = (p, q) =>
        Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]))
      let n = 0
      let nTol = 0
      let sum = 0
      const rowHits = new Map()
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
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
              const band = Math.floor(y / 2 / 20) * 20
              rowHits.set(band, (rowHits.get(band) ?? 0) + 1)
            }
          }
        }
      }
      const hotRows = [...rowHits.entries()]
        .sort((p, q) => q[1] - p[1])
        .slice(0, 8)
        .map(([cssY, count]) => ({ cssY, px: count }))
      return {
        refCssHeight: ref.height / 2,
        implCssHeight: impl.height / 2,
        comparedArea: `${W}x${H}`,
        diffPercent: +((n / (W * H)) * 100).toFixed(3),
        diffPercentAligned: +((nTol / (W * H)) * 100).toFixed(3),
        avgDelta: +(sum / (W * H)).toFixed(2),
        hotRows,
      }
    },
    [toDataUrl(path.join(process.cwd(), 'reference', refFile)), toDataUrl(path.join(OUT, implFile))]
  )

console.log('\n차분 (04 목록):', JSON.stringify(await diff('04-projects-list.png', 'impl-projects-list.png'), null, 2))
console.log('\n차분 (05 상세):', JSON.stringify(await diff('05-projects-detail.png', 'impl-projects-detail.png'), null, 2))

await browser.close()
