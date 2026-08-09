/**
 * app/apple-icon.png 생성기 (1회성, 결과물은 커밋된다)
 *
 * iOS 는 아이콘을 자체 마스크로 둥글게 깎으므로 모서리를 직각으로 두고
 * 배경 #181818 을 불투명하게 채운다. 투명 배경이면 iOS 가 검게 합성한다.
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const SIZE = 180
// 로고 20×20 을 108×108 로 확대하고 상하좌우 36px 여백 (SIZE 의 20%)
const PAD = 36
const INNER = SIZE - PAD * 2

const html = `<!doctype html><html><body style="margin:0">
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="#181818"/>
  <g transform="translate(${PAD} ${PAD}) scale(${INNER / 20})">
    <rect x="0" y="0" width="8.5" height="8.5" rx="2" fill="#C4A882"/>
    <rect x="11.5" y="0" width="8.5" height="8.5" rx="2" fill="#C4A882" opacity="0.35"/>
    <rect x="0" y="11.5" width="8.5" height="8.5" rx="2" fill="#C4A882" opacity="0.35"/>
    <rect x="11.5" y="11.5" width="8.5" height="8.5" rx="2" fill="#C4A882"/>
  </g>
</svg></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } })
await page.setContent(html)
const buf = await page.screenshot({ omitBackground: false })
writeFileSync('app/apple-icon.png', buf)
await browser.close()
console.log(`app/apple-icon.png 생성 — ${SIZE}×${SIZE}, ${buf.length} bytes`)
