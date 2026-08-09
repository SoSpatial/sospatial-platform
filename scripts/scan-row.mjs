/**
 * 가로 스캔 — 지정한 y 에서 색이 바뀌는 x 를 찾아 카드 좌우 경계를 실측한다.
 * 사용: node scripts/scan-row.mjs <refFile> <refY> <implFile> <implY>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , refFile, refY, implFile, implY] = process.argv
const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const targets = [
  ['원본', path.join(ROOT, 'reference', refFile), Number(refY)],
  ['구현', path.join(ROOT, 'screenshots', implFile), Number(implY)],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file, y] of targets) {
  const r = await page.evaluate(
    async ([src, cssY]) => {
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
      const row = c.getContext('2d').getImageData(0, cssY * 2, W, 1).data

      const key = (x) => `${row[x * 4]},${row[x * 4 + 1]},${row[x * 4 + 2]}`
      const runs = []
      let start = 0
      let cur = key(0)
      for (let x = 1; x < W; x++) {
        const k = key(x)
        if (k !== cur) {
          runs.push({ from: start / 2, to: x / 2, color: cur })
          start = x
          cur = k
        }
      }
      runs.push({ from: start / 2, to: W / 2, color: cur })
      return runs.filter((r) => r.to - r.from >= 2).map((r) => ({ ...r, w: +(r.to - r.from).toFixed(1) }))
    },
    [toDataUrl(file), y]
  )
  console.log(`\n[${label}]  y=${y}`)
  for (const s of r) {
    console.log(`   x ${String(s.from).padStart(7)} – ${String(s.to).padStart(7)}   폭 ${String(s.w).padStart(7)}   rgb(${s.color})`)
  }
}

await browser.close()
