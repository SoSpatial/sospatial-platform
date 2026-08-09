import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'SoSpatial 개인정보처리방침.',
}

/** 푸터 링크 대상. 404 방지를 위한 플레이스홀더. */
export default function PrivacyPage() {
  return <ComingSoon title="개인정보처리방침" />
}
