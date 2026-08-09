import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '어떤 데이터가 필요한지만 설명할게요',
  description: '필요한 분석이나 연구 목적을 설명하시면 적합한 데이터와 공간 단위를 제안합니다.',
}

/** 다음 단계에서 구현한다 (reference/11-request-describe.png). */
export default function RequestDescribePage() {
  return <ComingSoon title="어떤 데이터가 필요한지만 설명할게요" />
}
