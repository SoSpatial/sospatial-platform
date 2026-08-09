import { cn } from '@/lib/cn'

/**
 * 원형 숫자 배지
 *
 * 원본 사용처
 *   36px  방식 카드 헤더        blue/emerald/violet 채움, 14px 800 흰 글자
 *         (:1178 #2B52D0, :1196 #059669, :1217 #7C3AED — 폼 헤더 :1307/:1482/:1614 도 동일)
 *   38px  진행 절차 STEP 1     accent 채움, 13px 800 #1A1A1A (:1242)
 *   38px  진행 절차 STEP 2~4   fill-07 + 1px line-10, 13px 700 ink-45 (:1251)
 */
const COLOR = {
  blue: 'bg-blue text-ink',
  emerald: 'bg-emerald text-ink',
  violet: 'bg-violet text-ink',
  accent: 'bg-accent text-accent-ink',
  muted: 'border border-line-10 bg-fill-07 text-ink-45',
} as const

const SIZE = {
  36: 'h-9 w-9 text-14',
  38: 'h-9.5 w-9.5 text-13',
} as const

export function NumberBadge({
  n,
  color = 'blue',
  size = 36,
  className,
}: {
  n: number | string
  color?: keyof typeof COLOR
  size?: keyof typeof SIZE
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        COLOR[color],
        SIZE[size],
        // 채운 배지는 800, 비활성(muted)은 700 — 원본 :1243 vs :1252
        color === 'muted' ? 'font-bold' : 'font-extrabold',
        className
      )}
    >
      {n}
    </div>
  )
}
