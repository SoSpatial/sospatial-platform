import { cn } from '@/lib/cn'

/**
 * 카드 셸 프리미티브
 *
 * 원본 카드는 배경·보더는 같고 라운드와 패딩만 다르다.
 * 패딩은 카드마다 달라(20 / 28 / 32px) className 으로 받는다.
 *
 *   tone      surface = #242424  API 카드 :641, Request 카드 :1176, 폼 패널 :1305
 *             bg      = #181818  홈 피처 카드 :121 (밝은 밴드 위에 얹히는 카드)
 *   radius    panel 14px  API 카드 / 가이드 사이드바
 *             card  16px  Request 카드 / 모달
 *             cardLg 20px 홈 피처 카드
 *   interactive  cursor pointer + hover 시 보더가 액센트로 (원본 hover 규칙)
 */
const TONE = {
  surface: 'bg-surface',
  bg: 'bg-bg',
} as const

const RADIUS = {
  panel: 'rounded-panel',
  card: 'rounded-card',
  cardLg: 'rounded-card-lg',
} as const

export function Card({
  tone = 'surface',
  radius = 'panel',
  interactive = false,
  className,
  children,
}: {
  tone?: keyof typeof TONE
  radius?: keyof typeof RADIUS
  interactive?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'border border-line-07',
        TONE[tone],
        RADIUS[radius],
        interactive && 'cursor-pointer hover:border-accent-line-30',
        className
      )}
    >
      {children}
    </div>
  )
}
