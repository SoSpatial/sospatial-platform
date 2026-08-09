import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeatureCard } from '@/components/home/FeatureCard'
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
 * ── 2단계 진행 중 ──
 * 목업 자리는 높이 185px 빈 박스다. 임시 배경·보더를 주지 않는다
 * (차분 계산이 오염되지 않도록).
 * 원본 카드1 의 목업 래퍼에는 height 가 없고 콘텐츠 높이로 결정되므로,
 * 3단계에서 실제 목업을 넣으면 카드1 높이가 달라질 수 있다.
 */
function MockPlaceholder() {
  return <div className="h-[185px] shrink-0" />
}

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
              mock={<MockPlaceholder />}
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
