/**
 * 그리드 라인 주기 추정 — 피크 검출 대신 주기별 접기(folding) 대비로 구한다.
 * 블롭·말풍선이 없는 띠에서 열/행 평균 밝기를 뽑고,
 * 주기 p 로 접었을 때 프로파일의 진폭이 최대가 되는 p 를 찾는다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const X0 = 544
const Y0 = 889

const targets = [
  ['원본', path.join(ROOT, 'reference', '01-home.png')],
  ['구현', path.join(ROOT, 'screenshots', 'impl-home.png')],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file] of targets) {
  const res = await page.evaluate(
    async ([src, ox, oy]) => {
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

      // 목업 기준 좌표 → 이미지 좌표(@2x)
      const at = (x, y) => ctx.getImageData((ox + x) * 2, (oy + y) * 2, 1, 1).data[0]

      // 세로선용 띠: x 230~350, y 168~184 (블롭·말풍선 없음)
      const colMeans = []
      for (let x = 230; x < 350; x += 0.5) {
        let s = 0
        let n = 0
        for (let y = 168; y < 184; y += 0.5) {
          s += at(x, y)
          n++
        }
        colMeans.push(s / n)
      }
      // 가로선용 띠: x 300~350, y 20~160 (블롭 blur 영향 적은 우측)
      const rowMeans = []
      for (let y = 20; y < 160; y += 0.5) {
        let s = 0
        let n = 0
        for (let x = 300; x < 350; x += 0.5) {
          s += at(x, y)
          n++
        }
        rowMeans.push(s / n)
      }

      // 0.5px 샘플이므로 인덱스 2칸 = 1 CSS px
      const bestPeriod = (series) => {
        let best = null
        for (let p = 10; p <= 40; p += 0.5) {
          const bins = new Array(Math.round(p * 2)).fill(0)
          const cnt = new Array(Math.round(p * 2)).fill(0)
          for (let i = 0; i < series.length; i++) {
            const b = Math.round(i % (p * 2)) % bins.length
            bins[b] += series[i]
            cnt[b]++
          }
          const prof = bins.map((v, i) => v / (cnt[i] || 1))
          const amp = Math.max(...prof) - Math.min(...prof)
          if (!best || amp > best.amp) best = { p, amp: +amp.toFixed(3) }
        }
        return best
      }

      const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
      return {
        vertical: bestPeriod(colMeans),
        horizontal: bestPeriod(rowMeans),
        colBase: +Math.min(...colMeans).toFixed(2),
        colPeak: +Math.max(...colMeans).toFixed(2),
        colMean: +mean(colMeans).toFixed(2),
        rowBase: +Math.min(...rowMeans).toFixed(2),
        rowPeak: +Math.max(...rowMeans).toFixed(2),
      }
    },
    [toDataUrl(file), X0, Y0]
  )
  console.log(`\n[${label}]`)
  console.log(`   세로선 주기 ${res.vertical.p}px (진폭 ${res.vertical.amp})   열 밝기 ${res.colBase} ~ ${res.colPeak}`)
  console.log(`   가로선 주기 ${res.horizontal.p}px (진폭 ${res.horizontal.amp})   행 밝기 ${res.rowBase} ~ ${res.rowPeak}`)
}

await browser.close()
