import { NumberBadge } from '@/components/ui/NumberBadge'
import { cn } from '@/lib/cn'

/**
 * 요청 후 진행 절차 — 원본 :1240-1276
 *
 *   행     flex / align-items flex-start / gap 0
 *   항목   flex 1 / text-align center
 *     배지  38×38 원형. STEP1 은 accent 채움 + #1A1A1A 13px 800,
 *           나머지는 fill-07 + 1px line-10 + ink-45 13px 700. margin 0 auto 10px
 *     라벨  11px 600 자간 0.5px, margin-bottom 4px
 *           STEP1 액센트 / 나머지 ink-30
 *     제목  13px 600. STEP1 #fff / 나머지 ink-65
 *     설명  11.5px, margin-top 3px, line-height 1.5
 *           STEP1 ink-30 / 나머지 ink-28
 *   커넥터 flex 0 0 32px / padding-top 10px, 내부 1×32 line-10
 *
 * 반응형(원본에 없음): sm 미만에서 2열로 접고 커넥터를 숨긴다.
 */
/** desc 는 줄 배열이다. 원본의 <br> 줄바꿈을 그대로 표현한다. */
export type ProcessStep = { label: string; title: string; desc: string[] }

export function ProcessSteps({
  steps,
  activeIndex = 0,
}: {
  steps: ProcessStep[]
  activeIndex?: number
}) {
  return (
    <div className="flex flex-wrap items-start sm:flex-nowrap">
      {steps.map((s, i) => {
        const active = i === activeIndex
        return (
          <div key={s.label} className="contents">
            {i > 0 && (
              <div className="hidden shrink-0 grow-0 basis-8 items-center justify-center pt-2.5 sm:flex">
                <div className="h-px w-8 bg-line-10" />
              </div>
            )}
            <div className="min-w-1/2 flex-1 text-center sm:min-w-0">
              <NumberBadge
                n={i + 1}
                color={active ? 'accent' : 'muted'}
                size={38}
                className="mx-auto mb-2.5"
              />
              <div
                className={cn(
                  'mb-1 text-11 font-semibold tracking-caps',
                  active ? 'text-accent' : 'text-ink-30'
                )}
              >
                {s.label}
              </div>
              <div className={cn('text-13 font-semibold', active ? 'text-ink' : 'text-ink-65')}>
                {s.title}
              </div>
              <div
                className={cn(
                  'mt-0.75 text-11-5 leading-1-5',
                  active ? 'text-ink-30' : 'text-ink-28'
                )}
              >
                {s.desc.map((line, li) => (
                  <span key={line}>
                    {li > 0 && <br />}
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
