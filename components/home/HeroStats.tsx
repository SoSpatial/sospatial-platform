/**
 * 홈 히어로 통계 — 원본 :90-105
 *
 *   행    flex / justify-center / align-center / gap 0
 *   항목  padding 0 28px / text-align center
 *   수치  22px / 800 / #fff / letter-spacing -0.5px
 *   라벨  12.5px / ink-30 / margin-top 3px
 *   구분  width 1px / height 28px / rgba(255,255,255,0.1)
 *
 * README 에는 누락됐던 요소다 (CLAUDE.md 불일치 항목 #5 — 실제 코드 기준).
 *
 * 반응형(원본에 없음): 375px 에서 좌우 패딩을 28 → 16px 로 줄여 3개가 들어가게 한다.
 */
export type Stat = { value: string; label: string }

export function HeroStats({ items }: { items: Stat[] }) {
  return (
    <div className="flex items-center justify-center">
      {items.map((s, i) => (
        <div key={s.label} className="flex items-center">
          {i > 0 && <div className="h-7 w-px bg-line-10" />}
          <div className="px-4 text-center sm:px-7">
            <div className="text-22 font-extrabold tracking-stat text-ink">{s.value}</div>
            <div className="mt-0.75 text-12-5 text-ink-30">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
