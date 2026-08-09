/**
 * 카드2 목업을 원본/구현 PNG 에서 실측한다.
 *   - 블롭 4개: 색 계열별 강도 가중 중심(centroid) 과 피크 위치
 *   - 그리드 라인: 세로선 x 좌표에서 간격 산출
 * 블롭은 blur 로 경계가 없어 "중심"으로 비교한다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

// 카드2 목업 영역 (CSS px) — 카드2 내부 x 544~896, 목업 y 889~1074
const X0 = 544
const X1 = 896
const Y0 = 889
const Y1 = 1074

const targets = [
  ['원본', path.join(ROOT, 'reference', '01-home.png')],
  ['구현', path.join(ROOT, 'screenshots', 'impl-home.png')],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file] of targets) {
  const res = await page.evaluate(
    async ([src, x0, x1, y0, y1]) => {
      const img = await new Promise((r, j) => {
        const i = new Image()
        i.onload = () => r(i)
        i.onerror = j
        i.src = src
      })
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const RW = (x1 - x0) * 2
      const RH = (y1 - y0) * 2
      const d = ctx.getImageData(x0 * 2, y0 * 2, RW, RH).data

      const BG = 24
      // 계열 분류: 배경 대비 증가분으로 판단
      const families = { green: [], yellow: [], blue: [], orange: [] }
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i] - BG
        const G = d[i + 1] - BG
        const B = d[i + 2] - BG
        const strength = Math.max(R, G, B)
        if (strength < 6) continue // 배경/그리드 노이즈 제외
        let fam = null
        if (G > R && G > B) fam = 'green'
        else if (B > R && B > G) fam = 'blue'
        else if (R >= G && R >= B) {
          // 노랑(G/R 높음) vs 주황(G/R 낮음)
          fam = G / Math.max(R, 1) > 0.68 ? 'yellow' : 'orange'
        }
        if (!fam) continue
        const idx = i / 4
        families[fam].push([idx % RW, (idx / RW) | 0, strength])
      }

      const centroid = (arr) => {
        if (!arr.length) return null
        let sw = 0
        let sx = 0
        let sy = 0
        let peak = [0, 0, -1]
        for (const [x, y, w] of arr) {
          sw += w
          sx += x * w
          sy += y * w
          if (w > peak[2]) peak = [x, y, w]
        }
        return {
          centerX: +(sx / sw / 2).toFixed(1),
          centerY: +(sy / sw / 2).toFixed(1),
          peakX: +(peak[0] / 2).toFixed(1),
          peakY: +(peak[1] / 2).toFixed(1),
          peakStrength: peak[2],
          pixels: arr.length,
        }
      }

      // 그리드 세로선: 블롭이 없는 상단 우측 띠에서 열별 평균 밝기의 극대점을 찾는다
      const bandY0 = 4
      const bandY1 = 16
      const cols = []
      for (let x = 0; x < RW; x++) {
        let s = 0
        for (let y = bandY0 * 2; y < bandY1 * 2; y++) s += d[(y * RW + x) * 4]
        cols.push(s / ((bandY1 - bandY0) * 2))
      }
      const lineXs = []
      for (let x = 1; x < RW - 1; x++) {
        if (cols[x] > cols[x - 1] && cols[x] >= cols[x + 1] && cols[x] - BG > 0.4) {
          if (!lineXs.length || x / 2 - lineXs[lineXs.length - 1] > 8) lineXs.push(+(x / 2).toFixed(1))
        }
      }
      const gaps = lineXs.slice(1).map((v, i) => +(v - lineXs[i]).toFixed(1))

      return {
        blobs: {
          green: centroid(families.green),
          yellow: centroid(families.yellow),
          blue: centroid(families.blue),
          orange: centroid(families.orange),
        },
        gridLineXs: lineXs.slice(0, 10),
        gridGaps: gaps.slice(0, 9),
      }
    },
    [toDataUrl(file), X0, X1, Y0, Y1]
  )

  console.log(`\n[${label}]  (좌표는 목업 좌상단 기준 CSS px)`)
  for (const [k, v] of Object.entries(res.blobs)) {
    console.log(
      `   ${k.padEnd(7)} 중심 (${v ? v.centerX : '-'}, ${v ? v.centerY : '-'})   피크 (${v ? v.peakX : '-'}, ${v ? v.peakY : '-'})   강도 ${v ? v.peakStrength : '-'}   픽셀 ${v ? v.pixels : 0}`
    )
  }
  console.log(`   그리드 세로선 x: ${res.gridLineXs.join(', ')}`)
  console.log(`   그리드 간격: ${res.gridGaps.join(', ')}`)
}

await browser.close()
