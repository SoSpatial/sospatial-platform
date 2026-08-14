/**
 * 지도(/maps) 페이지 아이콘 — 원본 인라인 SVG 그대로
 *
 * ⚠ AiMark 는 LogoMark 와 **다르다 — 통합 금지.**
 *   세 값이 다르다: 사각형 8.5→7.5 (오프셋 1,1), rx 2→1.5, 반대 대각 opacity 0.35→0.4.
 *   (LogoMark :28-33 vs AI 아이콘 :1006, :1024, :1040)
 * 지도 검색바 돋보기(:1099)는 GuideSearchIcon(stroke 2, 동일 지오메트리)을 재사용한다.
 */
type IconProps = { size?: number }

/** AI 헤더 배지 14px (:1006) / 채팅 아바타 11px (:1024, :1040) */
export function AiMark({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" fill="#C4A882" />
      <rect x="11.5" y="1" width="7.5" height="7.5" rx="1.5" fill="#C4A882" opacity="0.4" />
      <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" fill="#C4A882" opacity="0.4" />
      <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" fill="#C4A882" />
    </svg>
  )
}

/** 전송 (종이비행기) — 12px stroke 2.5 (:1085). 원본 고정 #1A1A1A 는 currentColor 로 */
export function SendIcon({ size = 12 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
