'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { IconBadge } from '@/components/ui/IconBadge'
import { EmailChipInput } from '@/components/ui/EmailChipInput'
import { ShareNodesIcon } from '@/components/icons/projects'
import type { Project } from '@/lib/projects'

/**
 * 공유 모달 — 원본 :909-951, 로직 :2117-2155
 *
 *   헤더        IconBadge 32/ctrl/tint12 + 공유 아이콘 15/1.8 + 제목 15/700, mb 16 (:912-917)
 *   기존 공유자 sharedWith 있을 때만 (:918-932) — 라벨 11/600/ink-35/uppercase/ls .06em
 *               행: #1A1A1A / line-08 / radius 8 / 8px 12px, 이메일 13/ink-75
 *               공유 취소: 3px 10px / revoke 토큰(220,70,70 계열 — delete 와 다름) /
 *               radius 6 / 11.5 600, hover tint-22. 아래 구분선 line-07 + "새로 추가" 라벨
 *   입력·칩     EmailChipInput (:933-943)
 *   푸터        취소(neutral/modal) + 공유하기(accent/modal) (:945-948)
 *
 * 원본 그대로 유지하는 동작 (승인 사항):
 *   - confirmShare 는 입력창에 남은 미확정 이메일도 포함 (:2149)
 *   - 확정 시 sharedWith 를 새 목록으로 **교체** — 기존 공유자가 덮어써진다 (:2152, 비일관 보존)
 *   - 공유 완료 토스트 없음 — 목록의 '내가 공유' 색 전환이 피드백 (:2148-2155)
 *   - 닫기(취소·backdrop 공통) 시 입력·칩 리셋 (:2147) — 모달 언마운트로 자연 획득
 */
export function ShareModal({
  project,
  onClose,
  onConfirm,
  onRevoke,
}: {
  project: Project
  onClose: () => void
  onConfirm: (emails: string[]) => void
  onRevoke: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  const add = () => {
    const v = email.trim()
    if (!v || emails.includes(v)) return // :2143
    setEmails((cur) => [...cur, v])
    setEmail('')
  }

  const confirm = () => {
    // 입력창에 남은 미확정 이메일도 포함한다 (:2149)
    const trimmed = email.trim()
    const all = [...emails, ...(trimmed ? [trimmed] : [])]
    if (!all.length) return
    onConfirm(all)
  }

  const shared = project.sharedWith ?? []

  return (
    <Modal onBackdropClick={onClose} ariaLabel="프로젝트 공유">
      <div className="mb-4 flex items-center gap-2.5">
        <IconBadge size={32} radius="ctrl" tint={12}>
          <ShareNodesIcon size={15} />
        </IconBadge>
        <span className="text-15 font-bold text-ink">공유할 사람의 이메일을 입력하세요.</span>
      </div>

      {shared.length > 0 && (
        <>
          <div className="mb-4">
            <span className="text-11 font-semibold uppercase tracking-modal text-ink-35">
              현재 공유된 사람
            </span>
            <div className="mt-2 flex flex-col gap-1.25">
              {shared.map((sw) => (
                <div
                  key={sw}
                  className="flex items-center justify-between rounded-ctrl border border-line-08 bg-surface-deep px-3 py-2"
                >
                  <span className="text-13 text-ink-75">{sw}</span>
                  <button
                    type="button"
                    onClick={() => onRevoke(sw)}
                    className="cursor-pointer rounded-inset border border-revoke-line-20 bg-revoke-tint-10 px-2.5 py-0.75 text-11-5 font-semibold text-revoke-ink hover:bg-revoke-tint-22"
                  >
                    공유 취소
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3.5 h-px bg-line-07" />
          <span className="mb-2.5 block text-11 font-semibold uppercase tracking-modal text-ink-35">
            새로 추가
          </span>
        </>
      )}

      <EmailChipInput
        value={email}
        onValueChange={setEmail}
        emails={emails}
        onAdd={add}
        onRemove={(e) => setEmails((cur) => cur.filter((x) => x !== e))}
      />

      <div className="flex justify-end gap-2">
        <Button variant="neutral" size="modal" onClick={onClose}>
          취소
        </Button>
        <Button variant="accent" size="modal" onClick={confirm}>
          공유하기
        </Button>
      </div>
    </Modal>
  )
}
