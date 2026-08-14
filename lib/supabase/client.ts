'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from './env'

/**
 * 브라우저용 Supabase 클라이언트 (싱글턴).
 * @supabase/ssr 이 세션을 쿠키에 저장하므로 서버(라우트 핸들러·미들웨어)와
 * 같은 세션을 공유한다.
 * 타입을 SupabaseClient 로 명시하는 이유: ReturnType<typeof createBrowserClient> 는
 * 제네릭이 소거돼 any 로 풀리고, 사용처의 콜백 파라미터가 전부 암시적 any 가 된다.
 */
let client: SupabaseClient | null = null

export function supabaseBrowser() {
  if (!client) client = createBrowserClient(supabaseUrl(), supabaseAnonKey())
  return client
}
