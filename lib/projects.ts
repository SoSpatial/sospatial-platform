'use client'

import { useSyncExternalStore } from 'react'

/**
 * 프로젝트 영속화 — 원본 :1733(로드) / :1763-1766(동기화)
 *
 * localStorage('sospatial_projects') 를 단일 출처로 하는 외부 스토어.
 * 백엔드 없이 완전 동작하는 원본 기능이므로 그대로 재현한다 (CSV 다운로드와 동급).
 * /projects 와 /data/select(저장 모달)가 라우트로 분리돼 있어 같은 스토어를 공유한다.
 * 원본도 탭 간 동기화(storage 이벤트)는 하지 않으므로 넣지 않는다.
 *
 * 원타임 리셋 'sospatial_reset_v1'(:1746-1752)은 재현하지 않는다 — 프로토타입
 * 배포 중 과거 시드를 지우려는 운영 흔적 (CLAUDE.md 판단 사례 7).
 */
export type ProjectVariable = {
  name: string
  desc: string
  unit: string
  region: string
  subRegion: string
  year: string
}

/** 원본 confirmSaveProject(:2191)가 만드는 형태. sharing 은 임의 문자열이 올 수 있다
 *  (reference 시드의 '공유받음' 등) — 색 매핑에서 fallback 처리한다. */
export type Project = {
  id: number
  name: string
  starred: boolean
  date: string
  sharing: string
  variables: ProjectVariable[]
  sharedWith?: string[]
}

const KEY = 'sospatial_projects'
const EMPTY: Project[] = []

let cache: Project[] | null = null
const listeners = new Set<() => void>()

/** getSnapshot 은 안정된 참조를 반환해야 하므로 파싱 결과를 캐시한다 */
function read(): Project[] {
  if (cache === null) {
    try {
      const s = localStorage.getItem(KEY)
      cache = s ? (JSON.parse(s) as Project[]) : EMPTY
    } catch {
      // 파싱 실패 시 빈 목록 (원본 :1733 의 catch 와 동일)
      cache = EMPTY
    }
  }
  return cache
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** 변경은 반드시 이 함수로 — 원본 componentDidUpdate 의 저장 동기화에 해당 */
export function updateProjects(updater: (cur: Project[]) => Project[]) {
  const next = updater(read())
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 저장 실패는 무시 — 원본도 보호 없음
  }
  listeners.forEach((l) => l())
}

export function useProjects() {
  // 서버 스냅샷은 빈 목록 — 클라이언트 하이드레이션 후 localStorage 값으로 갱신된다
  const projects = useSyncExternalStore(subscribe, read, () => EMPTY)
  return { projects, updateProjects }
}
