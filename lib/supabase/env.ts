/**
 * Supabase 접속 환경변수 — 단일 출처.
 *
 * 키는 신형 형식(sb_publishable_... / sb_secret_...)이다 (CLAUDE.md 3단계 환경 메모).
 * supabase-js v2 는 키 문자열을 그대로 헤더로 보내므로 구형 JWT 와 동일하게 동작한다.
 *
 * URL 은 new URL().origin 으로 정규화한다 — 대시보드에서 REST 엔드포인트
 * (https://xxx.supabase.co/rest/v1/)를 복사해 넣어도 베이스 URL 로 동작하게.
 * env 파일은 Claude 가 수정하지 않는 규칙이라 코드 쪽에서 흡수한다.
 */
export function supabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) throw new Error('NEXT_PUBLIC_SUPABASE_URL 이 설정되지 않았습니다')
  return new URL(raw).origin
}

export function supabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다')
  return key
}
