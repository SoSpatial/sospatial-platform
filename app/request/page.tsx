import type { Metadata } from 'next'
import { RequestLanding } from '@/components/request/RequestLanding'

export const metadata: Metadata = {
  title: '맞춤 의뢰',
  description: '여러 방법으로 맞춤형 데이터를 요청하실 수 있습니다. 전문 팀이 함께합니다.',
}

/**
 * Request 랜딩 — 원본 SoSpatial Platform.dc.html :1161-1279
 * 검증 기준: reference/08-request-landing.png
 *
 * 하위 라우트 (CLAUDE.md 결정 2번 — 실제 라우트로 분리)
 *   /request/source   reference/09-request-source.png
 *   /request/upload   reference/10-request-upload.png
 *   /request/describe reference/11-request-describe.png
 */
export default function RequestPage() {
  return <RequestLanding />
}
