'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { FormField, TextInput } from '@/components/form/fields'
import { Button } from '@/components/ui/Button'
import { AccentLink } from '@/components/ui/AccentLink'
import { supabaseBrowser } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/auth'

/**
 * 로그인 폼 — 3단계 신규 화면.
 *   ?next=경로  로그인 성공 후 복귀 지점 (Request 제출 게이트 — 결정 2 — 가 사용)
 *   ?notice=confirm-failed  /auth/confirm 처리 실패 시 안내
 * useSearchParams 를 쓰므로 페이지에서 Suspense 로 감싼다 (정적 프리렌더 유지).
 */
export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  // confirm-failed 는 오류(danger), request-login 은 안내(ink-70)로 톤을 구분한다
  const noticeKind = params.get('notice')
  const notice =
    noticeKind === 'confirm-failed'
      ? '확인 링크 처리에 실패했습니다. 가입한 이메일로 로그인을 시도해 주세요.'
      : noticeKind === 'request-login'
        ? '요청 접수에는 로그인이 필요합니다. 로그인하면 작성하던 내용이 복원됩니다.'
        : ''
  const noticeIsInfo = noticeKind === 'request-login' && !error

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setError('')
    setPending(true)
    let error
    try {
      ;({ error } = await supabaseBrowser().auth.signInWithPassword({ email, password }))
    } catch (e) {
      // 원본 에러가 어디에도 안 남던 허점 해소 — 콘솔에 남기고 원문으로 문구를 분기
      console.error('[auth] signIn 실패:', e)
      error = { message: e instanceof Error ? e.message : String(e) }
    }
    if (error) {
      setError(authErrorMessage(error))
      setPending(false)
      return
    }
    // next 는 내부 경로만 허용 — 외부 URL 오픈 리다이렉트 방지
    const next = params.get('next')
    router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/')
  }

  return (
    <AuthCard title="로그인" subtitle="SoSpatial 계정으로 로그인하세요.">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <FormField label="이메일">
            {({ id }) => (
              <TextInput
                id={id}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            )}
          </FormField>
          <FormField label="비밀번호">
            {({ id }) => (
              <TextInput
                id={id}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </FormField>
        </div>

        {(error || notice) && (
          <p
            role="alert"
            className={`mt-3 text-12-5 ${noticeIsInfo ? 'text-ink-70' : 'text-danger'}`}
          >
            {error || notice}
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="md"
          className="mt-6 w-full disabled:cursor-default disabled:opacity-50"
          disabled={pending}
        >
          {pending ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <p className="mt-5 text-13 text-ink-40">
        계정이 없으신가요?{' '}
        <AccentLink href="/signup" size="sm" label="회원가입" className="align-baseline" />
      </p>
    </AuthCard>
  )
}
