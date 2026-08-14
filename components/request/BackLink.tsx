import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons/guide'
import { cn } from '@/lib/cn'

/**
 * 뒤로가기 브레드크럼 — 원본 :1285-1288 (source) / :1460 (upload) / :1592 (describe)
 *   flex / gap 8px / cursor pointer / hover opacity 0.7
 *   14px 화살표 stroke rgba(255,255,255,0.5) 2 + 13px ink-45 라벨
 *
 * margin-bottom 이 화면마다 다르다 — Request 3곳 28px / 데이터 선택(:231) 24px /
 * 프로젝트 상세(:822) 20px. 통일하지 않고 mb prop 으로 연다 (기본 28 = Request, 1단계 불변).
 */
const MB = { 20: 'mb-5', 24: 'mb-6', 28: 'mb-7' } as const

export function BackLink({
  href,
  label,
  mb = 28,
  onClick,
}: {
  href?: string
  label: string
  mb?: keyof typeof MB
  /** 프로젝트 상세처럼 라우팅 없이 뷰 상태만 바꿀 때 — href 없이 버튼으로 렌더 */
  onClick?: () => void
}) {
  const classes = cn(MB[mb], 'flex w-fit items-center gap-2 hover:opacity-70')
  if (!href) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'cursor-pointer')}>
        <span className="text-ink-50">
          <ArrowLeftIcon size={14} />
        </span>
        <span className="text-13 text-ink-45">{label}</span>
      </button>
    )
  }
  return (
    <Link href={href} onClick={onClick} className={classes}>
      <span className="text-ink-50">
        <ArrowLeftIcon size={14} />
      </span>
      <span className="text-13 text-ink-45">{label}</span>
    </Link>
  )
}
