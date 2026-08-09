import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/api')
await page.waitForLoadState('networkidle')

const r = await page.evaluate(() => {
  const grids = Array.from(document.querySelectorAll('[class*="grid-cols"]'))
  const info = grids.map((g) => ({
    className: g.className,
    gridTemplateColumns: getComputedStyle(g).gridTemplateColumns,
    childCount: g.children.length,
  }))

  // 생성된 스타일시트에서 grid-cols-4 / sm / xl 미디어쿼리 순서 확인
  const order = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        const txt = rule.conditionText || rule.media.mediaText
        const inner = Array.from(rule.cssRules)
          .map((r) => r.selectorText)
          .filter((s) => s && s.includes('grid-cols'))
        if (inner.length) order.push({ media: txt, selectors: inner })
      }
    }
  }
  return { info, order, innerWidth: window.innerWidth }
})

console.log(JSON.stringify(r, null, 2))
await browser.close()
