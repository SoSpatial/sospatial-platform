/**
 * 인증 동작 검증 (Playwright) — 로그인·회원가입·네비 상태 분기·세션 유지.
 *
 *   1. /login /signup 렌더 + 라벨↔컨트롤 연결 (getByLabel)
 *   2. 비로그인 네비: 로그인·회원가입이 실제 링크인지
 *   3. UI 로그인 (admin 이 만든 확인 완료 사용자) → 네비 로그아웃 표시
 *      → 새로고침 후 세션 유지 → ?next= 복귀 → 로그아웃 → 비로그인 복귀
 *   4. 실제 회원가입 (--signup-email <주소> 를 준 경우에만):
 *      확인 메일 발송 화면 + admin 으로 미확인 상태 검증 (Confirm email 켜짐 증명)
 *      ⚠ Supabase 기본 SMTP 는 시간당 발송 제한이 낮다 — 반복 실행 금지
 *
 * 사용: node scripts/verify-auth.mjs [--signup-email you+test@gmail.com]
 *       BASE_URL 환경변수로 대상 변경 (기본 http://localhost:3000)
 */
import fs from 'node:fs'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const SB = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const admin = createClient(SB, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const signupEmailArg = process.argv.indexOf('--signup-email')
const SIGNUP_EMAIL = signupEmailArg > -1 ? process.argv[signupEmailArg + 1] : null

const UI_EMAIL = 'auth-ui-test@example.com'
const UI_PW = 'AuthVerify-2026!ab'

let fail = 0
const check = (ok, label, detail = '') => {
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function deleteByEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const u = data?.users?.find((x) => x.email === email)
  if (u) await admin.auth.admin.deleteUser(u.id)
}
await deleteByEmail(UI_EMAIL)
await admin.auth.admin.createUser({ email: UI_EMAIL, password: UI_PW, email_confirm: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ── 1. 렌더 + 라벨 연결 ──
await page.goto(BASE + '/login')
check(await page.getByRole('heading', { name: '로그인' }).isVisible(), '/login 렌더')
check(await page.getByLabel('이메일').isVisible(), '/login 이메일 라벨 연결')
check(await page.getByLabel('비밀번호').isVisible(), '/login 비밀번호 라벨 연결')

await page.goto(BASE + '/signup')
check(await page.getByRole('heading', { name: '회원가입' }).isVisible(), '/signup 렌더')
check(await page.getByLabel('이메일').isVisible(), '/signup 이메일 라벨 연결')
check(await page.getByLabel('비밀번호').isVisible(), '/signup 비밀번호 라벨 연결')

// ── 2. 비로그인 네비 ──
await page.goto(BASE + '/')
{
  const loginHref = await page.locator('nav').getByRole('link', { name: '로그인' }).getAttribute('href')
  const signupHref = await page.locator('nav').getByRole('link', { name: '회원가입' }).getAttribute('href')
  check(loginHref === '/login' && signupHref === '/signup', '비로그인 네비: 로그인·회원가입 링크', `${loginHref} ${signupHref}`)
}

// ── 3. UI 로그인 → 세션 유지 → next 복귀 → 로그아웃 ──
await page.goto(BASE + '/login?next=' + encodeURIComponent('/request/source'))
await page.getByLabel('이메일').fill(UI_EMAIL)
await page.getByLabel('비밀번호').fill(UI_PW)
await page.getByRole('button', { name: '로그인' }).click()
await page.waitForURL(BASE + '/request/source')
check(true, '로그인 성공 + ?next=/request/source 복귀')
check(await page.locator('nav').getByRole('button', { name: '로그아웃' }).isVisible(), '로그인 네비: 로그아웃 표시')
check((await page.locator('nav').getByRole('link', { name: '회원가입' }).count()) === 0, '로그인 네비: 회원가입 숨김')

await page.goto(BASE + '/')
await page.reload()
await page.waitForTimeout(800)
check(await page.locator('nav').getByRole('button', { name: '로그아웃' }).isVisible(), '새로고침 후 세션 유지 (쿠키)')

// 잘못된 비밀번호 에러 문구 (별도 컨텍스트에서 — 현재 세션 유지)
{
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p2.goto(BASE + '/login')
  await p2.getByLabel('이메일').fill(UI_EMAIL)
  await p2.getByLabel('비밀번호').fill('wrong-password')
  await p2.getByRole('button', { name: '로그인' }).click()
  // Next 의 route announcer 도 role=alert 라서 폼 내부로 좁힌다
  const alert = p2.locator('form p[role="alert"]')
  await alert.waitFor()
  const msg = await alert.innerText()
  check(msg.includes('올바르지 않습니다'), '잘못된 자격 증명 에러 문구', msg)
  await p2.close()
}

await page.locator('nav').getByRole('button', { name: '로그아웃' }).click()
await page.locator('nav').getByRole('link', { name: '로그인' }).waitFor()
check(true, '로그아웃 → 비로그인 네비 복귀')

// ── 4. 실제 회원가입 (옵션 — 메일 발송 제한 주의) ──
if (SIGNUP_EMAIL) {
  await deleteByEmail(SIGNUP_EMAIL)
  await page.goto(BASE + '/signup')
  await page.getByLabel('이메일').fill(SIGNUP_EMAIL)
  await page.getByLabel('비밀번호').fill(UI_PW)
  await page.getByRole('button', { name: '회원가입' }).click()
  await page.getByRole('heading', { name: '확인 메일을 보냈습니다' }).waitFor({ timeout: 15000 })
  check(true, '회원가입 → 확인 메일 발송 화면')
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const u = data?.users?.find((x) => x.email === SIGNUP_EMAIL)
  check(!!u && !u.email_confirmed_at, 'Confirm email 켜짐 확인 (미확인 상태로 생성됨)')
  console.log(`→ ${SIGNUP_EMAIL} 메일함에서 확인 메일 실수신 여부를 확인할 것 (사용자 검증 항목)`)
} else {
  console.log('(회원가입 메일 테스트 생략 — --signup-email 미지정)')
}

await deleteByEmail(UI_EMAIL)
await browser.close()
console.log(fail === 0 ? '\n전부 통과' : `\n실패 ${fail}건`)
process.exit(fail === 0 ? 0 : 1)
