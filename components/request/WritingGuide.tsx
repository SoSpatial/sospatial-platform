import { AccentLink } from '@/components/ui/AccentLink'
import { Card } from '@/components/ui/Card'

/**
 * 작성 가이드 사이드바 — 원본 :1422-1450 (source) / :1561-1582 (upload) / :1634-1655 (describe)
 * 3개 폼에서 구조는 같고 항목 문구만 다르므로 items[] 로 받는다.
 *
 *   카드   #242424 / 1px line-07 / radius 14px / padding 22px / position sticky top 80px
 *   제목   14px 700 -0.2px / margin-bottom 16px
 *   항목   flex / align-items flex-start / gap 9px, 목록 gap 11px / margin-bottom 18px
 *     아이콘 14px stroke 2 액센트, flex-shrink 0, margin-top 1px
 *     제목   12px 600 ink-70 / margin-bottom 2px
 *     설명   11.5px ink-35 / line-height 1.5
 *   안내박스 accent-tint-08 / 1px accent-line-15 / radius 9px / padding 14px
 *     제목 12.5px 600 액센트 / margin-bottom 6px
 *     본문 12px ink-40 / line-height 1.55 / margin-bottom 8px
 *     링크 12.5px 600 액센트 + 11px 화살표
 *
 * 반응형(sticky 해제 + 1열 낙하)은 7번 반응형 작업에서 처리한다.
 */
export type GuideItem = { icon: React.ReactNode; title: string; desc: string }

export function WritingGuide({ items }: { items: GuideItem[] }) {
  return (
    <Card radius="panel" className="sticky top-20 p-5.5">
      <h3 className="mb-4 text-14 font-bold tracking-cta text-ink">작성 가이드</h3>

      <div className="mb-4.5 flex flex-col gap-2.75">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-2.25">
            <span className="mt-px shrink-0 text-accent">{it.icon}</span>
            <div>
              <div className="mb-0.5 text-12 font-semibold text-ink-70">{it.title}</div>
              <div className="text-11-5 leading-1-5 text-ink-35">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-field border border-accent-line-15 bg-accent-tint-08 p-3.5">
        <div className="mb-1.5 text-12-5 font-semibold text-accent">잘 모르겠어도 괜찮아요</div>
        <div className="mb-2 text-12 leading-1-55 text-ink-40">
          잘 모르겠으면 그냥 말씀해 주세요. 전문가가 도와드립니다.
        </div>
        <AccentLink label="무료 상담 신청" size="xs" />
      </div>
    </Card>
  )
}
