import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'SoSpatial 서비스 이용약관.',
}

/** 푸터 링크 대상. 404 방지를 위한 플레이스홀더. */
export default function TermsPage() {
  return <ComingSoon title="이용약관" />
}
