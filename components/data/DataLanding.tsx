import Form from 'next/form'
import Link from 'next/link'
import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AccentLink } from '@/components/ui/AccentLink'
import { Chip } from '@/components/ui/Chip'
import { IconBadge } from '@/components/ui/IconBadge'
import { GuideSearchIcon } from '@/components/icons/guide'
import { GridIcon, TruckIcon, BarChartIcon, HeartIcon, CloudIcon } from '@/components/icons/api'
import { UsersGroupIcon, ShieldIcon, CityIcon, GlobeIcon } from '@/components/icons/data'
import { PopularDatasets } from '@/components/data/PopularDatasets'
import { POPULAR_KEYWORDS, DATA_CATEGORIES, type DataCategory } from '@/lib/content/data-landing'
import { dataSelectHref } from '@/lib/nav'

/**
 * 데이터 랜딩 — 원본 SoSpatial Platform.dc.html :371-561 (dataIsLanding)
 *
 *   히어로   padding 72px 32px 60px / center / max-width 660 (:374-375)
 *            H1 36px 800 -1.2px mb 10px / 서브 15px ink-40 mb 28px
 *            검색바 :378-384 — surface(#242424), border 1.5px line-10, radius 12,
 *              overflow hidden, mb 18px. 돋보기 17px ink-30 (padding 0 16px),
 *              input 14.5px (padding 16px 0), 검색 버튼 accent 12px 24px 14px 700
 *            인기 검색 :385-391 — 라벨 12.5 ink-30 + searchPill 칩 4개
 *   주제별   padding 52px 32px / #222222 / max-width 1100 (:396-397)
 *            H2 19px 700 mb 24px / repeat(4,1fr) gap 12
 *            전체 카드 :404-416 — grid-column 1/-1, 135deg tint-10→04 그라디언트,
 *              accent-line-20 보더(hover 40), radius 14, padding 20px 24px, gap 20
 *            주제 카드 :418-473 — #2A2A2A, line-07, radius 14, padding 20,
 *              hover 보더 accent-line-30 + 배경 #2E2E2E
 *   인기     padding 52px 32px 80px / #181818 (:479) — 1fr 340px gap 28 그리드의
 *            우측 셀이 비어 있다 (API 히어로 :573 과 같은 재현 대상. 채우지 말 것)
 *
 * 검색 폼: Enter = 검색 버튼과 완전히 동일 (GET /data/select?topic=전체).
 * 검색어 input 은 name 이 없어 원본대로 버려진다 (CLAUDE.md 판단 사례 5).
 *
 * 반응형(원본에 없음): 주제 카드 4 → 2 → 1열, 인기 그리드는 xl 미만 1열
 */
const TOPIC_ICONS: Record<DataCategory['topic'], React.ReactNode> = {
  '인구·사회': <UsersGroupIcon size={18} />,
  '교통·이동': <TruckIcon size={18} />,
  '경제·산업': <BarChartIcon size={18} />,
  '건강·복지': <HeartIcon size={18} />,
  '안전·재난': <ShieldIcon size={18} />,
  '환경·기후': <CloudIcon size={18} />,
  '국토·도시': <CityIcon size={18} />,
  '기타·융합': <GlobeIcon size={18} />,
}

export function DataLanding() {
  return (
    <PageRoot className="bg-bg">
      {/* ── 검색 히어로 :374-393 ── */}
      <Section className="pt-18 pb-15 text-center">
        <Container width="search">
          <h1 className="mb-2.5 text-36 font-extrabold tracking-h1 text-ink">
            어떤 데이터가 필요하세요?
          </h1>
          <p className="mb-7 text-15 text-ink-40">
            1,240개 표준 공간 데이터셋을 검색하거나, 주제별로 둘러보세요.
          </p>

          <Form
            action="/data/select"
            className="mb-4.5 flex overflow-hidden rounded-mock border-[1.5px] border-line-10 bg-surface"
          >
            <input type="hidden" name="topic" value="전체" />
            <div className="flex shrink-0 items-center px-4 text-ink-30">
              <GuideSearchIcon size={17} />
            </div>
            <input
              placeholder="예: 유동인구, 사업체, 미세먼지, 버스 정류장..."
              aria-label="데이터 검색"
              className="min-w-0 flex-1 border-none bg-transparent py-4 text-14-5 text-ink"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer bg-accent px-6 py-3 text-14 font-bold text-accent-ink hover:bg-accent-hover"
            >
              검색
            </button>
          </Form>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-12-5 text-ink-30">인기 검색</span>
            {POPULAR_KEYWORDS.map((k) => (
              /* flex: 원본은 칩 span 이 행의 flex item 이라 블록화돼 세로 패딩이
                 높이에 포함된다(25px). Link 로 감싸면 span 이 인라인으로 남아
                 행이 6px 낮아지므로, Link 를 flex 컨테이너로 만들어 블록화한다. */
              <Link key={k.label} href={dataSelectHref(k.topic)} className="flex">
                <Chip variant="searchPill">{k.label}</Chip>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── 주제별 둘러보기 :396-476 ── */}
      <Section bg="alt" className="py-13">
        <Container>
          <SectionHeading title="주제별 둘러보기" size="sm" className="mb-6" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href={dataSelectHref('전체')}
              className="col-span-full flex items-center gap-5 rounded-panel border border-accent-line-20 bg-linear-135 from-accent-tint-10 to-accent-tint-04 px-6 py-5 hover:border-accent-line-40"
            >
              <IconBadge size={42} radius="btn" tint={15}>
                <GridIcon size={20} />
              </IconBadge>
              <div className="flex-1">
                <div className="mb-0.5 text-15 font-bold text-ink">전체 데이터셋</div>
                <div className="text-12-5 text-ink-40">
                  모든 주제의 1,240개 데이터셋을 한번에 둘러보세요
                </div>
              </div>
              <AccentLink label="전체 보기" size="sm" className="shrink-0" />
            </Link>

            {DATA_CATEGORIES.map((c) => (
              <Link
                key={c.topic}
                href={dataSelectHref(c.topic)}
                className="rounded-panel border border-line-07 bg-surface-raised p-5 hover:border-accent-line-30 hover:bg-surface-hover"
              >
                <IconBadge size={38} radius="btn" tint={10} className="mb-3">
                  {TOPIC_ICONS[c.topic]}
                </IconBadge>
                <div className="mb-0.75 text-14 font-semibold text-ink">{c.topic}</div>
                <div className="text-11-5 text-ink-30">{c.count}개 데이터셋</div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── 지금 인기 있는 데이터 :479-559 ── */}
      <Section className="pt-13 pb-20">
        <Container>
          <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[1fr_340px]">
            <PopularDatasets />
          </div>
        </Container>
      </Section>
    </PageRoot>
  )
}
