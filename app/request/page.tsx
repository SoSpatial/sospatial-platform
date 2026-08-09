import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '맞춤 의뢰',
  description: '여러 방법으로 맞춤형 데이터를 요청하실 수 있습니다. 전문 팀이 함께합니다.',
}

/**
 * Request 랜딩 — 이번 범위에 포함되지만 네비 검증 이후 단계에서 구현한다.
 * (reference/08-request-landing.png)
 * 하위 라우트: /request/source, /request/upload, /request/describe
 */
export default function RequestPage() {
  return <ComingSoon title="맞춤 의뢰" />
}
