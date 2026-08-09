'use client'

import { useState } from 'react'
import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { NumberBadge } from '@/components/ui/NumberBadge'
import { Toast, useToast } from '@/components/ui/Toast'
import { BackLink } from '@/components/request/BackLink'
import { ProgressSteps } from '@/components/request/ProgressSteps'
import { WritingGuide, type GuideItem } from '@/components/request/WritingGuide'
import { FormField, TextareaInput } from '@/components/form/fields'
import { GuideEditIcon, GuidePinIcon, GuideClockIcon } from '@/components/icons/guide'
import { SUBMIT_NOTE, SUBMIT_TOAST } from '@/lib/content/request-form'

/**
 * 요청 폼 ③ 어떤 데이터가 필요한지만 설명할게요 — 원본 :1589-1659
 *
 *   래퍼·그리드·폼 카드·가이드 스펙은 source/upload 와 동일하다.
 *   다른 점
 *     진행 스텝  현재 색 #7C3AED, 텍스트 pill 은 블록 (upload 와 동일)
 *     헤더 배지  violet
 *     본문       textarea 하나 (padding 16 / 13.5px / ink-75 / 1.75 / min-height 200)
 *                + 우측 정렬 카운터 11.5px ink-25 (margin-top 5px)
 *     제출 버튼  #7C3AED 배경 흰 글자, hover #6D28D9
 *     제출 행    margin-top 8px (source/upload 의 24px 와 다르다, :1627)
 *     가이드     3항목, 제목 자간 지정 없음
 *
 * 원본 카운터는 항상 "0 / 1000" 이지만(정적 목업), 실제 입력 길이를 반영한다.
 * maxLength 는 원본에 없으므로 넣지 않는다.
 */
const GUIDE_ITEMS: GuideItem[] = [
  {
    icon: <GuideEditIcon />,
    title: '구체적으로 작성할수록 좋아요',
    desc: '분석 목적, 지역, 기간, 변수 등을 포함하면 더 정확한 제안이 가능합니다.',
  },
  {
    icon: <GuidePinIcon />,
    title: '분석 목적을 알려주세요',
    desc: '어떤 연구나 프로젝트를 수행하려는지 설명해주세요.',
  },
  {
    icon: <GuideClockIcon />,
    title: '시간 범위를 포함해주세요',
    desc: '연도, 기간, 최신성이 중요한지 알려주세요.',
  },
]

/** 원본 placeholder 는 &#10; 으로 3줄이다 (:1623) */
const PLACEHOLDER = [
  '예: 서울시 상권 변화와 유동인구의 관계를 분석하고 싶어요.',
  '예: 미세먼지가 높은 지역의 건강 영향 데이터가 필요해요.',
  '예: 기후변화가 농업 생산성에 미치는 영향을 분석하고 싶어요.',
].join('\n')

const MAX_LEN = 1000

export function DescribeForm() {
  const { message, showToast } = useToast()
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 다음 단계에서 이 자리에 fetch 를 넣는다.
    const payload = { method: 'describe', text, length: text.length }
    console.log('[request/describe] submit', payload)
    showToast(SUBMIT_TOAST)
  }

  return (
    <PageRoot className="bg-bg">
      <Section className="pt-8 pb-18">
        <Container>
          <BackLink href="/request" label="Request" />
          <ProgressSteps activeColor="violet" textPillDisplay="block" />

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_var(--container-sidebar)]">
            <Card radius="card" className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex items-center gap-3">
                  <NumberBadge n={3} color="violet" size={36} />
                  <div>
                    <h2 className="text-20 font-bold tracking-h3 text-ink">
                      어떤 데이터가 필요한지만 설명할게요
                    </h2>
                    <p className="mt-0.75 text-13 text-ink-40">
                      필요한 분석이나 연구 목적을 설명하시면 적합한 데이터와 공간 단위를
                      제안합니다.
                    </p>
                  </div>
                </div>

                <FormField label="요청 내용을 자유롭게 작성해주세요" labelGap={8} className="mb-5">
                  {({ id }) => (
                    <>
                      <TextareaInput
                        id={id}
                        size="lg"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={PLACEHOLDER}
                        aria-describedby={`${id}-count`}
                      />
                      <div
                        id={`${id}-count`}
                        aria-live="polite"
                        className="mt-1.25 text-right text-11-5 text-ink-25"
                      >
                        {text.length} / {MAX_LEN}
                      </div>
                    </>
                  )}
                </FormField>

                {/* 원본 :1627 — 이 폼만 margin-top 8px 이다 */}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {/* 원본 :1628 — padding 12px 28px 이라 md(24px) + px-7 로 조합 */}
                  <Button type="submit" variant="violet" size="md" className="px-7">
                    이 방법으로 요청하기 →
                  </Button>
                  <span className="text-12-5 text-ink-30">{SUBMIT_NOTE}</span>
                </div>
              </form>
            </Card>

            <WritingGuide items={GUIDE_ITEMS} titleTracking="none" />
          </div>
        </Container>
      </Section>

      <Toast message={message} />
    </PageRoot>
  )
}
