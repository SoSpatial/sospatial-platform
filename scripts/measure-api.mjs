/**
 * API 페이지 computed style 덤프 — 원본 인라인 CSS 와 1:1 대조용
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/api')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

const m = await page.evaluate(() => {
  const cs = (el) => (el ? getComputedStyle(el) : null)
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) }
  }
  const sections = Array.from(document.querySelectorAll('main section'))
  const [heroSec, featSec, gridSec] = sections

  const heroInner = heroSec.children[0] // Container
  const heroGrid = heroInner.children[0] // grid
  const heroCol = heroGrid.children[0] // 좌측 컬럼
  const badge = heroCol.children[0]
  const h1 = heroCol.children[1]
  const p = heroCol.children[2]
  const btnRow = heroCol.children[3]
  const btns = btnRow.children

  const featGrid = featSec.children[0].children[0]
  const featItem = featGrid.children[0]
  const featBadge = featItem.children[0]
  const featText = featItem.children[1]
  const featTitle = featText.children[0]
  const featDesc = featText.children[1]

  const gridInner = gridSec.children[0]
  const h2 = gridInner.children[0].querySelector('h2')
  const cardGrid = gridInner.children[1]
  const card = cardGrid.children[0]
  const cardHeader = card.children[0]
  const cardBadge = cardHeader.children[0]
  const cardName = cardHeader.children[1].children[0]
  const cardPath = cardHeader.children[1].children[1]
  const cardDesc = card.children[1]
  const tagRow = card.children[2]
  const tag = tagRow.children[0]

  return {
    heroSection: {
      padding: `${cs(heroSec).paddingTop} ${cs(heroSec).paddingRight} ${cs(heroSec).paddingBottom}`,
      background: cs(heroSec).backgroundColor,
      height: box(heroSec).h,
    },
    heroContainer: { maxWidth: cs(heroInner).maxWidth, width: box(heroInner).w },
    heroGrid: {
      gridTemplateColumns: cs(heroGrid).gridTemplateColumns,
      gap: cs(heroGrid).columnGap,
      alignItems: cs(heroGrid).alignItems,
      childCount: heroGrid.children.length,
    },
    badge: {
      padding: `${cs(badge).paddingTop} ${cs(badge).paddingRight}`,
      borderRadius: cs(badge).borderRadius,
      background: cs(badge).backgroundColor,
      border: `${cs(badge).borderWidth} ${cs(badge).borderColor}`,
      color: cs(badge).color,
      marginBottom: cs(badge).marginBottom,
      gap: cs(badge).columnGap,
      fontSize: cs(badge.querySelector('span')).fontSize,
      fontWeight: cs(badge.querySelector('span')).fontWeight,
    },
    h1: {
      fontSize: cs(h1).fontSize,
      fontWeight: cs(h1).fontWeight,
      lineHeight: cs(h1).lineHeight,
      letterSpacing: cs(h1).letterSpacing,
      marginBottom: cs(h1).marginBottom,
      color: cs(h1).color,
      accentColor: cs(h1.querySelector('span')).color,
    },
    heroP: {
      fontSize: cs(p).fontSize,
      color: cs(p).color,
      lineHeight: cs(p).lineHeight,
      marginBottom: cs(p).marginBottom,
    },
    btnAccent: {
      padding: `${cs(btns[0]).paddingTop} ${cs(btns[0]).paddingRight}`,
      background: cs(btns[0]).backgroundColor,
      color: cs(btns[0]).color,
      borderRadius: cs(btns[0]).borderRadius,
      fontSize: cs(btns[0]).fontSize,
      fontWeight: cs(btns[0]).fontWeight,
      height: box(btns[0]).h,
    },
    btnGhostSoft: {
      padding: `${cs(btns[1]).paddingTop} ${cs(btns[1]).paddingRight}`,
      background: cs(btns[1]).backgroundColor,
      color: cs(btns[1]).color,
      border: `${cs(btns[1]).borderWidth} ${cs(btns[1]).borderColor}`,
      borderRadius: cs(btns[1]).borderRadius,
      fontSize: cs(btns[1]).fontSize,
      fontWeight: cs(btns[1]).fontWeight,
    },
    btnGap: cs(btnRow).columnGap,
    featSection: {
      padding: `${cs(featSec).paddingTop} ${cs(featSec).paddingRight}`,
      background: cs(featSec).backgroundColor,
      borderTop: `${cs(featSec).borderTopWidth} ${cs(featSec).borderTopColor}`,
      borderBottom: `${cs(featSec).borderBottomWidth} ${cs(featSec).borderBottomColor}`,
      height: box(featSec).h,
    },
    featGrid: { cols: cs(featGrid).gridTemplateColumns, gap: cs(featGrid).columnGap },
    featItem: { gap: cs(featItem).columnGap, alignItems: cs(featItem).alignItems, height: box(featItem).h },
    featBadge: { ...box(featBadge), radius: cs(featBadge).borderRadius, bg: cs(featBadge).backgroundColor },
    featTitle: {
      fontSize: cs(featTitle).fontSize,
      fontWeight: cs(featTitle).fontWeight,
      color: cs(featTitle).color,
      marginBottom: cs(featTitle).marginBottom,
      height: box(featTitle).h,
    },
    featDesc: {
      fontSize: cs(featDesc).fontSize,
      color: cs(featDesc).color,
      lineHeight: cs(featDesc).lineHeight,
      height: box(featDesc).h,
    },
    gridSection: {
      padding: `${cs(gridSec).paddingTop} ${cs(gridSec).paddingRight} ${cs(gridSec).paddingBottom}`,
      height: box(gridSec).h,
    },
    h2: {
      fontSize: cs(h2).fontSize,
      fontWeight: cs(h2).fontWeight,
      letterSpacing: cs(h2).letterSpacing,
      color: cs(h2).color,
      marginBottom: cs(h2.parentElement).marginBottom,
      height: box(h2).h,
    },
    cardGrid: { cols: cs(cardGrid).gridTemplateColumns, gap: cs(cardGrid).columnGap, rowGap: cs(cardGrid).rowGap },
    card: {
      ...box(card),
      padding: cs(card).padding,
      background: cs(card).backgroundColor,
      border: `${cs(card).borderWidth} ${cs(card).borderColor}`,
      borderRadius: cs(card).borderRadius,
      cursor: cs(card).cursor,
    },
    cardBadge: { ...box(cardBadge), radius: cs(cardBadge).borderRadius, bg: cs(cardBadge).backgroundColor },
    cardHeaderGap: cs(cardHeader).columnGap,
    cardHeaderMb: cs(cardHeader).marginBottom,
    cardName: { fontSize: cs(cardName).fontSize, fontWeight: cs(cardName).fontWeight, color: cs(cardName).color },
    cardPath: { fontSize: cs(cardPath).fontSize, color: cs(cardPath).color },
    cardDesc: {
      fontSize: cs(cardDesc).fontSize,
      color: cs(cardDesc).color,
      lineHeight: cs(cardDesc).lineHeight,
      marginBottom: cs(cardDesc).marginBottom,
    },
    tag: {
      padding: `${cs(tag).paddingTop} ${cs(tag).paddingRight}`,
      borderRadius: cs(tag).borderRadius,
      fontSize: cs(tag).fontSize,
      color: cs(tag).color,
      background: cs(tag).backgroundColor,
      gap: cs(tagRow).columnGap,
    },
  }
})

console.log(JSON.stringify(m, null, 2))
fs.writeFileSync(path.join(process.cwd(), 'screenshots', 'api-measured.json'), JSON.stringify(m, null, 2))
await browser.close()
