/**
 * /request/source 동작 확인
 *   - 변수 추가/삭제
 *   - 지역 선택 시 세부 지역 select 노출
 *   - 제출 시 토스트 + console.log payload + 2500ms 자동 소멸
 */
import { chromium } from 'playwright'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

const logs = []
page.on('console', (m) => logs.push(m.text()))

await page.goto('http://localhost:3000/request/source')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)

const varInputs = () => page.locator('input[placeholder="예: population, elderly_65+..."]')
const addBtn = page.getByRole('button', { name: '+ 변수 추가' })

console.log('초기 변수 인풋 개수      :', await varInputs().count())

await addBtn.click()
await page.waitForTimeout(120)
console.log('추가 1회 후             :', await varInputs().count())
await addBtn.click()
await page.waitForTimeout(120)
console.log('추가 2회 후             :', await varInputs().count())

await page.getByRole('button', { name: '변수 3 삭제' }).click()
await page.waitForTimeout(120)
console.log('삭제 1회 후             :', await varInputs().count())

// 최소 1개 유지 확인
for (let i = await varInputs().count(); i > 0; i--) {
  await page.getByRole('button', { name: `변수 ${i} 삭제` }).click()
  await page.waitForTimeout(80)
}
console.log('전부 삭제 시도 후 남은 수 :', await varInputs().count(), '(최소 1개 유지)')

// 세부 지역
const selects = page.locator('select')
console.log('\n지역 선택 전 select 개수 :', await selects.count())
await selects.nth(0).selectOption('서울특별시')
await page.waitForTimeout(200)
console.log('서울특별시 선택 후        :', await selects.count(), '(세부 지역 추가)')
const subOptions = await selects.nth(1).locator('option').count()
console.log('세부 지역 옵션 수         :', subOptions)
await selects.nth(0).selectOption('전국')
await page.waitForTimeout(200)
console.log('전국으로 되돌린 후        :', await selects.count())

// 제출
await varInputs().first().fill('population')
await page.locator('input[placeholder="예) data.go.kr, KOSIS, census.gov 등"]').fill('data.go.kr')
await page.getByRole('radio', { name: 'GeoJSON' }).check()
logs.length = 0
await page.getByRole('button', { name: 'Request Dataset →' }).click()
await page.waitForTimeout(300)

const toast = page.getByRole('status')
console.log('\n토스트 표시              :', await toast.isVisible())
console.log('토스트 문구              :', (await toast.innerText()).trim())
await page.screenshot({ path: path.join(OUT, 'source-toast.png') })
console.log('console.log payload     :', logs.find((l) => l.includes('request/source')) ?? '(없음)')

await page.waitForTimeout(2400)
console.log('2500ms 후 토스트 표시    :', await toast.isVisible().catch(() => false))

await browser.close()
