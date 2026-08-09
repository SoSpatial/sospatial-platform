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
import { FormField, TextInput, SelectInput, TextareaInput, RadioGroup } from '@/components/form/fields'
import { VariableInputList } from '@/components/form/VariableInputList'
import {
  GuideSearchIcon,
  GuidePinIcon,
  GuideGridIcon,
  GuideClockIcon,
} from '@/components/icons/guide'
import {
  REGIONS,
  SUB_REGIONS,
  SPATIAL_UNITS,
  YEARS_FROM,
  YEARS_TO,
  OUTPUT_FORMATS,
  SUBMIT_NOTE,
  SUBMIT_TOAST,
} from '@/lib/content/request-form'

/**
 * 요청 폼 ① 데이터 소스를 알고 있어요 — 원본 :1282-1454
 *
 *   래퍼   padding 32px 32px 72px / max-width 1100
 *   그리드 1fr 280px / gap 24px / align-items start
 *   폼카드 #242424 / 1px line-07 / radius 16px / padding 32px
 *   헤더   36px 배지(blue) + 20px 700 -0.4px 제목 + 13px ink-40 설명(margin-top 3px)
 *   1행    3열 gap 16 / margin-bottom 16
 *   2행    2열 gap 16 / margin-bottom 16
 *   출력형식 margin-bottom 16
 *   추가요청 margin-bottom 24
 *   제출   flex gap 12 — accent 버튼 padding 12px 28px + 12.5px ink-30 안내
 *
 * 반응형은 7번 작업에서 처리한다. 지금은 데스크톱 고정.
 */
const GUIDE_ITEMS: GuideItem[] = [
  {
    icon: <GuideSearchIcon />,
    title: 'Dataset',
    desc: '데이터 형식, 변수, 기간, 연도 목록을 구체적으로 입력하세요.',
  },
  { icon: <GuidePinIcon />, title: 'Region', desc: '분석이 필요한 지역 범위를 선택하세요.' },
  { icon: <GuideGridIcon />, title: 'Spatial Unit', desc: '분석에 사용할 공간 단위를 선택하세요.' },
  { icon: <GuideClockIcon />, title: 'Time Range', desc: '데이터가 필요한 기간 범위를 선택하세요.' },
]

export function SourceForm() {
  const { message, showToast } = useToast()

  const [dataset, setDataset] = useState('')
  const [region, setRegion] = useState<string>(REGIONS[0])
  const [subRegion, setSubRegion] = useState('')
  const [spatialUnit, setSpatialUnit] = useState<string>(SPATIAL_UNITS[0])
  const [yearFrom, setYearFrom] = useState<string>(YEARS_FROM[0])
  const [yearTo, setYearTo] = useState<string>(YEARS_TO[0])
  const [variables, setVariables] = useState<string[]>(['', ''])
  const [format, setFormat] = useState<string>(OUTPUT_FORMATS[0])
  const [notes, setNotes] = useState('')

  const subRegionOptions = SUB_REGIONS[region] ?? []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 다음 단계에서 이 자리에 fetch 를 넣는다. 토스트는 성공 경로에 그대로 둔다.
    const payload = {
      method: 'source',
      dataset,
      region,
      subRegion: subRegionOptions.length ? subRegion || subRegionOptions[0] : null,
      spatialUnit,
      yearFrom,
      yearTo,
      variables: variables.filter((v) => v.trim()),
      format,
      notes,
    }
    console.log('[request/source] submit', payload)
    showToast(SUBMIT_TOAST)
  }

  return (
    <PageRoot className="bg-bg">
      <Section className="pt-8 pb-18">
        <Container>
          <BackLink href="/request" label="Request" />
          <ProgressSteps activeColor="blue" />

          <div className="grid grid-cols-[1fr_var(--container-sidebar)] items-start gap-6">
            <Card radius="card" className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex items-center gap-3">
                  <NumberBadge n={1} color="blue" size={36} />
                  <div>
                    <h2 className="text-20 font-bold tracking-h3 text-ink">
                      데이터 소스를 알고 있어요
                    </h2>
                    <p className="mt-0.75 text-13 text-ink-40">
                      원하는 데이터의 출처/웹사이트 URL 또는 출처를 알려주시면,
                      <br />
                      수집·정제·공간 정합을 함께 합니다.
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <FormField label="Dataset (URL 또는 출처)">
                    <TextInput
                      value={dataset}
                      onChange={(e) => setDataset(e.target.value)}
                      placeholder="예) data.go.kr, KOSIS, census.gov 등"
                    />
                  </FormField>

                  <FormField label="Region (지역)">
                    <SelectInput
                      options={REGIONS}
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value)
                        setSubRegion('')
                      }}
                    />
                    {subRegionOptions.length > 0 && (
                      <SelectInput
                        options={subRegionOptions}
                        value={subRegion || subRegionOptions[0]}
                        onChange={(e) => setSubRegion(e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </FormField>

                  <FormField label="변환할 공간 단위">
                    <SelectInput
                      options={SPATIAL_UNITS}
                      value={spatialUnit}
                      onChange={(e) => setSpatialUnit(e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <FormField label="기준 연도 변경 범위">
                    <div className="flex items-center gap-2">
                      <SelectInput
                        options={YEARS_FROM}
                        value={yearFrom}
                        onChange={(e) => setYearFrom(e.target.value)}
                        className="flex-1"
                      />
                      <span className="shrink-0 text-13 text-ink-30">→</span>
                      <SelectInput
                        options={YEARS_TO}
                        value={yearTo}
                        onChange={(e) => setYearTo(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </FormField>

                  <FormField label="변환 요청 변수">
                    <VariableInputList
                      values={variables}
                      onChange={setVariables}
                      placeholder="예: population, elderly_65+..."
                    />
                  </FormField>
                </div>

                <FormField label="Output Format (출력 형식)" labelGap={8} className="mb-4">
                  <RadioGroup
                    name="format"
                    options={OUTPUT_FORMATS}
                    value={format}
                    onChange={setFormat}
                  />
                </FormField>

                <FormField label="Additional Requirements (추가 요청 사항)" className="mb-6">
                  <TextareaInput
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="분야 목적, 활용 계획, 추가 요청 사항을 입력하세요."
                    className="min-h-20"
                  />
                </FormField>

                <div className="flex items-center gap-3">
                  {/* 원본 제출 버튼은 padding 12px 28px 로 md(24px)보다 넓다 (:1414) */}
                  <Button type="submit" variant="accent" size="md" className="px-7">
                    Request Dataset →
                  </Button>
                  <span className="text-12-5 text-ink-30">{SUBMIT_NOTE}</span>
                </div>
              </form>
            </Card>

            <WritingGuide items={GUIDE_ITEMS} />
          </div>
        </Container>
      </Section>

      <Toast message={message} />
    </PageRoot>
  )
}
