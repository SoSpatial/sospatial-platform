import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import type { LegalDoc, LegalSection } from '@/lib/content/legal'

/**
 * 법적 문서 공용 레이아웃 — 3단계 신규 화면 (원본에 없음, reference 검증 제외).
 * 긴 문서용 선례가 없어 기존 프리미티브·토큰만으로 단순 구성한다:
 *   Container narrow(680) / h1 28·extrabold·tracking-h2 (My Projects 헤더와 동일 계층)
 *   섹션 제목 16/700, 본문 13.5/ink-70/leading-1-75 (describe textarea 본문 계층 재사용)
 */
function SectionBlock({ section }: { section: LegalSection }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-16 font-bold text-ink">{section.heading}</h2>
      {section.body.map((item, i) =>
        typeof item === 'string' ? (
          <p key={i} className="mb-3 text-13-5 leading-1-75 text-ink-70">
            {item}
          </p>
        ) : (
          <ul key={i} className="mb-3 list-disc space-y-1.5 pl-5">
            {item.list.map((li) => (
              <li key={li} className="text-13-5 leading-1-75 text-ink-70">
                {li}
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <PageRoot className="bg-bg">
      <Section className="pt-12 pb-24">
        <Container width="narrow">
          <h1 className="mb-1.5 text-28 font-extrabold tracking-h2 text-ink">{doc.title}</h1>
          <p className="text-12-5 text-ink-35">{doc.effective}</p>
          <p className="mt-6 text-13-5 leading-1-75 text-ink-70">{doc.intro}</p>
          {doc.sections.map((s) => (
            <SectionBlock key={s.heading} section={s} />
          ))}
        </Container>
      </Section>
    </PageRoot>
  )
}
