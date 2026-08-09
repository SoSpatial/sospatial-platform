import { LogoMark } from '@/components/icons/LogoMark'
import { PageRoot } from '@/components/layout/PageRoot'

/**
 * "준비 중" 플레이스홀더 — CLAUDE.md 결정 10번
 * 로고 + 페이지명 + "준비 중입니다" 최소 구성.
 * 원본에 없는 화면이므로 reference 검증 대상이 아니다.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <PageRoot className="flex flex-col items-center justify-center bg-bg px-5 py-40 text-center">
      <LogoMark size={28} />
      <h1 className="mt-5 text-22 font-bold tracking-h3 text-ink">{title}</h1>
      <p className="mt-2 text-13-5 text-ink-40">준비 중입니다.</p>
    </PageRoot>
  )
}
