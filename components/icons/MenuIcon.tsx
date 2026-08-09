/**
 * 햄버거 / 닫기 아이콘 — ★ 원본에 없는 신규 UI (모바일 네비용)
 *
 * 원본에 햄버거 아이콘이 없어 새로 그렸다. 다만 원본 아이콘 언어를 따른다:
 *   viewBox 0 0 24 24, fill none, stroke currentColor, 선형 아이콘.
 * 닫기(X)는 원본 파일 피커 모달의 닫기 아이콘을 그대로 가져왔다.
 *   (SoSpatial Platform.dc.html :1671 — line 18,6→6,18 / 6,6→18,18, stroke-width 2.5)
 */
export function MenuIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

export function CloseIcon({ size = 16 }: { size?: number }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
