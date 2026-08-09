/**
 * 오른쪽 화살표 — 액센트 링크에 붙는다.
 * 원본: SoSpatial Platform.dc.html :144, :176, :209, :414, :1190 등
 *   <svg width="14" height="14" fill="none" stroke="#C4A882" stroke-width="2.5"
 *        viewBox="0 0 24 24">
 *     <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>
 *   </svg>
 *
 * 원본의 고정 stroke(#C4A882)만 currentColor 로 바꿨다. 값은 동일하다.
 * 작성 가이드 사이드바에서는 11px 로 쓰인다(:1447).
 */
export function ArrowRight({ size = 14 }: { size?: number }) {
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
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
