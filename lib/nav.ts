/**
 * 네비게이션 링크 정의
 * 원본: SoSpatial Platform.dc.html :37-51 (데이터 / API / 지도·시각화 / 의뢰하기)
 */
export type NavLink = { href: string; label: string }

export const NAV_LINKS: NavLink[] = [
  { href: '/data', label: '데이터' },
  { href: '/api', label: 'API' },
  { href: '/maps', label: '지도·시각화' },
  { href: '/request', label: '의뢰하기' },
]

/**
 * 푸터 링크 — 원본에 푸터가 없어 신규 설계 (CLAUDE.md 결정 1번).
 * reference 검증 대상이 아니며 사용자 확인이 필요하다.
 */
export const FOOTER_LINKS: NavLink[] = [
  { href: '/api', label: 'API 문서' },
  { href: '/request', label: '맞춤 의뢰' },
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
]
