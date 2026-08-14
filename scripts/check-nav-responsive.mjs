/** 네비 우측 요소들의 브레이크포인트별 노출 상태 확인 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
for (const w of [375, 640, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } })
  await page.goto((process.env.BASE_URL || 'http://localhost:3000') + '/')
  await page.waitForLoadState('networkidle')
  const r = await page.evaluate(() => {
    /*
      3단계에서 로그인·회원가입이 <button> → <a>(Button href) 로 바뀌었고,
      로그인의 hidden md:block 은 래퍼 <span> 에 있다. 자기 display 만 보면
      조상 숨김을 놓치므로 checkVisibility() 로 판정한다 (2026-08-15 갱신).
    */
    const vis = (el) => (el && el.checkVisibility() ? '노출' : '숨김')
    // 로고는 <a> 이므로 div 자식은 [0]=링크행, [1]=우측 클러스터
    const divs = document.querySelectorAll('nav > div > div')
    const links = divs[0]
    const cluster = divs[1]
    const items = Array.from(cluster.querySelectorAll('button, a'))
    const byText = (t) => items.find((b) => b.textContent.trim() === t)
    return {
      링크행: vis(links),
      폴더: vis(cluster.querySelector('a[aria-label="내 프로젝트"]')),
      로그인: vis(byText('로그인')),
      회원가입: vis(byText('회원가입')),
      햄버거: vis(items.find((b) => b.getAttribute('aria-controls') === 'mobile-menu')),
      네비높이: document.querySelector('nav > div').getBoundingClientRect().height,
    }
  })
  console.log(`[${String(w).padStart(4)}px]`, JSON.stringify(r))
  await page.close()
}
await browser.close()
