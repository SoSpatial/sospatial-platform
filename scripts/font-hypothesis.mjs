/**
 * 가설 검증: reference PNG 는 Pretendard 없이 캡처됐다.
 *
 * 구현 페이지를 (A) Pretendard 정상 로드 (B) Pretendard 차단 두 조건으로 촬영해
 * 각각 reference 와 픽셀 차분한다. (B) 의 차이가 뚜렷이 작으면 가설이 참이다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
const NAV_H = 64
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()

async function shoot(blockFont) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  if (blockFont) {
    await page.route('**cdn.jsdelivr.net/**', (r) => r.abort())
  }
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  const file = path.join(OUT, blockFont ? 'impl-nav-nofont.png' : 'impl-nav.png')
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: NAV_H } })
  const family = await page.evaluate(
    () => getComputedStyle(document.querySelector('nav span')).fontFamily
  )
  await ctx.close()
  return { file, family }
}

const withFont = await shoot(false)
const noFont = await shoot(true)

// 차분
const page = await browser.newPage({ viewport: { width: 800, height: 300 } })
await page.setContent('<body></body>')

const refUrl = toDataUrl(path.join(ROOT, 'reference', '01-home.png'))

async function diffWith(implPath) {
  const implUrl = toDataUrl(implPath)
  return page.evaluate(
    async ([refSrc, implSrc]) => {
      const load = (src) =>
        new Promise((res, rej) => {
          const i = new Image()
          i.onload = () => res(i)
          i.onerror = rej
          i.src = src
        })
      const ref = await load(refSrc)
      const impl = await load(implSrc)
      const W = impl.width
      const H = impl.height
      const mk = () => {
        const c = document.createElement('canvas')
        c.width = W
        c.height = H
        return c
      }
      const ca = mk()
      const cb = mk()
      ca.getContext('2d').drawImage(ref, 0, 0)
      cb.getContext('2d').drawImage(impl, 0, 0)
      const a = ca.getContext('2d').getImageData(0, 0, W, H).data
      const b = cb.getContext('2d').getImageData(0, 0, W, H).data
      let n = 0
      let sum = 0
      for (let i = 0; i < a.length; i += 4) {
        const d = Math.max(
          Math.abs(a[i] - b[i]),
          Math.abs(a[i + 1] - b[i + 1]),
          Math.abs(a[i + 2] - b[i + 2])
        )
        sum += d
        if (d > 16) n++
      }
      return {
        diffPixels: n,
        diffPercent: +((n / (W * H)) * 100).toFixed(3),
        avgDelta: +(sum / (W * H)).toFixed(2),
      }
    },
    [refUrl, implUrl]
  )
}

const rA = await diffWith(withFont.file)
const rB = await diffWith(noFont.file)

console.log('A) Pretendard 로드됨   font-family:', withFont.family.split(',')[0])
console.log('   ', JSON.stringify(rA))
console.log('B) Pretendard 차단됨   font-family:', noFont.family.split(',')[0])
console.log('   ', JSON.stringify(rB))
console.log('')
console.log(
  rB.diffPixels < rA.diffPixels
    ? `→ 차단 시 차이가 ${(((rA.diffPixels - rB.diffPixels) / rA.diffPixels) * 100).toFixed(1)}% 감소. reference 는 Pretendard 없이 캡처된 것으로 판단된다.`
    : '→ 차단해도 줄지 않음. 가설이 틀렸다. 다른 원인을 찾아야 한다.'
)

await browser.close()
