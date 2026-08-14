/**
 * 데이터 페이지 아이콘 — 원본 인라인 SVG 그대로 (stroke-width 1.5)
 * 원본: SoSpatial Platform.dc.html :418-473 (주제 카드 8종)
 *
 * 8종 중 5종은 API 페이지와 지오메트리·획이 동일해 icons/api.tsx 를 재사용한다:
 *   인구·사회 제외 — GridIcon(:406 전체 카드), TruckIcon(:427), BarChartIcon(:434),
 *   HeartIcon(:441), CloudIcon(:455)
 * 히어로 돋보기(:380, stroke 2)는 icons/guide.tsx 의 GuideSearchIcon 과 동일해 재사용한다.
 * 여기엔 이 페이지에만 있는 4종을 둔다.
 *
 * ⚠ CityIcon 은 api.tsx 의 BuildingIcon 과 다르다 — 기둥 2개와 층 구분선
 *   (M8 21V10 / M16 21V10 / M3 15h18)이 추가돼 있다. 합치지 말 것.
 */
type IconProps = { size?: number }

function Stroke15({ size = 18, children }: { size?: number; children: React.ReactNode }) {
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

/** 인구·사회 (:420) — api.tsx UsersIcon 에 뒷사람 path 가 추가된 2인 버전 */
export function UsersGroupIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Stroke15>
  )
}

/** 안전·재난 (:448) */
export function ShieldIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Stroke15>
  )
}

/** 국토·도시 (:462) */
export function CityIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="3" y="10" width="18" height="11" rx="1" />
      <path d="M8 21V10M16 21V10M3 15h18M7 3h10l3 7H4L7 3z" />
    </Stroke15>
  )
}

/** 기타·융합 (:469) */
export function GlobeIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Stroke15>
  )
}

/* ── select 뷰 필터 컬럼 헤더 (:250-321, 13px stroke 1.5) ──
   주제 헤더의 그리드는 api.tsx GridIcon(13px)을 재사용한다. */

/** 세부 주제 선택 (:263) */
export function ListIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Stroke15>
  )
}

/** 단위 선택 (:276) */
export function UnitTableIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </Stroke15>
  )
}

/**
 * 지역·세부 지역 선택 (:290, :304 — 동일 지오메트리)
 * ⚠ guide.tsx 의 GuidePinIcon 과 모양이 같지만 stroke 1.5 vs 2 로 다르다. 합치지 말 것.
 */
export function PinIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Stroke15>
  )
}

/** 년도 선택 (:321) */
export function CalendarIcon({ size }: IconProps) {
  return (
    <Stroke15 size={size}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Stroke15>
  )
}
