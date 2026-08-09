/**
 * 카드2 목업 — 방법 독립적 비교
 *  (1) R/G/B 채널별 강도 가중 무게중심 + 총량  → 블롭 분포가 같은지
 *  (2) 블롭이 없는 하단 우측 띠에서 그리드 세로선 간격
 *  (3) 목업 영역 좌우 절반별 채널 총량 → 좌우 배치 확인
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

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

      const ch = [0, 1, 2].map(() => ({ sum: 0, sx: 0, sy: 0 }))
      let halfL = [0, 0, 0]
      let halfR = [0, 0, 0]
      for (let i = 0; i < d.length; i += 4) {
        const idx = i / 4
        const x = idx % RW
        const y = (idx / RW) | 0
        for (let k = 0; k < 3; k++) {
          const v = Math.max(0, d[i + k] - BG)
          if (!v) continue
          ch[k].sum += v
          ch[k].sx += x * v
          ch[k].sy += y * v
          if (x < RW / 2) halfL[k] += v
          else halfR[k] += v
        }
      }
      const names = ['R', 'G', 'B']
      const channels = ch.map((o, k) => ({
        ch: names[k],
        cx: +(o.sx / o.sum / 2).toFixed(1),
        cy: +(o.sy / o.sum / 2).toFixed(1),
        total: Math.round(o.sum / 1000),
      }))

      // 그리드: 블롭이 없는 하단 우측 띠 (목업 기준 x 190~350, y 168~184)
      const bx0 = 190 * 2
      const bx1 = 350 * 2
      const by0 = 168 * 2
      const by1 = 184 * 2
      const cols = []
      for (let x = bx0; x < bx1; x++) {
        let s = 0
        for (let y = by0; y < by1; y++) s += d[(y * RW + x) * 4]
        cols.push({ x: x / 2, v: s / (by1 - by0) })
      }
      const peaks = []
      for (let i = 1; i < cols.length - 1; i++) {
        if (cols[i].v > cols[i - 1].v && cols[i].v >= cols[i + 1].v && cols[i].v - BG > 0.3) {
          if (!peaks.length || cols[i].x - peaks[peaks.length - 1] > 10) peaks.push(cols[i].x)
        }
      }
      const gaps = peaks.slice(1).map((v, i) => +(v - peaks[i]).toFixed(1))
      const lineVal = peaks.length ? +cols.find((o) => o.x === peaks[0]).v.toFixed(2) : null
      const baseVal = +Math.min(...cols.map((o) => o.v)).toFixed(2)

      return {
        channels,
        halfLeft: halfL.map((v) => Math.round(v / 1000)),
        halfRight: halfR.map((v) => Math.round(v / 1000)),
        gridXs: peaks,
        gridGaps: gaps,
        gridLineBrightness: lineVal,
        gridBaseBrightness: baseVal,
      }
    },
    [toDataUrl(file), X0, X1, Y0, Y1]
  )

  console.log(`\n[${label}]`)
  for (const c of res.channels) {
    console.log(`   ${c.ch} 채널  무게중심 (${c.cx}, ${c.cy})   총량 ${c.total}k`)
  }
  console.log(`   좌반부 RGB 총량 ${res.halfLeft.join(' / ')}k    우반부 ${res.halfRight.join(' / ')}k`)
  console.log(`   그리드 세로선 x: ${res.gridXs.join(', ')}`)
  console.log(`   그리드 간격: ${res.gridGaps.join(', ')}`)
  console.log(`   라인 밝기 ${res.gridLineBrightness} / 바탕 ${res.gridBaseBrightness}`)
}

await browser.close()
