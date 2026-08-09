/**
 * 카드3 말풍선 2개의 바운딩 박스를 원본/구현 PNG 에서 실측한다.
 *   액센트 말풍선 = #C4A882 로 채워져 있어 색으로 분리된다.
 *   중립 말풍선   = rgba(255,255,255,0.08) 위 0.1 보더 → 배경(#181818)보다 밝다.
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

// 카드3 목업 하단부 (CSS px). 리포트 카드(x<1123)는 제외한다.
const X0 = 1050
const X1 = 1272
const Y0 = 1000
const Y1 = 1080

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
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const region = ctx.getImageData(x0 * 2, y0 * 2, (x1 - x0) * 2, (y1 - y0) * 2).data
      const RW = (x1 - x0) * 2

      const bbox = (test) => {
        let mnX = 1e9
        let mxX = -1
        let mnY = 1e9
        let mxY = -1
        for (let i = 0; i < region.length; i += 4) {
          const p = [region[i], region[i + 1], region[i + 2]]
          if (!test(p)) continue
          const idx = i / 4
          const x = idx % RW
          const y = (idx / RW) | 0
          if (x < mnX) mnX = x
          if (x > mxX) mxX = x
          if (y < mnY) mnY = y
          if (y > mxY) mxY = y
        }
        if (mxX < 0) return null
        return {
          left: x0 + mnX / 2,
          right: x0 + (mxX + 1) / 2,
          top: y0 + mnY / 2,
          bottom: y0 + (mxY + 1) / 2,
          w: (mxX + 1 - mnX) / 2,
          h: (mxY + 1 - mnY) / 2,
        }
      }

      // 액센트: R 이 크고 B 가 작음
      const accent = bbox((p) => p[0] > 150 && p[2] < 160 && p[0] - p[2] > 40)
      // 중립 말풍선: 배경(24,24,24)보다 밝고 채도 낮음
      const neutral = bbox(
        (p) => p[0] > 30 && p[0] < 120 && Math.max(...p) - Math.min(...p) < 12
      )
      return { accent, neutral }
    },
    [toDataUrl(file), X0, X1, Y0, Y1]
  )

  console.log(`\n[${label}]`)
  console.log('   액센트 말풍선 ', JSON.stringify(r.accent))
  console.log('   중립  말풍선 ', JSON.stringify(r.neutral))
}

await browser.close()
