'use client'

import { useState } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { FormField, TextInput } from '@/components/form/fields'
import { Button } from '@/components/ui/Button'
import { AccentLink } from '@/components/ui/AccentLink'
import { supabaseBrowser } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/auth'

/**
 * 회원가입 폼 — 3단계 신규 화면.
 * 이메일 확인(Confirm email)이 켜져 있으므로 가입 성공 = 확인 메일 발송이고,
 * 세션은 확인 링크를 누른 뒤 /auth/confirm 에서 만들어진다.
 */
export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setError('')
    setPending(true)
    let data, error
    try {
      ;({ data, error } = await supabaseBrowser().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/confirm` },
      }))
    } catch (e) {
      // 원본 에러가 어디에도 안 남던 허점 해소 — 콘솔에 남기고 원문으로 문구를 분기
      console.error('[auth] signUp 실패:', e)
      error = { message: e instanceof Error ? e.message : String(e) }
    }
    setPending(false)
    if (error) {
      setError(authErrorMessage(error))
      return
    }
    // Confirm email 이 켜져 있으면 기존 가입 이메일도 에러 없이 응답된다(열거 방지).
    // 그 경우 identities 가 빈 배열이다 — 안내를 구분한다.
    if (data?.user && data.user.identities?.length === 0) {
      setError('이미 가입된 이메일입니다. 로그인해 주세요.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="확인 메일을 보냈습니다" subtitle={`${email} 로 확인 메일이 발송되었습니다.`}>
        <p className="text-13 leading-1-6 text-ink-70">
          메일함에서 <span className="font-semibold text-ink">이메일 확인</span> 링크를 누르면
          가입이 완료되고 자동으로 로그인됩니다. 메일이 보이지 않으면 스팸함을 확인해 주세요.
        </p>
        <p className="mt-5 text-13 text-ink-40">
          이미 확인하셨나요?{' '}
          <AccentLink href="/login" size="sm" label="로그인" className="align-baseline" />
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="회원가입" subtitle="이메일과 비밀번호만으로 시작할 수 있습니다.">
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
              <>
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={`${id}-hint`}
                />
                <p id={`${id}-hint`} className="mt-1.5 text-12 text-ink-30">
                  6자 이상
                </p>
              </>
            )}
          </FormField>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-12-5 text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="md"
          className="mt-6 w-full disabled:cursor-default disabled:opacity-50"
          disabled={pending}
        >
          {pending ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <p className="mt-5 text-13 text-ink-40">
        이미 계정이 있으신가요?{' '}
        <AccentLink href="/login" size="sm" label="로그인" className="align-baseline" />
      </p>
    </AuthCard>
  )
}
