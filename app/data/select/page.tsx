import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DesktopOnly } from '@/components/ui/DesktopOnly'
import { DataSelect } from '@/components/data/DataSelect'

export const metadata: Metadata = {
  // 쿼리 의존 작업 화면 — 구현 후에도 noindex 유지·sitemap 미포함 (CLAUDE.md 색인 정책)
  robots: { index: false, follow: true },
  title: '데이터 선택',
  description: '분석에 필요한 데이터를 선택하고 프로젝트로 저장해 보세요.',
}

/**
 * 데이터 선택 뷰 — 원본 :226-368 (dataIsSelect)
 * 검증 기준: reference/03-data-select.png
 *
 * 진입 topic 은 ?topic=한글키 쿼리 (원본 goDataSelect :2320 의 data-topic 페이로드,
 * CLAUDE.md 판단 사례 4). useSearchParams 를 쓰므로 Suspense 로 감싸 정적 프리렌더 유지.
 * md 미만은 DesktopOnly 안내 (CLAUDE.md 2단계 반응형 범위).
 */
export default function DataSelectPage() {
  return (
    <DesktopOnly title="데이터 선택">
      <Suspense>
        <DataSelect />
      </Suspense>
    </DesktopOnly>
  )
}
