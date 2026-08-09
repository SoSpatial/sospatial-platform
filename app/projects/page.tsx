import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  // 내용이 없는 플레이스홀더라 색인에서 제외한다 (sitemap 에도 넣지 않는다)
  robots: { index: false, follow: true },
  title: '내 프로젝트',
  description: '저장한 프로젝트를 관리하고 필요한 분석을 이어가세요.',
}

/** CLAUDE.md 범위: 라우트와 네비 링크만. 내부 로직은 구현하지 않는다. */
export default function ProjectsPage() {
  return <ComingSoon title="내 프로젝트" />
}
