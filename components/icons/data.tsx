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
