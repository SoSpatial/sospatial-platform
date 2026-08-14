/**
 * 저장·공유 모달 computed 값 검증
 *   reference 12·13 은 모달 미캡처라 픽셀 차분이 불가능하다 (CLAUDE.md 재추출 목록).
 *   파일 피커 선례(verify-picker.mjs)대로 원본 인라인 스타일 값(:909-951, :961-993)을
 *   getComputedStyle 로 전수 대조한다. 스크린샷은 기록용으로만 남긴다.
 *   재추출본을 받으면 백드롭 포함 전체 화면 차분으로 재검증할 것.
 */
import { chromium } from 'playwright'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'screenshots')
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const enc = encodeURIComponent

const browser = await chromium.launch()
const results = []
const report = (section, rows) => {
  for (const [name, expected, actual] of rows) {
    const ok = expected === actual
    results.push({ ok, line: `${ok ? 'PASS' : 'FAIL'}  [${section}] ${name}: ${actual}${ok ? '' : `  (기대: ${expected})`}` })
  }
}

/** dialog 내부 요소들의 computed 값 수집 */
const collect = (page, spec) =>
  page.evaluate((s) => {
    const dlg = document.querySelector('[role=dialog]')
    const out = {}
    for (const [key, sel, prop] of s) {
      const el = sel === ':backdrop' ? dlg : sel === ':panel' ? dlg.firstElementChild : dlg.querySelector(sel)
      out[key] = el ? getComputedStyle(el)[prop] : '(요소 없음)'
    }
    return out
  }, spec)

