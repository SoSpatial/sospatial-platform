'use client'

import { cn } from '@/lib/cn'

/**
 * 이메일 추가 인풋 + 칩 목록 — 원본 공유 모달 :933-943 (재고표 신규 컴포넌트)
 *
 *   입력 행  gap 8, mb 10 — email input(flex-1, 11px 14px / #1A1A1A / line-12 /
 *            radius 9 / 14px) + 추가 버튼(11px 16px / accent-tint-15 + accent-line-30 /
 *            radius 9 / 13px 600 accent, hover tint-25)
 *   칩 목록  flex-wrap gap 6 / min-height 32 / mb 16
 *   칩       gap 6 / 4px 10px / accent-tint-10 + accent-line-20 / radius 6
 *            이메일 12.5 accent + × 리터럴(14px, accent 60%, hover accent)
 *
 * 추가 규칙(:2141-2145): trim, 빈값·중복 무시. 상태는 부모(ShareModal)가 가진다 —
 * 확정 시 입력창에 남은 미확정 값도 포함해야 해서(:2149) value 를 부모가 알아야 한다.
 */
export function EmailChipInput({
  value,
  onValueChange,
  emails,
  onAdd,
  onRemove,
}: {
  value: string
  onValueChange: (v: string) => void
  emails: string[]
  onAdd: () => void
  onRemove: (email: string) => void
}) {
  return (
    <>
      <div className="mb-2.5 flex gap-2">
        <input
          type="email"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="example@email.com"
          aria-label="공유할 이메일"
          className="min-w-0 flex-1 rounded-field border border-line-12 bg-surface-deep px-3.5 py-2.75 text-14 text-ink"
        />
        <button
          type="button"
          onClick={onAdd}
          className="cursor-pointer whitespace-nowrap rounded-field border border-accent-line-30 bg-accent-tint-15 px-4 py-2.75 text-13 font-semibold text-accent hover:bg-accent-tint-25"
        >
          추가
        </button>
      </div>
      <div className="mb-4 flex min-h-8 flex-wrap gap-1.5">
        {emails.map((email) => (
          <div
            key={email}
            className="flex items-center gap-1.5 rounded-inset border border-accent-line-20 bg-accent-tint-10 px-2.5 py-1"
          >
            <span className="text-12-5 text-accent">{email}</span>
            {/* × 색 rgba(196,168,130,0.6) 은 accent-line-60 과 동일 값이라 재사용 (:941) */}
            <button
              type="button"
              onClick={() => onRemove(email)}
              aria-label={`${email} 제거`}
              className={cn('cursor-pointer text-14 leading-none text-accent-line-60 hover:text-accent')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
