/**
 * Supabase 접속 초기화 검증 — 신형 키(sb_publishable_)가 실제로 통하는지 실측.
 *   1. .env.local 로드 (값은 절대 출력하지 않는다)
 *   2. URL 정규화(origin) 후 auth 헬스체크
 *   3. anon 키로 REST 접근 — 200 이면 키 유효, 401 이면 키 무효
 *   4. RLS 스모크: anon 으로 projects select → 빈 배열이어야 정상 (정책상 차단)
 *
 * 사용: node scripts/verify-supabase-init.mjs
 */
import fs from 'node:fs'

const envText = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envText.split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}

const base = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let fail = 0
const report = (ok, label, detail) => {
  if (!ok) fail++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`)
}

// 1. URL 정규화 확인
report(/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(base), 'URL 정규화(origin)', 'https://<ref>.supabase.co 형태')

// 2. auth 헬스체크
{
  const r = await fetch(`${base}/auth/v1/health`, { headers: { apikey: anon } })
  report(r.status === 200, `auth 헬스체크 ${r.status}`)
}

// 3. 키 유효성 + RLS 스모크 — anon 으로 projects/requests select.
//    200 + 빈 배열 = 신형 publishable 키 유효(무효 키면 401) & RLS 가 anon 을 차단.
//    ⚠ REST 루트(/rest/v1/ = OpenAPI 스펙)는 publishable 키로 401 이 정상이다
//      (실측 2026-08-14). 키 검증은 반드시 테이블 쿼리로 할 것.
for (const table of ['projects', 'requests']) {
  const r = await fetch(`${base}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  })
  const body = await r.text()
  const empty = r.status === 200 && body.trim() === '[]'
  report(empty, `RLS: anon ${table} select → ${r.status} ${body.slice(0, 40)}`, '빈 배열이어야 정상')
}

console.log(fail === 0 ? '\n전부 통과' : `\n실패 ${fail}건`)
process.exit(fail === 0 ? 0 : 1)
