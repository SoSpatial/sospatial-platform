import { cn } from '@/lib/cn'

const WIDTH = {
  content: 'max-w-content', // 1100px — 표준
  wide: 'max-w-wide', // 1200px — 데이터 선택 뷰
  narrow: 'max-w-narrow', // 680px — 홈/Request 히어로
  search: 'max-w-search', // 660px — 데이터 랜딩 히어로
} as const

/**
 * 콘텐츠 폭 제한 + 가운데 정렬.
 * 원본은 모든 섹션에서 `max-width: N; margin: 0 auto` 패턴을 쓴다.
 */
export function Container({
  width = 'content',
  className,
  children,
}: {
  width?: keyof typeof WIDTH
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('mx-auto', WIDTH[width], className)}>{children}</div>
}
