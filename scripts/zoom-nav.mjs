/**
 * 차이가 몰린 구간을 3배 확대해 원본/구현을 위아래로 붙여 출력한다.
 * 사용: node scripts/zoom-nav.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const refUrl = toDataUrl(path.join(ROOT, 'reference', '01-home.png'))
const implUrl = toDataUrl(path.join(OUT, 'impl-nav.png'))

// CSS px 기준 관심 구간 [x, width, 라벨]
const REGIONS = [
  [232, 220, '로고 + 워드마크'],
  [480, 260, '네비 링크 4개'],
  [1000, 260, '우측 클러스터 (폴더·로그인·회원가입)'],
]
const ZOOM = 3
const NAV_H = 64

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 })

const blocks = REGIONS.map(([x, w, label]) => {
  // 원본/구현 모두 2x 이미지이므로 CSS px → 이미지 px 는 ×2
  const ix = x * 2
  const iw = w * 2
  const scale = ZOOM / 2 // 이미지 픽셀 기준 배율
  const dispW = iw * scale
  const dispH = NAV_H * 2 * scale
  const bgW = 2880 * scale
  return `
    <div class="block">
      <div class="label">${label} &nbsp;<span class="dim">CSS x ${x}–${x + w}, ${ZOOM}배 확대</span></div>
      <div class="row"><span class="tag">원본</span>
        <div class="win" style="width:${dispW}px;height:${dispH}px">
          <div class="img" style="width:${bgW}px;background-image:url(${refUrl});background-size:${bgW}px auto;background-position:-${ix * scale}px 0"></div>
        </div>
      </div>
      <div class="row"><span class="tag">구현</span>
        <div class="win" style="width:${dispW}px;height:${dispH}px">
          <div class="img" style="width:${bgW}px;background-image:url(${implUrl});background-size:${bgW}px auto;background-position:-${ix * scale}px 0"></div>
        </div>
      </div>
    </div>`
}).join('')

const html = `<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#0d0d0d;font-family:ui-monospace,monospace;padding:14px}
  .block{margin-bottom:22px}
  .label{color:#C4A882;font-size:13px;margin-bottom:6px}
  .dim{color:rgba(255,255,255,.35)}
  .row{display:flex;align-items:center;gap:8px;margin-bottom:3px}
  .tag{color:rgba(255,255,255,.45);font-size:11px;width:32px;text-align:right}
  .win{overflow:hidden;position:relative;outline:1px solid rgba(196,168,130,.3)}
  .img{position:absolute;top:0;left:0;height:100%;background-repeat:no-repeat}
</style>
${blocks}`

await page.setContent(html)
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, 'nav-zoom.png'), fullPage: true })
await browser.close()
console.log('생성: screenshots/nav-zoom.png')
