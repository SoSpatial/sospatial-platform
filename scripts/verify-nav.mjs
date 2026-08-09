/**
 * 네비게이션 검증 스크립트
 *
 * 1) 구현 페이지를 1440×900 (DPR 2) 로 촬영 — reference PNG 와 동일 배율
 * 2) 네비 영역만 잘라 reference/01-home.png 상단과 나란히 붙인 비교 이미지 생성
 * 3) 실제 computed style 을 덤프해 원본 인라인 CSS 값과 대조
 *
 * 사용: node scripts/verify-nav.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'screenshots')
fs.mkdirSync(OUT, { recursive: true })

const BASE = 'http://localhost:3000'
const NAV_H = 64

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})

async function ready() {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // pageEnter 애니메이션(0.35s) 종료 대기
  await page.waitForTimeout(600)
}

// ── 1. 각 라우트 촬영 ─────────────────────────────────────────────
const routes = [
  ['/', 'home'],
  ['/data', 'data'],
  ['/projects', 'projects'],
  ['/maps', 'maps'],
]

for (const [route, name] of routes) {
  await page.goto(BASE + route)
  await ready()
  await page.screenshot({ path: path.join(OUT, `impl-${name}.png`) })
}

// 네비만 잘라내기 (홈 기준)
await page.goto(BASE + '/')
await ready()
await page.screenshot({
  path: path.join(OUT, 'impl-nav.png'),
  clip: { x: 0, y: 0, width: 1440, height: NAV_H },
})

// ── 2. computed style 덤프 ────────────────────────────────────────
const measured = await page.evaluate(() => {
  const px = (v) => v
  const get = (sel) => document.querySelector(sel)
  const cs = (el) => (el ? getComputedStyle(el) : null)

  const nav = get('nav')
  const inner = nav?.firstElementChild
  const logoLink = inner?.querySelector('a[aria-label="SoSpatial 홈"]')
  const svg = logoLink?.querySelector('svg')
  const wordmark = logoLink?.querySelector('span')
  const linkRow = inner?.children[1]
  const firstLink = linkRow?.querySelector('a')
  const rightCluster = inner?.children[2]
  const folderBtn = rightCluster?.querySelector('a')
  const loginBtn = rightCluster?.querySelectorAll('button')[0]
  const signupBtn = rightCluster?.querySelectorAll('button')[1]

  const navCs = cs(nav)
  const innerCs = cs(inner)
  const wordCs = cs(wordmark)
  const linkCs = cs(firstLink)
  const folderCs = cs(folderBtn)
  const loginCs = cs(loginBtn)
  const signupCs = cs(signupBtn)
  const logoCs = cs(logoLink)

  return {
    nav: {
      position: navCs.position,
      top: navCs.top,
      zIndex: navCs.zIndex,
      background: navCs.backgroundColor,
      backdropFilter: navCs.backdropFilter || navCs.webkitBackdropFilter,
      borderBottomWidth: navCs.borderBottomWidth,
    },
    inner: {
      height: px(inner?.getBoundingClientRect().height),
      maxWidth: innerCs.maxWidth,
      paddingLeft: innerCs.paddingLeft,
      paddingRight: innerCs.paddingRight,
      width: px(inner?.getBoundingClientRect().width),
      left: px(inner?.getBoundingClientRect().left),
    },
    logo: {
      gap: logoCs.columnGap,
      marginRight: logoCs.marginRight,
      svgWidth: svg?.getAttribute('width'),
      svgHeight: svg?.getAttribute('height'),
      rectCount: svg?.querySelectorAll('rect').length,
    },
    wordmark: {
      fontSize: wordCs.fontSize,
      fontWeight: wordCs.fontWeight,
      letterSpacing: wordCs.letterSpacing,
      color: wordCs.color,
      fontFamily: wordCs.fontFamily.split(',')[0],
    },
    navLink: {
      label: firstLink?.textContent,
      paddingLeft: linkCs.paddingLeft,
      paddingRight: linkCs.paddingRight,
      fontSize: linkCs.fontSize,
      fontWeight: linkCs.fontWeight,
      letterSpacing: linkCs.letterSpacing,
      color: linkCs.color,
      count: linkRow?.querySelectorAll('a').length,
    },
    folderBtn: {
      width: folderCs.width,
      height: folderCs.height,
      borderRadius: folderCs.borderRadius,
      borderColor: folderCs.borderColor,
      borderWidth: folderCs.borderWidth,
      color: folderCs.color,
    },
    loginBtn: {
      padding: `${loginCs.paddingTop} ${loginCs.paddingRight}`,
      borderRadius: loginCs.borderRadius,
      borderWidth: loginCs.borderWidth,
      borderColor: loginCs.borderColor,
      background: loginCs.backgroundColor,
      fontSize: loginCs.fontSize,
      fontWeight: loginCs.fontWeight,
      color: loginCs.color,
    },
    signupBtn: {
      padding: `${signupCs.paddingTop} ${signupCs.paddingRight}`,
      borderRadius: signupCs.borderRadius,
      background: signupCs.backgroundColor,
      fontSize: signupCs.fontSize,
      fontWeight: signupCs.fontWeight,
      color: signupCs.color,
    },
    rightClusterGap: cs(rightCluster).columnGap,
    bodyFont: cs(document.body).fontFamily.split(',')[0],
    bodyBg: cs(document.body).backgroundColor,
    pretendardLoaded: Array.from(document.fonts).some((f) =>
      f.family.includes('Pretendard')
    ),
  }
})

fs.writeFileSync(path.join(OUT, 'nav-measured.json'), JSON.stringify(measured, null, 2))
console.log(JSON.stringify(measured, null, 2))

// ── 3. reference 와 나란히 붙인 비교 이미지 ──────────────────────
const refPath = path.join(ROOT, 'reference', '01-home.png').split(path.sep).join('/')
const implPath = path.join(OUT, 'impl-nav.png').split(path.sep).join('/')

const compareHtml = `<!doctype html>
<meta charset="utf-8">
<style>
  body { margin:0; background:#0d0d0d; font-family: ui-monospace, monospace; }
  .label { color:#C4A882; font-size:12px; padding:6px 10px 4px; letter-spacing:.5px; }
  .strip { width:1440px; height:${NAV_H}px; overflow:hidden; position:relative; }
  .strip img { position:absolute; top:0; left:0; width:1440px; display:block; }
  .rule { height:1px; background:#C4A882; opacity:.35; }
  .gap { height:10px; }
</style>
<div class="label">① 원본 reference/01-home.png (상단 ${NAV_H}px)</div>
<div class="strip"><img src="file:///${refPath}"></div>
<div class="rule"></div>
<div class="gap"></div>
<div class="label">② 구현 localhost:3000/ (상단 ${NAV_H}px)</div>
<div class="strip"><img src="file:///${implPath}"></div>
<div class="rule"></div>
<div class="gap"></div>
<div class="label">③ 겹쳐보기 — 원본 위에 구현을 50% 불투명도로 합성</div>
<div class="strip">
  <img src="file:///${refPath}">
  <img src="file:///${implPath}" style="opacity:.5">
</div>
`

const cmpFile = path.join(OUT, '_compare.html')
fs.writeFileSync(cmpFile, compareHtml)
await page.goto('file:///' + cmpFile.split(path.sep).join('/'))
await page.waitForLoadState('networkidle')
await page.setViewportSize({ width: 1440, height: 300 })
await page.screenshot({ path: path.join(OUT, 'nav-compare.png'), fullPage: true })

await browser.close()
console.log('\n생성: screenshots/nav-compare.png, impl-*.png, nav-measured.json')
