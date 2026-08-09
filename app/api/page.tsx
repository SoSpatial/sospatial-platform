import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: 'API',
  description: '표준화된 공간 데이터를 API로 제공하여 연구, 분석, 제품 개발을 더 빠르고 쉽게.',
}

/**
 * API — 이번 범위에 포함되지만 네비 검증 이후 단계에서 구현한다.
 * (reference/07-api.png)
 */
export default function ApiPage() {
  return <ComingSoon title="API" />
}
