import type { TopicKey } from '@/lib/content/topics'

/**
 * 네비게이션 링크 정의
 * 원본: SoSpatial Platform.dc.html :37-51 (데이터 / API / 지도·시각화 / 의뢰하기)
 */
export type NavLink = { href: string; label: string }

/**
 * /data/select 진입 링크 — 원본 goDataSelect(:2320)의 data-topic 페이로드에 해당.
 * topic 쿼리 값은 한글 키 그대로 쓴다 (CLAUDE.md "프로토타입 제약 vs 디자인 의도" 사례 4).
 */
export function dataSelectHref(topic: TopicKey): string {
  return `/data/select?topic=${encodeURIComponent(topic)}`
}

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
