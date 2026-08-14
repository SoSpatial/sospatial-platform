'use client'

import { useSyncExternalStore } from 'react'
import * as remote from './projects-remote'

/**
 * 프로젝트 스토어 — 3단계에서 이중 백엔드 파사드로 확장 (B안, 설계 1번).
 *
 *   비로그인: localStorage('sospatial_projects') — 1·2단계 코드 그대로 (원본 :1733/:1763)
 *   로그인:   Supabase projects 테이블 — 메모리 캐시 + 낙관적 업데이트 + diff 영속화
 *
 * 반환 계약 { projects, updateProjects } 와 useSyncExternalStore 구조는 불변 —
 * 소비 컴포넌트(ProjectsView·DataSelect)는 모드를 모른다.
 *
 * 모드 전환은 setStoreUser() 하나로만 일어난다. 호출자는 전 페이지에 마운트되는
 * ProjectsBridge(layout) — 로그인 직후 화면 무관하게 [마이그레이션 → fetch → 전환]이
 * 실행된다 (설계 2번: 저장 모달도 이 스토어를 공유하므로 특정 화면 진입 시점은 모호).
 *
 * 동기화 (설계 4번, 사용자 승인):
 *   - updateProjects 는 캐시에 동기 적용 + notify (원본의 즉시 반영 사용감 유지)
 *   - persist 는 단일 프로미스 체인으로 직렬화, diff(id 대조)로 insert/update/delete
 *   - 실패 시 롤백 없이 서버 재조회로 수렴 (에러 UI 발명 금지 — 원본도 저장 실패 무시)
 *   - 원격 insert 는 임시 id(Date.now())로 반영 후 실제 id 로 교체 (두 번째 notify)
 *   - 멀티탭 실시간 동기화 없음 (원본도 storage 이벤트 없음 — 동급 유지)
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

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/* ── local 백엔드 (1·2단계 코드 그대로) ─────────────────────────────── */
let localCache: Project[] | null = null

/** getSnapshot 은 안정된 참조를 반환해야 하므로 파싱 결과를 캐시한다 */
function readLocal(): Project[] {
  if (localCache === null) {
    try {
      const s = localStorage.getItem(KEY)
      localCache = s ? (JSON.parse(s) as Project[]) : EMPTY
    } catch {
      // 파싱 실패 시 빈 목록 (원본 :1733 의 catch 와 동일)
      localCache = EMPTY
    }
  }
  return localCache
}

function writeLocal(next: Project[]) {
  localCache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 저장 실패는 무시 — 원본도 보호 없음
  }
}

/* ── remote 백엔드 상태 ─────────────────────────────────────────────── */
let mode: 'local' | 'remote' = 'local'
let userId: string | null = null
let remoteCache: Project[] = EMPTY
/** 서버에 저장된 sort_order — 배열 index 와 어긋난 행만 갱신하기 위한 대조표 */
let sortOrders = new Map<number, number>()
/** 낙관 임시 id → DB 실제 id (교체 전에 큐잉된 조작의 id 해석용) */
let idAlias = new Map<number, number>()
/** persist 직렬화 체인 — 순서 역전 방지 */
let chain: Promise<void> = Promise.resolve()
/** 로그인/로그아웃 전환 세대 — 전환 이후 도착한 이전 세대 결과를 버린다 */
let authEpoch = 0

function getSnapshot(): Project[] {
  return mode === 'remote' ? remoteCache : readLocal()
}

async function refreshRemote(epoch: number) {
  try {
    const { list, orders } = await remote.fetchProjects()
    if (epoch !== authEpoch) return
    remoteCache = list
    sortOrders = orders
    notify()
  } catch (e) {
    console.warn('[projects] 원격 목록 조회 실패:', e)
  }
}

