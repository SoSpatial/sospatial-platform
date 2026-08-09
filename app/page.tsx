import { PageRoot } from '@/components/layout/PageRoot'
import { HomeHero } from '@/components/home/HomeHero'

/**
 * 홈 — 원본 SoSpatial Platform.dc.html :64-219
 * 검증 기준: reference/01-home.png
 *
 * 단계별 구현 중:
 *   1) 히어로 + 통계        ← 현재
 *   2) CORE FEATURES 밴드 + 카드 셸 (목업은 185px 빈 박스)
 *   3) 목업 3종 (DataSearchMock → ReportMock → MapAnalysisMock)
 */
export default function HomePage() {
  return (
    <PageRoot>
      <HomeHero />
    </PageRoot>
  )
}
