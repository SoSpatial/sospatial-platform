/** 카드3 목업(ReportMock) 실측 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const r = (el) => {
    const b = el.getBoundingClientRect()
    return {
      x: +b.x.toFixed(2),
      y: +(b.y + scrollY).toFixed(2),
      right: +(1440 - b.right).toFixed(2),
      w: +b.width.toFixed(2),
      h: +b.height.toFixed(2),
    }
  }
  const grid = document.querySelectorAll('main section')[1].children[0].children[1]
  const cards = Array.from(grid.children)
  const card2 = cards[2]
  const wrapper = card2.children[0]
  const report = wrapper.children[0]
  const titleBar = report.children[0]
  const lines = [report.children[1], report.children[2], report.children[3]]
  const chart = report.children[4]
  const bars = Array.from(chart.children)
  const bubbleN = wrapper.children[1]
  const bubbleA = wrapper.children[2]

  return {
    cardHeights: cards.map((c) => +c.getBoundingClientRect().height.toFixed(2)),
    wrapper: {
      ...r(wrapper),
      padding: `${cs(wrapper).paddingTop} ${cs(wrapper).paddingRight} ${cs(wrapper).paddingBottom}`,
      position: cs(wrapper).position,
    },
    report: {
      ...r(report),
      widthDecl: cs(report).width,
      padding: cs(report).padding,
      radius: cs(report).borderRadius,
      bg: cs(report).backgroundColor,
      border: `${cs(report).borderWidth} ${cs(report).borderColor}`,
    },
    titleBar: { ...r(titleBar), radius: cs(titleBar).borderRadius, bg: cs(titleBar).backgroundColor, mb: cs(titleBar).marginBottom },
    lines: lines.map((l) => ({ ...r(l), radius: cs(l).borderRadius, bg: cs(l).backgroundColor, mb: cs(l).marginBottom })),
    chart: { ...r(chart), gap: cs(chart).columnGap, align: cs(chart).alignItems },
    bars: bars.map((b) => ({ ...r(b), bg: cs(b).backgroundColor, radius: cs(b).borderRadius })),
    bubbleNeutral: {
      ...r(bubbleN),
      position: cs(bubbleN).position,
      bottom: cs(bubbleN).bottom,
      right: cs(bubbleN).right,
      padding: `${cs(bubbleN).paddingTop} ${cs(bubbleN).paddingRight}`,
      radius: cs(bubbleN).borderRadius,
      bg: cs(bubbleN).backgroundColor,
      border: `${cs(bubbleN).borderWidth} ${cs(bubbleN).borderColor}`,
      color: cs(bubbleN).color,
      fontSize: cs(bubbleN).fontSize,
      lineHeight: cs(bubbleN).lineHeight,
      maxWidth: cs(bubbleN).maxWidth,
      zIndex: cs(bubbleN).zIndex,
    },
    bubbleAccent: {
      ...r(bubbleA),
      position: cs(bubbleA).position,
      bottom: cs(bubbleA).bottom,
      right: cs(bubbleA).right,
      padding: `${cs(bubbleA).paddingTop} ${cs(bubbleA).paddingRight}`,
      radius: cs(bubbleA).borderRadius,
      bg: cs(bubbleA).backgroundColor,
      color: cs(bubbleA).color,
      fontWeight: cs(bubbleA).fontWeight,
      fontSize: cs(bubbleA).fontSize,
      lineHeight: cs(bubbleA).lineHeight,
      maxWidth: cs(bubbleA).maxWidth,
      zIndex: cs(bubbleA).zIndex,
    },
    domOrder: Array.from(wrapper.children).map((c) => c.className.slice(0, 40)),
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
