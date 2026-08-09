import type { Metadata } from 'next'
import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ApiFeatureItem } from '@/components/api/ApiFeatureItem'
import { ApiCard } from '@/components/api/ApiCard'
import { CodeIcon } from '@/components/icons/api'
import { API_FEATURES, API_CARDS } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'API',
  description: '표준화된 공간 데이터를 API로 제공하여 연구, 분석, 제품 개발을 더 빠르고 쉽게.',
}

/**
 * API 페이지 — 원본 SoSpatial Platform.dc.html :566-784
 * 검증 기준: reference/07-api.png
 */
export default function ApiPage() {
  return (
    <PageRoot className="min-h-[calc(100vh-var(--spacing-nav))] bg-bg">
      {/* ── 히어로 (:571-589) ── */}
      <Section className="pt-18 pb-15">
        <Container>
          {/*
            원본은 `grid-template-columns: 1fr 340px; gap: 48px` 인데
            우측 셀에 아무 내용이 없다. 좌측 콘텐츠 폭을 결정하는 요소이므로
            그대로 재현한다. 임의로 채우거나 그리드를 없애지 않는다.
            (CLAUDE.md "원본과 달라지는 부분" #10)
          */}
          <div className="grid items-center gap-12 xl:grid-cols-[1fr_var(--container-aside)]">
            <div>
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-inset border border-chart-blue-line-18 bg-chart-blue-tint-10 px-3 py-1 text-steel">
                <CodeIcon size={11} />
                <span className="text-11 font-semibold">개발자용</span>
              </div>

              <h1 className="mb-4 text-44 font-extrabold leading-1-15 tracking-h1-api text-ink">
                Spatial APIs for
                <br />
                <span className="text-accent">AI &amp; Analytics</span>
              </h1>

              <p className="mb-8 text-15-5 leading-1-75 text-ink-45">
                표준화된 공간 데이터를 API로 제공하여
                <br />
                연구, 분석, 제품 개발을 더 빠르고 쉽게.
              </p>

              <div className="flex gap-3">
                <Button variant="accent" size="md">
                  API 키 발급
                </Button>
                <Button variant="ghostSoft" size="md">
                  문서 보기
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 특징 밴드 (:592-633) ── */}
      <Section bg="alt" className="border-y border-line-05 py-10">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {API_FEATURES.map((f) => (
              <ApiFeatureItem key={f.title} {...f} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ── 전체 API (:636-781) ── */}
      <Section className="pt-14 pb-20">
        <Container>
          <SectionHeading title="전체 API" className="mb-6" />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {API_CARDS.map((c) => (
              <ApiCard key={c.name} {...c} />
            ))}
          </div>
        </Container>
      </Section>
    </PageRoot>
  )
}
