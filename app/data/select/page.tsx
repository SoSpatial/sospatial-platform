import type { Metadata } from 'next'
import { ComingSoon } from '@/components/ui/ComingSoon'

export const metadata: Metadata = {
  // 쿼리 의존 작업 화면 — 구현 후에도 noindex 유지·sitemap 미포함 (CLAUDE.md 색인 정책)
  robots: { index: false, follow: true },
  title: '데이터 선택',
  description: '분석에 필요한 데이터를 선택하고 프로젝트로 저장해 보세요.',
}

/**
 * 데이터 선택 뷰 (원본 :226-368) — 다음 작업에서 구현한다.
 * 랜딩의 진입 링크(검색/칩/카드)가 404 가 되지 않도록 두는 임시 플레이스홀더.
 * 진입 topic 은 ?topic= 쿼리로 받는다 (원본 goDataSelect :2320 의 data-topic 페이로드).
 */
export default function DataSelectPage() {
  return <ComingSoon title="데이터 선택" />
}
