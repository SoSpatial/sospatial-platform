/**
 * 폼 접근성 실측 — 3개 폼 페이지에서
 *   1) 모든 폼 컨트롤의 스크린리더 이름(accessible name)
 *   2) Tab 이동으로 실제 포커스 링(outline)이 그려지는지
 *   3) 마우스 클릭 시 링이 뜨는지
 * 를 브라우저에서 직접 측정한다.
 */
import { chromium } from 'playwright'

const PAGES = ['/request/source', '/request/upload', '/request/describe']
const browser = await chromium.launch()

for (const route of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:3000' + route)
  await page.waitForLoadState('networkidle')

  // ── 1) 스크린리더 이름 ──────────────────────────────────────────
  // Playwright 의 aria 스냅샷은 접근성 이름 계산을 그대로 따른다.
  // `- textbox "이름"` / `- textbox` (이름 없음) 형태로 나온다.
  const aria = await page.locator('body').ariaSnapshot()
  const flat = aria
    .split('\n')
    .map((l) => l.trim().match(/^- (textbox|combobox|radio|checkbox|slider|spinbutton)(?: "([^"]*)")?/))
    .filter(Boolean)
    .map((m) => ({ role: m[1], name: m[2] || '' }))
  const unnamed = flat.filter((n) => !n.name.trim())

  // ── 2) Tab 이동 실측 ────────────────────────────────────────────
  await page.evaluate(() => document.body.focus())
  const tabbed = []
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase() + (el.type ? `[${el.type}]` : ''),
        name: el.getAttribute('aria-label') || el.labels?.[0]?.textContent?.trim() || el.textContent?.trim().slice(0, 18) || '',
        focusVisible: el.matches(':focus-visible'),
        outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
      }
    })
    if (!info) break
    if (['input', 'select', 'textarea'].some((t) => info.tag.startsWith(t))) tabbed.push(info)
  }

  // ── 3) 마우스 클릭 ──────────────────────────────────────────────
  const clickCheck = []
  for (const sel of ['input[type="text"]', 'textarea', 'select', 'input[type="radio"]']) {
    const el = page.locator(sel).first()
    if ((await el.count()) === 0) continue
    await el.click({ force: true })
    clickCheck.push(
      await el.evaluate((e) => ({
        tag: e.tagName.toLowerCase() + (e.type ? `[${e.type}]` : ''),
        focusVisible: e.matches(':focus-visible'),
        outlineWidth: getComputedStyle(e).outlineWidth,
      }))
    )
  }

  console.log(`\n━━━ ${route} ━━━`)
  console.log(`컨트롤 ${flat.length}개 / 이름 없음 ${unnamed.length}개`, unnamed.length ? unnamed : '')
  console.log('접근성 트리 이름:')
  flat.forEach((n) => console.log(`   ${n.role.padEnd(9)} "${n.name}"`))
  console.log(`Tab 도달 폼 컨트롤 ${tabbed.length}개 — 링 표시:`)
  tabbed.forEach((t) =>
    console.log(`   ${t.tag.padEnd(14)} ${t.focusVisible ? '링 O' : '링 X'}  ${t.outline}  "${t.name}"`)
  )
  console.log('마우스 클릭 시:')
  clickCheck.forEach((c) =>
    console.log(`   ${c.tag.padEnd(14)} ${c.focusVisible ? '링 O' : '링 X'}  outline ${c.outlineWidth}`)
  )
  await page.close()
}
await browser.close()
