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
import { DropZone } from '@/components/request/DropZone'
import { FilePickerModal } from '@/components/request/FilePickerModal'
import { FormField, SelectInput } from '@/components/form/fields'
import { CheckIcon, GuideSearchIcon, GuidePinIcon, GuideGridIcon } from '@/components/icons/guide'
import {
  SPATIAL_UNITS_UPLOAD,
  YEARS_FROM,
  YEARS_TO,
  SUBMIT_NOTE,
  SUBMIT_TOAST,
} from '@/lib/content/request-form'

/**
 * 요청 폼 ② 데이터를 가지고 있어요 — 원본 :1457-1586
 *
 *   래퍼·그리드·폼 카드·가이드 스펙은 source 와 동일하다.
 *   다른 점
 *     진행 스텝 현재 색  #059669 (emerald)
 *     헤더 배지         emerald
 *     Dataset          드롭존 (padding 32 / 2px dashed / radius 10 / 용량 박스)
 *     서비스 연동       select + "연결하기" 버튼, 선택 시 파일 배지 노출
 *     1행              2열 (공간 단위 3종 / 연도 범위)
 *     제출 버튼         #059669 배경 흰 글자, hover #047857
 *     가이드            3항목 (Time Range 없음), 제목 자간 지정 없음
 */
const GUIDE_ITEMS: GuideItem[] = [
  { icon: <GuideSearchIcon />, title: 'Dataset', desc: '파일 형식과 포함된 변수 정보를 알려주세요.' },
  { icon: <GuidePinIcon />, title: 'Region', desc: '데이터가 커버하는 지역 범위를 선택하세요.' },
  { icon: <GuideGridIcon />, title: 'Spatial Unit', desc: '원하는 공간 단위로 변환해 드립니다.' },
]

/** 원본 :1513-1519 — 첫 옵션은 value 가 빈 문자열이다 */
const SERVICES = [
  { value: '', label: '서비스 선택...' },
  'Google Drive',
  'Dropbox',
  'OneDrive',
  'AWS S3',
  'API 연동',
  'Database',
] as const

export function UploadForm() {
  const { message, showToast } = useToast()

  const [service, setService] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickedFile, setPickedFile] = useState('')
  const [spatialUnit, setSpatialUnit] = useState<string>(SPATIAL_UNITS_UPLOAD[0])
  const [yearFrom, setYearFrom] = useState<string>(YEARS_FROM[0])
  const [yearTo, setYearTo] = useState<string>(YEARS_TO[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 다음 단계에서 이 자리에 fetch 를 넣는다.
    const payload = { method: 'upload', service, pickedFile, spatialUnit, yearFrom, yearTo }
    console.log('[request/upload] submit', payload)
    showToast(SUBMIT_TOAST)
  }

  return (
    <PageRoot className="bg-bg">
      <Section className="pt-8 pb-18">
        <Container>
          <BackLink href="/request" label="Request" />
          <ProgressSteps activeColor="emerald" textPillDisplay="block" />

          <div className="grid grid-cols-[1fr_var(--container-sidebar)] items-start gap-6">
            <Card radius="card" className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex items-center gap-3">
                  <NumberBadge n={2} color="emerald" size={36} />
                  <div>
                    <h2 className="text-20 font-bold tracking-h3 text-ink">
                      데이터를 가지고 있어요
                    </h2>
                    <p className="mt-0.75 text-13 text-ink-40">
                      보유 중인 데이터를 업로드하거나 공간 단위 정합 및 분석 가능한 형태로
                      가공합니다.
                    </p>
                  </div>
                </div>

                <FormField label="Dataset (파일로 전달)" labelGap={8} className="mb-5">
                  <DropZone
                    title="파일을 드래그하거나 클릭하여 업로드하세요"
                    formats="CSV, Excel, Shapefile, GeoJSON, XML, ZIP 지원"
                    limits={{
                      guestLabel: '비회원',
                      guest: '100 MB',
                      memberLabel: '로그인 회원',
                      member: '500 MB',
                    }}
                  />
                </FormField>

                <FormField label="또는 서비스 연동" labelGap={8} className="mb-5">
                  <div className="flex items-center gap-2">
                    <SelectInput
                      options={SERVICES}
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="flex-1"
                    />
                    {/*
                      이 버튼은 Button 의 어떤 variant/size 와도 스펙이 다르다.
                      원본 :1521 padding 10px 18px / fill-07 / 1px line-12 / radius 8
                              13px 500 ink-70 / hover fill-12
                      가장 가까운 ghostSoft 는 fill-06 · ink-80 · md(24px) 라서
                      오버라이드가 4개 필요해 프리미티브를 쓰지 않았다.
                    */}
                    <button
                      type="button"
                      onClick={() => service && setPickerOpen(true)}
                      className="shrink-0 cursor-pointer rounded-ctrl border border-line-12 bg-fill-07 px-4.5 py-2.5 text-13 font-medium whitespace-nowrap text-ink-70 hover:bg-fill-12"
                    >
                      연결하기
                    </button>
                  </div>

                  {pickedFile && (
                    <div className="mt-2 flex items-center gap-2 rounded-ctrl border border-chart-green-line-20 bg-chart-green-tint-08 px-3 py-2.25">
                      <span className="text-chart-green">
                        <CheckIcon size={14} />
                      </span>
                      <span className="text-12-5 font-medium text-chart-green">{pickedFile}</span>
                    </div>
                  )}
                </FormField>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <FormField label="변환할 공간 단위">
                    <SelectInput
                      options={SPATIAL_UNITS_UPLOAD}
                      value={spatialUnit}
                      onChange={(e) => setSpatialUnit(e.target.value)}
                    />
                  </FormField>

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
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {/* 원본 :1555 — padding 12px 28px 이라 md(24px) + px-7 로 조합 */}
                  <Button type="submit" variant="emerald" size="md" className="px-7">
                    데이터 요청하기 →
                  </Button>
                  <span className="text-12-5 text-ink-30">{SUBMIT_NOTE}</span>
                </div>
              </form>
            </Card>

            <WritingGuide items={GUIDE_ITEMS} titleTracking="none" />
          </div>
        </Container>
      </Section>

      {pickerOpen && (
        <FilePickerModal
          service={service || 'Google Drive'}
          onClose={() => setPickerOpen(false)}
          onConfirm={(name) => {
            setPickedFile(name)
            setPickerOpen(false)
          }}
        />
      )}

      <Toast message={message} />
    </PageRoot>
  )
}
