/**
 * SoSpatial 로고 마크
 * 원본: SoSpatial Platform.dc.html :28-33
 *
 * 20×20 viewBox 안에 8.5×8.5 둥근 사각형(rx=2) 4개.
 * 대각선 쌍(좌상/우하)은 불투명, 반대 대각선 쌍은 opacity 0.35.
 * CLAUDE.md 구현 원칙에 따라 크기만 props 로 받는다.
 */
export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="8.5" height="8.5" rx="2" fill="#C4A882" />
      <rect x="11.5" y="0" width="8.5" height="8.5" rx="2" fill="#C4A882" opacity="0.35" />
      <rect x="0" y="11.5" width="8.5" height="8.5" rx="2" fill="#C4A882" opacity="0.35" />
      <rect x="11.5" y="11.5" width="8.5" height="8.5" rx="2" fill="#C4A882" />
    </svg>
  )
}
