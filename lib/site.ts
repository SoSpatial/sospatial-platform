/**
 * 사이트 전역 상수
 *
 * 배포 도메인이 아직 정해지지 않아 환경변수로 받는다.
 * 값이 없으면 http://localhost:3000 으로 폴백한다.
 *   - 로컬 개발에서는 이게 정답이다.
 *   - 배포 시 설정하지 않으면 OG·canonical·sitemap URL 이 전부 localhost 를 가리키므로
 *     반드시 설정해야 한다. (.env.example 참고)
 */
const FALLBACK_SITE_URL = 'http://localhost:3000'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, '')

/** 배포 환경인데 도메인이 설정되지 않았는지 여부 — 빌드 로그로 알리는 용도 */
export const SITE_URL_IS_FALLBACK = !process.env.NEXT_PUBLIC_SITE_URL

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
  '/request',
  '/request/source',
  '/request/upload',
  '/request/describe',
] as const
