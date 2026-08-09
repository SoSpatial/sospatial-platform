/**
 * 배경색 밴드 스캔 — 원본/구현의 섹션 경계를 픽셀로 직접 측정한다.
 *
 * 좌측 거터(콘텐츠가 없는 x)에서 세로로 훑어 배경색이 바뀌는 y 를 찾는다.
 * #181818(base) / #222222(alt) 가 번갈아 나오므로 섹션 경계가 그대로 드러난다.
 *
 * 사용: node scripts/scan-bands.mjs <refFile> <implFile>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , refFile = '07-api.png', implFile = 'impl-api.png', xArg = '20'] = process.argv
const SCAN_X = Number(xArg) // CSS px
const ROOT = process.cwd()
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const targets = [
  ['원본', path.join(ROOT, 'reference', refFile)],
  ['구현', path.join(ROOT, 'screenshots', implFile)],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

for (const [label, file] of targets) {
  const r = await page.evaluate(async ([src, scanX]) => {
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
    c.getContext('2d').drawImage(img, 0, 0)
    const ctx = c.getContext('2d')

    const x = scanX * 2 // CSS px → 이미지 px (@2x)
    const col = ctx.getImageData(x, 0, 1, H).data

    const key = (i) => `${col[i]},${col[i + 1]},${col[i + 2]}`
    const bands = []
    let start = 0
    let cur = key(0)
    for (let y = 1; y < H; y++) {
      const k = key(y * 4)
      if (k !== cur) {
        bands.push({ from: start / 2, to: y / 2, color: cur })
        start = y
        cur = k
      }
    }
    bands.push({ from: start / 2, to: H / 2, color: cur })

    // 1px 미만 잡음 제거
    return {
      cssHeight: H / 2,
      bands: bands
        .filter((b) => b.to - b.from >= 1)
        .map((b) => ({ ...b, height: +(b.to - b.from).toFixed(1) })),
    }
  }, [toDataUrl(file), SCAN_X])

  console.log(`\n[${label}]  전체 높이 ${r.cssHeight}px  (스캔 x=${SCAN_X})`)
  for (const b of r.bands) {
    console.log(
      `   y ${String(b.from).padStart(6)} – ${String(b.to).padStart(6)}   높이 ${String(b.height).padStart(6)}   rgb(${b.color})`
    )
  }
}

await browser.close()
