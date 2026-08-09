/**
 * 좁은 폭에서 콘텐츠가 컨테이너를 얼마나 빠듯하게 채우는지 확인한다.
 * 사용: node scripts/check-tight.mjs <route> <width>
 */
import { chromium } from 'playwright'

const [, , route = '/api', wArg = '375'] = process.argv
const W = Number(wArg)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: 900 } })
await page.goto('http://localhost:3000' + route)
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)

const r = await page.evaluate(() => {
  const out = []
  const container = document.querySelector('main section > div')
  const cRect = container.getBoundingClientRect()
  // 텍스트를 직접 담은 요소만 검사
  const els = Array.from(document.querySelectorAll('main h1, main h2, main h3, main p, main span, main div'))
  for (const el of els) {
    const hasText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    )
    if (!hasText) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0) continue
    // 실제 넘침만 잡는다: 콘텐츠가 박스보다 넓거나, 박스가 뷰포트를 벗어난 경우
    const overflow = el.scrollWidth - el.clientWidth
    if (overflow > 1 || r.right > window.innerWidth + 0.5 || r.left < -0.5) {
      out.push({
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 26),
        fontSize: getComputedStyle(el).fontSize,
        박스폭: +r.width.toFixed(1),
        콘텐츠폭: el.scrollWidth,
        넘침: overflow,
        뷰포트밖: +(r.right - window.innerWidth).toFixed(1),
      })
    }
  }
  return { 컨테이너폭: +cRect.width.toFixed(1), 뷰포트: window.innerWidth, 빠듯한요소: out.slice(0, 12) }
})
console.log(`[${route} @ ${W}px]`)
console.log(JSON.stringify(r, null, 2))
await browser.close()
