import { cn } from '@/lib/cn'

/**
 * 폼 프리미티브 — 원본 Request 폼 3종에서 공통으로 쓰인다.
 * source 전용 값을 하드코딩하지 않는다.
 *
 * 라벨   12px / 600 / ink-45 / uppercase / 자간 0.4px / margin-bottom 6px (:1316)
 *        Output Format 처럼 하단 마진 8px 인 경우가 있어 labelGap 으로 받는다 (:1387)
 * 컨트롤 padding 10px 12px / #2A2A2A / 1px line-10 / radius 8px / 13px (:1317)
 *        input 은 글자색 #fff, select 는 ink-70 (원본이 다르다)
 * textarea padding 12px / resize vertical / min-height 는 폼마다 다름 (:1410 80px, :1623 200px)
 */

export function FormField({
  label,
  labelGap = 6,
  className,
  children,
}: {
  label: string
  /** 라벨과 컨트롤 사이 간격. 원본은 6px 이고 Output Format 만 8px */
  labelGap?: 6 | 8
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label
        className={cn(
          'block text-12 font-semibold tracking-label text-ink-45 uppercase',
          labelGap === 8 ? 'mb-2' : 'mb-1.5'
        )}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const CONTROL = 'w-full rounded-ctrl border border-line-10 bg-surface-raised px-3 py-2.5 text-13 outline-none'

export function TextInput({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'text-ink', className)} {...rest} />
}

export function SelectInput({
  options,
  className,
  ...rest
}: { options: readonly string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, 'cursor-pointer text-ink-70', className)} {...rest}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function TextareaInput({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded-ctrl border border-line-10 bg-surface-raised p-3 text-13 leading-1-6 text-ink-70 outline-none',
        className
      )}
      {...rest}
    />
  )
}

/**
 * 라디오 그룹 — 원본 :1388-1405
 *   행 gap 12px, 항목 gap 7px, accent-color #C4A882, 라벨 13px ink-70
 */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-3">
      {options.map((o) => (
        <label key={o} className="flex cursor-pointer items-center gap-1.75">
          <input
            type="radio"
            name={name}
            value={o}
            checked={value === o}
            onChange={() => onChange(o)}
            className="accent-accent"
          />
          <span className="text-13 text-ink-70">{o}</span>
        </label>
      ))}
    </div>
  )
}
