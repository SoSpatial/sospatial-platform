'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * 세션 구독 훅 — 네비 등 클라이언트 컴포넌트가 로그인 상태를 안다.
 *
 * ready 이전(하이드레이션 직후 세션 조회 중)에는 비로그인 UI 를 렌더한다.
 * 로그인 사용자에게 짧은 깜빡임이 생기지만, 레이아웃을 서버 세션 조회로 바꾸면
 * 전 라우트 정적 프리렌더가 깨지므로 감수한다 (CLAUDE.md 2단계 확인 사항 유지).
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 환경변수 미설정(예: Vercel env 등록 전 배포)이어도 네비가 죽지 않도록
    // 비로그인 상태로 조용히 동작한다 (fail-soft)
    let supabase
    try {
      supabase = supabaseBrowser()
    } catch (e) {
      console.warn('[auth] Supabase 초기화 실패 — 비로그인 상태로 동작:', e)
      setReady(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, ready }
}

/**
 * Supabase 인증 에러 → 한국어 안내.
 * 알 수 없는 에러는 원문 대신 일반 문구를 낸다 (영문 원문 노출 방지).
 *
 * 세분화 (2026-08-15 — 프로덕션 env 미주입 진단에서 확정된 개선):
 * fallback 하나가 성격이 다른 실패를 뭉치지 않도록, 사용자가 할 일이 다른
 * 원인(재시도 무의미한 구성 오류 / 네트워크 / 발송 제한 / 가입 제한)을 나눈다.
 * rate limit 은 에러 코드형(over_email_send_rate_limit — 언더스코어라 'rate limit'
 * 부분 문자열에 안 걸리는 매핑 구멍)을 함께 잡는다.
 */
export function authErrorMessage(error: { message: string } | null): string {
  if (!error) return ''
  const m = error.message
  if (m.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (m.includes('Email not confirmed'))
    return '이메일 확인이 완료되지 않았습니다. 받은 메일함의 확인 링크를 눌러주세요.'
  if (m.includes('already registered')) return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (m.includes('at least 6 characters')) return '비밀번호는 6자 이상이어야 합니다.'
  if (m.includes('valid email')) return '올바른 이메일 주소를 입력해 주세요.'
  if (m.includes('rate limit') || m.includes('rate_limit') || m.includes('security purposes'))
    return '요청이 잦습니다. 잠시 후 다시 시도해 주세요.'
  if (m.includes('signup_disabled') || m.includes('Signups not allowed'))
    return '현재 신규 가입이 제한되어 있습니다.'
  // lib/supabase/env.ts 가 던지는 초기화 실패 — 재시도가 무의미한 구성 오류
  if (m.includes('설정되지 않았습니다')) return '서비스 구성에 문제가 있습니다. 운영자에게 문의해 주세요.'
  if (m.includes('Failed to fetch') || m.includes('NetworkError') || m.includes('fetch failed'))
    return '네트워크 연결을 확인해 주세요.'
  return '처리에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}
