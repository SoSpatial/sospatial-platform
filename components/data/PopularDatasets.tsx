'use client'

import { useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { POPULAR_DATASETS, POPULAR_COLLAPSED_COUNT } from '@/lib/content/data-landing'
import { cn } from '@/lib/cn'

/**
 * 지금 인기 있는 데이터 랭킹 — 원본 :483-554
 *
 *   헤더   H2 19px 700 + 토글 13.5px 500 액센트, mb 18px (:483-486)
 *          토글 라벨은 리터럴 텍스트 '전체 →' / '접기 ↑' (:2334) — AccentLink(600, SVG
 *          화살표)와 다르다. 통일하지 말 것.
 *   행     padding 15px 0 / border-bottom line-06 (8행째만 없음 :545 — 접힌 상태의
 *          4행째는 보더가 있다 :512)
 *          순위 16px 700 ink-18 width 32 / 제목 14.5px 600 mb 3px / 메타 12px ink-35
 *          hover: padding-left 8px + transition:padding 0.15s — transition 이
 *          style-hover 안에 있다. 진입만 애니메이션, 이탈은 즉시 복귀
 *          (CLAUDE.md 판단 사례 6 — 원본에 명시된 transition 의 재현).
 *   받기   6px 16px / fill-06 + line-10 / radius 7 / 13px ink-65, hover fill-10 (:494)
 *          onClick 없음 — 원본에서도 장식이다. Button size 증식을 막기 위해 page-local.
 *   토글   showAllPopular (:2333-2335) — 4행 ↔ 8행
 */
export function PopularDatasets() {
  const [showAll, setShowAll] = useState(false)
  const rows = showAll ? POPULAR_DATASETS : POPULAR_DATASETS.slice(0, POPULAR_COLLAPSED_COUNT)

  return (
    <div>
      <div className="mb-4.5 flex items-center justify-between">
        <SectionHeading title="지금 인기 있는 데이터" size="sm" />
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="cursor-pointer text-13-5 font-medium text-accent"
        >
          {showAll ? '접기 ↑' : '전체 →'}
        </button>
      </div>

      <div className="flex flex-col">
        {rows.map((d, i) => (
          <div
            key={d.name}
            className={cn(
              'flex cursor-pointer items-center py-3.75 hover:pl-2 hover:transition-[padding] hover:duration-150',
              i !== POPULAR_DATASETS.length - 1 && 'border-b border-line-06'
            )}
          >
            <span className="w-8 shrink-0 text-16 font-bold text-ink-18">{i + 1}</span>
            <div className="flex-1">
              <div className="mb-0.75 text-14-5 font-semibold text-ink">{d.name}</div>
              <div className="text-12 text-ink-35">{d.meta}</div>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-input border border-line-10 bg-fill-06 px-4 py-1.5 text-13 text-ink-65 hover:bg-fill-10"
            >
              받기
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
