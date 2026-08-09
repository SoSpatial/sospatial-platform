'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoMark } from '@/components/icons/LogoMark'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { MenuIcon, CloseIcon } from '@/components/icons/MenuIcon'
import { Button } from '@/components/ui/Button'
import { NAV_LINKS } from '@/lib/nav'

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
 * 로그인·회원가입은 이번 단계에서 동작하지 않는다(CLAUDE.md 범위).
 * 원본 마크업대로 <button type="button"> 을 유지하며 라우트를 만들지 않는다.
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

  // 라우트가 바뀌면 메뉴를 닫는다
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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

          <Button variant="ghost" size="sm" aria-label="로그인" className="hidden md:block">
            로그인
          </Button>
          <Button variant="white" size="sm" aria-label="회원가입">
            회원가입
          </Button>

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
            <button
              type="button"
              aria-label="로그인"
              className="block w-full py-3.5 text-left text-14 text-ink-70 hover:text-ink"
            >
              로그인
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
