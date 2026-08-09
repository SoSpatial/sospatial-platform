/**
 * 플레이스홀더·푸터·모바일 네비 촬영
 * 사용: node scripts/shot-pages.mjs
 */
import { chromium } from 'playwright'
import path from 'node:path'
import fs from 'node:fs'

const OUT = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:3000'

const browser = await chromium.launch()

async function ready(p) {
  await p.waitForLoadState('networkidle')
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(600)
}

// ── 데스크톱: 전체 페이지 + 푸터 ──────────────────────────────────
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await page.goto(BASE + '/data')
await ready(page)
await page.screenshot({ path: path.join(OUT, 'page-data-full.png'), fullPage: true })
await page.locator('footer').screenshot({ path: path.join(OUT, 'footer.png') })

// 푸터 링크가 404 가 아닌지 확인
const footerHrefs = await page.locator('footer a').evaluateAll((els) =>
  els.map((e) => e.getAttribute('href'))
)
const statuses = []
for (const href of footerHrefs) {
  const res = await page.request.get(BASE + href)
  statuses.push(`${href} → ${res.status()}`)
}
console.log('푸터 링크 상태:', statuses.join(', '))

// 카피라이트 연도 확인
const copyright = await page.locator('footer p').innerText()
console.log('카피라이트:', copyright)

// ── 모바일 375px: 닫힘 / 열림 ─────────────────────────────────────
const m = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
await m.goto(BASE + '/data')
await ready(m)
await m.screenshot({ path: path.join(OUT, 'mobile-closed.png') })

const toggle = m.getByRole('button', { name: '메뉴 열기' })
await toggle.click()
await m.waitForTimeout(300)
await m.screenshot({ path: path.join(OUT, 'mobile-open.png') })

// 접근성 속성 확인
const a11y = await m.evaluate(() => {
  const btn = document.querySelector('[aria-controls="mobile-menu"]')
  const panel = document.getElementById('mobile-menu')
  return {
    ariaLabel: btn?.getAttribute('aria-label'),
    ariaExpanded: btn?.getAttribute('aria-expanded'),
    panelExists: !!panel,
    panelLinks: panel ? Array.from(panel.querySelectorAll('a,button')).map((e) => e.textContent) : [],
  }
})
console.log('햄버거 a11y:', JSON.stringify(a11y, null, 2))

// 메뉴 열린 상태에서 링크 클릭 → 이동 후 자동 닫힘 확인
await m.getByRole('link', { name: 'API', exact: true }).click()
await m.waitForURL('**/api')
await m.waitForTimeout(400)
const closedAfterNav = await m.evaluate(() => !document.getElementById('mobile-menu'))
console.log('라우트 이동 후 메뉴 자동 닫힘:', closedAfterNav)
await m.screenshot({ path: path.join(OUT, 'mobile-after-nav.png') })

await browser.close()
console.log('\n생성: page-data-full.png, footer.png, mobile-closed.png, mobile-open.png, mobile-after-nav.png')
