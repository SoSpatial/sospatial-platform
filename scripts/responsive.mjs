/**
 * 반응형 확인 — 지정한 라우트를 375 / 768 / 1024 / 1440 에서 촬영하고
 * 가로 오버플로와 주요 그리드 열 수를 함께 보고한다.
 *
 * 사용: node scripts/responsive.mjs <route> <name>
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , route = '/', name = 'home'] = process.argv
const OUT = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(OUT, { recursive: true })

const WIDTHS = [375, 768, 1024, 1440]

const browser = await chromium.launch()

for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })
  await page.goto('http://localhost:3000' + route)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, `rsp-${name}-${w}.png`), fullPage: true })

  const info = await page.evaluate(() => {
    const cs = (el) => getComputedStyle(el)
    const cols = (el) => cs(el).gridTemplateColumns.split(' ').filter(Boolean).length
    const sec = document.querySelector('main section')
    const grids = Array.from(document.querySelectorAll('main [class*="grid-cols"]'))
    return {
      docWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      가로오버플로: document.documentElement.scrollWidth > window.innerWidth,
      섹션좌우패딩: sec ? `${cs(sec).paddingLeft} / ${cs(sec).paddingRight}` : '-',
      그리드열수: grids.map((g) => cols(g)),
      스티키: Array.from(document.querySelectorAll('main [class*="sticky"]')).map(
        (e) => cs(e).position
      ),
      네비링크노출: getComputedStyle(document.querySelector('nav div div:nth-child(2)')).display,
    }
  })
  console.log(`\n[${w}px]`)
  for (const [k, v] of Object.entries(info)) console.log(`   ${k.padEnd(14)} ${JSON.stringify(v)}`)
  await page.close()
}

await browser.close()
console.log(`\n생성: screenshots/rsp-${name}-{375,768,1024,1440}.png`)
