import { cn } from '@/lib/cn'

/**
 * 버튼 프리미티브
 *
 * 원본에서 반복되는 버튼 4종을 variant 로, 크기 3종을 size 로 정리했다.
 * API 전용 값을 하드코딩하지 않고, 홈·Request·네비에서 그대로 재사용한다.
 *
 * variant (원본 근거)
 *   white     흰 pill  #fff / #111 / 600, hover #E8E8E8      네비 회원가입 :58, 홈 히어로 CTA :86
 *   ghost     고스트   투명 / 1px line-18 / ink-70 / 500      네비 로그인 :57, 홈 히어로 보조 :87
 *   accent    액센트   #C4A882 / #1A1A1A / 700, hover #B09470 API 키 발급 :582, Request 제출 :1414
 *   ghostSoft 연한 면  fill-06 / 1px line-12 / ink-80 / 500    API 문서 보기 :583, Request 연결하기 :1521
 *
 * size (원본 근거)
 *   sm  padding 8px 20px  / 13.5px / radius 8px   네비 :57-58
 *   md  padding 12px 24px / 14px   / radius 9px   API :582-583
 *   lg  padding 14px 28px / 15px   / radius 10px  홈 히어로 :86-87
 */
const VARIANT = {
  white: 'bg-inverse text-inverse-ink font-semibold hover:bg-inverse-hover',
  ghost: 'border border-line-18 text-ink-70 font-medium hover:bg-fill-06',
  accent: 'bg-accent text-accent-ink font-bold hover:bg-accent-hover',
  ghostSoft: 'bg-fill-06 border border-line-12 text-ink-80 font-medium hover:bg-fill-10',
} as const

const SIZE = {
  sm: 'px-5 py-2 text-13-5 rounded-ctrl',
  md: 'px-6 py-3 text-14 rounded-field',
  lg: 'px-7 py-3.5 text-15 rounded-btn tracking-cta',
} as const

export type ButtonProps = {
  variant?: keyof typeof VARIANT
  size?: keyof typeof SIZE
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'white',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('cursor-pointer', VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {children}
    </button>
  )
}
