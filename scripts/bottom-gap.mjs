/**
 * reference PNG 하단 여백 측정
 * 마지막 "콘텐츠" 픽셀부터 이미지 끝까지의 거리를 잰다.
 * 원본 CSS 의 section padding-bottom 과 비교하면 잘림 여부를 알 수 있다.
 *
 * 사용: node scripts/bottom-gap.mjs <file...>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const files = process.argv.slice(2)
const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const f of files) {
  const full = path.join(ROOT, 'reference', f)
  const r = await page.evaluate(async (src) => {
    const img = await new Promise((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = src
    })
    const W = img.width
    const H = img.height
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, W, H).data

    // 맨 아래 행의 색 = 배경색으로 간주
    const bi = (H - 1) * W * 4
    const bg = [d[bi], d[bi + 1], d[bi + 2]]

    let lastContent = -1
    for (let y = H - 1; y >= 0; y--) {
      let differs = false
      for (let x = 0; x < W; x += 2) {
        const i = (y * W + x) * 4
        if (
          Math.abs(d[i] - bg[0]) > 6 ||
          Math.abs(d[i + 1] - bg[1]) > 6 ||
          Math.abs(d[i + 2] - bg[2]) > 6
        ) {
          differs = true
          break
        }
      }
      if (differs) {
        lastContent = y
        break
      }
    }
    return {
      cssHeight: H / 2,
      bgColor: `rgb(${bg.join(',')})`,
      lastContentCssY: (lastContent + 1) / 2,
      bottomGapCss: (H - 1 - lastContent) / 2,
    }
  }, toDataUrl(full))
  console.log(
    `${f.padEnd(26)} 높이 ${String(r.cssHeight).padStart(6)}  배경 ${r.bgColor.padEnd(16)} ` +
      `마지막 콘텐츠 y=${String(r.lastContentCssY).padStart(6)}  하단 여백 ${r.bottomGapCss}px`
  )
}

await browser.close()
