/**
 * /maps 검증 촬영
 *   reference/06-maps.png 은 1440×964 (네비 64 + 지도 900) — 100vh 앱 화면이라
 *   viewport 를 964 로 맞추면 페이지 전체가 정확히 한 화면이다 (하단 48px 정규화 비해당).
 *   블롭·backdrop-blur 는 환경 차이 4(blur 커널) 기준 — 기하·색이 맞으면 통과.
 *   fullPage 캡처는 animations:'disabled' (CLAUDE.md 검증 절차).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(OUT, { recursive: true })
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 964 }, deviceScaleFactor: 2 })

const BASE = process.env.BASE_URL || 'http://localhost:3000'
await page.goto(BASE + '/maps')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

console.log('페이지 전체 높이(css)    :', await page.evaluate(() => document.documentElement.scrollHeight))
console.log('body 세로 스크롤 여부    :', await page.evaluate(() => document.documentElement.scrollHeight > document.documentElement.clientHeight))
await page.screenshot({ path: path.join(OUT, 'impl-maps.png'), fullPage: true, animations: 'disabled' })

// ── 차분 ──
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
  [toDataUrl(path.join(process.cwd(), 'reference', '06-maps.png')), toDataUrl(path.join(OUT, 'impl-maps.png'))]
)
console.log('\n차분:', JSON.stringify(cmp, null, 2))

await browser.close()
