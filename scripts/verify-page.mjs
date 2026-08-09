/**
 * 범용 페이지 검증 — 전체 페이지 촬영 + reference 픽셀 차분 + 구간별 차이 집계
 *
 * 사용: node scripts/verify-page.mjs <route> <referenceFile> [name]
 * 예:   node scripts/verify-page.mjs /api 07-api.png api
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , route = '/', refFile = '01-home.png', name = 'page'] = process.argv

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
fs.mkdirSync(OUT, { recursive: true })
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000' + route)
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(700)

const implPath = path.join(OUT, `impl-${name}.png`)
await page.screenshot({ path: implPath, fullPage: true })

// ── 차분 ────────────────────────────────────────────────────────────
const refPath = path.join(ROOT, 'reference', refFile)
const cmp = await page.evaluate(
  async ([refSrc, implSrc]) => {
    const load = (src) =>
      new Promise((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = src
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
    const delta = (p, q) =>
      Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]))

    let n = 0
    let sum = 0
    let nTol = 0 // ±2 이미지픽셀(=±1 CSS px) 세로 정렬 오차를 허용한 차이
    const rowBuckets = {}
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = px(a, x, y)
        const q = px(b, x, y)
        const d = delta(p, q)
        sum += d
        if (d > 16) {
          n++
          const bucket = (((y / 2 / 20) | 0) * 20)
          rowBuckets[bucket] = (rowBuckets[bucket] || 0) + 1

          // 구현을 위/아래로 최대 2px 옮겨도 여전히 다른가?
          let best = d
          for (const dy of [-2, -1, 1, 2]) {
            const yy = y + dy
            if (yy < 0 || yy >= H) continue
            const dd = delta(p, px(b, x, yy))
            if (dd < best) best = dd
          }
          if (best > 16) nTol++
        }
      }
    }
    const hotRows = Object.entries(rowBuckets)
      .sort((p, q) => q[1] - p[1])
      .slice(0, 12)
      .map(([y, c]) => ({ cssY: +y, px: c }))

    return {
      refSize: `${ref.width}x${ref.height}`,
      implSize: `${impl.width}x${impl.height}`,
      refCssHeight: ref.height / 2,
      implCssHeight: impl.height / 2,
      heightDelta: (impl.height - ref.height) / 2,
      comparedArea: `${W}x${H}`,
      diffPixels: n,
      diffPercent: +((n / (W * H)) * 100).toFixed(3),
      diffPixelsAligned: nTol,
      diffPercentAligned: +((nTol / (W * H)) * 100).toFixed(3),
      avgDelta: +(sum / (W * H)).toFixed(2),
      hotRows,
    }
  },
  [toDataUrl(refPath), toDataUrl(implPath)]
)

console.log(JSON.stringify(cmp, null, 2))
fs.writeFileSync(path.join(OUT, `diff-${name}.json`), JSON.stringify(cmp, null, 2))

await browser.close()
