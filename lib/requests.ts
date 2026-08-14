'use client'

import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * Request 접수 클라이언트 — 폼 3종의 제출 핸들러가 공유한다 (4번 설계 1번).
 *
 * 제출 시점 로그인 요구 (결정 2):
 *   비로그인 제출 시도 → 폼 내용을 sessionStorage 에 보존 → /login?notice=request-login
 *   → 로그인 성공 → ?next=/request/{method}?resume=1 복귀 → 폼이 takeDraft 로 복원.
 *   자동 재제출은 하지 않는다 — 복원된 폼에서 사용자가 제출을 다시 누른다 (명시적 발송).
 *
 * sessionStorage 인 이유: 탭 스코프 + 탭 종료 시 자동 소멸. localStorage 면 다른
 * 탭·다음 방문에서 예기치 않게 복원되는 새는 동작이 된다 (사용자 확인 사항).
 * 복원은 ?resume=1 일 때만 — 로그인 복귀가 아닌 일반 진입에서는 복원하지 않는다.
 */
export type RequestMethod = 'source' | 'upload' | 'describe'
export type RequestPayload = { method: RequestMethod } & Record<string, unknown>

export type SubmitResult =
  | { kind: 'ok' }
  | { kind: 'auth'; loginUrl: string }
  | { kind: 'error' }

const DRAFT_KEY = 'sospatial_request_draft'
const DRAFT_TTL_MS = 30 * 60 * 1000

function toLogin(payload: RequestPayload): SubmitResult {
  try {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ method: payload.method, payload, ts: Date.now() })
    )
  } catch {
    // 보존 실패 시에도 로그인 유도는 진행 — 복원만 안 될 뿐
  }
  const next = encodeURIComponent(`/request/${payload.method}?resume=1`)
  return { kind: 'auth', loginUrl: `/login?notice=request-login&next=${next}` }
}

/** 로그인 복귀(?resume=1) 시 1회성 복원. method 불일치·TTL(30분) 초과·일반 진입은 null */
export function takeDraft(method: RequestMethod): Record<string, unknown> | null {
  try {
    if (new URLSearchParams(window.location.search).get('resume') !== '1') return null
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    sessionStorage.removeItem(DRAFT_KEY) // 1회성 — 실패해도 재복원되지 않는다
    const d = JSON.parse(raw) as { method?: string; payload?: Record<string, unknown>; ts?: number }
    if (d.method !== method || !d.payload) return null
    if (typeof d.ts !== 'number' || Date.now() - d.ts > DRAFT_TTL_MS) return null
    return d.payload
  } catch {
    return null
  }
}

export async function submitRequest(payload: RequestPayload): Promise<SubmitResult> {
  // 제출 시점 세션 판정 — env 미설정(fail-soft) 등 초기화 실패도 로그인 유도로
  try {
    const { data } = await supabaseBrowser().auth.getSession()
    if (!data.session) return toLogin(payload)
  } catch {
    return toLogin(payload)
  }

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    // 세션 만료 레이스 — 서버 판정이 우선 (이중 방어)
    if (res.status === 401) return toLogin(payload)
    if (!res.ok) return { kind: 'error' }
    return { kind: 'ok' }
  } catch {
    return { kind: 'error' }
  }
}
