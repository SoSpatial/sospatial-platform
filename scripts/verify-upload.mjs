/**
 * /request/upload 검증 촬영
 *   reference/10-request-upload.png 는 파일 선택 완료 상태로 캡처돼 있으므로
 *   같은 state 를 재현한 뒤 촬영해서 비교한다.
 *   기본(미선택) 상태와 피커 모달도 따로 남긴다.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
const toDataUrl = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const logs = []
page.on('console', (m) => logs.push(m.text()))

await page.goto('http://localhost:3000/request/upload')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)

// ① 기본 상태
await page.screenshot({ path: path.join(OUT, 'impl-requpload-default.png'), fullPage: true })

// ② 서비스 선택 → 연결하기 → 피커 모달
await page.locator('select').first().selectOption('Google Drive')
await page.getByRole('button', { name: '연결하기' }).click()
await page.waitForTimeout(300)
const modal = page.getByRole('dialog')
console.log('피커 모달 표시           :', await modal.isVisible())
console.log('모달 제목               :', (await modal.locator('h3').innerText()).trim())
console.log('모달 항목 수             :', await modal.locator('input[type=checkbox]').count())
console.log('기본 선택 항목           :', await modal.locator('.bg-accent-tint-06 span').first().innerText().catch(() => '(감지 실패)'))
await page.screenshot({ path: path.join(OUT, 'impl-requpload-picker.png') })

// ③ 파일 선택 완료 상태
await page.getByRole('button', { name: '선택하기' }).click()
await page.waitForTimeout(400)
const badge = page.locator('.text-chart-green').last()
console.log('선택된 파일 배지         :', (await badge.innerText()).trim())
await page.screenshot({ path: path.join(OUT, 'impl-requpload-natural.png'), fullPage: true })

/*
  reference 는 service select 이 "서비스 선택..." 인 채로 파일 배지가 떠 있다.
  프로토타입에서 state 를 직접 주입해 만든 조합이며 실제 UI 흐름으로는 도달할 수 없다
  (피커를 열려면 서비스를 골라야 한다).
  픽셀 비교를 위해 select 만 되돌려 같은 화면을 만든다.
*/
await page.locator('select').first().selectOption('')
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(OUT, 'impl-requpload.png'), fullPage: true })

// ④ 제출
logs.length = 0
await page.getByRole('button', { name: '데이터 요청하기 →' }).click()
await page.waitForTimeout(300)
console.log('토스트                  :', (await page.getByRole('status').innerText()).trim())
console.log('console.log payload     :', logs.find((l) => l.includes('request/upload')) ?? '(없음)')

// ⑤ 차분
await page.setContent('<body></body>')
const cmp = await page.evaluate(
  async ([refSrc, implSrc]) => {
    const load = (s) =>
      new Promise((r, j) => {
        const i = new Image()
        i.onload = () => r(i)
        i.onerror = j
        i.src = s
      })
    const ref = await load(refSrc)
    const impl = await load(implSrc)
    const W = Math.min(ref.width, impl.width)
    const H = Math.min(ref.height, impl.height)
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
    const px = (buf, x, y) => {
      const i = (y * W + x) * 4
      return [buf[i], buf[i + 1], buf[i + 2]]
    }
    const dl = (p, q) => Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]))
    let n = 0
    let nTol = 0
    let sum = 0
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = px(a, x, y)
        const d = dl(p, px(b, x, y))
        sum += d
        if (d > 16) {
          n++
          let best = d
          for (const dy of [-2, -1, 1, 2]) {
            const yy = y + dy
            if (yy < 0 || yy >= H) continue
            const dd = dl(p, px(b, x, yy))
            if (dd < best) best = dd
          }
          if (best > 16) nTol++
        }
      }
    }
    return {
      refCssHeight: ref.height / 2,
      implCssHeight: impl.height / 2,
      comparedArea: `${W}x${H}`,
      diffPercent: +((n / (W * H)) * 100).toFixed(3),
      diffPercentAligned: +((nTol / (W * H)) * 100).toFixed(3),
      avgDelta: +(sum / (W * H)).toFixed(2),
    }
  },
  [
    toDataUrl(path.join(process.cwd(), 'reference', '10-request-upload.png')),
    toDataUrl(path.join(OUT, 'impl-requpload.png')),
  ]
)
console.log('\n차분 (파일 선택 완료 상태):', JSON.stringify(cmp, null, 2))

await browser.close()
