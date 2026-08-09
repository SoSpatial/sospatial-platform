import type { Metadata } from 'next'
import { UploadForm } from '@/components/request/UploadForm'

export const metadata: Metadata = {
  title: '데이터를 가지고 있어요',
  description: '보유 중인 데이터를 업로드하면 공간 단위 정합 및 분석 가능한 형태로 가공합니다.',
}

/**
 * 요청 폼 ② — 원본 SoSpatial Platform.dc.html :1457-1586
 * 검증 기준: reference/10-request-upload.png
 *   ※ reference 는 파일 선택 완료 상태(유동인구_서울_2024.csv)로 캡처돼 있다.
 */
export default function RequestUploadPage() {
  return <UploadForm />
}
