import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * 이메일 확인 링크 착지점.
 *
 * 두 가지 착지 형태를 모두 처리한다:
 *   ?code=...            기본 메일 템플릿(ConfirmationURL) → Supabase verify 엔드포인트가
 *                        PKCE code 로 리다이렉트해 준 경우. 같은 브라우저에서 열면
 *                        code_verifier 쿠키가 있어 세션 교환이 성공한다.
 *   ?token_hash=&type=   메일 템플릿을 TokenHash 방식으로 바꾼 경우 (기기 무관 동작).
 *
 * 실패해도 이메일 자체는 verify 단계에서 확인 처리됐을 수 있으므로
 * /login?notice=confirm-failed 로 보내 로그인 재시도를 안내한다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const supabase = await supabaseServer()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/`)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${origin}/`)
  }

  return NextResponse.redirect(`${origin}/login?notice=confirm-failed`)
}
