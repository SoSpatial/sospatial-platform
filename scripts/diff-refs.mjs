/** reference 두 장을 서로 비교한다. 사용: node scripts/diff-refs.mjs <a.png> <b.png> */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [, , A, B] = process.argv
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')
const ROOT = path.join(process.cwd(), 'reference')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body></body>')

const r = await page.evaluate(
  async ([sa, sb]) => {
    const load = (s) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = s })
    const a0 = await load(sa); const b0 = await load(sb)
    const W = Math.min(a0.width, b0.width), H = Math.min(a0.height, b0.height)
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c }
    const ca = mk(), cb = mk()
    ca.getContext('2d').drawImage(a0, 0, 0); cb.getContext('2d').drawImage(b0, 0, 0)
    const a = ca.getContext('2d').getImageData(0,0,W,H).data
    const b = cb.getContext('2d').getImageData(0,0,W,H).data
    let n = 0, minX = W, maxX = 0, minY = H, maxY = 0
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.max(Math.abs(a[i]-b[i]), Math.abs(a[i+1]-b[i+1]), Math.abs(a[i+2]-b[i+2]))
      if (d > 8) { n++
        const p = i/4, x = p % W, y = (p/W)|0
        if (x<minX) minX=x; if (x>maxX) maxX=x; if (y<minY) minY=y; if (y>maxY) maxY=y
      }
    }
    return { size: `${a0.width}x${a0.height} vs ${b0.width}x${b0.height}`,
      diffPercent: +((n/(W*H))*100).toFixed(3),
      차이영역: n ? `x ${Math.round(minX/2)}–${Math.round(maxX/2)}, y ${Math.round(minY/2)}–${Math.round(maxY/2)}` : '없음' }
  },
  [toDataUrl(path.join(ROOT, A)), toDataUrl(path.join(ROOT, B))]
)
console.log(`${A} ↔ ${B}`)
console.log(JSON.stringify(r, null, 2))
await browser.close()
