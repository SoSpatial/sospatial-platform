/**
 * 원본 / 구현 전체 페이지를 나란히 붙인 비교 이미지 생성
 * 사용: node scripts/side-by-side.mjs <refFile> <implFile> <outName>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , refFile = '07-api.png', implFile = 'impl-api.png', outName = 'sbs-api.png'] = process.argv
const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const refUrl = toDataUrl(path.join(ROOT, 'reference', refFile))
const implUrl = toDataUrl(path.join(OUT, implFile))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

const html = `<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#0d0d0d;font-family:ui-monospace,monospace;padding:12px}
  .wrap{display:flex;gap:12px;align-items:flex-start}
  .col{flex:1}
  .label{color:#C4A882;font-size:13px;margin-bottom:6px}
  img{width:100%;display:block;outline:1px solid rgba(196,168,130,.3)}
</style>
<div class="wrap">
  <div class="col"><div class="label">① 원본 ${refFile}</div><img src="${refUrl}"></div>
  <div class="col"><div class="label">② 구현 ${implFile}</div><img src="${implUrl}"></div>
</div>`

await page.setContent(html)
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, outName), fullPage: true })
await browser.close()
console.log('생성: screenshots/' + outName)
