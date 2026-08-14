'use client'

import { useEffect } from 'react'
import { useSession } from '@/lib/auth'
import { setStoreUser } from '@/lib/projects'

/**
 * 세션 ↔ 프로젝트 스토어 바인딩 — layout 에 마운트되는 렌더 없는 컴포넌트.
 *
 * 로그인 전환 감지의 단일 지점 (설계 2번): 마이그레이션·모드 전환이 특정 화면
 * 진입이 아니라 로그인 직후 화면 무관하게 실행되도록 전 페이지에 존재해야 한다.
 * 다른 탭의 로그인/로그아웃도 auth-js 의 탭 간 전파(onAuthStateChange)를 타고
 * 여기로 들어온다.
 */
export function ProjectsBridge() {
  const { session, ready } = useSession()

  useEffect(() => {
    if (!ready) return
    setStoreUser(session?.user.id ?? null)
  }, [session, ready])

  return null
}
