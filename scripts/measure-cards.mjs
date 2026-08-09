/** 홈 피처 카드 기하 측정 */
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
      x: +b.x.toFixed(1),
      y: +(b.y + window.scrollY).toFixed(1),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
    }
  }
  const band = document.querySelectorAll('main section')[1]
  const heading = band.children[0].children[0]
  const grid = band.children[0].children[1]
  const cards = Array.from(grid.children)
  const c0 = cards[0]
  const mock = c0.children[0]
  const body = c0.children[1]
  const h3 = body.children[0]
  const p = body.children[1]
  const chips = body.children[2]
  const links = body.children[3]

  return {
    band: { ...r(band), padding: `${cs(band).paddingTop} ${cs(band).paddingRight} ${cs(band).paddingBottom}`, bg: cs(band).backgroundColor },
    heading: { ...r(heading), marginBottom: cs(heading).marginBottom },
    eyebrow: {
      fontSize: cs(heading.children[0]).fontSize,
      fontWeight: cs(heading.children[0]).fontWeight,
      letterSpacing: cs(heading.children[0]).letterSpacing,
      textTransform: cs(heading.children[0]).textTransform,
      color: cs(heading.children[0]).color,
      marginBottom: cs(heading.children[0]).marginBottom,
    },
    h2: {
      fontSize: cs(heading.children[1]).fontSize,
      fontWeight: cs(heading.children[1]).fontWeight,
      letterSpacing: cs(heading.children[1]).letterSpacing,
      color: cs(heading.children[1]).color,
    },
    grid: { cols: cs(grid).gridTemplateColumns, gap: cs(grid).columnGap, ...r(grid) },
    cards: cards.map((c) => r(c)),
    card0: {
      ...r(c0),
      radius: cs(c0).borderRadius,
      bg: cs(c0).backgroundColor,
      border: `${cs(c0).borderWidth} ${cs(c0).borderColor}`,
      overflow: cs(c0).overflow,
    },
    mock: r(mock),
    body: { ...r(body), padding: `${cs(body).paddingTop} ${cs(body).paddingRight} ${cs(body).paddingBottom}` },
    h3: { ...r(h3), fontSize: cs(h3).fontSize, fontWeight: cs(h3).fontWeight, letterSpacing: cs(h3).letterSpacing, marginBottom: cs(h3).marginBottom },
    desc: { ...r(p), fontSize: cs(p).fontSize, color: cs(p).color, lineHeight: cs(p).lineHeight, marginBottom: cs(p).marginBottom, flexGrow: cs(p).flexGrow },
    chipsRow: { ...r(chips), gap: cs(chips).columnGap, marginBottom: cs(chips).marginBottom },
    linksRow: { ...r(links), gap: cs(links).columnGap },
    chip0: (() => {
      const el = chips.children[0]
      return { ...r(el), padding: `${cs(el).paddingTop} ${cs(el).paddingRight}`, radius: cs(el).borderRadius, fontSize: cs(el).fontSize, color: cs(el).color, border: `${cs(el).borderWidth} ${cs(el).borderColor}`, bg: cs(el).backgroundColor }
    })(),
    link0: (() => {
      const el = links.children[0].children[0]
      return { ...r(el), fontSize: cs(el).fontSize, fontWeight: cs(el).fontWeight, color: cs(el).color, gap: cs(el).columnGap }
    })(),
    linkDivider: (() => {
      const d = links.children[1].children[0]
      return { ...r(d), bg: cs(d).backgroundColor }
    })(),
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
