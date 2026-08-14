'use client'

import { usePathname } from 'next/navigation'

/**
 * /maps 는 100vh 앱 화면이라 푸터를 렌더하지 않는다 (2026-08-14 승인 —
 * CLAUDE.md "원본과 달라지는 부분" 1번: 푸터 노출 범위 = 전 페이지, 단 /maps 제외).
 *
 * SiteFooter 는 children 으로 받으므로 서버 컴포넌트로 유지된다 — 이 게이트만
 * 클라이언트다. usePathname 은 정적 프리렌더를 동적으로 전환하지 않는다
 * (빌드 19/19 static + 회귀 차분으로 확인).
 */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/maps') return null
  return <>{children}</>
}
