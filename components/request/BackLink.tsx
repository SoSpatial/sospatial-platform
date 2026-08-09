import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons/guide'

/**
 * 뒤로가기 브레드크럼 — 원본 :1285-1288 (source) / :1460 (upload) / :1592 (describe)
 *   flex / gap 8px / margin-bottom 28px / cursor pointer / hover opacity 0.7
 *   14px 화살표 stroke rgba(255,255,255,0.5) 2 + 13px ink-45 라벨
 *
 * 데이터 선택·프로젝트 상세에서도 같은 패턴이 쓰인다 (:231, :822).
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-7 flex w-fit items-center gap-2 hover:opacity-70">
      <span className="text-ink-50">
        <ArrowLeftIcon size={14} />
      </span>
      <span className="text-13 text-ink-45">{label}</span>
    </Link>
  )
}
