import Link from 'next/link'
import { LogoMark } from '@/components/icons/LogoMark'
import { FOOTER_LINKS } from '@/lib/nav'

/**
 * 전역 푸터 — ★ 신규 설계 (원본에 존재하지 않음)
 *
 * CLAUDE.md 결정 1번: 로고 + 카피라이트 + 링크 3~4개의 1단 구성.
 * reference PNG 15장 어디에도 푸터가 없으므로 검증 대상에서 제외하며,
 * 사용자에게 별도로 확인받아야 한다. 확정 전까지 임시 시안이다.
 *
 * 원본 디자인 시스템 안에서만 구성했다:
 *   - 배경 #181818(bg), 상단 보더 rgba(255,255,255,0.06)(line-06)
 *   - 로고 마크 + 워드마크는 네비와 동일 컴포넌트
 *   - 링크 13.5px / ink-55 / hover ink, 카피라이트 12px / ink-30
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line-06 bg-bg">
      <div className="mx-auto flex max-w-content flex-col items-center gap-5 px-5 py-9 md:flex-row md:justify-between md:gap-8 xl:px-gutter">
        <Link href="/" className="flex shrink-0 items-center gap-2.25" aria-label="SoSpatial 홈">
          <LogoMark size={18} />
          <span className="text-14 font-bold tracking-h3 text-ink-70">SoSpatial</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-13-5 text-ink-55 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-12 text-ink-30">
          © {new Date().getFullYear()} SoSpatial. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
