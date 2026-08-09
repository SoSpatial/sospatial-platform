/**
 * 업로드·파일 피커 아이콘 — 원본 인라인 SVG 그대로
 * 원본: :1492 (업로드) / :1676 (셰브런) / :1682 (폴더) / :1688 (파일)
 * 색은 currentColor 로 바꿔 부모에서 지정한다. 값은 동일하다.
 */
type IconProps = { size?: number }

/** 드롭존 업로드 아이콘 (:1492) — stroke 1.5 */
export function UploadIcon({ size = 28 }: IconProps) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

/** 경로 구분 셰브런 (:1676) — stroke 2 */
export function ChevronRightIcon({ size = 10 }: IconProps) {
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

/** 폴더 (:1682) — stroke 1.5. 네비의 FolderIcon(stroke 1.6)과 path 가 다르다 */
export function PickerFolderIcon({ size = 16 }: IconProps) {
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
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

/** 파일 (:1688) — stroke 1.5 */
export function FileIcon({ size = 16 }: IconProps) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
