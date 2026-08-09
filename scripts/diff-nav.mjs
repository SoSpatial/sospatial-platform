/**
 * 네비 영역 픽셀 차분 — /, /data, /projects, /maps 4개 라우트 전부
 * reference/01-home.png 상단 64px(=2880×128 @2x) 을 기준으로 각각 비교한다.
 * file:// 이미지는 캔버스를 오염시키므로 data URL 로 인라인한다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const refUrl = toDataUrl(path.join(ROOT, 'reference', '01-home.png'))
const ROUTES = [
  ['/', 'impl-home.png'],
  ['/data', 'impl-data.png'],
  ['/projects', 'impl-projects.png'],
  ['/maps', 'impl-maps.png'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 800, height: 300 } })
await page.setContent('<body></body>')

const results = []
for (const [route, file] of ROUTES) {
  const implUrl = toDataUrl(path.join(OUT, file))
  const r = await page.evaluate(
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

      const W = 2880
      const H = 128 // 네비 64px @2x
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

      let n = 0
      let sum = 0
      let maxD = 0
      let minX = W
      let maxX = 0
      let minY = H
      let maxY = 0
      for (let i = 0; i < a.length; i += 4) {
        const d = Math.max(
          Math.abs(a[i] - b[i]),
          Math.abs(a[i + 1] - b[i + 1]),
          Math.abs(a[i + 2] - b[i + 2])
        )
        sum += d
        if (d > maxD) maxD = d
        if (d > 16) {
          n++
          const p = i / 4
          const x = p % W
          const y = (p / W) | 0
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
      return {
        diffPixels: n,
        diffPercent: +((n / (W * H)) * 100).toFixed(3),
        avgDelta: +(sum / (W * H)).toFixed(2),
        maxDelta: maxD,
        bbox: n
          ? {
              x0: Math.round(minX / 2),
              y0: Math.round(minY / 2),
              x1: Math.round(maxX / 2),
              y1: Math.round(maxY / 2),
            }
          : null,
      }
    },
    [refUrl, implUrl]
  )
  results.push({ route, ...r })
}

console.log('라우트별 네비 영역 차분 (기준: reference/01-home.png 상단 64px)\n')
for (const r of results) {
  console.log(
    `  ${r.route.padEnd(11)} 차이 ${String(r.diffPercent).padStart(6)}%  ` +
      `(${String(r.diffPixels).padStart(5)}px)  평균델타 ${r.avgDelta}  ` +
      `영역 x${r.bbox.x0}–${r.bbox.x1} y${r.bbox.y0}–${r.bbox.y1}`
  )
}

// 4개 라우트가 서로 동일한지 (레이아웃 공통 컴포넌트이므로 같아야 정상)
const same = results.every((r) => r.diffPixels === results[0].diffPixels)
console.log(
  `\n  4개 라우트 네비 동일 여부: ${same ? '동일 (공통 레이아웃 정상)' : '★ 라우트마다 다름 — 확인 필요'}`
)

fs.writeFileSync(path.join(OUT, 'nav-diff-all.json'), JSON.stringify(results, null, 2))
await browser.close()
