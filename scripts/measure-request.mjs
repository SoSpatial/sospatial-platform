/** Request 랜딩 구조 실측 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/request')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(700)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const top = (el) => +(el.getBoundingClientRect().top + scrollY).toFixed(2)
  const h = (el) => +el.getBoundingClientRect().height.toFixed(2)
  const box = (el) => {
    const b = el.getBoundingClientRect()
    return { x: +b.x.toFixed(2), y: +(b.y + scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }
  }

  const secs = document.querySelectorAll('main section')
  const [hero, cardsSec, procSec] = secs
  const heroC = hero.children[0]
  const badge = heroC.children[0]
  const h1 = heroC.children[1]
  const p = heroC.children[2]
  const grid = cardsSec.children[0].children[0]
  const cards = Array.from(grid.children)
  const c0 = cards[0]
  const link0 = c0.children[0]
  const header0 = link0.children[0]
  const badge0 = header0.children[0]
  const title0 = header0.children[1]
  const desc0 = link0.children[1]
  const prev0 = link0.children[2]
  const chips0 = link0.children[3]
  const cta0 = link0.children[4]
  const procC = procSec.children[0]
  const h2 = procC.children[0]
  const stepsRow = procC.children[1]

  return {
    hero: { ...box(hero), padding: `${cs(hero).paddingTop} ${cs(hero).paddingRight} ${cs(hero).paddingBottom}`, end: +(top(hero) + h(hero)).toFixed(2) },
    badge: { ...box(badge), padding: `${cs(badge).paddingTop} ${cs(badge).paddingRight}`, radius: cs(badge).borderRadius, bg: cs(badge).backgroundColor, border: `${cs(badge).borderWidth} ${cs(badge).borderColor}`, mb: cs(badge).marginBottom, fontSize: cs(badge.children[0]).fontSize, fontWeight: cs(badge.children[0]).fontWeight, color: cs(badge.children[0]).color },
    h1: { ...box(h1), fontSize: cs(h1).fontSize, fontWeight: cs(h1).fontWeight, lineHeight: cs(h1).lineHeight, letterSpacing: cs(h1).letterSpacing, mb: cs(h1).marginBottom },
    heroP: { ...box(p), fontSize: cs(p).fontSize, color: cs(p).color, lineHeight: cs(p).lineHeight },
    cardsSection: { ...box(cardsSec), padding: `${cs(cardsSec).paddingTop} ${cs(cardsSec).paddingRight} ${cs(cardsSec).paddingBottom}`, end: +(top(cardsSec) + h(cardsSec)).toFixed(2) },
    grid: { ...box(grid), cols: cs(grid).gridTemplateColumns, gap: cs(grid).columnGap },
    cardHeights: cards.map((c) => h(c)),
    cardXs: cards.map((c) => +c.getBoundingClientRect().x.toFixed(2)),
    card0: { ...box(c0), padding: cs(c0).padding, radius: cs(c0).borderRadius, bg: cs(c0).backgroundColor, border: `${cs(c0).borderWidth} ${cs(c0).borderColor}` },
    cardHeader: { gap: cs(header0).columnGap, mb: cs(header0).marginBottom },
    cardBadge: { ...box(badge0), radius: cs(badge0).borderRadius, bg: cs(badge0).backgroundColor, fontSize: cs(badge0).fontSize, fontWeight: cs(badge0).fontWeight, color: cs(badge0).color },
    cardTitle: { fontSize: cs(title0).fontSize, fontWeight: cs(title0).fontWeight, letterSpacing: cs(title0).letterSpacing, color: cs(title0).color },
    cardDesc: { ...box(desc0), fontSize: cs(desc0).fontSize, color: cs(desc0).color, lineHeight: cs(desc0).lineHeight, mb: cs(desc0).marginBottom, flexGrow: cs(desc0).flexGrow },
    cardPreview: { ...box(prev0), padding: `${cs(prev0).paddingTop} ${cs(prev0).paddingRight}`, radius: cs(prev0).borderRadius, bg: cs(prev0).backgroundColor, border: `${cs(prev0).borderWidth} ${cs(prev0).borderColor}`, fontSize: cs(prev0).fontSize, color: cs(prev0).color, mb: cs(prev0).marginBottom },
    cardChips: { ...box(chips0), gap: cs(chips0).columnGap, mb: cs(chips0).marginBottom },
    cardCta: { ...box(cta0), fontSize: cs(cta0).fontSize, fontWeight: cs(cta0).fontWeight, color: cs(cta0).color, gap: cs(cta0).columnGap },
    procSection: { ...box(procSec), padding: `${cs(procSec).paddingTop} ${cs(procSec).paddingRight} ${cs(procSec).paddingBottom}`, bg: cs(procSec).backgroundColor },
    procContainer: { paddingTop: cs(procC).paddingTop },
    h2: { ...box(h2), fontSize: cs(h2).fontSize, fontWeight: cs(h2).fontWeight, letterSpacing: cs(h2).letterSpacing, mb: cs(h2).marginBottom },
    stepsRow: box(stepsRow),
    docHeight: document.documentElement.scrollHeight,
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
