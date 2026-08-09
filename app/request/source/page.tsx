import type { Metadata } from 'next'
import { SourceForm } from '@/components/request/SourceForm'

export const metadata: Metadata = {
  title: '데이터 소스를 알고 있어요',
  description:
    '원하는 데이터의 출처나 웹사이트 URL을 알려주시면 수집·정제·공간 정합을 함께 합니다.',
}

/**
 * 요청 폼 ① — 원본 SoSpatial Platform.dc.html :1282-1454
 * 검증 기준: reference/09-request-source.png
 */
export default function RequestSourcePage() {
  return <SourceForm />
}
