/** 네비 우측 요소들의 브레이크포인트별 노출 상태 확인 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
for (const w of [375, 640, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } })
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState('networkidle')
  const r = await page.evaluate(() => {
    const vis = (el) => (el && getComputedStyle(el).display !== 'none' ? '노출' : '숨김')
    // 로고는 <a> 이므로 div 자식은 [0]=링크행, [1]=우측 클러스터
    const divs = document.querySelectorAll('nav > div > div')
    const links = divs[0]
    const cluster = divs[1]
    const btns = Array.from(cluster.querySelectorAll('button'))
    const folder = cluster.querySelector('a')
    return {
      링크행: vis(links),
      폴더: vis(folder),
      로그인: vis(btns.find((b) => b.textContent.trim() === '로그인')),
      회원가입: vis(btns.find((b) => b.textContent.trim() === '회원가입')),
      햄버거: vis(btns.find((b) => b.getAttribute('aria-controls') === 'mobile-menu')),
      네비높이: document.querySelector('nav > div').getBoundingClientRect().height,
    }
  })
  console.log(`[${String(w).padStart(4)}px]`, JSON.stringify(r))
  await page.close()
}
await browser.close()
