import { LogoMark } from '@/components/icons/LogoMark'
import { PageRoot } from '@/components/layout/PageRoot'

/**
 * 데스크톱 전용 안내 — CLAUDE.md "2단계 반응형 범위" 확정 사항.
 * /data/select · /projects · /maps 가 md(768px) 미만에서 콘텐츠 대신 이것을 띄운다.
 * 원본에 없는 화면이므로 reference 검증 대상이 아니다 (ComingSoon 스타일 준용).
 *
 * CSS 분기(hidden/md:hidden)로 처리한다 — 정적 프리렌더와 충돌하는 JS 미디어쿼리 없이
 * 세 화면이 같은 분기를 공유한다.
 */
export function DesktopOnly({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="hidden md:block">{children}</div>
      <div className="md:hidden">
        <PageRoot className="flex flex-col items-center justify-center bg-bg px-5 py-40 text-center">
          <LogoMark size={28} />
          <h1 className="mt-5 text-22 font-bold tracking-h3 text-ink">{title}</h1>
          <p className="mt-2 text-13-5 text-ink-40">이 화면은 데스크톱에서 이용해주세요.</p>
        </PageRoot>
      </div>
    </>
  )
}
