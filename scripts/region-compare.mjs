/**
 * 지정한 y 구간만 원본/구현을 1:1 배율로 위아래 붙여 비교한다.
 * 사용: node scripts/region-compare.mjs <refFile> <implFile> <y0> <y1> <out>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , refFile, implFile, y0 = '0', y1 = '700', out = 'region.png', implY0] = process.argv
const Y0 = Number(y0)
const Y1 = Number(y1)
/** 구현 쪽 시작 y 를 따로 줄 수 있다 (세로 오프셋이 있는 구간 비교용) */
const IY0 = implY0 !== undefined ? Number(implY0) : Y0
const H = Y1 - Y0
const W = 1440

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const refUrl = toDataUrl(path.join(ROOT, 'reference', refFile))
const implUrl = toDataUrl(path.join(OUT, implFile))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: 600 } })

const win = (url, label, top) => `
  <div class="label">${label} &nbsp;<span class="dim">y ${top}–${top + H}</span></div>
  <div class="win" style="width:${W}px;height:${H}px">
    <div class="img" style="background-image:url(${url});background-size:${W}px auto;background-position:0 -${top}px"></div>
  </div>`

await page.setContent(`<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#0d0d0d;font-family:ui-monospace,monospace;padding:10px}
  .label{color:#C4A882;font-size:12px;margin:8px 0 4px}
  .dim{color:rgba(255,255,255,.35)}
  .win{overflow:hidden;position:relative;outline:1px solid rgba(196,168,130,.35)}
  .img{position:absolute;inset:0;background-repeat:no-repeat}
</style>
${win(refUrl, '① 원본 ' + refFile, Y0)}
${win(implUrl, '② 구현 ' + implFile, IY0)}`)

await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, out), fullPage: true })
await browser.close()
console.log('생성: screenshots/' + out)
