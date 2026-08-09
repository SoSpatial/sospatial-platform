import Link from 'next/link'
import { cn } from '@/lib/cn'

/**
 * 버튼 프리미티브
 *
 * 원본에서 반복되는 버튼 4종을 variant 로, 크기 3종을 size 로 정리했다.
 * API 전용 값을 하드코딩하지 않고, 홈·Request·네비에서 그대로 재사용한다.
 *
 * variant (원본 근거)
 *   white     흰 pill  #fff / #111 / 600, hover #E8E8E8      네비 회원가입 :58, 홈 히어로 CTA :86
 *   ghost     고스트   투명 / 1px   line-18 / ink-70 / 500, hover fill-06   네비 로그인 :57
 *   ghostBold 고스트   투명 / 1.5px line-18 / ink-70 / 500, hover fill-05   홈 히어로 보조 :87
 *   accent    액센트   #C4A882 / #1A1A1A / 700, hover #B09470 API 키 발급 :582, source 제출 :1414
 *   emerald   에메랄드 #059669 / #fff    / 700, hover #047857 upload 제출 :1555
 *   violet    보라     #7C3AED / #fff    / 700, hover #6D28D9 describe 제출 :1628
 *   ghostSoft 연한 면  fill-06 / 1px line-12 / ink-80 / 500    API 문서 보기 :583
 *
 * ※ 요청 폼 3종의 제출 버튼은 색 3요소(배경/글자/hover)만 다르고 나머지가 같다.
 *   패딩은 원본이 12px 28px 이라 size="md"(24px) + className="px-7" 로 조합한다.
 *   px-7 은 lg(홈 히어로)에도 쓰여 크기 축과 직교하지 않으므로 4번째 size 를 만들지 않았다.
 *
 * ※ ghost 와 ghostBold 는 원본에서 실제로 보더 두께(1px / 1.5px)와
 *   hover 배경(0.06 / 0.05)이 다르다. 통합하지 말 것.
 *
 * size (원본 근거)
 *   sm  padding 8px 20px  / 13.5px / radius 8px   네비 :57-58
 *   md  padding 12px 24px / 14px   / radius 9px   API :582-583
 *   lg  padding 14px 28px / 15px   / radius 10px  홈 히어로 :86-87
 */
const VARIANT = {
  white: 'bg-inverse text-inverse-ink font-semibold hover:bg-inverse-hover',
  ghost: 'border border-line-18 text-ink-70 font-medium hover:bg-fill-06',
  // 1.5px 는 Tailwind 기본 보더 스케일에 없어 임의값을 쓴다 (원본 :87)
  ghostBold: 'border-[1.5px] border-line-18 text-ink-70 font-medium hover:bg-fill-05',
  accent: 'bg-accent text-accent-ink font-bold hover:bg-accent-hover',
  emerald: 'bg-emerald text-ink font-bold hover:bg-emerald-hover',
  violet: 'bg-violet text-ink font-bold hover:bg-violet-hover',
  ghostSoft: 'bg-fill-06 border border-line-12 text-ink-80 font-medium hover:bg-fill-10',
} as const

const SIZE = {
  sm: 'px-5 py-2 text-13-5 rounded-ctrl',
  md: 'px-6 py-3 text-14 rounded-field',
  lg: 'px-7 py-3.5 text-15 rounded-btn tracking-cta',
} as const

type BaseProps = {
  variant?: keyof typeof VARIANT
  size?: keyof typeof SIZE
  className?: string
  children: React.ReactNode
}

export type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>

export type ButtonLinkProps = BaseProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'children' | 'className' | 'href'
  >

/**
 * href 를 주면 next/link 로, 없으면 <button> 으로 렌더한다.
 * 원본은 전부 <button onClick={navigate}> 이지만, 페이지 이동은 링크가 맞다.
 * 시각 스타일은 동일하다.
 */
export function Button(props: ButtonProps): React.ReactElement
export function Button(props: ButtonLinkProps): React.ReactElement
export function Button({
  variant = 'white',
  size = 'md',
  className,
  children,
  ...rest
}: BaseProps & Record<string, unknown>) {
  const classes = cn(
    'inline-block cursor-pointer text-center',
    VARIANT[variant],
    SIZE[size],
    className
  )

  if (typeof rest.href === 'string') {
    const { href, ...anchorRest } = rest as { href: string }
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    )
  }

  const { type = 'button', ...buttonRest } = rest as { type?: 'button' | 'submit' | 'reset' }
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
