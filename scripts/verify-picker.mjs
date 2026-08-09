/**
 * 파일 피커 모달을 reference/14-modal-file-picker.png 와 대조한다.
 * (모달 3종은 다음 단계 범위지만, upload 구현에 필요해 먼저 만들었으므로 확인만 한다)
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/request/upload')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.locator('select').first().selectOption('Google Drive')
await page.getByRole('button', { name: '연결하기' }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, 'impl-picker-full.png'), fullPage: true })

// 모달 패널 자체의 기하 실측
const spec = await page.evaluate(() => {
  const panel = document.querySelector('[role="dialog"] > div')
  const cs = getComputedStyle(panel)
  const r = panel.getBoundingClientRect()
  const backdrop = document.querySelector('[role="dialog"]')
  return {
    backdropBg: getComputedStyle(backdrop).backgroundColor,
    backdropZ: getComputedStyle(backdrop).zIndex,
    width: cs.width,
    maxHeight: cs.maxHeight,
    height: +r.height.toFixed(1),
    radius: cs.borderRadius,
    bg: cs.backgroundColor,
    border: `${cs.borderWidth} ${cs.borderColor}`,
    좌표: `x ${r.x.toFixed(1)} y ${r.y.toFixed(1)}`,
  }
})
console.log('모달 패널:', JSON.stringify(spec, null, 2))

await page.setContent('<body></body>')
const cmp = await page.evaluate(
  async ([refSrc, implSrc]) => {
    const load = (s) => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = s })
    const ref = await load(refSrc)
    const impl = await load(implSrc)
    const W = Math.min(ref.width, impl.width)
    const H = Math.min(ref.height, impl.height)
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c }
    const ca = mk(); const cb = mk()
    ca.getContext('2d').drawImage(ref, 0, 0)
    cb.getContext('2d').drawImage(impl, 0, 0)
    const a = ca.getContext('2d').getImageData(0, 0, W, H).data
    const b = cb.getContext('2d').getImageData(0, 0, W, H).data
    const px = (buf, x, y) => { const i = (y * W + x) * 4; return [buf[i], buf[i+1], buf[i+2]] }
    const dl = (p, q) => Math.max(Math.abs(p[0]-q[0]), Math.abs(p[1]-q[1]), Math.abs(p[2]-q[2]))
    let n = 0, nTol = 0
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = px(a, x, y); const d = dl(p, px(b, x, y))
      if (d > 16) { n++
        let best = d
        for (const dy of [-2,-1,1,2]) { const yy = y+dy; if (yy<0||yy>=H) continue; const dd = dl(p, px(b,x,yy)); if (dd<best) best = dd }
        if (best > 16) nTol++
      }
    }
    return { refCssHeight: ref.height/2, implCssHeight: impl.height/2,
      diffPercent: +((n/(W*H))*100).toFixed(3), diffPercentAligned: +((nTol/(W*H))*100).toFixed(3) }
  },
  [toDataUrl(path.join(process.cwd(), 'reference', '14-modal-file-picker.png')), toDataUrl(path.join(OUT, 'impl-picker-full.png'))]
)
console.log('\n차분:', JSON.stringify(cmp, null, 2))
await browser.close()
