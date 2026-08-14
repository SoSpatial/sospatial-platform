'use client'

import { useState } from 'react'
import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Toast, useToast } from '@/components/ui/Toast'
import { ActionButton } from '@/components/projects/ActionButton'
import { ProjectListTable } from '@/components/projects/ProjectListTable'
import { ProjectDetailView } from '@/components/projects/ProjectDetailView'
import { ShareModal } from '@/components/projects/ShareModal'
import { TrashIcon, DownloadIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons/projects'
import { useProjects, type Project } from '@/lib/projects'

/**
 * My Projects — 원본 :786-905, 로직 :2194-2299
 *
 *   래퍼   padding 48px 32px 80px / max-width 1100 (:788-789)
 *   헤더   mb 32, items-end — h1 28/800/-0.8 mb 6 + 설명 13.5 ink-40 (:792-796)
 *          ⚠ h1 에 closeProjectDetail onClick + hover opacity 0.8 (:794) —
 *          상세에서 h1 클릭으로도 목록 복귀. 액션바 4버튼은 목록 뷰에서만 (:797)
 *
 * 원본 그대로 유지하는 비일관 (통일·수정 금지, CLAUDE.md 지시):
 *   - 목록 선택 삭제는 확인창·토스트 없음 (:2250) / 상세 삭제는 토스트 있음 (:2199)
 *   - 선택 다운로드는 체크 0개여도 빈 배열 JSON 을 내려받는다 (:2253 — CSV 쪽
 *     조기 반환 :2396 과 다름)
 *
 * 목록 앱 상태는 빈 목록이 기본 (원본 초기 상태와 동일). reference 의 3건은 캡처
 * 시점 시드이며 verify-projects.mjs 가 localStorage 로 주입한다 — 앱 코드에 넣지 않는다.
 */
const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ProjectsView() {
  const { projects, updateProjects } = useProjects()
  const [checked, setChecked] = useState<number[]>([])
  const [viewing, setViewing] = useState<Project | null>(null)
  const [shareProjectId, setShareProjectId] = useState<number | null>(null)
  const { message, showToast } = useToast()

  /* ── 목록 액션 (:2245-2285) ── */
  const toggleAll = () =>
    setChecked((cur) => (cur.length === projects.length ? [] : projects.map((p) => p.id)))
  const toggleCheck = (id: number) =>
    setChecked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  const deleteSelected = () => {
    updateProjects((cur) => cur.filter((p) => !checked.includes(p.id)))
    setChecked([])
  }
  const downloadSelected = () => {
    downloadJson(
      projects.filter((p) => checked.includes(p.id)),
      'sospatial_projects.json'
    )
  }
  // 체크 행들을 한 칸 이동 — 인접 체크 블록은 순서 유지 (버블 스왑 :2262-2285)
  const moveUp = () =>
    updateProjects((cur) => {
      const arr = [...cur]
      for (let i = 1; i < arr.length; i++) {
        if (checked.includes(arr[i].id) && !checked.includes(arr[i - 1].id)) {
          ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        }
      }
      return arr
    })
  const moveDown = () =>
    updateProjects((cur) => {
      const arr = [...cur]
      for (let i = arr.length - 2; i >= 0; i--) {
        if (checked.includes(arr[i].id) && !checked.includes(arr[i + 1].id)) {
          ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        }
      }
      return arr
    })
  const starToggle = (id: number) =>
    updateProjects((cur) => cur.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)))
  /* ── 공유 모달 (:2294, :2117-2155) — 프로젝트는 스토어에서 live 로 찾아
        revoke 시 목록이 즉시 갱신된다 (:2120) ── */
  const shareClick = (id: number) => setShareProjectId(id)
  const shareProject = projects.find((p) => p.id === shareProjectId) ?? null
  const confirmShare = (emails: string[]) => {
    // sharedWith 를 새 목록으로 교체 — 기존 공유자가 덮어써진다 (:2152, 원본 비일관 보존).
    // 공유 완료 토스트 없음 — '내가 공유' 색 전환이 피드백 (원본 그대로)
    updateProjects((cur) =>
      cur.map((p) =>
        p.id === shareProjectId ? { ...p, sharing: '내가 공유', sharedWith: emails } : p
      )
    )
    setShareProjectId(null)
  }
  const revokeShare = (email: string) => {
    // sharedWith 에서 제거, 비면 '공유 안함' 복귀 (:2123-2129)
    updateProjects((cur) =>
      cur.map((p) => {
        if (p.id !== shareProjectId) return p
        const next = (p.sharedWith ?? []).filter((e) => e !== email)
        return { ...p, sharedWith: next, sharing: next.length ? '내가 공유' : '공유 안함' }
      })
    )
  }

  /* ── 상세 액션 (:2198-2213) ── */
  const closeDetail = () => setViewing(null)
  const deleteViewing = () => {
    if (!viewing) return
    updateProjects((cur) => cur.filter((p) => p.id !== viewing.id))
    setViewing(null)
    showToast('프로젝트가 삭제됐습니다.')
  }
  const downloadViewing = () => {
    if (viewing) downloadJson(viewing, `${viewing.name}.json`)
  }

  return (
    <PageRoot className="bg-bg">
      <Section className="pt-12 pb-20">
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1
                onClick={closeDetail}
                className="mb-1.5 cursor-pointer text-28 font-extrabold tracking-h2 text-ink hover:opacity-80"
              >
                My Projects
              </h1>
              <p className="text-13-5 text-ink-40">
                저장한 프로젝트를 관리하고 필요한 분석을 이어가세요.
              </p>
            </div>
            {!viewing && (
              <div className="flex gap-2">
                <ActionButton onClick={deleteSelected} icon={<TrashIcon />}>
                  선택 삭제
                </ActionButton>
                <ActionButton onClick={downloadSelected} icon={<DownloadIcon />}>
                  선택 다운로드
                </ActionButton>
                <ActionButton onClick={moveUp} icon={<ArrowUpIcon />}>
                  위로 이동
                </ActionButton>
                <ActionButton onClick={moveDown} icon={<ArrowDownIcon />}>
                  아래로 이동
                </ActionButton>
              </div>
            )}
          </div>

          {viewing ? (
            <ProjectDetailView
              project={viewing}
              onBack={closeDetail}
              onDownload={downloadViewing}
              onDelete={deleteViewing}
            />
          ) : (
            <ProjectListTable
              projects={projects}
              checked={checked}
              onToggleAll={toggleAll}
              onToggleCheck={toggleCheck}
              onRowClick={setViewing}
              onStarToggle={starToggle}
              onShareClick={shareClick}
            />
          )}
        </Container>
      </Section>

      {shareProject && (
        <ShareModal
          project={shareProject}
          onClose={() => setShareProjectId(null)}
          onConfirm={confirmShare}
          onRevoke={revokeShare}
        />
      )}
      <Toast message={message} />
    </PageRoot>
  )
}
