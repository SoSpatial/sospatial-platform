import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from './env'

/**
 * 서버용 Supabase 클라이언트 — 라우트 핸들러·서버 컴포넌트에서 사용.
 * 요청 쿠키의 세션을 읽고, 토큰 갱신 시 응답 쿠키에 다시 쓴다.
 *
 * ⚠ 정적 프리렌더되는 페이지 컴포넌트에서 임포트하지 말 것 — cookies() 접근이
 * 해당 라우트를 동적 렌더링으로 바꿔 "전 라우트 정적 프리렌더" 확인 사항을 깬다.
 * 현재 사용처는 /auth/confirm 라우트 핸들러뿐이다.
 */
export async function supabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // 서버 컴포넌트에서 호출되면 쿠키 쓰기가 불가능하다 — 미들웨어가 갱신을 담당
        }
      },
    },
  })
}
