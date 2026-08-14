import type { Metadata } from 'next'
import { DesktopOnly } from '@/components/ui/DesktopOnly'
import { ProjectsView } from '@/components/projects/ProjectsView'

export const metadata: Metadata = {
  // 개인 작업 화면(localStorage 기반) — /data/select 와 같은 취급으로 noindex 유지·sitemap 미포함
  robots: { index: false, follow: true },
  title: 'My Projects',
  description: '저장한 프로젝트를 관리하고 필요한 분석을 이어가세요.',
}

/**
 * My Projects — 원본 :786-905 (목록 + 상세, 단일 라우트 내 뷰 상태)
 * 검증 기준: reference/04-projects-list.png / 05-projects-detail.png
 *
 * 목록↔상세는 Request·/data 와 달리 라우트를 분리하지 않는다 — 상세는 영속 식별자가
 * 없는 로컬 데이터(localStorage) 뷰라 딥링크 대상이 아니고, 원본 복귀 동작(체크 유지)이
 * 상태 전환과 일치한다. md 미만은 DesktopOnly (CLAUDE.md 2단계 반응형 범위).
 */
export default function ProjectsPage() {
  return (
    <DesktopOnly title="My Projects">
      <ProjectsView />
    </DesktopOnly>
  )
}
