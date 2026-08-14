import { cn } from '@/lib/cn'

/**
 * 액션 버튼 (아이콘 + 라벨) — 원본 :799-814(목록 액션바), :832-839(상세)
 *   8px 16px / radius 8 / 13px / gap 6px / 아이콘 13 stroke 2
 *   neutral  fill-06 + line-10 / ink-60, hover fill-10
 *   danger   delete-tint-08 + delete-line-18 / delete-ink, hover delete-tint-15 (:836)
 *
 * Button 프리미티브와 크기(8/16 vs sm 8/20)·구성(아이콘 필수)이 달라 page-local
 * (받기·미리보기 버튼과 같은 취급 — size 증식 방지).
 */
export function ActionButton({
  variant = 'neutral',
  onClick,
  icon,
  children,
}: {
  variant?: 'neutral' | 'danger'
  onClick?: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-ctrl border px-4 py-2 text-13',
        variant === 'danger'
          ? 'border-delete-line-18 bg-delete-tint-08 text-delete-ink hover:bg-delete-tint-15'
          : 'border-line-10 bg-fill-06 text-ink-60 hover:bg-fill-10'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
