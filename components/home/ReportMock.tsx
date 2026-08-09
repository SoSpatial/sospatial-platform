/**
 * 카드3 목업 — 리포트 카드 + 말풍선 2개 (원본 :183-199)
 *
 * 래퍼   padding 28px 28px 0 / flex-shrink 0 / position relative / height 185px
 *        ★ 카드1 과 달리 원본에 height:185px 선언이 있다. 그대로 유지한다.
 *
 * 리포트 카드  width 60% / #242424 / radius 10px / padding 14px
 *              1px rgba(255,255,255,0.06)
 *   제목 바    height 6px / #C4A882 / radius 3px / margin-bottom 8px / width 50%
 *   스켈레톤   height 3px / rgba(255,255,255,0.08) / radius 2px / width 82%,70%,60%
 *              margin-bottom 5px, 5px, 12px
 *   차트       flex / align-items flex-end / gap 5px / height 40px
 *              막대 width 13px / radius 2px 2px 0 0
 *              높이·색: 90% accent / 58% chart-blue / 72% chart-green
 *                       42% accent / 68% chart-blue
 *
 * 말풍선 (둘 다 absolute, right 16px, radius 10px 10px 2px 10px, 10.5px, line-height 1.5)
 *   중립  bottom 32px / rgba(255,255,255,0.08) / 1px rgba(255,255,255,0.1)
 *         / ink-80 / max-width 130px
 *   액센트 bottom 6px / #C4A882 / #1A1A1A / 600 / max-width 140px
 *   DOM 순서상 액센트가 나중이라 중립 위에 그려진다 (원본과 동일).
 */
const BARS = [
  { h: 'h-[90%]', color: 'bg-accent' },
  { h: 'h-[58%]', color: 'bg-chart-blue' },
  { h: 'h-[72%]', color: 'bg-chart-green' },
  { h: 'h-[42%]', color: 'bg-accent' },
  { h: 'h-[68%]', color: 'bg-chart-blue' },
]

export function ReportMock() {
  return (
    <div className="relative h-[185px] shrink-0 px-7 pt-7">
      <div className="w-[60%] rounded-btn border border-line-06 bg-surface p-3.5">
        <div className="mb-2 h-1.5 w-1/2 rounded-[3px] bg-accent" />
        <div className="mb-1.25 h-[3px] w-[82%] rounded-[2px] bg-fill-08" />
        <div className="mb-1.25 h-[3px] w-[70%] rounded-[2px] bg-fill-08" />
        <div className="mb-3 h-[3px] w-[60%] rounded-[2px] bg-fill-08" />

        <div className="flex h-10 items-end gap-1.25">
          {BARS.map((b, i) => (
            <div key={i} className={`w-[13px] rounded-t-[2px] ${b.color} ${b.h}`} />
          ))}
        </div>
      </div>

      <div className="absolute right-4 bottom-8 max-w-[130px] rounded-btn rounded-br-[2px] border border-line-10 bg-fill-08 px-2.75 py-1.75 text-10-5 leading-1-5 text-ink-80">
        우리 지역도 가능한가요?
      </div>
      <div className="absolute right-4 bottom-1.5 max-w-[140px] rounded-btn rounded-br-[2px] bg-accent px-2.75 py-1.75 text-10-5 leading-1-5 font-semibold text-accent-ink">
        전문가가 함께 설계해 드려요
      </div>
    </div>
  )
}
