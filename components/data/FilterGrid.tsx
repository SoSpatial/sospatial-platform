import { cn } from '@/lib/cn'

/**
 * 필터 그리드 셸 — 원본 :245
 *   #242424 / 1px line-07 / radius 14 / overflow hidden / margin-bottom 24
 *   grid-template-columns: repeat(5,1fr) ↔ repeat(6,1fr) 동적 (filterGridCols :2362)
 *
 * Tailwind JIT 는 런타임 문자열을 못 잡으므로 두 클래스를 정적으로 써서 분기한다
 * (CLAUDE.md 재고표 확정 사항).
 */
export function FilterGrid({
  sixCols,
  children,
}: {
  sixCols: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'mb-6 grid overflow-hidden rounded-panel border border-line-07 bg-surface',
        sixCols ? 'grid-cols-[repeat(6,1fr)]' : 'grid-cols-[repeat(5,1fr)]'
      )}
    >
      {children}
    </div>
  )
}
