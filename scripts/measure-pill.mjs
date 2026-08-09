/**
 * 원본/구현 각각에서 흰색 "회원가입" 알약의 바운딩 박스를 픽셀로 측정한다.
 * 흰 알약은 주변(#181818) 대비 압도적으로 밝아 임계값으로 분리된다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const targets = [
  ['원본  reference/01-home.png', path.join(ROOT, 'reference', '01-home.png')],
  ['구현  impl-nav.png', path.join(OUT, 'impl-nav.png')],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file] of targets) {
  const r = await page.evaluate(async (src) => {
    const img = await new Promise((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = src
    })
    const W = img.width
    const H = Math.min(img.height, 128) // 네비 영역(2x 기준 128px)만
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    c.getContext('2d').drawImage(img, 0, 0)
    const d = c.getContext('2d').getImageData(0, 0, W, H).data

    // 밝기 240 이상 = 흰 알약
    let minX = W, maxX = 0, minY = H, maxY = 0, n = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) {
        const p = i / 4
        const x = p % W
        const y = (p / W) | 0
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        n++
      }
    }
    if (!n) return null
    return {
      // 이미지가 2x 이므로 CSS px 로 환산
      left: minX / 2,
      right: (maxX + 1) / 2,
      top: minY / 2,
      bottom: (maxY + 1) / 2,
      width: (maxX + 1 - minX) / 2,
      height: (maxY + 1 - minY) / 2,
      whitePixels: n,
    }
  }, toDataUrl(file))
  console.log(label)
  console.log('  ', JSON.stringify(r))
}

await browser.close()
