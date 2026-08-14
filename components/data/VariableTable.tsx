import { Checkbox } from '@/components/ui/Checkbox'
import type { TopicVariable } from '@/lib/content/topics'

/**
 * 변수 선택 테이블 — 원본 :334-364. /data select 전용 page-local.
 * DataTable 로의 추출은 /projects 에서 사용처가 2개가 될 때 한다
 * (CLAUDE.md 재고표 "추출은 보류" 확정).
 *
 *   셸        #242424 / line-07 / radius 14 / overflow hidden / mb 20
 *   헤더 행   padding 16px 20px / border-b line-07
 *             제목 14.5 600 + 우측 gap 8: "N개 선택"(12 ink-35, 체크 있을 때만)
 *             + [저장 버튼 + 경고 세로 스택 gap 4 align-end (:341)] + 다운로드 버튼
 *   저장      6px 14px / fill-07 + line-12 / radius 7 / 12.5 600 ink-70, hover fill-11
 *   경고      11.5 500 --color-danger, "⚠ " 리터럴 포함 (:344)
 *   다운로드  6px 14px / accent / radius 7 / 12.5 700, hover accent-hover
 *   컬럼 행   grid 44px 1fr 1fr auto / padding 10px 20px / border-b line-06
 *             라벨 11.5 600 ink-35 uppercase ls 0.5
 *   데이터 행 같은 grid / padding 12px 20px / border-b line-05 (모든 행)
 *             체크박스 14×14 accent / 변수명 13 / 설명 12 ink-38 lh 1.5
 *             미리보기 5px 12px / fill-05 + line-10 / radius 6 / 11.5 ink-55,
 *             hover fill-09, onClick 없음(원본 장식)
 *
 * 저장·다운로드·미리보기 버튼은 Button size 와 안 맞아 page-local (받기 버튼과 동일 취급).
 * 변수 목록이 비면 데이터 행이 없는 것이 원본 동작이다 (주제∧세부주제 필요).
 */
export function VariableTable({
  rows,
  checked,
  onToggle,
  onSave,
  onDownload,
  warn,
}: {
  rows: TopicVariable[]
  checked: string[]
  onToggle: (name: string) => void
  onSave: () => void
  onDownload: () => void
  warn: string
}) {
  return (
    <div className="mb-5 overflow-hidden rounded-panel border border-line-07 bg-surface">
      <div className="flex items-center justify-between border-b border-line-07 px-5 py-4">
        <h3 className="text-14-5 font-semibold text-ink">필요한 데이터를 선택하세요</h3>
        <div className="flex items-center gap-2">
          {checked.length > 0 && <span className="text-12 text-ink-35">{checked.length}개 선택</span>}
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={onSave}
              className="cursor-pointer rounded-input border border-line-12 bg-fill-07 px-3.5 py-1.5 text-12-5 font-semibold text-ink-70 hover:bg-fill-11"
            >
              프로젝트에 저장
            </button>
            {warn && <span className="text-11-5 font-medium text-danger">⚠ {warn}</span>}
          </div>
          <button
            type="button"
            onClick={onDownload}
            className="cursor-pointer rounded-input bg-accent px-3.5 py-1.5 text-12-5 font-bold text-accent-ink hover:bg-accent-hover"
          >
            다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[44px_1fr_1fr_auto] border-b border-line-06 px-5 py-2.5">
        <span />
        <span className="text-11-5 font-semibold uppercase tracking-caps text-ink-35">변수</span>
        <span className="text-11-5 font-semibold uppercase tracking-caps text-ink-35">설명</span>
        <span className="text-11-5 font-semibold uppercase tracking-caps text-ink-35">액션</span>
      </div>

      {rows.map((v) => (
        <div
          key={v.name}
          className="grid grid-cols-[44px_1fr_1fr_auto] items-center border-b border-line-05 px-5 py-3"
        >
          <Checkbox checked={checked.includes(v.name)} onChange={() => onToggle(v.name)} />
          <span className="text-13 text-ink">{v.name}</span>
          <span className="text-12 leading-1-5 text-ink-38">{v.desc}</span>
          <button
            type="button"
            className="cursor-pointer whitespace-nowrap rounded-inset border border-line-10 bg-fill-05 px-3 py-1.25 text-11-5 text-ink-55 hover:bg-fill-09"
          >
            미리보기
          </button>
        </div>
      ))}
    </div>
  )
}
