/**
 * 카드1 목업 — 데이터 필터 폼 (원본 :122-133)
 *
 * 래퍼   padding 28px 28px 0 / flex-shrink 0
 *        ★ 원본에 height 선언이 없다. 콘텐츠 높이로 결정되는 것이 원본 동작이므로
 *          검증 편의로 height 를 임의로 넣지 않는다.
 *          (카드2·3 목업만 height:185px 를 갖는다)
 *
 * 패널   #242424 / radius 12px / padding 16px / 1px rgba(255,255,255,0.06)
 * 인풋행 flex / gap 6px / margin-bottom 10px
 *   인풋 flex 1 / padding 8px 10px / 1px rgba(255,255,255,0.08) / radius 6px
 *        10.5px / rgba(255,255,255,0.25)
 *        ※ README 는 인풋 2개("주제 *", "지역 *")라고 했으나 실제 코드는 3개다
 *          (CLAUDE.md 불일치 항목 #3 — 실제 코드 기준)
 * 선택행 padding 9px 11px / rgba(196,168,130,0.12) / 1.5px rgba(196,168,130,0.28)
 *        radius 7px / 10.5px / #C4A882 / 600 / margin-bottom 6px
 * 스켈레톤 26px + margin-bottom 5px, 20px 폭 65% — 둘 다 fill-05 / radius 6px
 */
const FIELDS = ['주제 *', '단위 *', '지역 *']

export function DataSearchMock() {
  return (
    <div className="shrink-0 px-7 pt-7">
      <div className="rounded-mock border border-line-06 bg-surface p-4">
        <div className="mb-2.5 flex gap-1.5">
          {FIELDS.map((f) => (
            <div
              key={f}
              className="flex-1 rounded-inset border border-line-08 px-2.5 py-2 text-10-5 text-ink-25"
            >
              {f}
            </div>
          ))}
        </div>

        <div className="mb-1.5 rounded-input border-[1.5px] border-accent-line-28 bg-accent-tint-12 px-2.75 py-2.25 text-10-5 font-semibold text-accent">
          격자 250m · 서울특별시 · 2024
        </div>

        <div className="mb-1.25 h-6.5 rounded-inset bg-fill-05" />
        <div className="h-5 w-[65%] rounded-inset bg-fill-05" />
      </div>
    </div>
  )
}
