import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { AccentLink } from '@/components/ui/AccentLink'

/**
 * 홈 피처 카드 셸 — 원본 :121-153 (카드1) / :156-179 (카드2) / :182-212 (카드3)
 *
 *   카드   #181818 / 1px line-07 / radius 20px / overflow hidden / flex column
 *   본문   padding 24px 28px 28px / flex 1 / flex column
 *   제목   17px / 700 / #fff / margin-bottom 8px / letter-spacing -0.3px
 *   설명   13.5px / ink-45 / line-height 1.7 / margin-bottom 18px / flex 1
 *   칩행   gap 6px / flex-wrap / margin-bottom 18px
 *   링크행 gap 16px, 링크가 2개면 사이에 1x14 rgba(255,255,255,0.1) 구분선
 *
 * 목업 헤더는 카드마다 구조가 달라 mock 으로 통째로 주입받는다.
 *   카드1 padding 28px 28px 0 / height 없음(콘텐츠 높이)
 *   카드2 height 185px / position relative / overflow hidden
 *   카드3 padding 28px 28px 0 / position relative / height 185px
 */
export type FeatureLink = { label: string; href: string }

export function FeatureCard({
  mock,
  title,
  desc,
  chips,
  links,
}: {
  mock: React.ReactNode
  title: string
  desc: string
  chips: string[]
  links: FeatureLink[]
}) {
  return (
    <Card tone="bg" radius="cardLg" className="flex flex-col overflow-hidden">
      {mock}

      <div className="flex flex-1 flex-col px-7 pt-6 pb-7">
        <h3 className="mb-2 text-17 font-bold tracking-card text-ink">{title}</h3>
        <p className="mb-4.5 flex-1 text-13-5 leading-1-7 text-ink-45">{desc}</p>

        <div className="mb-4.5 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {links.map((l, i) => (
            <div key={l.href + l.label} className="flex items-center gap-4">
              {i > 0 && <div className="h-3.5 w-px bg-line-10" />}
              <AccentLink label={l.label} href={l.href} size="md" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
