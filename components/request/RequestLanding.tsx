import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { RequestMethodCard } from '@/components/request/RequestMethodCard'
import { ProcessSteps } from '@/components/request/ProcessSteps'
import { SourcePreview, UploadPreview, DescribePreview } from '@/components/request/previews'
import { REQUEST_METHODS, PROCESS_STEPS } from '@/lib/content/request'

/**
 * Request 랜딩 — 원본 SoSpatial Platform.dc.html :1161-1279
 *
 *   히어로   padding 72px 32px 56px / center / max-width 680px
 *            배지 4px 12px / accent-tint-10 / 1px accent-line-18 / radius 6px / mb 18px
 *                 11.5px 600 액센트
 *            H1  38px 800 -1.2px / line-height 1.2 / mb 14px, 2번째 줄 액센트
 *            본문 15px ink-40 line-height 1.75
 *   카드     padding 0 32px 64px / max-width 1100 / repeat(3,1fr) gap 18px
 *   절차     padding 0 32px 72px / #222222, 내부 padding-top 48px
 *            H2 17px 700 -0.3px mb 28px
 *
 * 반응형(원본에 없음): 카드 3 → 2 → 1열
 */
const PREVIEWS = {
  source: <SourcePreview />,
  upload: <UploadPreview />,
  describe: <DescribePreview />,
} as const

export function RequestLanding() {
  return (
    <PageRoot className="bg-bg">
      <Section className="pt-18 pb-14 text-center">
        <Container width="narrow">
          <div className="mb-4.5 inline-flex rounded-inset border border-accent-line-18 bg-accent-tint-10 px-3 py-1">
            <span className="text-11-5 font-semibold text-accent">Custom Data Request</span>
          </div>

          <h1 className="mb-3.5 text-38 font-extrabold leading-1-2 tracking-h1 text-ink">
            어떤 방식으로 데이터를
            <br />
            <span className="text-accent">요청하시겠어요?</span>
          </h1>

          <p className="text-15 leading-1-75 text-ink-40">
            여러 방법으로 맞춤형 데이터를 요청하실 수 있습니다. 최적의 데이터를 제공하기 위해 전문
            팀이 함께합니다.
          </p>
        </Container>
      </Section>

      <Section className="pb-16">
        <Container>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 xl:grid-cols-3">
            {REQUEST_METHODS.map((m) => (
              <RequestMethodCard
                key={m.key}
                n={m.n}
                color={m.color}
                title={m.title}
                desc={m.desc}
                preview={PREVIEWS[m.key]}
                chips={m.chips}
                href={m.href}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section bg="alt" className="pb-18">
        <Container className="pt-12">
          <h2 className="mb-7 text-17 font-bold tracking-card text-ink">요청 후 진행 절차</h2>
          <ProcessSteps steps={PROCESS_STEPS} activeIndex={0} />
        </Container>
      </Section>
    </PageRoot>
  )
}
