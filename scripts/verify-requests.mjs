/**
 * Request 실접수 검증 (4번 설계 5번)
 *
 *   1. 비로그인 × 폼 3종 — 제출 → 로그인 유도(notice) → 복귀(?resume=1) → 폼 복원
 *      실측 → 재제출 → 성공 토스트 + DB 행 대조
 *   2. 로그인 × 폼 3종 — 바로 제출 → DB 대조 (+ mail_sent, v3 적용 시)
 *   3. 경계 — 쿠키 없는 직접 POST 401 / 33KB 400 / rate limit 429
 *      (429 는 admin 으로 채운 필러 행으로 유도 — 실메일 추가 발송 없음)
 *
 * 실메일: 1·2에서 총 6건이 REQUEST_NOTIFY_EMAIL 로 발송된다 — 수신함 확인은
 * 사용자 검증 항목. 테스트 사용자·행은 종료 시 정리한다.
 *
 * 사용: node scripts/verify-requests.mjs   (BASE_URL 기본 http://localhost:3100)
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
const BASE = process.env.BASE_URL || 'http://localhost:3100'
const EMAIL = 'req-verify@example.com'
const PW = 'ReqVerify-2026!ab'

let n = 0
let fail = 0
const check = (ok, label, detail = '') => {
  n++
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${String(n).padStart(2)}] ${label}${detail ? ` — ${detail}` : ''}`)
}
const until = async (fn, timeout = 8000, step = 300) => {
  const t0 = Date.now()
  for (;;) {
    const v = await fn()
    if (v) return v
    if (Date.now() - t0 > timeout) return null
    await new Promise((r) => setTimeout(r, step))
  }
}

await (async () => {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const u = data?.users?.find((x) => x.email === EMAIL)
  if (u) {
    await admin.from('requests').delete().eq('user_id', u.id)
    await admin.auth.admin.deleteUser(u.id)
  }
})()
const { data: created } = await admin.auth.admin.createUser({ email: EMAIL, password: PW, email_confirm: true })
const UID = created.user.id

const reqRows = async () => {
  const { data } = await admin
    .from('requests')
    .select('id,method,payload,email,user_id,status,created_at')
    .eq('user_id', UID)
    .order('id')
  return data ?? []
}

// mail_sent 컬럼(v3) 적용 여부
const hasMailSent = !(await admin.from('requests').select('mail_sent').limit(1)).error

/** 폼 3종 정의 — fill: 값 입력 / assertRestored: 복귀 후 복원 확인 / dbCheck: payload 대조 */
const FORMS = [
  {
    method: 'source',
    fill: async (page) => {
      await page.getByLabel(/Dataset/).fill('https://data.go.kr/verify-test')
      await page.locator('textarea').fill('검증용 추가 요청사항입니다')
    },
    assertRestored: async (page) =>
      (await page.getByLabel(/Dataset/).inputValue()) === 'https://data.go.kr/verify-test' &&
      (await page.locator('textarea').inputValue()) === '검증용 추가 요청사항입니다',
    dbCheck: (p) => p.dataset === 'https://data.go.kr/verify-test' && p.notes === '검증용 추가 요청사항입니다',
  },
  {
    method: 'upload',
    fill: async (page) => {
      await page.locator('select').first().selectOption('Google Drive')
    },
    assertRestored: async (page) => (await page.locator('select').first().inputValue()) === 'Google Drive',
    dbCheck: (p) => p.service === 'Google Drive',
  },
  {
    method: 'describe',
    fill: async (page) => {
      await page.locator('textarea').fill('검증용 설명 텍스트')
    },
    assertRestored: async (page) => (await page.locator('textarea').inputValue()) === '검증용 설명 텍스트',
    dbCheck: (p) => p.text === '검증용 설명 텍스트' && p.length === '검증용 설명 텍스트'.length,
  },
]

const browser = await chromium.launch()

