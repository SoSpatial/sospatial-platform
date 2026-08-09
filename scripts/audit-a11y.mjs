/**
 * 접근성 진단 (진단만, 수정 없음)
 *  - 폼 컨트롤의 접근 가능한 이름 유무
 *  - 포커스 이동 순서와 포커스 링 표시
 *  - 텍스트 색 대비 (WCAG)
 */
import { chromium } from 'playwright'

const ROUTES = ['/', '/api', '/request', '/request/source', '/request/upload', '/request/describe']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('===== 폼 컨트롤 접근 가능한 이름 =====')
for (const route of ROUTES) {
  await page.goto('http://localhost:3000' + route)
  await page.waitForLoadState('networkidle')
  const r = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll('input, select, textarea'))
    const noName = []
    for (const el of controls) {
      const id = el.id
      const labelled =
        (id && document.querySelector(`label[for="${id}"]`)) ||
        el.closest('label') ||
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby')
      if (!labelled) {
        noName.push({
          tag: el.tagName.toLowerCase(),
          type: el.type || '',
          placeholder: el.getAttribute('placeholder')?.slice(0, 24) || '',
          // 시각적으로는 어떤 라벨 아래 있는지
          근처라벨: el.closest('div')?.parentElement?.querySelector('label')?.textContent?.trim().slice(0, 28) || '',
        })
      }
    }
    return { 전체: controls.length, 이름없음: noName }
  })
  console.log(`\n[${route}] 컨트롤 ${r.전체}개 중 접근 가능한 이름 없음 ${r.이름없음.length}개`)
  for (const c of r.이름없음.slice(0, 8))
    console.log(`   ${c.tag}${c.type ? '/' + c.type : ''}  placeholder="${c.placeholder}"  시각라벨="${c.근처라벨}"`)
}

console.log('\n\n===== 포커스 이동 (Tab 12회, /request/source) =====')
await page.goto('http://localhost:3000/request/source')
await page.waitForLoadState('networkidle')
for (let i = 0; i < 12; i++) {
  await page.keyboard.press('Tab')
  const f = await page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      라벨: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 24),
      outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
    }
  })
  if (f) console.log(`   ${String(i + 1).padStart(2)}. ${f.tag.padEnd(8)} ${f.라벨.padEnd(26)} outline: ${f.outline}`)
}

console.log('\n\n===== 텍스트 색 대비 (WCAG) =====')
const contrast = await page.evaluate(() => {
  const toLin = (c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const lum = ([r, g, b]) => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
  const over = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a))
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
    return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2)
  }
  const WHITE = [255, 255, 255]
  const BGS = { '#181818': [24, 24, 24], '#222222': [34, 34, 34], '#242424': [36, 36, 36] }
  const LEVELS = [0.7, 0.65, 0.55, 0.45, 0.42, 0.4, 0.38, 0.35, 0.3, 0.28, 0.25, 0.22, 0.2]
  const rows = []
  for (const lv of LEVELS) {
    const row = { 'ink': lv }
    for (const [name, bg] of Object.entries(BGS)) row[name] = ratio(over(WHITE, lv, bg), bg)
    rows.push(row)
  }
  return rows
})
console.log('  알파   #181818  #222222  #242424   판정(본문 4.5 / 큰글씨 3.0)')
for (const r of contrast) {
  const worst = Math.min(r['#181818'], r['#222222'], r['#242424'])
  const verdict = worst >= 4.5 ? 'AA 통과' : worst >= 3.0 ? '큰 글씨만 통과' : '미달'
  console.log(
    `  ${String(r.ink).padEnd(5)}  ${String(r['#181818']).padStart(6)}  ${String(r['#222222']).padStart(6)}  ${String(r['#242424']).padStart(6)}   ${verdict}`
  )
}

await browser.close()
