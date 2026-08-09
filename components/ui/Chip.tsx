import { cn } from '@/lib/cn'

/**
 * 칩 / 태그 프리미티브
 *
 * 원본에 3종이 있다.
 *   pill        padding 4px 12px / radius 99px / 12px  / fill-05 + line-10 / ink-55
 *               홈 피처 카드 :138, 데이터 인기 검색 :387
 *   tag         padding 2px 8px  / radius 4px  / 10.5px / fill-05, 보더 없음 / ink-40
 *               API 카드 태그 :653
 *   tagOutline  padding 3px 8px  / radius 4px  / 10.5px / fill-05 + line-08 / ink-38
 *               Request 카드 태그 :1184
 */
const VARIANT = {
  pill: 'px-3 py-1 rounded-pill text-12 bg-fill-05 border border-line-10 text-ink-55',
  tag: 'px-2 py-0.5 rounded-tag text-10-5 bg-fill-05 text-ink-40',
  tagOutline: 'px-2 py-0.75 rounded-tag text-10-5 bg-fill-05 border border-line-08 text-ink-38',
} as const

export function Chip({
  variant = 'pill',
  className,
  children,
}: {
  variant?: keyof typeof VARIANT
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn(VARIANT[variant], className)}>{children}</span>
}
