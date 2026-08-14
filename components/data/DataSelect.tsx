'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageRoot } from '@/components/layout/PageRoot'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { BackLink } from '@/components/request/BackLink'
import { FolderIcon } from '@/components/icons/FolderIcon'
import { GridIcon } from '@/components/icons/api'
import { ListIcon, UnitTableIcon, PinIcon, CalendarIcon } from '@/components/icons/data'
import { FilterGrid } from '@/components/data/FilterGrid'
import { FilterColumn, FilterItem, FilterGroupHeader } from '@/components/data/FilterColumn'
import { VariableTable } from '@/components/data/VariableTable'
import { SaveProjectModal } from '@/components/data/SaveProjectModal'
import { Toast, useToast } from '@/components/ui/Toast'
import { TOPIC_DATA, type TopicEntry, type TopicVariable } from '@/lib/content/topics'
import { UNITS, REGIONS, YEARS, REGION_DATA } from '@/lib/content/data-select'
import { useProjects, type ProjectVariable } from '@/lib/projects'

/**
 * 데이터 선택 뷰 — 원본 :226-368 (dataIsSelect), 로직 :2034-2075 / :2336-2410
 *
 *   래퍼   padding 28px 32px 80px / max-width 1200 (Container wide)
 *   백 링크 "← 데이터" mb 24 (:230-234) → /data. 필터 리셋은 언마운트로 자연 획득
 *   H1 22px 700 -0.4 mb 4 / 프로젝트 배지(조건부 :236-241) / 설명 13.5 ink-40 mb 28
 *
 * 선택 규칙은 컬럼마다 다르다 — FilterColumn/FilterItem 은 규칙을 모르고,
 * 아래 pick* 핸들러(컬럼 정의)가 주입한다:
 *   주제·세부 주제·년도  '전체' 배타 다중 / 지역 '전국' 배타 다중
 *   단위                 단일 선택 (재클릭 해제 :2352)
 *   세부 지역            ⚠ 비배타 단순 토글 — '전체'도 그냥 토글된다 (:2372, 원본 그대로)
 *
 * 검증 기준: reference/03-data-select.png (인구·사회 + 이동인구 + 행정동 +
 * 서울특별시(6열) + 2024 + 체크 2개 상태) — scripts/verify-select.mjs 로 재현 촬영.
 */

/** 배열 토글 (:2036) */
const toggle = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

/** allKey('전체'/'전국') 배타 토글 (:2338-2360, :2376-2382) */
const exclusiveToggle = (arr: string[], v: string, allKey: string) =>
  v === allKey
    ? arr.includes(allKey)
      ? []
      : [allKey]
    : toggle(
        arr.filter((x) => x !== allKey),
        v
      )

const TOPICS = TOPIC_DATA as Record<string, TopicEntry>
const TOPIC_KEYS = Object.keys(TOPIC_DATA)

