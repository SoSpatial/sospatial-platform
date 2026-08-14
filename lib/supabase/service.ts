import { createClient } from '@supabase/supabase-js'
import { supabaseUrl } from './env'

/**
 * service role 클라이언트 — **서버 전용** (라우트 핸들러에서만 임포트할 것).
 * RLS 를 우회하므로 용도를 좁게 유지한다: 현재는 requests 의 mail_sent 갱신·
 * 미발송 집계뿐이다. 사용자 소유 데이터의 읽기/쓰기는 항상 세션 클라이언트로.
 */
export function supabaseService() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) throw new Error('SUPABASE_SECRET_KEY 가 설정되지 않았습니다')
  return createClient(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
