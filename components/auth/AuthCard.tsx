import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'

/**
 * 로그인·회원가입 공용 셸 — 3단계 신규 화면 (원본에 없음, reference 검증 제외).
 * 기존 디자인 시스템만 사용한다:
 *   폭 420 = --container-modal (저장·공유 모달과 동일)
 *   카드 = Card radius card p-8 (Request 폼 카드와 동일)
 *   제목 = text-20/bold/tracking-h3, 부제 = text-13 ink-40 (Request 폼 헤더와 동일)
 */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <PageRoot className="bg-bg">
      <Section className="pt-14 pb-24">
        <Container>
          <div className="mx-auto max-w-modal">
            <Card radius="card" className="p-8">
              <h1 className="text-20 font-bold tracking-h3 text-ink">{title}</h1>
              <p className="mt-0.75 mb-6 text-13 text-ink-40">{subtitle}</p>
              {children}
            </Card>
          </div>
        </Container>
      </Section>
    </PageRoot>
  )
}
