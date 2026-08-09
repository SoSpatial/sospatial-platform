/**
 * API 페이지 아이콘 — 원본 인라인 SVG 를 그대로 옮겼다.
 * 원본: SoSpatial Platform.dc.html :576(코드), :597-624(특징 4), :644-765(카드 8)
 *
 * CLAUDE.md 구현 원칙: 아이콘은 원본 인라인 SVG 를 유지하고
 * lucide-react 등으로 교체하지 않는다(획 두께·크기가 미묘하게 달라진다).
 *
 * 원본의 고정 stroke(#C4A882 / #8BA8D4)만 currentColor 로 바꿨다.
 * 값은 동일하며, 부모에서 text-accent / text-steel 로 지정한다.
 */

type IconProps = { size?: number }

/** 특징·카드 아이콘 공통 래퍼 — 원본 stroke-width 1.5 */
function Stroke15({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/* ── 히어로 배지 (:576) — stroke-width 2 ── */
export function CodeIcon({ size = 11 }: IconProps) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

/* ── 특징 4종 (:597, :606, :615, :624) ── */
export function GridIcon({ size = 16 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </Stroke15>
  )
}

export function SearchIcon({ size = 16 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </Stroke15>
  )
}

export function ZapIcon({ size = 16 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Stroke15>
  )
}

export function ClockIcon({ size = 16 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Stroke15>
  )
}

/* ── API 카드 8종 (:644 ~ :765) ── */
export function UsersIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </Stroke15>
  )
}

export function BarChartIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </Stroke15>
  )
}

export function HeartIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Stroke15>
  )
}

export function TruckIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </Stroke15>
  )
}

export function BuildingIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="3" y="10" width="18" height="11" rx="1" />
      <path d="M7 3h10l3 7H4L7 3z" />
    </Stroke15>
  )
}

export function CloudIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </Stroke15>
  )
}

export function BookIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Stroke15>
  )
}

/** 카드용 시계 — 특징의 ClockIcon 과 내부 path 가 다르다 (:765) */
export function ClockHandIcon({ size = 15 }: IconProps) {
  return (
    <Stroke15 size={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </Stroke15>
  )
}
