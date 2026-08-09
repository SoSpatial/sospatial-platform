/** 카드2 목업(MapAnalysisMock) 실측 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(700)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const r = (el) => {
    const b = el.getBoundingClientRect()
    return {
      x: +b.x.toFixed(2),
      y: +(b.y + scrollY).toFixed(2),
      w: +b.width.toFixed(2),
      h: +b.height.toFixed(2),
    }
  }
  const grid = document.querySelectorAll('main section')[1].children[0].children[1]
  const cards = Array.from(grid.children)
  const wrapper = cards[1].children[0]
  const gridLayer = wrapper.children[0]
  const blobs = [1, 2, 3, 4].map((i) => wrapper.children[i])
  const qBubble = wrapper.children[5]
  const aBubble = wrapper.children[6]

  const wrapRect = wrapper.getBoundingClientRect()

  return {
    cardHeights: cards.map((c) => +c.getBoundingClientRect().height.toFixed(2)),
    wrapper: {
      ...r(wrapper),
      position: cs(wrapper).position,
      overflow: cs(wrapper).overflow,
      padding: cs(wrapper).padding,
    },
    gridLayer: {
      ...r(gridLayer),
      inset: `${cs(gridLayer).top} ${cs(gridLayer).right} ${cs(gridLayer).bottom} ${cs(gridLayer).left}`,
      backgroundSize: cs(gridLayer).backgroundSize,
      backgroundImage: cs(gridLayer).backgroundImage.replace(/\s+/g, ' '),
    },
    blobs: blobs.map((b) => {
      const rect = b.getBoundingClientRect()
      return {
        topPct: cs(b).top,
        leftPct: cs(b).left,
        // 래퍼 기준 상대 좌표
        relTop: +(rect.top - wrapRect.top).toFixed(2),
        relLeft: +(rect.left - wrapRect.left).toFixed(2),
        w: +rect.width.toFixed(2),
        h: +rect.height.toFixed(2),
        filter: cs(b).filter,
        background: cs(b).background.split(')')[0] + ')' + cs(b).background.split(')').slice(1, 3).join(')') + ')',
        backgroundImage: cs(b).backgroundImage.replace(/\s+/g, ' '),
      }
    }),
    qBubble: {
      ...r(qBubble),
      relBottom: +(wrapRect.bottom - qBubble.getBoundingClientRect().bottom).toFixed(2),
      relRight: +(wrapRect.right - qBubble.getBoundingClientRect().right).toFixed(2),
      bottom: cs(qBubble).bottom,
      right: cs(qBubble).right,
      padding: `${cs(qBubble).paddingTop} ${cs(qBubble).paddingRight}`,
      radius: cs(qBubble).borderRadius,
      bg: cs(qBubble).backgroundColor,
      color: cs(qBubble).color,
      fontSize: cs(qBubble).fontSize,
      fontWeight: cs(qBubble).fontWeight,
      lineHeight: cs(qBubble).lineHeight,
      maxWidth: cs(qBubble).maxWidth,
    },
    aBubble: {
      ...r(aBubble),
      relBottom: +(wrapRect.bottom - aBubble.getBoundingClientRect().bottom).toFixed(2),
      relLeft: +(aBubble.getBoundingClientRect().left - wrapRect.left).toFixed(2),
      bottom: cs(aBubble).bottom,
      left: cs(aBubble).left,
      padding: `${cs(aBubble).paddingTop} ${cs(aBubble).paddingRight}`,
      radius: cs(aBubble).borderRadius,
      bg: cs(aBubble).backgroundColor,
      color: cs(aBubble).color,
      fontSize: cs(aBubble).fontSize,
      lineHeight: cs(aBubble).lineHeight,
      maxWidth: cs(aBubble).maxWidth,
    },
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
