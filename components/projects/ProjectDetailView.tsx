import { BackLink } from '@/components/request/BackLink'
import { ActionButton } from '@/components/projects/ActionButton'
import { DownloadIcon, TrashIcon } from '@/components/icons/projects'
import { cn } from '@/lib/cn'
import type { Project } from '@/lib/projects'

/**
 * 프로젝트 상세 뷰 — 원본 :820-863. page-local 테이블 (DataTable 추출 안 함).
 *
 *   백 링크 "← 내 프로젝트" mb 20 (:822) — 라우팅이 아니라 뷰 상태 복귀라 onClick 렌더
 *   타이틀 행 mb 24 — h2 20/700/-0.4 mb 4 + 메타 12.5 ink-35 "저장일 {date} · {sharing}"
 *             우측: 다운로드(neutral) + 프로젝트 삭제(danger :836)
 *   테이블   grid 1fr 2fr 0.8fr×4 / 헤더 12px 20px bg #2A2A2A 11.5 600 ink-40 (:843)
 *           행 14px 20px border-b line-05 — 데이터명 13.5/600, 설명 12 ink-40 lh1.5,
 *           나머지 12.5 ink-55
 */
const GRID = 'grid grid-cols-[1fr_2fr_0.8fr_0.8fr_0.8fr_0.8fr]'
const HEADERS = ['데이터명', '설명', '단위', '지역', '세부지역', '년도'] as const

export function ProjectDetailView({
  project,
  onBack,
  onDownload,
  onDelete,
}: {
  project: Project
  onBack: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  return (
    <div className="mb-5">
      <BackLink label="내 프로젝트" mb={20} onClick={onBack} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-20 font-bold tracking-h3 text-ink">{project.name}</h2>
          <span className="text-12-5 text-ink-35">
            저장일 {project.date} · {project.sharing}
          </span>
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={onDownload} icon={<DownloadIcon />}>
            다운로드
          </ActionButton>
          <ActionButton variant="danger" onClick={onDelete} icon={<TrashIcon />}>
            프로젝트 삭제
          </ActionButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-panel border border-line-07 bg-surface">
        <div className={cn(GRID, 'border-b border-line-08 bg-surface-raised px-5 py-3')}>
          {HEADERS.map((h) => (
            <span key={h} className="text-11-5 font-semibold text-ink-40">
              {h}
            </span>
          ))}
        </div>
        {project.variables.map((v) => (
          <div key={v.name} className={cn(GRID, 'items-center border-b border-line-05 px-5 py-3.5')}>
            <span className="text-13-5 font-semibold text-ink">{v.name}</span>
            <span className="text-12 leading-1-5 text-ink-40">{v.desc}</span>
            <span className="text-12-5 text-ink-55">{v.unit}</span>
            <span className="text-12-5 text-ink-55">{v.region}</span>
            <span className="text-12-5 text-ink-55">{v.subRegion}</span>
            <span className="text-12-5 text-ink-55">{v.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
