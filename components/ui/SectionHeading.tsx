import { cn } from '@/lib/cn'

/**
 * 섹션 제목
 *
 *   size sm  19px / 700 / -0.4px   "전체 API" :638, "주제별 둘러보기" :399
 *   size lg  28px / 800 / -0.8px   홈 CORE FEATURES H2 :115
 *
 * eyebrow 는 홈에서만 쓴다 — 11px / 700 / 자간 3px / uppercase / 액센트 :114
 */
export function SectionHeading({
  eyebrow,
  title,
  size = 'sm',
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  size?: 'sm' | 'lg'
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="mb-3 text-11 font-bold uppercase tracking-eyebrow text-accent">{eyebrow}</p>
      )}
      <h2
        className={cn(
          'text-ink',
          size === 'lg' ? 'text-28 font-extrabold tracking-h2' : 'text-19 font-bold tracking-h3'
        )}
      >
        {title}
      </h2>
    </div>
  )
}
