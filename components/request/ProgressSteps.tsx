import { CheckIcon } from '@/components/icons/guide'
import { cn } from '@/lib/cn'

/**
 * 요청 폼 상단 진행 스텝 — 원본 :1289-1302 (source) / :1464-1477 (upload) / :1596-1609 (describe)
 *
 *   행     flex / align-items center / gap 8px / margin-bottom 28px
 *   완료   padding 4px 12px / #C4A882 / radius 99px / gap 6px
 *          10px 체크 아이콘(stroke #1A1A1A 2.5) + 11.5px 700 #1A1A1A
 *   현재   padding 4px 12px / 방식별 색 / radius 99px / 11.5px 700 #fff
 *   대기   padding 4px 12px / rgba(255,255,255,0.06) / radius 99px / 11.5px ink-35
 *   커넥터 1×32 rgba(255,255,255,0.15)
 *
 * 현재 단계 색만 폼마다 다르다 (blue / emerald / violet).
 */
const ACTIVE_BG = {
  blue: 'bg-blue',
  emerald: 'bg-emerald',
  violet: 'bg-violet',
} as const

const STEPS = ['요청 방식 선택', '요청 정보 입력', '검토 및 제출'] as const

export function ProgressSteps({
  activeColor,
  activeIndex = 1,
  textPillDisplay = 'flex',
}: {
  activeColor: keyof typeof ACTIVE_BG
  /** 기본값 1 = "요청 정보 입력" 단계 (폼 3종 공통) */
  activeIndex?: number
  /**
   * ★ 원본에서 텍스트만 있는 pill 의 display 가 폼마다 다르다.
   *   source   :1295 `display:flex;align-items:center;gap:6px` → 라인박스가 11.5px 기준
   *   upload   :1470 / describe :1602 — display 지정 없음(블록)
   *     → 부모의 16px strut 이 라인박스를 키워 pill 이 약 6px 높아지고,
   *       그만큼 아래 폼 카드가 내려간다(원본 실측 191.5 vs 197.5).
   *   체크 아이콘이 있는 "완료" pill 은 세 폼 모두 flex 다.
   */
  textPillDisplay?: 'flex' | 'block'
}) {
  return (
    <div className="mb-7 flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        // 완료 pill 은 아이콘이 있어 항상 flex
        const asFlex = done || textPillDisplay === 'flex'
        return (
          <div key={label} className="contents">
            {i > 0 && <div className="h-px w-8 bg-line-15" />}
            <div
              className={cn(
                'rounded-pill px-3 py-1',
                asFlex && 'flex items-center gap-1.5',
                done && 'bg-accent',
                active && ACTIVE_BG[activeColor],
                !done && !active && 'bg-fill-06'
              )}
            >
              {done && (
                <span className="text-accent-ink">
                  <CheckIcon size={10} />
                </span>
              )}
              <span
                className={cn(
                  'text-11-5',
                  done && 'font-bold text-accent-ink',
                  active && 'font-bold text-ink',
                  !done && !active && 'text-ink-35'
                )}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
