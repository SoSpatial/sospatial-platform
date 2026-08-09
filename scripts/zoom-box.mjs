/**
 * 임의 박스를 확대해 원본/구현을 위아래로 비교한다.
 * 사용: node scripts/zoom-box.mjs <ref> <impl> <x0> <y0> <w> <h> <zoom> <out>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , refFile, implFile, x0, y0, w, h, zoom = '3', out = 'zoom.png'] = process.argv
const X = Number(x0)
const Y = Number(y0)
const W = Number(w)
const H = Number(h)
const Z = Number(zoom)

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const refUrl = toDataUrl(path.join(ROOT, 'reference', refFile))
const implUrl = toDataUrl(path.join(OUT, implFile))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Math.ceil(W * Z) + 40, height: 400 } })

// 이미지는 @2x 이므로 CSS px → 이미지 px 는 ×2, 표시 배율은 Z/2
const s = Z / 2
const bg = 2880 * s

const win = (url, label) => `
  <div class="label">${label}</div>
  <div class="win" style="width:${W * Z}px;height:${H * Z}px">
    <div class="img" style="width:${bg}px;background-image:url(${url});background-size:${bg}px auto;background-position:-${X * 2 * s}px -${Y * 2 * s}px"></div>
  </div>`

await page.setContent(`<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#0d0d0d;font-family:ui-monospace,monospace;padding:12px}
  .label{color:#C4A882;font-size:12px;margin:8px 0 4px}
  .win{overflow:hidden;position:relative;outline:1px solid rgba(196,168,130,.35)}
  .img{position:absolute;top:0;left:0;height:100%;background-repeat:no-repeat}
</style>
${win(refUrl, '① 원본 ' + refFile + `  (x ${X}–${X + W}, y ${Y}–${Y + H}, ${Z}배)`)}
${win(implUrl, '② 구현 ' + implFile)}`)

await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, out), fullPage: true })
await browser.close()
console.log('생성: screenshots/' + out)
