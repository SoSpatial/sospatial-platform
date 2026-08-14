import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons/guide'
import { cn } from '@/lib/cn'

/**
 * 뒤로가기 브레드크럼 — 원본 :1285-1288 (source) / :1460 (upload) / :1592 (describe)
 *   flex / gap 8px / cursor pointer / hover opacity 0.7
 *   14px 화살표 stroke rgba(255,255,255,0.5) 2 + 13px ink-45 라벨
 *
 * margin-bottom 이 화면마다 다르다 — Request 3곳은 28px, 데이터 선택(:231)은 24px.
 * 통일하지 않고 mb prop 으로 연다 (기본 28 = Request, 1단계 불변).
 * 프로젝트 상세(:822)는 구현 시 실측 후 결정.
 */
export function BackLink({
  href,
  label,
  mb = 28,
}: {
  href: string
  label: string
  mb?: 24 | 28
}) {
  return (
    <Link
      href={href}
      className={cn(
        mb === 28 ? 'mb-7' : 'mb-6',
        'flex w-fit items-center gap-2 hover:opacity-70'
      )}
    >
      <span className="text-ink-50">
        <ArrowLeftIcon size={14} />
      </span>
      <span className="text-13 text-ink-45">{label}</span>
    </Link>
  )
}
