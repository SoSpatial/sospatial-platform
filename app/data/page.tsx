import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '데이터',
  description: '표준 공간 데이터셋을 검색하고 주제별로 둘러보세요.',
}

/** CLAUDE.md 범위: 라우트와 네비 링크만. 내부 로직은 구현하지 않는다. */
export default function DataPage() {
  return <ComingSoon title="데이터" />
}
