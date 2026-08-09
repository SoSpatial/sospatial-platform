/** /request/describe 동작 확인 — 카운터 + 제출 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const logs = []
page.on('console', (m) => logs.push(m.text()))

await page.goto('http://localhost:3000/request/describe')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)

const ta = page.locator('textarea')
const counter = page.locator('form div.text-right')

console.log('초기 카운터            :', (await counter.innerText()).trim())
await ta.fill('서울시 상권 변화를 보고 싶어요')
await page.waitForTimeout(150)
console.log('15자 입력 후           :', (await counter.innerText()).trim())
await ta.fill('')
await page.waitForTimeout(150)
console.log('비운 후                :', (await counter.innerText()).trim())

const spec = await page.evaluate(() => {
  const t = document.querySelector('textarea')
  const cs = getComputedStyle(t)
  const c = document.querySelector('form div.text-right')
  const ccs = getComputedStyle(c)
  const btn = document.querySelector('button[type=submit]')
  const bcs = getComputedStyle(btn)
  return {
    textarea: {
      padding: cs.padding,
      fontSize: cs.fontSize,
      color: cs.color,
      lineHeight: cs.lineHeight,
      minHeight: cs.minHeight,
      resize: cs.resize,
      bg: cs.backgroundColor,
      border: `${cs.borderWidth} ${cs.borderColor}`,
      radius: cs.borderRadius,
      placeholderLines: t.placeholder.split('\n').length,
    },
    counter: { fontSize: ccs.fontSize, color: ccs.color, textAlign: ccs.textAlign, marginTop: ccs.marginTop },
    submit: {
      padding: `${bcs.paddingTop} ${bcs.paddingRight}`,
      bg: bcs.backgroundColor,
      color: bcs.color,
      radius: bcs.borderRadius,
      fontSize: bcs.fontSize,
      fontWeight: bcs.fontWeight,
      rowMarginTop: getComputedStyle(btn.parentElement).marginTop,
    },
  }
})
console.log('\n실측:', JSON.stringify(spec, null, 2))

logs.length = 0
await ta.fill('테스트 요청 내용')
await page.getByRole('button', { name: '이 방법으로 요청하기 →' }).click()
await page.waitForTimeout(300)
console.log('\n토스트                 :', (await page.getByRole('status').innerText()).trim())
console.log('console.log payload    :', logs.find((l) => l.includes('request/describe')) ?? '(없음)')

await browser.close()
