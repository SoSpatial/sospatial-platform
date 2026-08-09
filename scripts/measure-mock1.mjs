/** 카드1 목업 내부 요소 소수점 단위 측정 */
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
      top: +(b.top + scrollY).toFixed(2),
      bottom: +(b.bottom + scrollY).toFixed(2),
      h: +b.height.toFixed(2),
      w: +b.width.toFixed(2),
    }
  }
  const card0 = document.querySelectorAll('main section')[1].children[0].children[1].children[0]
  const wrapper = card0.children[0]
  const panel = wrapper.children[0]
  const inputRow = panel.children[0]
  const input0 = inputRow.children[0]
  const selected = panel.children[1]
  const bar1 = panel.children[2]
  const bar2 = panel.children[3]

  return {
    wrapper: { ...r(wrapper), padding: `${cs(wrapper).paddingTop} ${cs(wrapper).paddingRight} ${cs(wrapper).paddingBottom}` },
    panel: {
      ...r(panel),
      padding: cs(panel).padding,
      border: `${cs(panel).borderWidth} ${cs(panel).borderColor}`,
      radius: cs(panel).borderRadius,
      bg: cs(panel).backgroundColor,
    },
    inputRow: { ...r(inputRow), gap: cs(inputRow).columnGap, marginBottom: cs(inputRow).marginBottom },
    input0: {
      ...r(input0),
      padding: `${cs(input0).paddingTop} ${cs(input0).paddingRight}`,
      border: `${cs(input0).borderWidth} ${cs(input0).borderColor}`,
      radius: cs(input0).borderRadius,
      fontSize: cs(input0).fontSize,
      lineHeight: cs(input0).lineHeight,
      color: cs(input0).color,
    },
    selected: {
      ...r(selected),
      padding: `${cs(selected).paddingTop} ${cs(selected).paddingRight}`,
      border: `${cs(selected).borderTopWidth} ${cs(selected).borderColor}`,
      radius: cs(selected).borderRadius,
      fontSize: cs(selected).fontSize,
      lineHeight: cs(selected).lineHeight,
      fontWeight: cs(selected).fontWeight,
      color: cs(selected).color,
      bg: cs(selected).backgroundColor,
      marginBottom: cs(selected).marginBottom,
    },
    bar1: { ...r(bar1), marginBottom: cs(bar1).marginBottom, radius: cs(bar1).borderRadius, bg: cs(bar1).backgroundColor },
    bar2: { ...r(bar2), radius: cs(bar2).borderRadius, bg: cs(bar2).backgroundColor, widthPct: cs(bar2).width },
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