export function DataSelect() {
  /**
   * 진입 topic (:2320-2322 goDataSelect): 쿼리 없음·빈값 → '전체' 프리셋,
   * TOPIC_DATA 에 없는 무효 키 → 프리셋 없음 (원본 `TOPIC_DATA[topic] ? [topic] : []`)
   */
  const searchParams = useSearchParams()
  const entryTopic = searchParams.get('topic') || '전체'
  const entryValid = entryTopic in TOPICS

  const [filterTopic, setFilterTopic] = useState<string[]>(() => (entryValid ? [entryTopic] : []))
  const [filterSubTopic, setFilterSubTopic] = useState<string[]>([])
  const [filterUnit, setFilterUnit] = useState<string[]>([])
  const [filterRegion, setFilterRegion] = useState<string[]>([])
  const [filterSubRegion, setFilterSubRegion] = useState<string[]>([])
  const [filterYear, setFilterYear] = useState<string[]>([])
  const [dataChecked, setDataChecked] = useState<string[]>([])
  const [saveWarn, setSaveWarn] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const { projects, updateProjects } = useProjects()
  const { message, showToast } = useToast()

  /** TODO(/projects 연동): openInDataView(:2214) 진입 시 프로젝트명·체크 상태 전달 */
  const viewingProjectName = ''

  /**
   * 진입 스크롤 (:2323-2329): 150ms 후 주제 리스트에서 프리셋 항목을 중앙 정렬.
   * 프리셋이 없으면(무효 쿼리) 원본대로 스크롤하지 않는다.
   */
  const topicListRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!entryValid) return
    const t = setTimeout(() => {
      const container = topicListRef.current
      if (!container) return
      const item = Array.from(container.querySelectorAll('button')).find(
        (d) => d.textContent?.trim() === entryTopic
      )
      if (!item) return
      const rel =
        item.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
      container.scrollTop = rel - container.clientHeight / 2 + item.clientHeight / 2
    }, 150)
    return () => clearTimeout(t)
    // 진입 시 1회 — entryTopic 은 마운트 시점 값만 쓴다 (원본과 동일)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── 파생 값 (:2039-2069, :2361-2375) ── */

  // 선택된 주제들의 세부 주제 합집합 + '전체' 선두. 주제 미선택이면 빈 목록.
  const subTopicSet: string[] = []
  if (filterTopic.length > 0) {
    subTopicSet.push('전체')
    filterTopic.forEach((t) => {
      ;(TOPICS[t]?.subTopics ?? []).forEach((s) => {
        if (s !== '전체' && !subTopicSet.includes(s)) subTopicSet.push(s)
      })
    })
  }

  // 변수 목록 — 주제 ∧ 세부 주제 둘 다 선택돼야 계산. 이름 기준 dedup, 삽입 순.
  const varList: TopicVariable[] = []
  if (filterTopic.length > 0 && filterSubTopic.length > 0) {
    const seen = new Set<string>()
    const push = (v: TopicVariable) => {
      if (!seen.has(v.name)) {
        seen.add(v.name)
        varList.push(v)
      }
    }
    filterTopic.forEach((t) => {
      const entry = TOPICS[t]
      if (!entry) return
      if (filterSubTopic.includes('전체')) {
        Object.values(entry.variables).forEach((vars) => vars.forEach(push))
      } else {
        filterSubTopic
          .filter((s) => entry.subTopics.includes(s))
          .forEach((s) => (entry.variables[s] ?? entry.variables['전체'] ?? []).forEach(push))
      }
    })
  }

  // REGION_DATA 보유 지역이 선택돼 있으면 세부 지역 컬럼이 열린다 → 5↔6열 (:2361-2362)
  const hasSubRegion = filterRegion.some((r) => REGION_DATA[r])
  const subRegionGroups = filterRegion
    .filter((r) => REGION_DATA[r])
    .map((r) => ({ region: r, items: ['전체', ...REGION_DATA[r]] }))

  /* ── 컬럼별 선택 규칙 (핸들러 주입) ── */

  const pickTopic = (t: string) => {
    setFilterTopic((cur) => exclusiveToggle(cur, t, '전체'))
    setFilterSubTopic([]) // 주제 변경 시 세부 주제 리셋 (:2340, :2342)
  }
  const pickSubTopic = (s: string) => setFilterSubTopic((cur) => exclusiveToggle(cur, s, '전체'))
  const pickUnit = (u: string) => setFilterUnit((cur) => (cur[0] === u ? [] : [u])) // 단일 (:2352)
  const pickRegion = (r: string) => {
    setFilterRegion((cur) => exclusiveToggle(cur, r, '전국'))
    setFilterSubRegion([]) // 지역 변경 시 세부 지역 리셋 (:2355, :2358)
  }
  const pickSubRegion = (s: string) => setFilterSubRegion((cur) => toggle(cur, s)) // 비배타 (:2372)
  const pickYear = (y: string) => setFilterYear((cur) => exclusiveToggle(cur, y, '전체'))
  const toggleCheck = (name: string) => setDataChecked((cur) => toggle(cur, name))

  /* ── 저장 검증 (:2098-2113) — 모달 열기는 저장 모달 단계에서 ── */
  const onSave = () => {
    let warn = ''
    if (!filterTopic.length) warn = '주제를 선택해 주세요.'
    else if (!filterSubTopic.length) warn = '세부 주제를 선택해 주세요.'
    else if (!filterUnit.length) warn = '단위를 선택해 주세요.'
    else if (!filterRegion.length) warn = '지역을 선택해 주세요.'
    else if (!filterYear.length) warn = '년도를 선택해 주세요.'
    else if (!dataChecked.length) warn = '저장할 데이터를 1개 이상 선택해 주세요.'
    if (warn) {
      setSaveWarn(warn)
      setTimeout(() => setSaveWarn(''), 3000) // 원본 그대로 (:2109)
      return
    }
    setShowSaveModal(true) // :2112
  }

  /* ── 저장 확정 (:2156-2193) ── */
  const buildVariables = (): ProjectVariable[] =>
    varList
      .filter((v) => dataChecked.includes(v.name))
      .map((v) => ({
        name: v.name,
        desc: v.desc,
        // ⚠ 저장은 join(', ') — CSV 다운로드의 join('/') 과 다르다 (:2186 vs :2400). 통일 금지
        unit: filterUnit.join(', ') || '전체',
        region: filterRegion.join(', ') || '전국',
        subRegion: filterSubRegion.join(', ') || '전체',
        year: filterYear.join(', ') || '전체',
      }))

  const saveNew = (name: string) => {
    const d = new Date()
    const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
      d.getDate()
    ).padStart(2, '0')}` // :2158-2159
    updateProjects((cur) => [
      ...cur,
      { id: Date.now(), name, starred: false, date, sharing: '공유 안함', variables: buildVariables() },
    ])
    setShowSaveModal(false)
    showToast('프로젝트가 저장됐습니다.')
  }

  const saveExisting = (targetId: number) => {
    const newVars = buildVariables()
    updateProjects((cur) =>
      cur.map((p) =>
        p.id === targetId
          ? {
              ...p,
              // 이름 중복은 제외하고 append (:2173)
              variables: [
                ...p.variables,
                ...newVars.filter((nv) => !p.variables.some((ev) => ev.name === nv.name)),
              ],
            }
          : p
      )
    )
    setShowSaveModal(false)
    showToast('기존 프로젝트에 저장됐습니다.')
  }

  /* ── CSV 다운로드 (:2394-2410) — 백엔드 없이 완전 동작하는 원본 기능 ── */
  const onDownload = () => {
    const selected = varList.filter((v) => dataChecked.includes(v.name))
    if (!selected.length) return
    const header = '데이터명,설명,단위,지역,세부지역,년도'
    const rows = selected.map((v) =>
      [
        v.name,
        v.desc,
        filterUnit.join('/') || '전체',
        filterRegion.join('/') || '전국',
        filterSubRegion.join('/') || '전체',
        filterYear.join('/') || '전체',
      ]
        .map((s) => `"${s}"`)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    // U+FEFF BOM — 엑셀 한글 깨짐 방지 (원본 :2406)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sospatial_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageRoot className="bg-bg">
      <Section className="pt-7 pb-20">
        <Container width="wide">
          <BackLink href="/data" label="데이터" mb={24} />
          <h1 className="mb-1 text-22 font-bold tracking-h3 text-ink">데이터 선택</h1>
          {viewingProjectName ? (
            <div className="mb-3 inline-flex items-center gap-1.75 rounded-ctrl border border-accent-line-20 bg-accent-tint-10 px-3 py-1.25">
              <span className="text-accent">
                <FolderIcon size={12} strokeWidth={1.8} />
              </span>
              <span className="text-12-5 font-semibold text-accent">{viewingProjectName}</span>
            </div>
          ) : null}
          <p className="mb-7 text-13-5 text-ink-40">
            분석에 필요한 데이터를 선택하고 프로젝트로 저장해 보세요.
          </p>

          <FilterGrid sixCols={hasSubRegion}>
            <FilterColumn icon={<GridIcon size={13} />} label="주제 선택" listRef={topicListRef}>
              {TOPIC_KEYS.map((t) => (
                <FilterItem
                  key={t}
                  label={t}
                  active={filterTopic.includes(t)}
                  onClick={() => pickTopic(t)}
                />
              ))}
            </FilterColumn>

            <FilterColumn icon={<ListIcon size={13} />} label="세부 주제 선택">
              {subTopicSet.map((s) => (
                <FilterItem
                  key={s}
                  label={s}
                  active={filterSubTopic.includes(s)}
                  onClick={() => pickSubTopic(s)}
                />
              ))}
            </FilterColumn>

            <FilterColumn icon={<UnitTableIcon size={13} />} label="단위 선택" extra="단일 선택">
              {UNITS.map((u) => (
                <FilterItem
                  key={u}
                  label={u}
                  active={filterUnit.includes(u)}
                  onClick={() => pickUnit(u)}
                />
              ))}
            </FilterColumn>

            <FilterColumn icon={<PinIcon size={13} />} label="지역 선택">
              {REGIONS.map((r) => (
                <FilterItem
                  key={r}
                  label={r}
                  active={filterRegion.includes(r)}
                  onClick={() => pickRegion(r)}
                />
              ))}
            </FilterColumn>

            {hasSubRegion && (
              <FilterColumn icon={<PinIcon size={13} />} label="세부 지역 선택">
                {subRegionGroups.map((g) => (
                  <Fragment key={g.region}>
                    <FilterGroupHeader label={g.region} />
                    {g.items.map((s) => (
                      /* filterSubRegion 은 그룹 간 공유되는 평면 목록이다 — 두 시도에 같은
                         구 이름이 있으면 함께 하이라이트되는 것까지 원본 동작 (:2371) */
                      <FilterItem
                        key={`${g.region}-${s}`}
                        label={s}
                        active={filterSubRegion.includes(s)}
                        onClick={() => pickSubRegion(s)}
                      />
                    ))}
                  </Fragment>
                ))}
              </FilterColumn>
            )}

            <FilterColumn icon={<CalendarIcon size={13} />} label="년도 선택" last>
              {YEARS.map((y) => (
                <FilterItem
                  key={y}
                  label={y}
                  active={filterYear.includes(y)}
                  onClick={() => pickYear(y)}
                />
              ))}
            </FilterColumn>
          </FilterGrid>

          <VariableTable
            rows={varList}
            checked={dataChecked}
            onToggle={toggleCheck}
            onSave={onSave}
            onDownload={onDownload}
            warn={saveWarn}
          />
        </Container>
      </Section>

      {showSaveModal && (
        <SaveProjectModal
          existingProjects={projects.map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setShowSaveModal(false)}
          onSaveNew={saveNew}
          onSaveExisting={saveExisting}
        />
      )}
      <Toast message={message} />
    </PageRoot>
  )
}
