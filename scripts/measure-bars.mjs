/**
 * 리포트 목업의 막대 5개와 말풍선을 원본/구현 PNG 에서 직접 실측한다.
 * 막대는 채도 있는 색이라 배경(#242424)과 쉽게 분리된다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const targets = [
  ['원본', path.join(ROOT, 'reference', '01-home.png')],
  ['구현', path.join(ROOT, 'screenshots', 'impl-home.png')],
]

// 카드3 리포트 카드 영역 (CSS px)
const X0 = 940
const X1 = 1130
const Y0 = 960
const Y1 = 1030

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file] of targets) {
  const r = await page.evaluate(
    async ([src, x0, x1, y0, y1]) => {
      const img = await new Promise((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = src
      })
      const W = img.width
      const c = document.createElement('canvas')
      c.width = W
      c.height = img.height
      c.getContext('2d').drawImage(img, 0, 0)
      const ctx = c.getContext('2d')

      const px = (x, y) => {
        const d = ctx.getImageData(x * 2, y * 2, 1, 1).data
        return [d[0], d[1], d[2]]
      }
      // 채도가 있으면 막대(액센트/블루/그린), 없으면 배경
      const saturated = (p) => Math.max(...p) - Math.min(...p) > 18

      // 바닥선(baseline): 막대가 존재하는 가장 아래 y
      let baseline = -1
      for (let y = y1; y >= y0; y--) {
        let found = false
        for (let x = x0; x < x1; x++) {
          if (saturated(px(x, y))) {
            found = true
            break
          }
        }
        if (found) {
          baseline = y
          break
        }
      }

      // 막대별 x 구간과 top
      const bars = []
      let inBar = false
      let bx0 = 0
      for (let x = x0; x <= x1; x++) {
        const isBar = saturated(px(x, baseline))
        if (isBar && !inBar) {
          inBar = true
          bx0 = x
        } else if (!isBar && inBar) {
          inBar = false
          const cx = Math.round((bx0 + x - 1) / 2)
          let top = baseline
          for (let y = baseline; y >= y0; y--) {
            if (!saturated(px(cx, y))) break
            top = y
          }
          bars.push({
            x: bx0,
            w: x - bx0,
            top,
            h: baseline - top + 1,
            color: `rgb(${px(cx, baseline).join(',')})`,
          })
        }
      }
      return { baseline: baseline + 1, bars }
    },
    [toDataUrl(file), X0, X1, Y0, Y1]
  )

  console.log(`\n[${label}]  차트 바닥선 y=${r.baseline}`)
  r.bars.forEach((b, i) => {
    console.log(
      `   막대${i + 1}  x ${String(b.x).padStart(5)}  폭 ${b.w}  높이 ${String(b.h).padStart(5)}  ${b.color}`
    )
  })
  const gaps = r.bars.slice(1).map((b, i) => b.x - (r.bars[i].x + r.bars[i].w))
  console.log(`   간격: ${gaps.join(', ')}`)
}

await browser.close()
