/**
 * 작성 가이드 아이콘 — 원본 인라인 SVG 그대로 (stroke-width 2)
 * 원본: :1426-1439 (source), :1565-1574 (upload), :1638-1647 (describe)
 *
 * API 페이지 아이콘(components/icons/api.tsx)과 모양이 겹치는 것이 있지만
 * 원본에서 stroke-width 가 1.5 vs 2 로 다르다. 합치지 말 것.
 */
type IconProps = { size?: number }

function Stroke2({ size = 14, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Dataset (:1426) */
export function GuideSearchIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </Stroke2>
  )
}

/** Region (:1430) */
export function GuidePinIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Stroke2>
  )
}

/** Spatial Unit (:1434) */
export function GuideGridIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </Stroke2>
  )
}

/** Time Range (:1438) */
export function GuideClockIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Stroke2>
  )
}

/** 구체적으로 작성할수록 좋아요 (:1638) */
export function GuideEditIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Stroke2>
  )
}

/** 뒤로가기 (:1286) */
export function ArrowLeftIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 진행 스텝 체크 (:1291) */
export function CheckIcon({ size = 10 }: IconProps) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
