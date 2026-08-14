import { cn } from '@/lib/cn'

/**
 * 체크박스 — 네이티브 input + accent-color
 *
 * 원본 두 사용처가 동일 스펙이라 추출했다 (14×14, accent-color #C4A882, cursor pointer):
 *   데이터 선택 변수 테이블 :358 / 파일 피커 목록 :1690
 */
export function Checkbox({
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <input
      type="checkbox"
      className={cn('h-3.5 w-3.5 cursor-pointer accent-accent', className)}
      {...rest}
    />
  )
}
