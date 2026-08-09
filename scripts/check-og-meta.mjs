/** og:image 메타가 루트 하나로 전 페이지에 상속되는지 확인 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
for (const r of ['/', '/api', '/request', '/request/source', '/request/upload', '/request/describe', '/data']) {
  await page.goto('http://localhost:3000' + r)
  const m = await page.evaluate(() => {
    const c = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null
    return {
      ogImage: c('meta[property="og:image"]'),
      size: `${c('meta[property="og:image:width"]')}x${c('meta[property="og:image:height"]')}`,
      alt: c('meta[property="og:image:alt"]'),
      twitter: c('meta[name="twitter:image"]'),
      count: document.querySelectorAll('meta[property="og:image"]').length,
    }
  })
  console.log(r.padEnd(19), `${m.count}개  ${m.size}  ${m.ogImage}`)
  console.log(''.padEnd(19), `alt: ${m.alt}`)
}
await browser.close()
