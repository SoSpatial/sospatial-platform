'use client'

import { useId } from 'react'
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
 *
 * ── 접근성 ──
 * 원본은 <label> 이 컨트롤과 연결돼 있지 않아 스크린리더가 이름을 읽지 못한다.
 * FormField 가 useId() 로 id 를 만들어 render-prop 으로 내려준다.
 * cloneElement 는 children 구조가 바뀌면 조용히 깨지므로 쓰지 않는다.
 *
 *   as="label" (기본)  컨트롤 1개   <label htmlFor={id}> + children({ id })
 *   as="group"         컨트롤 N개   <span id={labelId}> + role="group" aria-labelledby
 *                      (연도 범위, 변수 목록, 라디오 그룹, 컨트롤이 없는 드롭존)
 */
export type FieldRenderArgs = { id: string; labelId: string }

export function FormField({
  label,
  labelGap = 6,
  as = 'label',
  className,
  children,
}: {
  label: string
  /** 라벨과 컨트롤 사이 간격. 원본은 6px 이고 Output Format 만 8px */
  labelGap?: 6 | 8
  as?: 'label' | 'group'
  className?: string
  children: React.ReactNode | ((args: FieldRenderArgs) => React.ReactNode)
}) {
  const uid = useId()
  const id = `${uid}-control`
  const labelId = `${uid}-label`
  const labelClass = cn(
    'block text-12 font-semibold tracking-label text-ink-45 uppercase',
    labelGap === 8 ? 'mb-2' : 'mb-1.5'
  )
  const body = typeof children === 'function' ? children({ id, labelId }) : children

  if (as === 'group') {
    return (
      <div className={className}>
        <span id={labelId} className={labelClass}>
          {label}
        </span>
        <div role="group" aria-labelledby={labelId}>
          {body}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <label id={labelId} htmlFor={id} className={labelClass}>
        {label}
      </label>
      {body}
    </div>
  )
}

/**
 * 원본은 컨트롤에 outline:none 만 있고 포커스 표시가 없다.
 * CLAUDE.md 결정 8번에 따라 focus-visible 링(globals.css @layer base)이 뜨도록
 * outline-none 을 걷어냈다. 마우스 클릭 시에도 링이 뜨는지는 아래 참고.
 *   - <select>, <button>: 클릭으로는 :focus-visible 이 매칭되지 않아 링이 안 뜬다.
 *   - <input>, <textarea>: 편집 가능한 필드라 브라우저가 클릭 포커스도
 *     :focus-visible 로 취급한다(명세대로). 키보드 입력을 받는 필드이므로 정상 동작이다.
 */
const CONTROL = 'w-full rounded-ctrl border border-line-10 bg-surface-raised px-3 py-2.5 text-13'

export function TextInput({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'text-ink', className)} {...rest} />
}

/**
 * 문자열 배열이면 값=라벨, 객체면 value/label 을 분리한다.
 * (업로드 폼의 "서비스 선택..." 처럼 value 가 빈 문자열인 옵션이 있다 — 원본 :1513)
 */
export type SelectOption = string | { value: string; label: string }

export function SelectInput({
  options,
  className,
  ...rest
}: { options: readonly SelectOption[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, 'cursor-pointer text-ink-70', className)} {...rest}>
      {options.map((o) => {
        const value = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        return (
          <option key={value} value={value}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

/**
 * ★ 원본 textarea 는 폼마다 스펙이 다르다. 통일하지 말고 size 로 고른다.
 *   sm  :1410 source   padding 12 / 13px   / ink-70 / line-height 1.6  / min-height 80
 *   lg  :1623 describe  padding 16 / 13.5px / ink-75 / line-height 1.75 / min-height 200
 */
const TEXTAREA_SIZE = {
  sm: 'p-3 text-13 leading-1-6 text-ink-70 min-h-20',
  lg: 'p-4 text-13-5 leading-1-75 text-ink-75 min-h-50',
} as const

export function TextareaInput({
  size = 'sm',
  className,
  ...rest
}: { size?: keyof typeof TEXTAREA_SIZE } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-y rounded-ctrl border border-line-10 bg-surface-raised',
        TEXTAREA_SIZE[size],
        className
      )}
      {...rest}
    />
  )
}

/**
 * 라디오 그룹 — 원본 :1388-1405
 *   행 gap 12px, 항목 gap 7px, accent-color #C4A882, 라벨 13px ink-70
 *   <label> 이 <input> 을 감싸고 있어 이름 연결은 원래부터 정상이다.
 *   그룹 자체의 이름은 FormField as="group" 이 aria-labelledby 로 붙인다.
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
    /*
      원본은 flex-wrap 이 없다(:1388). 데스크톱에서는 항상 한 줄이라 차이가 없지만,
      375px 에서는 이 행의 min-content 가 286px 로 카드 콘텐츠 폭(269px)을 넘긴다.
      좁은 화면에서만 줄바꿈되도록 flex-wrap 을 추가했다 (반응형 신규 판단).
    */
    <div className="flex flex-wrap gap-3">
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
