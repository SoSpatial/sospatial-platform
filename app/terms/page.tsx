import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  // 내용이 없는 플레이스홀더라 색인에서 제외한다 (sitemap 에도 넣지 않는다)
  robots: { index: false, follow: true },
  title: '이용약관',
  description: 'SoSpatial 서비스 이용약관.',
}

/** 푸터 링크 대상. 404 방지를 위한 플레이스홀더. */
export default function TermsPage() {
  return <ComingSoon title="이용약관" />
}