/* ── 1. 비로그인 → 로그인 유도 → 복원 → 재제출 ── */
console.log('■ 1. 비로그인 × 폼 3종 (로그인 게이트 + 폼 보존)')
for (const f of FORMS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/request/${f.method}`)
  await page.waitForLoadState('networkidle')
  await f.fill(page)
  await page.locator('form button[type=submit]').first().click()
  await page.waitForURL(/\/login\?notice=request-login/)
  check(true, `${f.method}: 비로그인 제출 → /login?notice=request-login`)
  check(
    await page.getByText('요청 접수에는 로그인이 필요합니다', { exact: false }).isVisible(),
    `${f.method}: 로그인 안내 문구`
  )
  await page.getByLabel('이메일').fill(EMAIL)
  await page.getByLabel('비밀번호').fill(PW)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(`${BASE}/request/${f.method}?resume=1`)
  check(true, `${f.method}: 로그인 → ?resume=1 복귀`)
  await page.waitForTimeout(600)
  check(await f.assertRestored(page), `${f.method}: 폼 내용 복원`)
  await page.locator('form button[type=submit]').first().click()
  check(
    await page.getByText('요청이 접수되었습니다').isVisible({ timeout: 10000 }).catch(() => false) ||
      (await until(async () => page.getByText('요청이 접수되었습니다').isVisible(), 8000)) !== null,
    `${f.method}: 재제출 → 성공 토스트`
  )
  const row = await until(async () => (await reqRows()).find((r) => r.method === f.method))
  check(!!row && f.dbCheck(row.payload), `${f.method}: DB 행 payload 대조`)
  check(row?.email === EMAIL && row?.user_id === UID && row?.status === 'received', `${f.method}: email·user_id·status 대조`)
  await ctx.close()
}

/* ── 2. 로그인 상태 바로 제출 ── */
console.log('\n■ 2. 로그인 × 폼 3종 (직행 제출)')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/login`)
  await page.getByLabel('이메일').fill(EMAIL)
  await page.getByLabel('비밀번호').fill(PW)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(`${BASE}/`)
  for (const f of FORMS) {
    const before = (await reqRows()).filter((r) => r.method === f.method).length
    await page.goto(`${BASE}/request/${f.method}`)
    await page.waitForLoadState('networkidle')
    await f.fill(page)
    await page.locator('form button[type=submit]').first().click()
    const ok = await until(async () => page.getByText('요청이 접수되었습니다').isVisible())
    check(!!ok, `${f.method}: 로그인 상태 제출 → 성공 토스트`)
    const added = await until(async () => {
      const rows = (await reqRows()).filter((r) => r.method === f.method)
      return rows.length === before + 1 ? rows[rows.length - 1] : null
    })
    check(!!added && f.dbCheck(added.payload), `${f.method}: DB 행 추가 대조`)
  }
  if (hasMailSent) {
    const rows = await admin.from('requests').select('id,mail_sent').eq('user_id', UID)
    const sent = (rows.data ?? []).filter((r) => r.mail_sent).length
    check(sent === (rows.data ?? []).length, 'mail_sent 전건 true (발송 성공 추적)', `${sent}/${rows.data?.length}`)
  } else {
    console.log('      (mail_sent 컬럼 v3 미적용 — 발송 추적 검증 생략)')
  }

  /* ── 3. 경계 ── */
  console.log('\n■ 3. 경계 (401 / 400 / 429)')
  {
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'source' }),
    })
    check(res.status === 401, '쿠키 없는 직접 POST → 401', String(res.status))
  }
  {
    const status = await page.evaluate(async () => {
      const r = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'source', junk: 'x'.repeat(33 * 1024) }),
      })
      return r.status
    })
    check(status === 400, '33KB payload → 400', String(status))
  }
  {
    const status = await page.evaluate(async () => {
      const r = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'hack' }),
      })
      return r.status
    })
    check(status === 400, 'method 화이트리스트 밖 → 400', String(status))
  }
  {
    // 필러 행을 admin 으로 채워 10건을 만든 뒤 API 호출 — 메일 추가 발송 없이 429 유도
    const current = (await reqRows()).length
    const fillers = Math.max(0, 10 - current)
    for (let i = 0; i < fillers; i++)
      await admin.from('requests').insert({ user_id: UID, email: EMAIL, method: 'source', payload: { filler: i } })
    const status = await page.evaluate(async () => {
      const r = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'source' }),
      })
      return r.status
    })
    check(status === 429, `rate limit — 1시간 10건 도달 후 → 429 (필러 ${fillers}건)`, String(status))
  }
  await ctx.close()
}

/* ── 정리 ── */
await admin.from('requests').delete().eq('user_id', UID)
await admin.auth.admin.deleteUser(UID)

await browser.close()
console.log(`\n총 ${n}항목 — ${fail === 0 ? '전부 통과' : `실패 ${fail}건`}`)
console.log(`→ ${'REQUEST_NOTIFY_EMAIL'} 수신함에서 알림 메일 6건(방식별 제목) 실수신을 확인할 것 (사용자 검증 항목)`)
process.exit(fail === 0 ? 0 : 1)
