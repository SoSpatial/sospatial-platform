/**
 * 성능 진단 (진단만)
 *  - Pretendard CDN 로딩 방식과 FOUT 여부
 *  - 초기 요청 목록과 전송량
 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const reqs = []
page.on('response', async (res) => {
  const url = res.url()
  const type = res.request().resourceType()
  let size = 0
  try {
    size = (await res.body()).length
  } catch {}
  reqs.push({ url, type, size, status: res.status() })
})

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const info = await page.evaluate(() => {
  const links = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"], link[rel="preload"]')
  )
  const fonts = Array.from(document.fonts).map((f) => `${f.family} ${f.weight} ${f.status}`)
  const nav = performance.getEntriesByType('navigation')[0]
  const paints = performance.getEntriesByType('paint').map((p) => `${p.name} ${Math.round(p.startTime)}ms`)
  const fontFaces = []
  for (const sheet of document.styleSheets) {
    let rules
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const r of rules) {
      if (r.constructor.name === 'CSSFontFaceRule') {
        const d = r.style.getPropertyValue('font-display') || '(미지정 = auto)'
        fontFaces.push(`${r.style.getPropertyValue('font-family')} → font-display: ${d}`)
      }
    }
  }
  return {
    스타일시트링크: links.map((l) => ({
      rel: l.rel,
      호스트: new URL(l.href, location.href).host,
      precedence: l.getAttribute('data-precedence') || '(없음)',
    })),
    로드된폰트: [...new Set(fonts)].slice(0, 6),
    preconnect수: links.filter((l) => l.rel === 'preconnect').length,
    fontFace: [...new Set(fontFaces)].slice(0, 3),
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    paints,
  }
})

console.log('=== 폰트 로딩 ===')
console.log(JSON.stringify(info, null, 2))

console.log('\n=== 초기 요청 (타입별 합계) ===')
const byType = {}
for (const r of reqs) {
  byType[r.type] = byType[r.type] || { 건수: 0, 바이트: 0 }
  byType[r.type].건수++
  byType[r.type].바이트 += r.size
}
for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].바이트 - a[1].바이트))
  console.log(`   ${t.padEnd(12)} ${String(v.건수).padStart(3)}건  ${(v.바이트 / 1024).toFixed(1)} KB`)

console.log('\n=== 외부 호스트 요청 ===')
for (const r of reqs.filter((x) => !x.url.includes('localhost')))
  console.log(`   ${r.status}  ${(r.size / 1024).toFixed(1)} KB  ${r.url.slice(0, 92)}`)

await browser.close()
