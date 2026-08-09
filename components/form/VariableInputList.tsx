'use client'

import { TextInput } from '@/components/form/fields'

/**
 * 변환 요청 변수 입력 목록 — 원본 :1374-1382
 *   컨테이너 flex column / gap 6px / max-height 180px / overflow-y auto
 *   행       flex / gap 6px, 인풋 flex 1 + 30×30 삭제(×) 버튼
 *            삭제 버튼 16px ink-30, hover ink-60
 *   추가     padding 8px / fill-04 / 1px dashed line-12 / radius 8px
 *            12.5px ink-40 / text-align left
 *
 * 원본 동작 (:2415-2416)
 *   addVar1    varCount + 1
 *   removeVar1 varCount - 1, 최소 1개는 남긴다 Math.max(1, n-1)
 * 원본은 개수만 세지만 여기서는 실제 값도 관리해 제출 payload 에 담는다.
 */
export function VariableInputList({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
}) {
  return (
    <div className="flex max-h-[180px] flex-col gap-1.5 overflow-y-auto">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <TextInput
            value={v}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values]
              next[i] = e.target.value
              onChange(next)
            }}
            className="flex-1"
          />
          <button
            type="button"
            aria-label={`변수 ${i + 1} 삭제`}
            onClick={() => onChange(values.length > 1 ? values.filter((_, k) => k !== i) : [''])}
            className="flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center text-16 text-ink-30 hover:text-ink-60"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="cursor-pointer rounded-ctrl border border-dashed border-line-12 bg-fill-04 p-2 text-left text-12-5 text-ink-40 hover:bg-fill-07"
      >
        + 변수 추가
      </button>
    </div>
  )
}
