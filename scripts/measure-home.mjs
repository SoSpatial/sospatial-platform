/**
 * 홈 히어로 computed style 덤프 — 원본 인라인 CSS 와 1:1 대조용
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), top: +r.top.toFixed(1) }
  }

  const hero = document.querySelector('main section')
  const container = hero.children[0]
  const badge = container.children[0]
  const dot = badge.children[0]
  const badgeText = badge.children[1]
  const h1 = container.children[1]
  const p = container.children[2]
  const btnRow = container.children[3]
  const btnA = btnRow.children[0]
  const btnB = btnRow.children[1]
  const stats = container.children[4]
  const stat0 = stats.children[0]
  const statInner0 = stat0.children[0] // 첫 항목은 구분선이 없다
  const statValue = statInner0.children[0]
  const statLabel = statInner0.children[1]
  const stat1 = stats.children[1]
  const divider = stat1.children[0]

  return {
    heroSection: {
      padding: `${cs(hero).paddingTop} ${cs(hero).paddingRight} ${cs(hero).paddingBottom}`,
      textAlign: cs(hero).textAlign,
      background: cs(hero).backgroundColor,
      height: box(hero).h,
      top: box(hero).top,
    },
    container: { maxWidth: cs(container).maxWidth, width: box(container).w },
    badge: {
      display: cs(badge).display,
      gap: cs(badge).columnGap,
      padding: `${cs(badge).paddingTop} ${cs(badge).paddingRight}`,
      border: `${cs(badge).borderWidth} ${cs(badge).borderColor}`,
      borderRadius: cs(badge).borderRadius,
      background: cs(badge).backgroundColor,
      marginBottom: cs(badge).marginBottom,
      ...box(badge),
    },
    dot: { ...box(dot), radius: cs(dot).borderRadius, bg: cs(dot).backgroundColor },
    badgeText: {
      fontSize: cs(badgeText).fontSize,
      fontWeight: cs(badgeText).fontWeight,
      color: cs(badgeText).color,
      letterSpacing: cs(badgeText).letterSpacing,
    },
    h1: {
      fontSize: cs(h1).fontSize,
      fontWeight: cs(h1).fontWeight,
      lineHeight: cs(h1).lineHeight,
      letterSpacing: cs(h1).letterSpacing,
      marginBottom: cs(h1).marginBottom,
      color: cs(h1).color,
      accent: cs(h1.querySelector('span')).color,
      height: box(h1).h,
    },
    paragraph: {
      fontSize: cs(p).fontSize,
      fontWeight: cs(p).fontWeight,
      color: cs(p).color,
      lineHeight: cs(p).lineHeight,
      marginBottom: cs(p).marginBottom,
      strongColor: cs(p.querySelector('strong')).color,
      strongWeight: cs(p.querySelector('strong')).fontWeight,
      height: box(p).h,
    },
    btnRow: {
      justifyContent: cs(btnRow).justifyContent,
      gap: cs(btnRow).columnGap,
      marginBottom: cs(btnRow).marginBottom,
    },
    btnPrimary: {
      tag: btnA.tagName,
      padding: `${cs(btnA).paddingTop} ${cs(btnA).paddingRight}`,
      background: cs(btnA).backgroundColor,
      color: cs(btnA).color,
      borderRadius: cs(btnA).borderRadius,
      fontSize: cs(btnA).fontSize,
      fontWeight: cs(btnA).fontWeight,
      letterSpacing: cs(btnA).letterSpacing,
      ...box(btnA),
    },
    btnSecondary: {
      tag: btnB.tagName,
      padding: `${cs(btnB).paddingTop} ${cs(btnB).paddingRight}`,
      background: cs(btnB).backgroundColor,
      color: cs(btnB).color,
      border: `${cs(btnB).borderTopWidth} ${cs(btnB).borderColor}`,
      borderRadius: cs(btnB).borderRadius,
      fontSize: cs(btnB).fontSize,
      fontWeight: cs(btnB).fontWeight,
      ...box(btnB),
    },
    stats: { justifyContent: cs(stats).justifyContent, height: box(stats).h },
    statItem: { padding: `${cs(statInner0).paddingTop} ${cs(statInner0).paddingRight}` },
    statValue: {
      fontSize: cs(statValue).fontSize,
      fontWeight: cs(statValue).fontWeight,
      color: cs(statValue).color,
      letterSpacing: cs(statValue).letterSpacing,
    },
    statLabel: {
      fontSize: cs(statLabel).fontSize,
      color: cs(statLabel).color,
      marginTop: cs(statLabel).marginTop,
    },
    divider: { ...box(divider), background: cs(divider).backgroundColor },
  }
})

console.log(JSON.stringify(m, null, 2))
fs.writeFileSync(
  path.join(process.cwd(), 'screenshots', 'home-measured.json'),
  JSON.stringify(m, null, 2)
)
await browser.close()
