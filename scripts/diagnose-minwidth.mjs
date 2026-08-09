/**
 * 좁은 폭에서 폼 카드의 최소 폭을 결정하는 요소를 찾는다.
 * 폼의 직계 자식을 하나씩 숨겨 보고 좌측 컬럼 폭이 얼마나 줄어드는지 측정한다.
 */
import { chromium } from 'playwright'

const ROUTES = ['/request/source', '/request/upload', '/request/describe']
const browser = await chromium.launch()

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } })
  await page.goto('http://localhost:3000' + route)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)

  const r = await page.evaluate(() => {
    const grid = document.querySelector('main section > div > div:last-child')
    const card = grid.children[0]
    const form = card.querySelector('form')
    const w = () => +card.getBoundingClientRect().width.toFixed(1)
    const base = w()

    const rows = Array.from(form.children).map((el, i) => ({
      i,
      요약: (el.textContent || '').trim().slice(0, 22) || el.tagName,
    }))

    const impact = []
    for (const row of rows) {
      const el = form.children[row.i]
      const prev = el.style.display
      el.style.display = 'none'
      impact.push({ ...row, 숨겼을때: w(), 감소: +(base - w()).toFixed(1) })
      el.style.display = prev
    }

    // 가장 영향이 큰 행 안에서 다시 자식별로 확인
    impact.sort((a, b) => b.감소 - a.감소)
    let inner = []
    if (impact[0] && impact[0].감소 > 0) {
      const top = form.children[impact[0].i]
      inner = Array.from(top.querySelectorAll('*'))
        .filter((e) => ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.tagName))
        .map((e) => ({
          tag: e.tagName,
          식별: (e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 20),
          현재폭: +e.getBoundingClientRect().width.toFixed(1),
          최소폭: (() => {
            const prev = e.style.width
            e.style.width = 'min-content'
            const v = +e.getBoundingClientRect().width.toFixed(1)
            e.style.width = prev
            return v
          })(),
        }))
    }

    return {
      좌측컬럼폭: base,
      그리드폭: +grid.getBoundingClientRect().width.toFixed(1),
      컨테이너폭: +grid.parentElement.getBoundingClientRect().width.toFixed(1),
      행별영향: impact,
      최다영향행_컨트롤: inner,
    }
  })

  console.log(`\n===== ${route} @375px =====`)
  console.log(`좌측 컬럼 ${r.좌측컬럼폭}  / 그리드 ${r.그리드폭}  / 컨테이너 ${r.컨테이너폭}`)
  console.log('행별 영향 (감소 큰 순):')
  for (const x of r.행별영향) console.log(`   [${x.i}] ${x.요약.padEnd(24)} 숨김시 ${String(x.숨겼을때).padStart(6)}  감소 ${x.감소}`)
  if (r.최다영향행_컨트롤.length) {
    console.log('최다 영향 행의 컨트롤:')
    for (const c of r.최다영향행_컨트롤)
      console.log(`   ${c.tag.padEnd(9)} ${c.식별.padEnd(22)} 현재 ${String(c.현재폭).padStart(6)}  min-content ${c.최소폭}`)
  }
  await page.close()
}
await browser.close()