/**
 * 로그인 상태 바인딩 — ProjectsBridge 전용. 컴포넌트에서 직접 호출하지 말 것.
 * 로그인: 마이그레이션 → fetch 성공 후에야 remote 로 전환 (그 전엔 로컬 목록 표시 —
 * 빈 화면 깜빡임 방지). 로그아웃: 즉시 local 복귀.
 */
export function setStoreUser(uid: string | null) {
  if (uid === userId) return
  const epoch = ++authEpoch
  userId = uid
  idAlias = new Map()
  chain = Promise.resolve()
  if (!uid) {
    mode = 'local'
    remoteCache = EMPTY
    sortOrders = new Map()
    notify()
    return
  }
  void (async () => {
    try {
      await remote.migrateLocal(uid, readLocal)
    } catch (e) {
      console.warn('[projects] 마이그레이션 부분 실패 — 다음 로그인에 재시도:', e)
    }
    if (epoch !== authEpoch) return
    mode = 'remote'
    remoteCache = EMPTY
    await refreshRemote(epoch)
    if (epoch === authEpoch && mode === 'remote') notify()
  })()
}

/* ── diff 영속화 ────────────────────────────────────────────────────── */
async function persistDiff(prev: Project[], next: Project[], epoch: number) {
  if (epoch !== authEpoch) return
  const real = (id: number) => idAlias.get(id) ?? id
  const prevIds = new Set(prev.map((p) => p.id))
  const nextIds = new Set(next.map((p) => p.id))
  const prevById = new Map(prev.map((p) => [p.id, p]))

  // 1. 삭제
  const removed = prev.filter((p) => !nextIds.has(p.id)).map((p) => real(p.id))
  if (removed.length) {
    await remote.deleteProjects(removed)
    removed.forEach((id) => sortOrders.delete(id))
  }

  // 2. 추가 — 임시 id 를 DB id 로 교체 (스냅샷 참조가 바뀌므로 notify)
  for (let i = 0; i < next.length; i++) {
    const p = next[i]
    if (prevIds.has(p.id)) continue
    const realId = await remote.insertProject(p, i)
    idAlias.set(p.id, realId)
    sortOrders.set(realId, i)
    if (epoch === authEpoch) {
      remoteCache = remoteCache.map((q) => (q.id === p.id ? { ...q, id: realId } : q))
      notify()
    }
  }

  // 3. 변경 + 순서 (index ≠ 저장된 sort_order 인 행만)
  for (let i = 0; i < next.length; i++) {
    const p = next[i]
    const before = prevById.get(p.id)
    if (!before) continue
    const id = real(p.id)
    const patch: Record<string, unknown> = {}
    if (before.name !== p.name) patch.name = p.name
    if (before.starred !== p.starred) patch.starred = p.starred
    if (before.sharing !== p.sharing) patch.sharing = p.sharing
    if (before.variables !== p.variables) patch.variables = p.variables
    if (before.sharedWith !== p.sharedWith) patch.shared_with = p.sharedWith ?? []
    if (sortOrders.get(id) !== i) patch.sort_order = i
    if (Object.keys(patch).length) {
      await remote.updateProject(id, patch)
      sortOrders.set(id, i)
    }
  }
}

/** 변경은 반드시 이 함수로 — 원본 componentDidUpdate 의 저장 동기화에 해당 */
export function updateProjects(updater: (cur: Project[]) => Project[]) {
  if (mode !== 'remote') {
    writeLocal(updater(readLocal()))
    notify()
    return
  }
  const prev = remoteCache
  const nextList = updater(prev)
  remoteCache = nextList
  notify()
  const epoch = authEpoch
  chain = chain
    .then(() => persistDiff(prev, nextList, epoch))
    .catch((e) => {
      console.warn('[projects] 원격 저장 실패 — 서버 상태로 재조회:', e)
      return refreshRemote(epoch)
    })
}

export function useProjects() {
  // 서버 스냅샷은 빈 목록 — 클라이언트 하이드레이션 후 백엔드 값으로 갱신된다
  const projects = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
  return { projects, updateProjects }
}
