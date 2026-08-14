import type { Metadata } from 'next'
import { DataLanding } from '@/components/data/DataLanding'

export const metadata: Metadata = {
  title: '데이터',
  description: '1,240개 표준 공간 데이터셋을 검색하거나, 주제별로 둘러보세요.',
}

/**
 * 데이터 랜딩 — 원본 SoSpatial Platform.dc.html :371-561 (dataIsLanding)
 * 검증 기준: reference/02-data-landing.png
 *
 * select 뷰는 /data/select?topic=한글키 실제 라우트로 분리
 * (CLAUDE.md "프로토타입 제약 vs 디자인 의도" 사례 4)
 */
export default function DataPage() {
  return <DataLanding />
}
