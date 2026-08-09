/**
 * 홈 전체 통합 검증
 * 구간별 개별 검증에서 기록한 절대 좌표가 합쳤을 때도 그대로인지 대조한다.
 */
import { chromium } from 'playwright'

// 구간별 개별 검증 시점에 기록한 값
const BASELINE = {
  '히어로 섹션 top': 64,
  '히어로 섹션 높이': 637.1,
  '히어로 섹션 끝 (= 밴드 시작)': 701.1,
  '밴드 top': 701.1,
  '헤딩 블록 top': 781.1,
  '헤딩 블록 높이': 59,
  '카드 그리드 top': 888.1,
  '카드1 높이': 396.88,
  '카드2 높이': 396.88,
  '카드3 높이': 396.88,
  '카드1 목업 높이': 193,
  '카드2 목업 높이': 185,
  '카드3 목업 높이': 185,
  '카드1 본문 높이': 201.9,
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const top = (el) => +(el.getBoundingClientRect().top + scrollY).toFixed(2)
  const h = (el) => +el.getBoundingClientRect().height.toFixed(2)

  const sections = document.querySelectorAll('main section')
  const hero = sections[0]
  const band = sections[1]
  const heading = band.children[0].children[0]
  const grid = band.children[0].children[1]
  const cards = Array.from(grid.children)
  const footer = document.querySelector('footer')

  return {
    '히어로 섹션 top': top(hero),
    '히어로 섹션 높이': h(hero),
    '히어로 섹션 끝 (= 밴드 시작)': +(top(hero) + h(hero)).toFixed(2),
    '밴드 top': top(band),
    '헤딩 블록 top': top(heading),
    '헤딩 블록 높이': h(heading),
    '카드 그리드 top': top(grid),
    '카드1 높이': h(cards[0]),
    '카드2 높이': h(cards[1]),
    '카드3 높이': h(cards[2]),
    '카드1 목업 높이': h(cards[0].children[0]),
    '카드2 목업 높이': h(cards[1].children[0]),
    '카드3 목업 높이': h(cards[2].children[0]),
    '카드1 본문 높이': h(cards[0].children[1]),
    _extra: {
      히어로패딩: `${cs(hero).paddingTop} ${cs(hero).paddingRight} ${cs(hero).paddingBottom}`,
      밴드패딩: `${cs(band).paddingTop} ${cs(band).paddingRight} ${cs(band).paddingBottom}`,
      밴드높이: h(band),
      밴드끝: +(top(band) + h(band)).toFixed(2),
      카드그리드끝: +(top(grid) + h(grid)).toFixed(2),
      카드폭: cards.map((c) => +c.getBoundingClientRect().width.toFixed(2)),
      카드x: cards.map((c) => +c.getBoundingClientRect().x.toFixed(2)),
      푸터top: top(footer),
      푸터높이: h(footer),
      문서높이: document.documentElement.scrollHeight,
      마지막섹션하단여백: +(top(footer) - (top(grid) + h(grid))).toFixed(2),
    },
  }
})

console.log('구간별 개별 검증값과 통합 후 값 대조\n')
console.log('  항목                              개별검증    통합후      차이')
console.log('  ' + '-'.repeat(62))
let moved = 0
for (const [k, base] of Object.entries(BASELINE)) {
  const now = m[k]
  const d = +(now - base).toFixed(2)
  if (Math.abs(d) > 0.01) moved++
  console.log(
    `  ${k.padEnd(32)} ${String(base).padStart(9)} ${String(now).padStart(10)} ${String(d === 0 ? '-' : d).padStart(9)}`
  )
}
console.log('\n  이동한 항목: ' + (moved === 0 ? '없음' : moved + '개'))

console.log('\n부가 정보')
for (const [k, v] of Object.entries(m._extra)) {
  console.log(`  ${k.padEnd(20)} ${JSON.stringify(v)}`)
}

await browser.close()
