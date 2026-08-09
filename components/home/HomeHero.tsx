import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { HeroStats, type Stat } from '@/components/home/HeroStats'

/**
 * 홈 히어로 — 원본 SoSpatial Platform.dc.html :68-107
 *
 *   섹션    padding 100px 32px 84px / text-align center / #181818
 *   컨테이너 max-width 680px
 *   배지    inline-flex / gap 7px / padding 6px 16px / 1px line-10 / fill-05
 *           radius 99px / margin-bottom 32px, 도트 6px #C4A882
 *           텍스트 12.5px / 500 / ink-50 / letter-spacing 0.2px
 *   H1      52px / 900 / 1.18 / -2.5px / margin-bottom 22px, 2번째 줄 액센트
 *   본문    16.5px / ink-42 / 1.8 / margin-bottom 40px, strong 은 ink-72 / 600
 *   버튼행  flex / center / gap 10px / margin-bottom 56px
 *   통계    HeroStats
 *
 * 반응형(원본에 없음): 375px 에서 H1 을 52 → 36px 로, 버튼을 세로로 쌓는다.
 */
const STATS: Stat[] = [
  { value: '1,240+', label: '데이터셋' },
  { value: '48종', label: '데이터 소스' },
  { value: '98%', label: '재의뢰율' },
]

export function HomeHero() {
  return (
    <Section className="pt-25 pb-21 text-center">
      <Container width="narrow">
        <div className="mb-8 inline-flex items-center gap-1.75 rounded-pill border border-line-10 bg-fill-05 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-12-5 font-medium tracking-badge text-ink-50">
            AI-Ready 공간 데이터 플랫폼
          </span>
        </div>

        <h1 className="mb-5.5 text-36 font-black leading-1-18 tracking-h1 text-ink sm:text-52 sm:tracking-hero">
          흩어진 공간 데이터를
          <br />
          <span className="text-accent">바로 쓸 수 있게.</span>
        </h1>

        <p className="mb-10 text-16-5 font-normal leading-1-8 text-ink-42">
          데이터를 찾고, AI로 분석하고, 전문가와 함께 활용하세요.
          <br />
          공간 인사이트의{' '}
          <strong className="font-semibold text-ink-72">처음부터 끝까지</strong> 한 곳에서.
        </p>

        <div className="mb-14 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Button variant="white" size="lg" href="/data">
            데이터 둘러보기
          </Button>
          <Button variant="ghostBold" size="lg" href="/maps">
            AI에게 물어보기
          </Button>
        </div>

        <HeroStats items={STATS} />
      </Container>
    </Section>
  )
}
