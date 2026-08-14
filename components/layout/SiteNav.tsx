'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoMark } from '@/components/icons/LogoMark'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { MenuIcon, CloseIcon } from '@/components/icons/MenuIcon'
import { Button } from '@/components/ui/Button'
import { NAV_LINKS } from '@/lib/nav'
import { useSession } from '@/lib/auth'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * 전역 네비게이션
 * 원본: SoSpatial Platform.dc.html :24-61
 *
 *   nav      sticky / top 0 / z-index 100 / #181818 / backdrop-blur(16px) / 하단 보더 없음
 *   inner    max-width 1100px / padding 0 32px / height 64px / flex
 *   로고     gap 9px / margin-right 52px / 20×20 마크 + 16px·700·-0.4px 워드마크
 *   링크     padding 0 18px / 14px / 400 / rgba(255,255,255,0.55) / hover #fff
 *   우측     36×36 폴더 버튼 + 로그인(고스트) + 회원가입(흰 pill)  ← 실제 코드 기준 3개
 *
 * ── 인증 상태 분기 (3단계 신규) ──
 * 비로그인: 로그인(/login 링크)·회원가입(/signup 링크) — 시각은 1·2단계와 픽셀 동일해야
 *   한다 (회귀 기준선 10종의 전제). Button 을 href 로 렌더하면 <a> 에 inline-block 이
 *   붙어 호출부 `hidden md:block` 과 display 충돌하므로(1단계 버그), display 분기는
 *   래퍼 <span> 이 담당한다.
 * 로그인: 두 버튼 자리를 로그아웃(ghost) 하나로 대체. 세션 확인 전(ready 이전)에는
 *   비로그인 UI 를 렌더한다 (lib/auth.ts 주석 참조 — 정적 프리렌더 유지 트레이드오프).
 *
 * ── 반응형 (원본에 없는 신규, CLAUDE.md "원본과 달라지는 부분" #2) ──
 *   md 이상: 원본 그대로의 가로 네비
 *   md 미만: 가로 링크를 숨기고 햄버거 메뉴로 대체한다.
 *            원본 디자인 언어만 사용 — 배경 bg, 보더 line-06, 링크 14px/ink-70,
 *            라운드는 기존 토큰(rounded-ctrl). 새 토큰을 만들지 않았다.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session } = useSession()

  // 라우트가 바뀌면 메뉴를 닫는다
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabaseBrowser().auth.signOut()
    // onAuthStateChange 가 session 을 비워 UI 가 즉시 비로그인 상태로 돌아간다
  }

  return (
    <nav className="sticky top-0 z-100 bg-bg backdrop-blur-lg">
      <div className="mx-auto flex h-nav max-w-content items-center px-5 xl:px-gutter">
        {/* 로고 */}
        <Link
          href="/"
          className="mr-6 flex shrink-0 items-center gap-2.25 xl:mr-13"
          aria-label="SoSpatial 홈"
        >
          <LogoMark size={20} />
          <span className="text-16 font-bold tracking-h3 text-ink">SoSpatial</span>
        </Link>

        {/* 주 메뉴 (md 이상) */}
        <div className="hidden h-full flex-1 items-stretch md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-4.5 text-14 font-normal tracking-nav text-ink-55 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* 우측 클러스터 */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/projects"
            title="내 프로젝트"
            aria-label="내 프로젝트"
            className="flex h-9 w-9 items-center justify-center rounded-ctrl border border-line-12 text-ink-60 hover:border-ink-22 hover:bg-fill-07"
          >
            <FolderIcon size={16} />
          </Link>

          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:block"
            >
              로그아웃
            </Button>
          ) : (
            <>
              {/* display 분기는 래퍼가 담당 — Button 링크 렌더의 inline-block 과 충돌 방지 */}
              <span className="hidden md:block">
                <Button variant="ghost" size="sm" href="/login">
                  로그인
                </Button>
              </span>
              <Button variant="white" size="sm" href="/signup">
                회원가입
              </Button>
            </>
          )}

          {/* 햄버거 (md 미만) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-ctrl border border-line-12 text-ink-60 hover:border-ink-22 hover:bg-fill-07 md:hidden"
          >
            {open ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {open && (
        <div id="mobile-menu" className="border-t border-line-06 bg-bg md:hidden">
          <div className="mx-auto max-w-content px-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border-b border-line-06 py-3.5 text-14 text-ink-70 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/projects"
              className="block border-b border-line-06 py-3.5 text-14 text-ink-70 hover:text-ink"
            >
              내 프로젝트
            </Link>
            {session ? (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full py-3.5 text-left text-14 text-ink-70 hover:text-ink"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="block py-3.5 text-14 text-ink-70 hover:text-ink"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
