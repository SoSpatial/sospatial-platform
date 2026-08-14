/**
 * 사이트 전역 상수
 *
 * ─ SITE_URL 결정 순서 ────────────────────────────────────────────────
 *   1. NEXT_PUBLIC_SITE_URL            직접 지정. 커스텀 도메인이 생기면 이걸 쓴다
 *   2. VERCEL_PROJECT_PRODUCTION_URL   Vercel 이 자동 주입 (프로토콜 없음)
 *   3. http://localhost:3000           로컬 개발
 *
 * 2번을 쓰는 이유: 배포 전에는 *.vercel.app 주소를 모르고 배포 후에는 이미 빌드가
 * 끝나 있어서, 환경변수만 쓰면 1차 배포의 절대 URL 이 반드시 틀린다.
 * Vercel 문서상 이 변수는 **빌드 타임과 런타임 모두**에서 쓸 수 있고,
 * 프리뷰 배포에서도 항상 프로덕션 도메인을 가리킨다 — OG 이미지 URL 처럼
 * 프로덕션을 가리켜야 하는 링크를 만들라고 문서가 직접 권하는 용도다.
 *
 * VERCEL_URL 을 쓰지 않는 이유: 배포마다 값이 바뀌는 배포 전용 주소라
 * canonical·sitemap 에 넣으면 안 되고, Standard Deployment Protection 과도 충돌한다.
 *
 * 이 파일은 서버 전용(metadata / sitemap / robots)에서만 임포트된다.
 * 클라이언트 컴포넌트에서 쓰게 되면 NEXT_PUBLIC_ 접두어가 없는 2번은 값이 비므로,
 * 그때는 NEXT_PUBLIC_SITE_URL 을 반드시 설정해야 한다.
 */
const FALLBACK_SITE_URL = 'http://localhost:3000'

/** Vercel 시스템 변수는 프로토콜이 없다 (`my-site.vercel.app`) */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || FALLBACK_SITE_URL).replace(
  /\/$/,
  ''
)

/** SITE_URL 이 어디서 왔는지 — 배포 후 점검과 빌드 로그용 */
export const SITE_URL_SOURCE: 'env' | 'vercel' | 'fallback' = process.env.NEXT_PUBLIC_SITE_URL
  ? 'env'
  : vercelUrl
    ? 'vercel'
    : 'fallback'

/** 폴백(localhost)으로 떨어졌는지 여부 */
export const SITE_URL_IS_FALLBACK = SITE_URL_SOURCE === 'fallback'

// 빌드 로그에 한 줄 남긴다. 1차 배포에서 어떤 주소가 박혔는지 바로 확인하기 위한 것이고,
// localhost 로 떨어진 채 배포되는 사고를 눈에 띄게 만든다.
if (process.env.VERCEL && SITE_URL_IS_FALLBACK) {
  console.warn(
    '[site] ⚠ SITE_URL 이 localhost 로 폴백했다. ' +
      'Vercel 프로젝트 설정에서 "Enable access to System Environment Variables" 를 켜거나 ' +
      'NEXT_PUBLIC_SITE_URL 을 설정할 것.'
  )
} else if (process.env.VERCEL) {
  console.log(`[site] SITE_URL = ${SITE_URL} (${SITE_URL_SOURCE})`)
}

export const SITE_NAME = 'SoSpatial'
export const SITE_TITLE = 'SoSpatial — AI-Ready 공간 데이터 플랫폼'
export const SITE_DESCRIPTION =
  '흩어진 공간 데이터를 바로 쓸 수 있게. 데이터를 찾고, AI로 분석하고, 전문가와 함께 활용하세요.'

/**
 * sitemap 에 포함할 라우트.
 * "준비 중" 플레이스홀더(/data, /projects, /maps)와 아직 내용이 없는
 * /terms, /privacy 는 제외한다. 내용 없는 페이지가 색인되면 품질 평가에 불리하다.
 * 해당 페이지들에는 metadata 로 robots: { index: false } 를 함께 준다.
 */
export const SITEMAP_ROUTES = [
  '/',
  '/api',
  '/data',
  '/request',
  '/request/source',
  '/request/upload',
  '/request/describe',
] as const
