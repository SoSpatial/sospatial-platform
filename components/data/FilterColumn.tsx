import { cn } from '@/lib/cn'

/**
 * 필터 컬럼 — 원본 :248-329
 *   헤더   padding 12px 16px / border-b line-07 / gap 7px
 *          아이콘 13px accent stroke 1.5 + 라벨 11.5px 600 ink-55
 *          단위 컬럼만 우측 extra "단일 선택" 10px ink-25 (:278)
 *   리스트 max-height 220px / overflow-y auto / overscroll-behavior contain
 *   컬럼   border-right line-07 (마지막 컬럼 제외 :319)
 *
 * 선택 규칙(배타/단일/비배타)은 이 컴포넌트가 모른다 — 컬럼 정의(DataSelect)가
 * onClick 핸들러로 주입한다. 컬럼마다 규칙이 달라 하드코딩하면 통일 금지 원칙을 깬다.
 */
export function FilterColumn({
  icon,
  label,
  extra,
  last = false,
  listRef,
  children,
}: {
  icon: React.ReactNode
  label: string
  /** 헤더 우측 보조 라벨 (단위 컬럼 "단일 선택") */
  extra?: string
  /** 마지막 컬럼은 border-right 없음 */
  last?: boolean
  /** 주제 컬럼의 진입 스크롤용 */
  listRef?: React.Ref<HTMLDivElement>
  children: React.ReactNode
}) {
  return (
    <div className={cn(!last && 'border-r border-line-07')}>
      <div className="flex items-center gap-1.75 border-b border-line-07 px-4 py-3">
        <span className="text-accent">{icon}</span>
        <span className="text-11-5 font-semibold text-ink-55">{label}</span>
        {extra && <span className="ml-auto text-10 text-ink-25">{extra}</span>}
      </div>
      <div ref={listRef} className="max-h-55 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  )
}

/**
 * 필터 아이템 — 원본 aStyle/iStyle (:2071-2072)
 *   공통   padding 9px 16px / 13px / border-b line-04 / cursor pointer
 *   활성   accent 600 + bg accent-08 + border-left 2px accent
 *          (보더 2px 만큼 텍스트가 밀리는 것도 원본 동작이다)
 *   비활성 ink-55
 *
 * 원본은 div 지만 키보드 접근을 위해 button 으로 렌더한다 (시각 결과 동일 —
 * 1단계 폼 a11y 연결과 같은 취급). 포커스 링은 globals 의 :focus-visible.
 */
export function FilterItem({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full cursor-pointer border-b border-line-04 px-4 py-2.25 text-left text-13',
        active
          ? 'border-l-2 border-l-accent bg-accent-tint-08 font-semibold text-accent'
          : 'text-ink-55'
      )}
    >
      {label}
    </button>
  )
}

/**
 * 세부 지역 그룹 헤더 — 원본 :309 (세부 지역 컬럼에만 있다)
 *   padding 6px 16px 2px / 10.5px 700 ink-30 / letter-spacing 0.5px / uppercase
 *   border-b line-04
 */
export function FilterGroupHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-line-04 px-4 pb-0.5 pt-1.5 text-10-5 font-bold uppercase tracking-caps text-ink-30">
      {label}
    </div>
  )
}
