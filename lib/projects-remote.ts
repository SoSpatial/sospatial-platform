'use client'

import { supabaseBrowser } from '@/lib/supabase/client'
import type { Project, ProjectVariable } from './projects'

/**
 * 프로젝트 원격 백엔드 IO — lib/projects.ts(스토어) 전용. 컴포넌트에서 임포트 금지.
 *
 * Project ↔ projects 행 매핑 (3단계 설계 3번):
 *   목록 렌더·정렬·상태색이 직접 쓰는 스칼라(name/starred/sharing) = 컬럼,
 *   목록 순서 = sort_order (moveUp/moveDown 이 사용자 상태로 만듦 — 스키마 v2),
 *   date(표시용) = created_at 에서 파생 (DataSelect 의 zero-pad YYYY.MM.DD 와 동일 형식),
 *   variables = jsonb 통짜, sharedWith = shared_with text[] (결정 5 — 데이터만).
 */
export type ProjectRow = {
  id: number
  name: string
  starred: boolean
  sharing: string
  variables: ProjectVariable[]
  shared_with: string[]
  sort_order: number
  created_at: string
}

/** DataSelect saveNew(:194)와 동일한 표시 형식 */
function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`
}

/** 'YYYY.MM.DD' → ISO. 정오로 파싱해 타임존 경계에서 날짜가 밀리지 않게 한다 */
function parseDateToIso(date: string): string | null {
  const m = date.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12).toISOString()
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: Number(row.id),
    name: row.name,
    starred: row.starred,
    date: fmtDate(row.created_at),
    sharing: row.sharing,
    variables: row.variables ?? [],
    // 로컬(DataSelect)이 만드는 객체엔 sharedWith 키가 없다 — 빈 배열은 미보유로 매핑해 동형 유지
    ...(row.shared_with?.length ? { sharedWith: row.shared_with } : {}),
  }
}

function projectToRow(p: Project): Omit<ProjectRow, 'id' | 'sort_order' | 'created_at'> {
  return {
    name: p.name,
    starred: p.starred,
    sharing: p.sharing,
    variables: p.variables,
    shared_with: p.sharedWith ?? [],
  }
}

const SELECT = 'id,name,starred,sharing,variables,shared_with,sort_order,created_at'

/** 목록 + 서버에 저장된 sort_order 맵 (스토어가 순서 변경 diff 에 사용) */
export async function fetchProjects(): Promise<{ list: Project[]; orders: Map<number, number> }> {
  const { data, error } = await supabaseBrowser()
    .from('projects')
    .select(SELECT)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  const rows = (data ?? []) as ProjectRow[]
  return {
    list: rows.map(rowToProject),
    orders: new Map(rows.map((r) => [Number(r.id), r.sort_order])),
  }
}

/** insert 후 실제 id 반환 (스토어가 낙관 임시 id 를 교체한다) */
export async function insertProject(p: Project, sortOrder: number): Promise<number> {
  const { data, error } = await supabaseBrowser()
    .from('projects')
    .insert({ ...projectToRow(p), sort_order: sortOrder })
    .select('id')
    .single()
  if (error) throw error
  return Number(data.id)
}

export async function updateProject(id: number, patch: Partial<ProjectRow>): Promise<void> {
  const { error } = await supabaseBrowser().from('projects').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProjects(ids: number[]): Promise<void> {
  const { error } = await supabaseBrowser().from('projects').delete().in('id', ids)
  if (error) throw error
}

/**
 * 로컬 → DB 마이그레이션 (설계 2번 + 사용자 승인: **원본 보존 + 계정별 기록**).
 *
 * localStorage 의 게스트 목록은 지우지 않는다. 대신 계정별로 "이전 완료된 로컬 id"
 * 를 기록해 재로그인 시 중복 이전을 막는다. boolean 플래그가 아니라 id 목록인 이유:
 * 마이그레이션 후 게스트로 새로 저장한 항목도 다음 로그인에 이전돼야 하기 때문.
 * 성공 건마다 즉시 기록하므로 부분 실패 시 남은 건만 다음 로그인에 재시도된다.
 *
 * 두 탭 동시 로그인은 Web Locks 로 직렬화한다 — 락 안에서 기록을 다시 읽으므로
 * 뒤에 든 탭은 이전할 것이 없음을 보고 건너뛴다. (미지원 브라우저는 락 없이 진행)
 */
const MIG_KEY = 'sospatial_migrated_v1'

function readMigrated(): Record<string, number[]> {
  try {
    const s = localStorage.getItem(MIG_KEY)
    return s ? (JSON.parse(s) as Record<string, number[]>) : {}
  } catch {
    return {}
  }
}

export async function migrateLocal(uid: string, readLocalList: () => Project[]): Promise<void> {
  const run = async () => {
    const map = readMigrated()
    const done = new Set(map[uid] ?? [])
    const pending = readLocalList().filter((p) => !done.has(p.id))
    if (!pending.length) return

    // 서버 목록 끝에 이어 붙인다
    const { data } = await supabaseBrowser()
      .from('projects')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
    let next = ((data?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1) + 1

    for (const p of pending) {
      const createdAt = parseDateToIso(p.date)
      const { error } = await supabaseBrowser()
        .from('projects')
        .insert({
          ...projectToRow(p),
          sort_order: next++,
          // 저장일 보존 — 파싱 실패 시 DB 기본값(now())
          ...(createdAt ? { created_at: createdAt } : {}),
        })
      if (error) throw error
      done.add(p.id)
      map[uid] = [...done]
      try {
        localStorage.setItem(MIG_KEY, JSON.stringify(map))
      } catch {
        // 기록 실패 시 최악은 다음 로그인의 중복 이전 — MVP 수용 (설계 2번)
      }
    }
  }

  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    await navigator.locks.request('sospatial-migrate', run)
  } else {
    await run()
  }
}
