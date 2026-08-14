'use client'

import { useState } from 'react'
import { CloseIcon } from '@/components/icons/MenuIcon'
import { ChevronRightIcon, PickerFolderIcon, FileIcon } from '@/components/icons/picker'
import { Checkbox } from '@/components/ui/Checkbox'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

/**
 * 파일 피커 모달 — 원본 :1662-1720
 *
 *   backdrop  fixed inset 0 / rgba(0,0,0,0.75) / z-index 1000 / 가운데 정렬
 *   패널      #242424 / 1px line-10 / radius 16px / width 520px
 *             max-height 560px / flex column / overflow hidden
 *   → 셸은 ui/Modal 로 추출 (2026-08-14). 백드롭 클릭 닫기는 원본에 없지만
 *     1단계에서 추가·승인된 동작이라 유지한다.
 *   헤더      padding 20px 24px / 하단 1px line-08
 *             제목 16px 700 / 부제 12px ink-35 (margin-top 3px)
 *             닫기 28×28 radius 6 fill-06 + 12px X(stroke 2.5) ink-60
 *   경로      padding 10px 24px / 하단 1px line-06 / gap 6px
 *             12px ink-40 + 10px 셰브런 ink-25 + 12px 500 액센트
 *   목록      flex 1 / overflow-y auto / padding 8px 16px
 *             행 gap 10px / padding 10px 8px / radius 8px / hover fill-05
 *             선택 행은 accent-tint-06 + 1px accent-line-15
 *             이름 13.5px (선택 시 #fff 500, 그 외 ink-65) / 메타 11.5px ink-25~30
 *   푸터      padding 16px 24px / 상단 1px line-08 / space-between
 *             "N개 선택됨" 12.5px ink-35 + 취소/선택하기 버튼
 *
 * ★ 목업이다. 실제 외부 서비스 연동은 3단계 작업이므로
 *   선택 시 파일명만 상태로 넘긴다 (원본 confirmPick :2420 과 동일한 동작).
 */
export type PickerEntry = {
  name: string
  meta: string
  kind: 'folder' | 'file'
  /** 파일 아이콘 색 — 원본이 확장자별로 다르게 준다 (:1688/:1694/:1700/:1706) */
  tone?: 'green' | 'blue' | 'orange'
}

/** 원본 목록 그대로 (:1680-1709) */
export const PICKER_ENTRIES: PickerEntry[] = [
  { name: 'SoSpatial 프로젝트', meta: '폴더', kind: 'folder' },
  { name: '유동인구_서울_2024.csv', meta: '234 MB', kind: 'file', tone: 'green' },
  { name: '상권분석_강남구.xlsx', meta: '12 MB', kind: 'file', tone: 'blue' },
  { name: '건물정보_전국.geojson', meta: '456 MB', kind: 'file', tone: 'orange' },
  { name: '인구통계_2023.csv', meta: '89 MB', kind: 'file', tone: 'green' },
]

const TONE = {
  green: 'text-chart-green',
  blue: 'text-chart-blue',
  orange: 'text-orange',
} as const

export function FilePickerModal({
  service,
  onClose,
  onConfirm,
}: {
  service: string
  onClose: () => void
  onConfirm: (fileName: string) => void
}) {
  // 원본은 두 번째 항목(유동인구_서울_2024.csv)이 선택된 상태로 그려져 있다
  const [selected, setSelected] = useState(1)

  return (
    <Modal
      width={520}
      backdrop={75}
      z={1000}
      scroll
      onBackdropClick={onClose}
      ariaLabel={`${service}에서 파일 선택`}
    >
        <div className="flex items-center justify-between border-b border-line-08 px-6 py-5">
          <div>
            <h3 className="text-16 font-bold text-ink">{service}에서 파일 선택</h3>
            <p className="mt-0.75 text-12 text-ink-35">가져올 파일을 선택하세요</p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-inset bg-fill-06 text-ink-60 hover:bg-fill-10"
          >
            <CloseIcon size={12} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-b border-line-06 px-6 py-2.5">
          <span className="text-12 text-ink-40">내 드라이브</span>
          <span className="text-ink-25">
            <ChevronRightIcon size={10} />
          </span>
          <span className="text-12 font-medium text-accent">SoSpatial 프로젝트</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {PICKER_ENTRIES.map((e, i) => {
            const isSelected = i === selected
            return (
              <div
                key={e.name}
                onClick={() => e.kind === 'file' && setSelected(i)}
                className={cn(
                  'flex items-center gap-2.5 rounded-ctrl px-2 py-2.5',
                  e.kind === 'file' && 'cursor-pointer',
                  isSelected
                    ? 'border border-accent-line-15 bg-accent-tint-06'
                    : 'hover:bg-fill-05'
                )}
              >
                <Checkbox checked={isSelected} readOnly />
                <span className={cn(e.kind === 'folder' ? 'text-accent' : TONE[e.tone ?? 'green'])}>
                  {e.kind === 'folder' ? <PickerFolderIcon size={16} /> : <FileIcon size={16} />}
                </span>
                <span
                  className={cn(
                    'flex-1 text-13-5',
                    isSelected ? 'font-medium text-ink' : e.kind === 'folder' ? 'text-ink-75' : 'text-ink-65'
                  )}
                >
                  {e.name}
                </span>
                <span className={cn('text-11-5', e.kind === 'folder' ? 'text-ink-25' : 'text-ink-30')}>
                  {e.meta}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line-08 px-6 py-4">
          <span className="text-12-5 text-ink-35">1개 선택됨</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-ctrl border border-line-10 bg-fill-06 px-5 py-2.25 text-13 text-ink-60 hover:bg-fill-10"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => onConfirm(PICKER_ENTRIES[selected].name)}
              className="cursor-pointer rounded-ctrl bg-accent px-5 py-2.25 text-13 font-bold text-accent-ink hover:bg-accent-hover"
            >
              선택하기
            </button>
          </div>
        </div>
    </Modal>
  )
}
