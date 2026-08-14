import { cn } from '@/lib/cn'

/**
 * 체크박스 — 네이티브 input + accent-color
 *
 * 원본 사용처와 크기 (통일 금지 — size prop 으로 연다):
 *   14×14  데이터 선택 변수 테이블 :358 / 파일 피커 목록 :1690 (기본값)
 *   15×15  프로젝트 목록 헤더·행 :872, :885
 */
const SIZE = {
  14: 'h-3.5 w-3.5',
  15: 'h-3.75 w-3.75',
} as const

export function Checkbox({
  size = 14,
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: keyof typeof SIZE
}) {
  return (
    <input
      type="checkbox"
      className={cn('cursor-pointer accent-accent', SIZE[size], className)}
      {...rest}
    />
  )
}
