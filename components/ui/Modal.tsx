'use client'

import { cn } from '@/lib/cn'

/**
 * 모달 셸 — backdrop + 센터 정렬 + 패널. 내용은 children 이 채운다.
 *
 * 원본 3종의 차이는 prop 으로 연다 (통일 금지 원칙 — CLAUDE.md 재고표):
 *                backdrop   z     폭    패널 구성                        backdrop 클릭
 *   파일 피커    0.75      1000   520   패딩 없음 + max-h 560 flex-col   원본엔 없음 (:1663)
 *   저장/공유    0.7       2000   420   패딩 28 균일                     닫기 (:910/:963 + stopProp)
 * 공통: 패널 #242424 / 1px line-10 / radius 16 (:911, :964, :1664)
 *
 * 파일 피커의 backdrop 클릭 닫기는 원본에 없지만 1단계에서 추가·승인된 동작이라 유지한다
 * — onBackdropClick 을 넘기는 쪽이 결정한다.
 */
export function Modal({
  width = 420,
  backdrop = 70,
  z = 2000,
  scroll = false,
  onBackdropClick,
  ariaLabel,
  children,
}: {
  width?: 420 | 520
  backdrop?: 70 | 75
  z?: 1000 | 2000
  /** 파일 피커형: 패딩 없이 max-h 560 + flex-col + overflow hidden (기본은 패딩 28) */
  scroll?: boolean
  onBackdropClick?: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onBackdropClick}
      className={cn(
        'fixed inset-0 flex items-center justify-center',
        backdrop === 75 ? 'bg-scrim-75' : 'bg-scrim',
        z === 1000 ? 'z-[1000]' : 'z-[2000]'
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'rounded-card border border-line-10 bg-surface',
          width === 520 ? 'w-[520px]' : 'w-[420px]',
          scroll ? 'flex max-h-[560px] flex-col overflow-hidden' : 'p-7'
        )}
      >
        {children}
      </div>
    </div>
  )
}
