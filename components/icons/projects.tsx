/**
 * 프로젝트 페이지 아이콘 — 원본 인라인 SVG 그대로 (stroke-width 2, 13px)
 * 원본: :800(휴지통) :804(다운로드) :808(위) :812(아래) — 액션바
 *       :833(다운로드) :837(휴지통) — 상세 뷰, 동일 지오메트리
 *       :890(별 16px stroke 1.5) — starred 토글, fill/stroke 를 상태로 바꾼다
 */
type IconProps = { size?: number }

function Stroke2({ size = 13, children }: { size?: number; children: React.ReactNode }) {
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

export function TrashIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </Stroke2>
  )
}

export function DownloadIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Stroke2>
  )
}

export function ArrowUpIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </Stroke2>
  )
}

export function ArrowDownIcon({ size }: IconProps) {
  return (
    <Stroke2 size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </Stroke2>
  )
}

/** 공유 모달 헤더 (:914) — 노드 3개 + 연결선, 15px stroke 1.8 */
export function ShareNodesIcon({ size = 15 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

/**
 * 별 (:890) — 활성: fill·stroke accent / 비활성: fill none·stroke ink-25.
 * 원본이 fill/stroke 를 인라인으로 바꾸므로 filled prop 으로 받는다.
 */
export function StarIcon({ size = 16, filled }: IconProps & { filled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      fill={filled ? 'var(--color-accent)' : 'none'}
      stroke={filled ? 'var(--color-accent)' : 'var(--color-ink-25)'}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
