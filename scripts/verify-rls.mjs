/**
 * RLS 보안 검증 — 실제 Supabase 프로젝트에 대해 정책을 실측한다.
 *
 *   admin(service role) 으로 확인 완료된 테스트 사용자 A·B 를 만들고,
 *   A 소유 데이터에 B/anon 이 접근·변조할 수 없음을 전 동사(SELECT/INSERT/
 *   UPDATE/DELETE)로 확인한 뒤 테스트 사용자·데이터를 정리한다.
 *
 * 사용: node scripts/verify-rls.mjs   (.env.local 의 키 사용, 값 미출력)
 */
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const BASE = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SECRET = env.SUPABASE_SECRET_KEY

const admin = createClient(BASE, SECRET, { auth: { autoRefreshToken: false, persistSession: false } })
const newClient = () => createClient(BASE, ANON, { auth: { persistSession: false } })

const PW = 'RlsVerify-2026!ab'
const EMAIL_A = 'rls-test-a@example.com'
const EMAIL_B = 'rls-test-b@example.com'

let fail = 0
const check = (ok, label, detail = '') => {
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

// 이전 실행이 남긴 테스트 사용자 정리 (멱등)
async function deleteByEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const u = data?.users?.find((x) => x.email === email)
  if (u) await admin.auth.admin.deleteUser(u.id)
}
await deleteByEmail(EMAIL_A)
await deleteByEmail(EMAIL_B)

// ── 준비: 확인 완료된 사용자 2명 ──
const { data: ua, error: ea } = await admin.auth.admin.createUser({
  email: EMAIL_A, password: PW, email_confirm: true,
})
const { data: ub, error: eb } = await admin.auth.admin.createUser({
  email: EMAIL_B, password: PW, email_confirm: true,
})
if (ea || eb) {
  console.error('테스트 사용자 생성 실패:', ea?.message || eb?.message)
  process.exit(1)
}
const idA = ua.user.id

const A = newClient()
const B = newClient()
{
  const [ra, rb] = await Promise.all([
    A.auth.signInWithPassword({ email: EMAIL_A, password: PW }),
    B.auth.signInWithPassword({ email: EMAIL_B, password: PW }),
  ])
  check(!ra.error && !rb.error, '테스트 사용자 A·B 로그인')
}

// ── projects ──
let projectId = null
{
  const { data, error } = await A.from('projects')
    .insert({ name: 'RLS 검증용', variables: [{ name: 'v', desc: '', unit: '', region: '', subRegion: '', year: '' }] })
    .select('id, user_id').single()
  projectId = data?.id ?? null
  check(!error && data?.user_id === idA, 'A: 프로젝트 insert (user_id 자동 = A)', error?.message)
}
{
  const { data, error } = await A.from('projects').select('id')
  check(!error && data?.length === 1, 'A: 본인 프로젝트 select = 1건')
}
{
  const { data } = await B.from('projects').select('id')
  check(data?.length === 0, 'B: A 프로젝트 select 차단 (0건)')
}
{
  const { data } = await B.from('projects').update({ name: '변조' }).eq('id', projectId).select()
  check(data?.length === 0, 'B: A 프로젝트 update 차단 (0건 영향)')
}
{
  const { data } = await B.from('projects').delete().eq('id', projectId).select()
  check(data?.length === 0, 'B: A 프로젝트 delete 차단 (0건 영향)')
}
{
  const { error } = await B.from('projects').insert({ name: '위장', user_id: idA })
  check(!!error, 'B: user_id=A 위장 insert 거부', error ? `(${error.code})` : '에러 없음!')
}
{
  const { error } = await newClient().from('projects').insert({ name: 'anon' })
  check(!!error, 'anon: 프로젝트 insert 거부', error ? `(${error.code})` : '에러 없음!')
}
{
  const { data, error } = await A.from('projects').update({ name: 'RLS 검증용 수정', starred: true })
    .eq('id', projectId).select('name, starred').single()
  check(!error && data?.starred === true, 'A: 본인 프로젝트 update 허용')
}

// ── requests ──
let requestId = null
{
  const { error } = await newClient().from('requests')
    .insert({ email: 'x@example.com', method: 'source', payload: {} })
  check(!!error, 'anon: 요청 insert 거부 (제출은 로그인 필수)', error ? `(${error.code})` : '에러 없음!')
}
{
  const { data, error } = await A.from('requests')
    .insert({ email: EMAIL_A, method: 'source', payload: { probe: true } })
    .select('id, user_id, status').single()
  requestId = data?.id ?? null
  check(!error && data?.user_id === idA && data?.status === 'received', 'A: 요청 insert (user_id 자동, status=received)', error?.message)
}
{
  const { error } = await B.from('requests').insert({ email: EMAIL_B, method: 'source', payload: {}, user_id: idA })
  check(!!error, 'B: user_id=A 위장 요청 insert 거부', error ? `(${error.code})` : '에러 없음!')
}
{
  const { data } = await B.from('requests').select('id')
  check(data?.length === 0, 'B: A 요청 select 차단 (0건)')
}
{
  const { data } = await A.from('requests').update({ status: 'done' }).eq('id', requestId).select()
  check(data?.length === 0, 'A: 본인 요청 update 도 차단 (접수 후 변조 불가)')
}
{
  const { data } = await A.from('requests').delete().eq('id', requestId).select()
  check(data?.length === 0, 'A: 본인 요청 delete 도 차단')
}

// ── 정리 ──
{
  if (requestId) await admin.from('requests').delete().eq('id', requestId)
  await admin.auth.admin.deleteUser(ua.user.id)
  await admin.auth.admin.deleteUser(ub.user.id)
  const { data } = await admin.from('projects').select('id').eq('id', projectId)
  check(data?.length === 0, '정리: 사용자 삭제로 프로젝트 cascade 삭제 확인')
}

console.log(fail === 0 ? '\n전부 통과' : `\n실패 ${fail}건`)
process.exit(fail === 0 ? 0 : 1)
