import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '데이터 소스를 알고 있어요',
  description:
    '원하는 데이터의 출처나 웹사이트 URL을 알려주시면 수집·정제·공간 정합을 함께 합니다.',
}

/** 다음 단계에서 구현한다 (reference/09-request-source.png). */
export default function RequestSourcePage() {
  return <ComingSoon title="데이터 소스를 알고 있어요" />
}
