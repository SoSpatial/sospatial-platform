import { IconBadge } from '@/components/ui/IconBadge'
import { AiMark, SendIcon } from '@/components/icons/maps'
import { cn } from '@/lib/cn'
import {
  AI_GREETING,
  USER_MESSAGE,
  AI_ANALYSIS_INTRO,
  RANKS,
  REPORT_BUTTON_LABEL,
  SUGGESTED_CHIPS,
  INPUT_PLACEHOLDER,
  CHAT_CAPTION,
} from '@/lib/content/maps'

/**
 * AI 채팅 패널 — 원본 :1000-1090. 420px 고정 / flex-col / border-r line-07
 *
 * ★ 3단계 교체 경계: 이 프레임(헤더·스크롤 영역·하단 입력부)은 **남는 구조**다.
 *   대화 내용은 lib/content/maps.tsx(버려질 목업)에서 온다.
 *
 *   헤더   padding 16 20 / border-b line-07 — 배지 36/btn/tint12 + AiMark 14,
 *          제목 14/600 + 서브 11/ink-35, 온라인 도트 7px chart-green + 11.5/ink-40
 *   메시지 flex-1 overflow-y-auto / padding 20 / gap 16 — 이 영역만 스크롤된다
 *          AI 버블   fill-05 + line-07 / radius 12(mock) + 좌상만 2px / 12px 14px
 *          사용자    #2B52D0(blue) / radius 12 + 우하만 2px / 시각 10.5 우측
 *          순위 카드 1위 chart-green 계열 강조, 2·3위 fill-04 (:1046-1066)
 *   하단   padding 12 20 16 / border-t line-06 — 추천 칩(원본 span — 무동작이라
 *          button 으로 승격하지 않음) + 입력 셸(1.5px line-08, hover accent-line-25)
 *          + 전송 30×30 + 캡션 10.5/ink-20
 *
 * 입력·전송·칩·보고서 버튼은 **원본대로 무동작** (CLAUDE.md 판단 사례 10 — 연결할
 * 기존 동작이 없어 발명 금지). hover 만 style-hover 명시대로 재현.
 */
function AiAvatar() {
  return (
    <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-input bg-accent-tint-10">
      <AiMark size={11} />
    </div>
  )
}

export function ChatPanel() {
  return (
    <div className="flex w-[420px] shrink-0 flex-col border-r border-line-07">
      {/* AI 헤더 :1003-1017 */}
      <div className="flex shrink-0 items-center justify-between border-b border-line-07 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <IconBadge size={36} radius="btn" tint={12}>
            <AiMark size={14} />
          </IconBadge>
          <div>
            <div className="text-14 font-semibold text-ink">SoSpatial AI</div>
            <div className="text-11 text-ink-35">공간 데이터 기반 분석</div>
          </div>
        </div>
        <div className="flex items-center gap-1.25">
          <div className="h-1.75 w-1.75 rounded-full bg-chart-green" />
          <span className="text-11-5 text-ink-40">온라인</span>
        </div>
      </div>

      {/* 메시지 :1020-1073 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="flex items-start gap-2.5">
          <AiAvatar />
          <div className="max-w-[310px] rounded-mock rounded-tl-[2px] border border-line-07 bg-fill-05 px-3.5 py-3">
            <p className="text-13 leading-1-7 text-ink-80">{AI_GREETING}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[280px] rounded-mock rounded-br-[2px] bg-blue px-3.5 py-3">
            <p className="text-13 leading-1-65 text-ink">{USER_MESSAGE.text}</p>
            <p className="mt-1.25 text-right text-10-5 text-ink-40">{USER_MESSAGE.time}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AiAvatar />
          <div className="flex max-w-[330px] flex-col gap-2">
            <div className="rounded-mock rounded-tl-[2px] border border-line-07 bg-fill-05 px-3.5 py-3">
              <p className="mb-3 text-13 leading-1-65 text-ink-80">{AI_ANALYSIS_INTRO}</p>
              <div className="flex flex-col gap-1.5">
                {RANKS.map((r) => (
                  <div
                    key={r.rank}
                    className={cn(
                      'flex items-center justify-between rounded-ctrl border px-3 py-2.25',
                      r.top
                        ? 'border-chart-green-line-18 bg-chart-green-tint-10'
                        : 'border-line-06 bg-fill-04'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-9-5',
                          r.top
                            ? 'bg-chart-green font-extrabold text-marker-ink'
                            : 'bg-fill-10 font-bold text-ink'
                        )}
                      >
                        {r.rank}
                      </span>
                      <span
                        className={cn(
                          'text-12-5',
                          r.top ? 'font-semibold text-ink' : 'text-ink-70'
                        )}
                      >
                        {r.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-12',
                        r.top ? 'font-bold text-chart-green' : 'font-semibold text-ink-50'
                      )}
                    >
                      {r.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-ctrl border border-accent-line-18 bg-accent-tint-10 px-3.5 py-2.25 text-left text-12-5 font-semibold text-accent hover:bg-accent-tint-16"
            >
              {REPORT_BUTTON_LABEL}
            </button>
          </div>
        </div>
      </div>

      {/* 추천 칩 + 입력 :1076-1089 */}
      <div className="shrink-0 border-t border-line-06 px-5 pb-4 pt-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {SUGGESTED_CHIPS.map((chip) => (
            <span
              key={chip}
              className="cursor-pointer whitespace-nowrap rounded-pill border border-line-08 bg-fill-05 px-2.75 py-1.25 text-11-5 text-ink-50 hover:bg-fill-09"
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-btn border-[1.5px] border-line-08 bg-fill-05 px-3 py-2.25 hover:border-accent-line-25">
          <input
            placeholder={INPUT_PLACEHOLDER}
            aria-label="AI에게 질문"
            className="min-w-0 flex-1 border-none bg-transparent text-13 text-ink-75"
          />
          <button
            type="button"
            aria-label="전송"
            className="flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-input bg-accent text-accent-ink hover:bg-accent-hover"
          >
            <SendIcon size={12} />
          </button>
        </div>
        <p className="mt-1.75 text-center text-10-5 text-ink-20">{CHAT_CAPTION}</p>
      </div>
    </div>
  )
}
