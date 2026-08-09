import { cn } from '@/lib/cn'

/**
 * 아이콘 배지 — 액센트 틴트 배경의 정사각 아이콘 컨테이너
 *
 * 원본 크기·라운드 조합
 *   32 / 8px  (rounded-ctrl)   API 카드 :643, 모달 헤더 :913
 *   36 / 9px  (rounded-field)  API 특징 :596
 *   38 / 10px (rounded-btn)    데이터 카테고리 카드 :419
 *   42 / 10px (rounded-btn)    데이터 전체 카드 :405
 *
 * tint 는 원본이 accent 0.1 / 0.12 두 가지를 쓴다.
 */
const SIZE = {
  32: 'h-8 w-8',
  36: 'h-9 w-9',
  38: 'h-9.5 w-9.5',
  42: 'h-10.5 w-10.5',
} as const

const RADIUS = {
  ctrl: 'rounded-ctrl',
  field: 'rounded-field',
  btn: 'rounded-btn',
} as const

const TINT = {
  10: 'bg-accent-tint-10',
  12: 'bg-accent-tint-12',
  15: 'bg-accent-tint-15',
} as const

export function IconBadge({
  size = 32,
  radius = 'ctrl',
  tint = 10,
  className,
  children,
}: {
  size?: keyof typeof SIZE
  radius?: keyof typeof RADIUS
  tint?: keyof typeof TINT
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center text-accent',
        SIZE[size],
        RADIUS[radius],
        TINT[tint],
        className
      )}
    >
      {children}
    </div>
  )
}
