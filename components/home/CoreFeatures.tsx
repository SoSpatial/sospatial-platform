import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeatureCard } from '@/components/home/FeatureCard'
import { DataSearchMock } from '@/components/home/DataSearchMock'
import { ReportMock } from '@/components/home/ReportMock'
import { MapAnalysisMock } from '@/components/home/MapAnalysisMock'
import { FEATURE_CARDS } from '@/lib/content/home'

/**
 * CORE FEATURES 밴드 — 원본 :110-216
 *
 *   섹션    padding 80px 32px 100px / #222222
 *   헤딩    eyebrow 11px 700 자간 3px 액센트 uppercase, margin-bottom 12px
 *           H2 28px 800 -0.8px, 블록 margin-bottom 48px, 가운데 정렬
 *   그리드  1fr 1fr 1fr / gap 20px
 *
 * 반응형(원본에 없음): 3 → 2 → 1열 (CLAUDE.md [반응형])
 *
 * 목업은 카드마다 래퍼 구조가 달라 각 목업 컴포넌트가 자기 래퍼를 소유한다.
 *   카드1 DataSearchMock   padding 28px 28px 0, height 선언 없음(콘텐츠 높이)
 *                          → 이 카드가 그리드 행 높이를 정한다
 *   카드2 MapAnalysisMock  height 185px + relative + overflow hidden, 패딩 없음
 *   카드3 ReportMock       padding 28px 28px 0 + relative + height 185px
 */
export function CoreFeatures() {
  return (
    <Section bg="alt" className="pt-20 pb-25">
      <Container>
        <SectionHeading
          eyebrow="CORE FEATURES"
          title="필요한 곳에서 바로 시작하세요"
          size="lg"
          align="center"
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURE_CARDS.map((c) => (
            <FeatureCard
              key={c.key}
              mock={
                c.key === 'data' ? (
                  <DataSearchMock />
                ) : c.key === 'maps' ? (
                  <MapAnalysisMock />
                ) : (
                  <ReportMock />
                )
              }
              title={c.title}
              desc={c.desc}
              chips={c.chips}
              links={c.links}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
