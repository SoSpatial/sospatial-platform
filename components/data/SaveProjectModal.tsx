'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { IconBadge } from '@/components/ui/IconBadge'
import { FolderIcon } from '@/components/icons/FolderIcon'

/**
 * 프로젝트 저장 모달 — 원본 :961-993, 로직 :2084-2096, :2156-2193
 *
 *   헤더   IconBadge 32/ctrl/tint12 + 폴더 아이콘 15/stroke 1.8 + 제목 15/700, mb 20 (:965-970)
 *   탭     ui/Tabs (신규/기존), mb 16 (:972-975)
 *   신규   이름 인풋 — 11px 14px / #1A1A1A / line-12 / radius 9 / 14px, mb 20 (:977)
 *          ⚠ 폼 TextInput(#2A2A2A/radius 8/10×12/13px)과 전부 달라 모달 로컬 (통일 금지)
 *   기존   네이티브 select + "프로젝트 선택" 기본 옵션 + 프로젝트 목록 (:980-985)
 *   푸터   우측 정렬 gap 8 — 취소(neutral/modal) + 저장(accent/modal) (:987-990)
 *
 * 원본 그대로 유지하는 동작 (수정 금지 승인 사항):
 *   - 신규 탭에서 이름이 비면 조용히 return — 경고 없음 (:2180). 경고 UI 를 추가하려면
 *     문구·스타일을 발명해야 하므로 원본 유지 (판단 사례 3 의 maxLength 미추가와 동류)
 *   - 기존 탭에서 대상 미선택도 조용히 return (:2161)
 *   - backdrop 클릭 = 취소 (:963)
 *
 * 저장 로직 자체(변수 스냅샷·프로젝트 생성·append)는 부모(DataSelect)가 콜백으로 갖는다
 * — 원본도 confirmSaveProject 가 앱 상태 쪽에 있다.
 */
const MODAL_INPUT =
  'w-full rounded-field border border-line-12 bg-surface-deep px-3.5 py-2.75 text-14 text-ink'

const TAB_ITEMS = [
  { value: 'new', label: '새 프로젝트' },
  { value: 'existing', label: '기존 프로젝트에 추가' },
] as const

export function SaveProjectModal({
  existingProjects,
  onClose,
  onSaveNew,
  onSaveExisting,
}: {
  existingProjects: { id: number; name: string }[]
  onClose: () => void
  onSaveNew: (name: string) => void
  onSaveExisting: (id: number) => void
}) {
  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [name, setName] = useState('')
  const [targetId, setTargetId] = useState('')

  const confirm = () => {
    if (mode === 'existing') {
      if (!targetId) return // 원본 :2161 — 무반응
      onSaveExisting(Number(targetId))
      return
    }
    const trimmed = name.trim()
    if (!trimmed) return // 원본 :2180 — 무반응 (경고 없음, 원본 그대로)
    onSaveNew(trimmed)
  }

  return (
    <Modal onBackdropClick={onClose} ariaLabel="프로젝트에 저장">
      <div className="mb-5 flex items-center gap-2.5">
        <IconBadge size={32} radius="ctrl" tint={12}>
          <FolderIcon size={15} strokeWidth={1.8} />
        </IconBadge>
        <span className="text-15 font-bold text-ink">프로젝트에 저장</span>
      </div>

      <Tabs items={TAB_ITEMS} value={mode} onChange={setMode} className="mb-4" />

      {mode === 'new' ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="프로젝트 이름 입력"
          aria-label="프로젝트 이름"
          className={`${MODAL_INPUT} mb-5`}
        />
      ) : (
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          aria-label="저장할 프로젝트 선택"
          className={`${MODAL_INPUT} mb-5 cursor-pointer`}
        >
          <option value="">프로젝트 선택</option>
          {existingProjects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="neutral" size="modal" onClick={onClose}>
          취소
        </Button>
        <Button variant="accent" size="modal" onClick={confirm}>
          저장
        </Button>
      </div>
    </Modal>
  )
}
