import { Checkbox } from '@/components/ui/Checkbox'
import { StarIcon } from '@/components/icons/projects'
import { cn } from '@/lib/cn'
import type { Project } from '@/lib/projects'

/**
 * 프로젝트 목록 테이블 — 원본 :866-903. page-local (DataTable 추출 안 함 — CLAUDE.md
 * "데이터 테이블 3종 실물 대조" 참조).
 *
 *   셸     #242424 / line-07 / radius 16 (상세·select 의 14와 다름 — 통일 금지)
 *   헤더   grid 52px 72px 1fr 60px 130px 120px 90px / padding 13px 20px / bg #2A2A2A
 *          border-b line-08 / 12px 600 ink-40, 중요·공유하기·공유여부는 center
 *          "저장 날짜 ↓" 는 리터럴 텍스트 (:877)
 *   행     padding 16px 20px / border-b line-05 / hover bg fill-03 / 행 전체 클릭 → 상세
 *   체크   wrapper div 가 클릭을 받고(stopPropagation) input 은 pointer-events:none
 *          (:884-885 그대로). 크기 15×15 (:872)
 *   공유여부 색 (:2287) — 공유 안함 ink-35 / 내가 공유 #5CC974 / 나에게 공유 accent /
 *          그 외(시드의 '공유받음' 등) fallback ink-35
 *
 * 빈 목록이면 헤더만 남는 것이 원본 동작이다 (빈 상태 UI 없음).
 */
const GRID = 'grid grid-cols-[52px_72px_1fr_60px_130px_120px_90px]'

const SHARE_COLOR: Record<string, string> = {
  '공유 안함': 'text-ink-35',
  '내가 공유': 'text-success',
  '나에게 공유': 'text-accent',
}

export function ProjectListTable({
  projects,
  checked,
  onToggleAll,
  onToggleCheck,
  onRowClick,
  onStarToggle,
  onShareClick,
}: {
  projects: Project[]
  checked: number[]
  onToggleAll: () => void
  onToggleCheck: (id: number) => void
  onRowClick: (project: Project) => void
  onStarToggle: (id: number) => void
  onShareClick: (id: number) => void
}) {
  const allChecked = projects.length > 0 && checked.length === projects.length

  return (
    <div className="overflow-hidden rounded-card border border-line-07 bg-surface">
      <div className={cn(GRID, 'border-b border-line-08 bg-surface-raised px-5 py-3.25')}>
        <div className="flex items-center">
          <Checkbox size={15} checked={allChecked} onChange={onToggleAll} aria-label="전체 선택" />
        </div>
        <span className="text-12 font-semibold text-ink-40">No.</span>
        <span className="text-12 font-semibold text-ink-40">프로젝트 이름</span>
        <span className="text-center text-12 font-semibold text-ink-40">중요</span>
        <span className="text-12 font-semibold text-ink-40">저장 날짜 ↓</span>
        <span className="text-center text-12 font-semibold text-ink-40">공유하기</span>
        <span className="text-center text-12 font-semibold text-ink-40">공유여부</span>
      </div>

      {projects.map((p, i) => (
        <div
          key={p.id}
          onClick={() => onRowClick(p)}
          className={cn(
            GRID,
            'cursor-pointer items-center border-b border-line-05 px-5 py-4 hover:bg-fill-03'
          )}
        >
          <div
            className="flex items-center"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCheck(p.id)
            }}
          >
            <Checkbox
              size={15}
              checked={checked.includes(p.id)}
              readOnly
              className="pointer-events-none"
              aria-label={`${p.name} 선택`}
            />
          </div>
          <span className="text-13 text-ink-35">{i + 1}</span>
          <span className="text-14 font-medium text-ink">{p.name}</span>
          <div
            className="flex cursor-pointer justify-center"
            onClick={(e) => {
              e.stopPropagation()
              onStarToggle(p.id)
            }}
          >
            <StarIcon filled={p.starred} />
          </div>
          <span className="text-13 text-ink-45">{p.date}</span>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onShareClick(p.id)
              }}
              className="cursor-pointer whitespace-nowrap rounded-inset border border-line-10 bg-fill-06 px-2.5 py-1.25 text-11-5 text-ink-55 hover:bg-fill-10"
            >
              공유하기
            </button>
          </div>
          <div className="pointer-events-none flex justify-center">
            <span className={cn('text-12-5', SHARE_COLOR[p.sharing] ?? 'text-ink-35')}>
              {p.sharing}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
