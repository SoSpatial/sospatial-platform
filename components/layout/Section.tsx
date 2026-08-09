import { cn } from '@/lib/cn'

/**
 * 섹션 래퍼 — 배경과 좌우 거터를 담당한다.
 * 세로 패딩은 페이지마다 달라 className 으로 받는다.
 *
 * 원본 좌우 거터는 항상 32px 이며, 반응형에서 20px 로 줄인다
 * (CLAUDE.md [반응형] — 원본은 데스크톱 전용이라 신규 결정).
 */
export function Section({
  bg = 'base',
  className,
  children,
}: {
  /** base = #181818, alt = #222222 (교차 밴드) */
  bg?: 'base' | 'alt'
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        bg === 'alt' ? 'bg-surface-alt' : 'bg-bg',
        'px-5 xl:px-gutter',
        className
      )}
    >
      {children}
    </section>
  )
}
