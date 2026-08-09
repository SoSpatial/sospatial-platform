/**
 * OG 이미지 검증
 *  1) 텍스트 잘림 — 각 텍스트 블록의 잉크 경계가 캔버스 안에 있는지
 *  2) 폰트 폴백 여부 — 브라우저에서 Pretendard Bold 로 잰 글자 폭과
 *     OG PNG 의 실제 잉크 폭을 비교한다. 폴백이면 폭이 어긋난다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } })

// ── OG PNG 의 잉크 경계 스캔 ─────────────────────────────────────
const og = 'data:image/png;base64,' + fs.readFileSync('screenshots/og.png').toString('base64')
const scan = await page.evaluate(async (src) => {
  const img = await new Promise((res) => {
    const i = new Image()
    i.onload = () => res(i)
    i.src = src
  })
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, c.width, c.height).data
  const BG = [24, 24, 24]
  const isInk = (x, y) => {
    const i = (y * c.width + x) * 4
    return Math.abs(d[i] - BG[0]) + Math.abs(d[i + 1] - BG[1]) + Math.abs(d[i + 2] - BG[2]) > 24
  }
  // 지정한 y 밴드 안에서 x 방향 잉크 구간을 찾는다
  const band = (y0, y1, x0 = 0, x1 = c.width) => {
    let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++)
        if (isInk(x, y)) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
    return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, right: maxX }
  }
  return {
    canvas: { w: c.width, h: c.height },
    // 워드마크는 로고 마크(x<130) 를 빼고 잰다
    wordmark: band(60, 130, 140),
    eyebrow: band(215, 250),
    title: band(265, 365),
    sub: band(385, 425),
    footer: band(525, 560, 140),
    // 캔버스 가장자리 1px 에 잉크가 닿았는지 = 잘림 신호
    edgeTop: band(0, 1),
    edgeBottom: band(c.height - 1, c.height),
    edgeRight: band(0, c.height, c.width - 1, c.width),
  }
}, og)

// ── 브라우저에서 Pretendard Bold 로 같은 텍스트 폭 측정 ──────────
// Satori 에 넘긴 것과 "같은 파일"을 FontFace 로 직접 올린다.
// CDN 의 dynamic-subset CSS 를 쓰면 한글 서브셋이 늦게 도착해
// 측정 시점에 시스템 폴백 폭이 잡힌다 (라틴만 맞고 한글이 16% 어긋났던 원인).
const fontB64 = fs.readFileSync('assets/Pretendard-Bold.subset.woff').toString('base64')
await page.setContent('<!doctype html><html><body style="margin:0;background:#181818"></body></html>')
await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  const ff = new FontFace('Pretendard', bin.buffer, { weight: '700' })
  await ff.load()
  document.fonts.add(ff)
  await document.fonts.ready
}, fontB64)
const measured = await page.evaluate(() => {
  const mk = (text, px, ls, family) => {
    const s = document.createElement('span')
    s.textContent = text
    s.style.cssText = `position:absolute;white-space:pre;font-weight:700;font-size:${px}px;letter-spacing:${ls};font-family:${family}`
    document.body.appendChild(s)
    const w = s.getBoundingClientRect().width
    s.remove()
    return w
  }
  const cases = [
    ['SoSpatial', 36, '-0.02em'],
    ['공간 데이터 플랫폼', 82, '-0.035em'],
    ['흩어진 공간 데이터를 바로 쓸 수 있게', 30, '-0.015em'],
  ]
  return cases.map(([t, px, ls]) => ({
    text: t,
    pretendard: +mk(t, px, ls, 'Pretendard').toFixed(1),
    fallback: +mk(t, px, ls, 'serif').toFixed(1),
  }))
})

console.log('■ 캔버스', scan.canvas)
console.log('\n■ 잉크 경계 (잘림 확인)')
for (const k of ['wordmark', 'eyebrow', 'title', 'sub', 'footer']) {
  const b = scan[k]
  console.log(`   ${k.padEnd(9)} x ${String(b.x).padStart(4)}  w ${String(b.w).padStart(4)}  우측끝 ${String(b.right).padStart(4)}  (캔버스 ${scan.canvas.w})`)
}
console.log('\n■ 캔버스 가장자리 잉크 (있으면 잘림)')
console.log('   상단', scan.edgeTop ? '있음 ⚠' : '없음', ' 하단', scan.edgeBottom ? '있음 ⚠' : '없음', ' 우측', scan.edgeRight ? '있음 ⚠' : '없음')

console.log('\n■ 폰트 폴백 판정 (letter-spacing 포함 폭, 마지막 글자 우측 여백 때문에 잉크 폭이 조금 작다)')
const inkW = { 'SoSpatial': scan.wordmark.w, '공간 데이터 플랫폼': scan.title.w, '흩어진 공간 데이터를 바로 쓸 수 있게': scan.sub.w }
for (const m of measured) {
  const ink = inkW[m.text]
  const dP = (((ink - m.pretendard) / m.pretendard) * 100).toFixed(1)
  const dF = (((ink - m.fallback) / m.fallback) * 100).toFixed(1)
  console.log(`   "${m.text}"`)
  console.log(`      OG 잉크폭 ${ink}   Pretendard ${m.pretendard} (${dP}%)   serif 폴백 ${m.fallback} (${dF}%)`)
}

await browser.close()
