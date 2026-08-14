import { cn } from '@/lib/cn'

/**
 * 칩 / 태그 프리미티브
 *
 * 원본에 4종이 있다.
 *   pill        padding 4px 12px / radius 99px / 12px   / fill-05 + line-10 / ink-55
 *               홈 피처 카드 :138
 *   searchPill  padding 4px 13px / radius 99px / 12.5px / fill-06 + line-10 / ink-60
 *               데이터 랜딩 인기 검색 :387-390 — hover 시 fill-10.
 *               ⚠ pill 과 패딩·크기·배경·색 4개 값이 전부 다르다. 통일하지 말 것.
 *   tag         padding 2px 8px  / radius 4px  / 10.5px / fill-05, 보더 없음 / ink-40
 *               API 카드 태그 :653
 *   tagOutline  padding 3px 8px  / radius 4px  / 10.5px / fill-05 + line-08 / ink-38
 *               Request 카드 태그 :1184
 */
const VARIANT = {
  pill: 'px-3 py-1 rounded-pill text-12 bg-fill-05 border border-line-10 text-ink-55',
  searchPill:
    'px-3.25 py-1 rounded-pill text-12-5 bg-fill-06 border border-line-10 text-ink-60 hover:bg-fill-10',
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
