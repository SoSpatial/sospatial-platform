import { cn } from '@/lib/cn'

/**
 * 세그먼트 탭 — 원본 저장 모달 신규/기존 탭 (:972-975, 스타일 :2088-2089)
 *   트랙   #1A1A1A(surface-deep) / radius 8 / padding 3
 *   버튼   flex-1 / padding 7px / radius 6 / 13px 600
 *   활성   #333(control) + #fff / 비활성 투명 + ink-45
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex rounded-ctrl bg-surface-deep p-0.75', className)}>
      {items.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'flex-1 cursor-pointer rounded-inset py-1.75 text-13 font-semibold',
            t.value === value ? 'bg-control text-ink' : 'text-ink-45'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
