/**
 * 폴더 아이콘 — 네비게이션 "내 프로젝트" 버튼
 * 원본: SoSpatial Platform.dc.html :55
 *   <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.6)"
 *        stroke-width="1.6" viewBox="0 0 24 24">
 *
 * 원본의 고정 stroke 색은 currentColor 로 바꾸고 부모에서 text-ink-60 을 준다.
 * 값은 동일하며, hover 시 색 전환이 가능해진다.
 *
 * 데이터 선택 프로젝트 배지(:238)는 같은 지오메트리를 12px / stroke 1.8 로 쓴다
 * → strokeWidth prop 으로 열어둔다 (기본 1.6 = 네비, 통일 금지 원칙).
 */
export function FolderIcon({ size = 16, strokeWidth = 1.6 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  )
}
