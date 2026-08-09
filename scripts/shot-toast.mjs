/** 토스트 요소만 확대 촬영 + 스펙 실측 */
import { chromium } from 'playwright'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })
await page.goto('http://localhost:3000/request/source')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.getByRole('button', { name: 'Request Dataset →' }).click()
await page.waitForTimeout(250)

const toast = page.getByRole('status')
await toast.screenshot({ path: path.join(OUT, 'toast-zoom.png') })

const spec = await page.evaluate(() => {
  const el = document.querySelector('[role="status"]')
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const dot = el.children[0]
  const text = el.children[1]
  return {
    position: cs.position,
    bottom: cs.bottom,
    zIndex: cs.zIndex,
    바닥에서: +(window.innerHeight - r.bottom).toFixed(1),
    가운데정렬: +(r.left + r.width / 2 - 720).toFixed(1),
    크기: `${r.width.toFixed(1)}×${r.height.toFixed(1)}`,
    padding: `${cs.paddingTop} ${cs.paddingRight}`,
    radius: cs.borderRadius,
    bg: cs.backgroundColor,
    border: `${cs.borderWidth} ${cs.borderColor}`,
    boxShadow: cs.boxShadow,
    gap: cs.columnGap,
    dot: `${getComputedStyle(dot).width}×${getComputedStyle(dot).height} ${getComputedStyle(dot).backgroundColor} r${getComputedStyle(dot).borderRadius}`,
    text: `${getComputedStyle(text).fontSize} ${getComputedStyle(text).fontWeight} ${getComputedStyle(text).color}`,
  }
})
console.log(JSON.stringify(spec, null, 2))
await browser.close()
