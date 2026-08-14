import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase/service'
import { buildRequestMail } from '@/lib/request-mail'

/**
 * Request 접수 API (4번 설계 2번).
 *
 * 순서: 세션 확인 → 검증 → rate limit → **DB insert (진실)** → Resend 발송 (부가).
 * 사용자에게 보이는 성공의 기준은 DB insert 성공이다 — 메일이 실패해도 레코드는
 * 남아 운영자가 확인할 수 있으므로 접수는 성공으로 응답한다 (재제출 유도는 중복만
 * 만든다). 메일 실패는 서버 로그 + mail_sent=false 로 남고, 다음 성공 메일 본문에
 * 미발송 누적 건수가 병기된다 (조정 2).
 *
 * email 컬럼은 클라이언트 값을 믿지 않고 세션의 user.email 로 서버가 채운다.
 * insert 는 사용자 토큰(RLS 경유 — user_id 위장 불가 기검증), service role 은
 * mail_sent 갱신·미발송 집계에만 쓴다.
 */
const METHODS = new Set(['source', 'upload', 'describe'])
const MAX_BODY_BYTES = 32 * 1024
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: Request) {
  let supabase
  try {
    supabase = await supabaseServer()
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'auth' }, { status: 401 })

  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 400 })
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const method = String(payload?.method ?? '')
  if (!METHODS.has(method)) return NextResponse.json({ error: 'bad_method' }, { status: 400 })

  /*
    rate limit — 최근 1시간 본인 접수 count (requests_select_own 정책으로 본인 것만 잡힌다).
    ⚠ 조회~삽입 사이에 동시 요청이 끼어들 수 있는 TOCTOU 한계가 있다 — 이것은
    "완화 장치이며 정확한 제한이 아니다" (2026-08-15 확정, CLAUDE.md 기록).
    정확한 제한이 필요해지면 DB 제약(트리거)이나 원자적 카운터로 — 실서비스 전환 개선 목록.
  */
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT) return NextResponse.json({ error: 'rate' }, { status: 429 })

  const { data: row, error } = await supabase
    .from('requests')
    .insert({ method, payload, email: user.email })
    .select('id, created_at')
    .single()
  if (error || !row) {
    console.error('[requests] insert 실패:', error)
    return NextResponse.json({ error: 'db' }, { status: 500 })
  }

  let mailed = false
  try {
    mailed = await sendOperatorMail(Number(row.id), row.created_at, method, payload, user.email)
  } catch (e) {
    console.error('[requests] 메일 발송 실패 (접수는 성공):', e)
  }

  return NextResponse.json({ ok: true, id: row.id, mailed })
}

async function sendOperatorMail(
  id: number,
  createdAt: string,
  method: string,
  payload: Record<string, unknown>,
  userEmail: string
): Promise<boolean> {
  const to = process.env.REQUEST_NOTIFY_EMAIL
  const key = process.env.RESEND_API_KEY
  if (!to || !key) {
    console.warn('[requests] RESEND_API_KEY/REQUEST_NOTIFY_EMAIL 미설정 — 메일 생략')
    return false
  }

  // 미발송 누적 집계 (조정 2) — mail_sent 컬럼(v3) 미적용 등 실패 시 표기만 생략
  let unsent: number | null = null
  try {
    const { count, error } = await supabaseService()
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('mail_sent', false)
      .neq('id', id)
    unsent = error ? null : (count ?? 0)
  } catch {
    unsent = null
  }

  const { subject, html } = buildRequestMail({ id, createdAt, method, payload, userEmail, unsent })
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'SoSpatial <onboarding@resend.dev>', // 도메인 인증 전 (CLAUDE.md 환경 메모)
      to: [to],
      reply_to: userEmail, // 운영자가 바로 답장하면 요청자에게 간다
      subject,
      html,
    }),
  })
  if (!res.ok) {
    console.error('[requests] Resend 실패:', res.status, await res.text())
    return false
  }
  try {
    await supabaseService().from('requests').update({ mail_sent: true }).eq('id', id)
  } catch (e) {
    console.warn('[requests] mail_sent 갱신 실패 (v3 미적용?):', e)
  }
  return true
}
