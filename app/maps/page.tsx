import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  // 내용이 없는 플레이스홀더라 색인에서 제외한다 (sitemap 에도 넣지 않는다)
  robots: { index: false, follow: true },
  title: '지도·시각화',
  description: '지도 위에서 데이터를 시각화하고, 대화형 AI로 공간 패턴을 분석합니다.',
}

/** CLAUDE.md 범위: 라우트와 네비 링크만. 내부 로직은 구현하지 않는다. */
export default function MapsPage() {
  return <ComingSoon title="지도·시각화" />
}
