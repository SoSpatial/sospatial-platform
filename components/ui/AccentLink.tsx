import Link from 'next/link'
import { ArrowRight } from '@/components/icons/ArrowRight'
import { cn } from '@/lib/cn'

/**
 * 액센트 링크 (텍스트 + 오른쪽 화살표)
 *
 * 원본에서 크기 3종이 쓰인다.
 *   md  14px   / 600 / gap 4px / 화살표 14  홈 피처 카드 :142, :174, :207
 *   sm  13.5px / 600 / gap 6px / 화살표 14  데이터 랜딩 전체보기 :412, Request 카드 :1188
 *   xs  12.5px / 600 / gap 5px / 화살표 11  작성 가이드 무료 상담 :1445
 */
const SIZE = {
  md: { text: 'text-14 gap-1', arrow: 14 },
  sm: { text: 'text-13-5 gap-1.5', arrow: 14 },
  xs: { text: 'text-12-5 gap-1.25', arrow: 11 },
} as const

export function AccentLink({
  label,
  href,
  size = 'md',
  className,
}: {
  label: string
  href?: string
  size?: keyof typeof SIZE
  className?: string
}) {
  const s = SIZE[size]
  const classes = cn(
    'inline-flex cursor-pointer items-center font-semibold text-accent',
    s.text,
    className
  )
  const inner = (
    <>
      <span>{label}</span>
      <ArrowRight size={s.arrow} />
    </>
  )

  return href ? (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  ) : (
    <span className={classes}>{inner}</span>
  )
}