/* ══ 저장 모달 ══ */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(`${BASE}/data/select?topic=${enc('인구·사회')}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const col = (label) => page.locator(`div:has(> div > span:text-is("${label}"))`).last()
  await col('세부 주제 선택').getByRole('button', { name: '이동인구', exact: true }).click()
  await col('단위 선택').getByRole('button', { name: '행정동', exact: true }).click()
  await col('지역 선택').getByRole('button', { name: '서울특별시', exact: true }).click()
  await col('년도 선택').getByRole('button', { name: '2024', exact: true }).click()
  await page.locator('div:has(> input[type=checkbox])', { hasText: '생활인구 (시간별)' }).locator('input').check()
  await page.getByRole('button', { name: '프로젝트에 저장' }).click()
  await page.waitForTimeout(300)

  const v = await collect(page, [
    ['backdropBg', ':backdrop', 'backgroundColor'],
    ['backdropZ', ':backdrop', 'zIndex'],
    ['panelBg', ':panel', 'backgroundColor'],
    ['panelBorder', ':panel', 'borderTopColor'],
    ['panelBorderW', ':panel', 'borderTopWidth'],
    ['panelRadius', ':panel', 'borderRadius'],
    ['panelPad', ':panel', 'padding'],
    ['panelW', ':panel', 'width'],
    ['titleSize', 'span.text-15', 'fontSize'],
    ['titleWeight', 'span.text-15', 'fontWeight'],
    ['trackBg', '.bg-surface-deep', 'backgroundColor'],
    ['trackRadius', '.bg-surface-deep', 'borderRadius'],
    ['trackPad', '.bg-surface-deep', 'padding'],
    ['tabActiveBg', '.bg-control', 'backgroundColor'],
    ['tabActiveColor', '.bg-control', 'color'],
    ['tabPad', '.bg-control', 'padding'],
    ['tabRadius', '.bg-control', 'borderRadius'],
    ['tabSize', '.bg-control', 'fontSize'],
    ['tabWeight', '.bg-control', 'fontWeight'],
    ['inputBg', 'input[type=text]', 'backgroundColor'],
    ['inputPad', 'input[type=text]', 'padding'],
    ['inputRadius', 'input[type=text]', 'borderRadius'],
    ['inputBorder', 'input[type=text]', 'borderTopColor'],
    ['inputSize', 'input[type=text]', 'fontSize'],
  ])
  report('저장', [
    ['backdrop rgba(0,0,0,0.7)', 'rgba(0, 0, 0, 0.7)', v.backdropBg],
    ['backdrop z 2000', '2000', v.backdropZ],
    ['패널 #242424', 'rgb(36, 36, 36)', v.panelBg],
    ['패널 보더 line-10', 'rgba(255, 255, 255, 0.1)', v.panelBorder],
    ['패널 보더 1px', '1px', v.panelBorderW],
    ['패널 radius 16', '16px', v.panelRadius],
    ['패널 패딩 28', '28px', v.panelPad],
    ['패널 폭 420', '420px', v.panelW],
    ['제목 15px', '15px', v.titleSize],
    ['제목 700', '700', v.titleWeight],
    ['탭 트랙 #1A1A1A', 'rgb(26, 26, 26)', v.trackBg],
    ['탭 트랙 radius 8', '8px', v.trackRadius],
    ['탭 트랙 패딩 3', '3px', v.trackPad],
    ['활성 탭 #333', 'rgb(51, 51, 51)', v.tabActiveBg],
    ['활성 탭 #fff', 'rgb(255, 255, 255)', v.tabActiveColor],
    ['탭 패딩 7px', '7px 0px', v.tabPad],
    ['탭 radius 6', '6px', v.tabRadius],
    ['탭 13px', '13px', v.tabSize],
    ['탭 600', '600', v.tabWeight],
    ['인풋 #1A1A1A', 'rgb(26, 26, 26)', v.inputBg],
    ['인풋 패딩 11 14', '11px 14px', v.inputPad],
    ['인풋 radius 9', '9px', v.inputRadius],
    ['인풋 보더 line-12', 'rgba(255, 255, 255, 0.12)', v.inputBorder],
    ['인풋 14px', '14px', v.inputSize],
  ])

  // 푸터 버튼 (취소=neutral, 저장=accent)
  const btn = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]')
    const btns = [...dlg.querySelectorAll('button')].filter((b) => ['취소', '저장'].includes(b.textContent))
    return btns.map((b) => {
      const c = getComputedStyle(b)
      return { label: b.textContent, pad: c.padding, bg: c.backgroundColor, radius: c.borderRadius, size: c.fontSize, weight: c.fontWeight, color: c.color, border: c.borderTopColor }
    })
  })
  const cancel = btn.find((b) => b.label === '취소')
  const save = btn.find((b) => b.label === '저장')
  report('저장/푸터', [
    ['취소 패딩 9 20', '9px 20px', cancel.pad],
    ['취소 bg fill-07', 'rgba(255, 255, 255, 0.07)', cancel.bg],
    ['취소 보더 line-12', 'rgba(255, 255, 255, 0.12)', cancel.border],
    ['취소 radius 8', '8px', cancel.radius],
    ['취소 13.5px/400', '13.5px/400', `${cancel.size}/${cancel.weight}`],
    ['취소 ink-70', 'rgba(255, 255, 255, 0.7)', cancel.color],
    ['저장 accent bg', 'rgb(196, 168, 130)', save.bg],
    ['저장 13.5px/700', '13.5px/700', `${save.size}/${save.weight}`],
    ['저장 글자 #1A1A1A', 'rgb(26, 26, 26)', save.color],
  ])

  // 기존 탭 select
  await page.getByRole('button', { name: '기존 프로젝트에 추가' }).click()
  const sel = await collect(page, [
    ['selBg', 'select', 'backgroundColor'],
    ['selPad', 'select', 'padding'],
    ['selRadius', 'select', 'borderRadius'],
    ['selSize', 'select', 'fontSize'],
  ])
  report('저장/기존탭', [
    ['select #1A1A1A', 'rgb(26, 26, 26)', sel.selBg],
    ['select 패딩 11 14', '11px 14px', sel.selPad],
    ['select radius 9', '9px', sel.selRadius],
    ['select 14px', '14px', sel.selSize],
  ])
  await page.getByRole('button', { name: '새 프로젝트' }).click()
  await page.screenshot({ path: path.join(OUT, 'impl-modal-save.png'), animations: 'disabled' })
  await page.close()
}

/* ══ 공유 모달 ══ */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  await page.addInitScript(() => {
    localStorage.setItem(
      'sospatial_projects',
      JSON.stringify([
        { id: 1, name: '서울 상권 분석 2024', starred: true, date: '2024.11.12', sharing: '내가 공유', sharedWith: ['kim@example.com'], variables: [] },
      ])
    )
  })
  await page.goto(`${BASE}/projects`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: '공유하기' }).first().click()
  await page.waitForTimeout(300)
  // 칩 렌더를 위해 하나 추가
  await page.getByLabel('공유할 이메일').fill('lee@example.com')
  await page.getByRole('button', { name: '추가' }).click()
  await page.mouse.move(0, 0) // 클릭 후 포인터가 버튼 위에 남으면 :hover 값이 측정된다

  const v = await collect(page, [
    ['backdropBg', ':backdrop', 'backgroundColor'],
    ['backdropZ', ':backdrop', 'zIndex'],
    ['panelW', ':panel', 'width'],
    ['sectionLabelSize', 'span.uppercase', 'fontSize'],
    ['sectionLabelLs', 'span.uppercase', 'letterSpacing'],
    ['sharedRowBg', '.bg-surface-deep', 'backgroundColor'],
    ['sharedRowPad', '.bg-surface-deep', 'padding'],
    ['sharedRowRadius', '.bg-surface-deep', 'borderRadius'],
    ['revokeBg', '.bg-revoke-tint-10', 'backgroundColor'],
    ['revokePad', '.bg-revoke-tint-10', 'padding'],
    ['revokeColor', '.bg-revoke-tint-10', 'color'],
    ['revokeBorder', '.bg-revoke-tint-10', 'borderTopColor'],
    ['revokeRadius', '.bg-revoke-tint-10', 'borderRadius'],
    ['revokeSize', '.bg-revoke-tint-10', 'fontSize'],
    ['addBg', '.bg-accent-tint-15', 'backgroundColor'],
    ['addPad', '.bg-accent-tint-15', 'padding'],
    ['addBorder', '.bg-accent-tint-15', 'borderTopColor'],
    ['addRadius', '.bg-accent-tint-15', 'borderRadius'],
    ['chipBg', '.bg-accent-tint-10', 'backgroundColor'],
    ['chipPad', '.bg-accent-tint-10', 'padding'],
    ['chipBorder', '.bg-accent-tint-10', 'borderTopColor'],
    ['chipRadius', '.bg-accent-tint-10', 'borderRadius'],
  ])
  report('공유', [
    ['backdrop rgba(0,0,0,0.7)', 'rgba(0, 0, 0, 0.7)', v.backdropBg],
    ['backdrop z 2000', '2000', v.backdropZ],
    ['패널 폭 420', '420px', v.panelW],
    ['섹션 라벨 11px', '11px', v.sectionLabelSize],
    ['섹션 라벨 ls .06em(0.66px)', '0.66px', v.sectionLabelLs],
    ['공유자 행 #1A1A1A', 'rgb(26, 26, 26)', v.sharedRowBg],
    ['공유자 행 패딩 8 12', '8px 12px', v.sharedRowPad],
    ['공유자 행 radius 8', '8px', v.sharedRowRadius],
    ['공유 취소 bg rgba(220,70,70,0.1)', 'rgba(220, 70, 70, 0.1)', v.revokeBg],
    ['공유 취소 패딩 3 10', '3px 10px', v.revokePad],
    ['공유 취소 글자 rgba(220,100,100,0.85)', 'rgba(220, 100, 100, 0.85)', v.revokeColor],
    ['공유 취소 보더 rgba(220,70,70,0.2)', 'rgba(220, 70, 70, 0.2)', v.revokeBorder],
    ['공유 취소 radius 6', '6px', v.revokeRadius],
    ['공유 취소 11.5px', '11.5px', v.revokeSize],
    ['추가 버튼 bg accent-15', 'rgba(196, 168, 130, 0.15)', v.addBg],
    ['추가 버튼 패딩 11 16', '11px 16px', v.addPad],
    ['추가 버튼 보더 accent-30', 'rgba(196, 168, 130, 0.3)', v.addBorder],
    ['추가 버튼 radius 9', '9px', v.addRadius],
    ['칩 bg accent-10', 'rgba(196, 168, 130, 0.1)', v.chipBg],
    ['칩 패딩 4 10', '4px 10px', v.chipPad],
    ['칩 보더 accent-20', 'rgba(196, 168, 130, 0.2)', v.chipBorder],
    ['칩 radius 6', '6px', v.chipRadius],
  ])
  await page.screenshot({ path: path.join(OUT, 'impl-modal-share.png'), animations: 'disabled' })
  await page.close()
}

for (const r of results) console.log(r.line)
const fails = results.filter((r) => !r.ok).length
console.log(`\n${results.length - fails}/${results.length} PASS${fails ? ` — FAIL ${fails}` : ' (ALL PASS)'}`)
await browser.close()
