import type { Metadata } from 'next'
import { DescribeForm } from '@/components/request/DescribeForm'

export const metadata: Metadata = {
  title: '어떤 데이터가 필요한지만 설명할게요',
  description: '필요한 분석이나 연구 목적을 설명하시면 적합한 데이터와 공간 단위를 제안합니다.',
}

/**
 * 요청 폼 ③ — 원본 SoSpatial Platform.dc.html :1589-1659
 * 검증 기준: reference/11-request-describe.png
 */
export default function RequestDescribePage() {
  return <DescribeForm />
}
