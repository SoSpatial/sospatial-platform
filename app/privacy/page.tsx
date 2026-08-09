import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  // 내용이 없는 플레이스홀더라 색인에서 제외한다 (sitemap 에도 넣지 않는다)
  robots: { index: false, follow: true },
  title: '개인정보처리방침',
  description: 'SoSpatial 개인정보처리방침.',
}

/** 푸터 링크 대상. 404 방지를 위한 플레이스홀더. */
export default function PrivacyPage() {
  return <ComingSoon title="개인정보처리방침" />
}
