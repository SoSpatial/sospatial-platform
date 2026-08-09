import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  title: '데이터를 가지고 있어요',
  description: '보유 중인 데이터를 업로드하면 공간 단위 정합 및 분석 가능한 형태로 가공합니다.',
}

/** 다음 단계에서 구현한다 (reference/10-request-upload.png). */
export default function RequestUploadPage() {
  return <ComingSoon title="데이터를 가지고 있어요" />
}
