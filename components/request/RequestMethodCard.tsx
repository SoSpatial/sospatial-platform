import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { NumberBadge } from '@/components/ui/NumberBadge'
import { AccentLink } from '@/components/ui/AccentLink'

/**
 * 요청 방식 카드 — 원본 :1176-1232 (3장 모두 같은 구조)
 *
 *   카드   #242424 / 1px line-07 / radius 16px / padding 28px / flex column / cursor pointer
 *          hover  border-color rgba(196,168,130,0.3) + box-shadow 0 8px 28px rgba(0,0,0,0.35)
 *   헤더   flex / gap 12px / margin-bottom 16px
 *          36px 원형 배지(방식별 색) + 15.5px 700 -0.2px 제목
 *   설명   13px / ink-42 / line-height 1.65 / margin-bottom 16px / flex 1
 *   미리보기  카드마다 구조가 달라 preview 로 주입받는다
 *   칩     gap 5px / flex-wrap / margin-bottom 20px / tagOutline
 *   링크   "이 방법으로 요청하기 →" 13.5px 600 액센트 (AccentLink size sm)
 *
 * 색은 props 로 받는다. 1번 방식 값을 하드코딩하지 않는다.
 */
export type RequestMethodColor = 'blue' | 'emerald' | 'violet'

export function RequestMethodCard({
  n,
  color,
  title,
  desc,
  preview,
  chips,
  href,
}: {
  n: number
  color: RequestMethodColor
  title: string
  desc: string
  preview: React.ReactNode
  chips: string[]
  href: string
}) {
  return (
    <Card
      radius="card"
      interactive
      className="flex flex-col p-7 hover:shadow-[0_8px_28px_var(--color-scrim-35)]"
    >
      <Link href={href} className="flex flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3">
          <NumberBadge n={n} color={color} size={36} />
          <h3 className="text-15-5 font-bold tracking-cta text-ink">{title}</h3>
        </div>

        <p className="mb-4 flex-1 text-13 leading-1-65 text-ink-42">{desc}</p>

        {preview}

        <div className="mb-5 flex flex-wrap gap-1.25">
          {chips.map((c) => (
            <Chip key={c} variant="tagOutline">
              {c}
            </Chip>
          ))}
        </div>

        <AccentLink label="이 방법으로 요청하기" size="sm" />
      </Link>
    </Card>
  )
}
