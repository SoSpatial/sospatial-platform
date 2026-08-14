'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * 토스트 — 원본 :954-959
 *   position fixed / bottom 32px / left 50% translateX(-50%)
 *   #2A2A2A / 1px rgba(255,255,255,0.12) / radius 10px / padding 12px 24px
 *   도트 8px #5CC974 / 텍스트 14px 500 #fff
 *   box-shadow 0 8px 32px rgba(0,0,0,0.4) / z-index 3000
 *   showToastMsg 는 2500ms 후 자동 소멸 (:1737-1740)
 *
 * upload·describe 폼에서 그대로 재사용한다.
 * 다음 단계에서 fetch 를 끼워 넣을 때는 제출 핸들러의 성공 경로에서
 * showToast() 를 호출하면 되고 이 컴포넌트는 건드릴 필요가 없다.
 */
const AUTO_DISMISS_MS = 2500

/**
 * tone (3단계 추가 — 접수 실패 표시):
 *   success  #5CC974 도트 (원본 스펙 그대로 — 기본값, 기존 호출부 무변경)
 *   error    기존 --color-danger 토큰 도트 — 새 색을 발명하지 않는다
 */
export type ToastTone = 'success' | 'error'

export function useToast() {
  const [toast, setToast] = useState<{ text: string; tone: ToastTone } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, tone: ToastTone = 'success') => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ text: msg, tone })
    timer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS)
  }, [])

  return { message: toast?.text ?? null, tone: toast?.tone ?? ('success' as ToastTone), showToast }
}

export function Toast({ message, tone = 'success' }: { message: string | null; tone?: ToastTone }) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 z-[3000] flex -translate-x-1/2 items-center gap-2.5 rounded-btn border border-line-12 bg-surface-raised px-6 py-3 shadow-[0_8px_32px_var(--color-scrim-40)]"
    >
      <div className={`h-2 w-2 shrink-0 rounded-full ${tone === 'error' ? 'bg-danger' : 'bg-success'}`} />
      <span className="text-14 font-medium text-ink">{message}</span>
    </div>
  )
}
