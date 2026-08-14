import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/env'

/**
 * Supabase 세션 갱신 프록시 (Next 16 proxy 컨벤션 — 구 middleware. @supabase/ssr 표준 패턴).
 * 만료가 가까운 액세스 토큰을 리프레시 토큰으로 갱신해 쿠키에 다시 쓴다.
 * 페이지 정적 프리렌더에는 영향이 없다 — 미들웨어는 요청 시점에 따로 돈다.
 * 라우트 보호(리다이렉트)는 하지 않는다: 화면 접근 제어가 필요한 지점은
 * 각 클라이언트 컴포넌트가 세션 유무로 처리한다 (B안 — 비로그인도 화면 사용 가능).
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // getUser() 가 토큰 검증·갱신을 수행한다 (getSession 은 갱신하지 않음)
  await supabase.auth.getUser()

  return response
}

export const config = {
  // 정적 자산·이미지·메타 파일은 세션 갱신이 필요 없다
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|ico|jpg|jpeg|webp|css|js|txt|xml)$).*)'],
}
