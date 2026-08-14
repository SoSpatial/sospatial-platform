/**
 * 프로젝트 동작 검증 — 2단계 "동작 29항목"(커밋 38345f5, 당시 일회성 수행)의 영구 복원판.
 * 3단계 이중 백엔드(B안)에 맞춰 4개 스위트로 실행한다:
 *
 *   A. 게스트(localStorage)  — 1·2단계 동작 회귀 없음
 *   B. 로그인(Supabase DB)   — 같은 시나리오 + 각 조작을 admin 으로 DB 실측 대조
 *   C. 마이그레이션          — 시드 주입 → 로그인 → 이전·원본 보존·중복 방지·복귀
 *   D. 두 탭                 — 로그인 전파(onAuthStateChange 경로)·진행 중 쓰기 유실 여부
 *
 * B~D 는 스키마 v2(sort_order)가 적용돼 있어야 실행된다 — 미적용이면 생략하고 알린다.
 * 사용: node scripts/verify-projects-behavior.mjs   (BASE_URL 기본 http://localhost:3100)
 */
import fs from 'node:fs'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const SB = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const admin = createClient(SB, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const BASE = process.env.BASE_URL || 'http://localhost:3100'
const PW = 'ProjVerify-2026!ab'

let n = 0
let fail = 0
const check = (ok, label, detail = '') => {
  n++
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${String(n).padStart(2)}] ${label}${detail ? ` — ${detail}` : ''}`)
}
const info = (label) => console.log(`      ${label}`)

async function deleteUserByEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const u = data?.users?.find((x) => x.email === email)
  if (u) await admin.auth.admin.deleteUser(u.id)
  return u?.id
}
const dbRows = async (uid) => {
  const { data } = await admin
    .from('projects')
    .select('id,name,starred,sharing,variables,shared_with,sort_order,created_at')
    .eq('user_id', uid)
    .order('sort_order')
  return data ?? []
}
const until = async (fn, timeout = 8000, step = 250) => {
  const t0 = Date.now()
  for (;;) {
    const v = await fn()
    if (v) return v
    if (Date.now() - t0 > timeout) return null
    await new Promise((r) => setTimeout(r, step))
  }
}

/* ── 공용 UI 헬퍼 ── */
const rowByName = (page, name) => page.locator(`div:has(> span:text-is("${name}"))`).last()
const rowNames = (page) => page.locator('span.text-14.font-medium').allTextContents()
const readGuest = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('sospatial_projects') || '[]'))
const readMigrated = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('sospatial_migrated_v1') || '{}'))

/** /data/select 에서 필터 → 변수 체크 → 저장 모달까지 (verify-modals 와 동일 경로) */
async function openSaveModal(page) {
  await page.goto(BASE + '/data/select?topic=' + encodeURIComponent('인구·사회'))
  await page.waitForLoadState('networkidle')
  const col = (label) => page.locator(`div:has(> div > span:text-is("${label}"))`).last()
  await col('세부 주제 선택').getByRole('button', { name: '이동인구', exact: true }).click()
  await col('단위 선택').getByRole('button', { name: '행정동', exact: true }).click()
  await col('지역 선택').getByRole('button', { name: '서울특별시', exact: true }).click()
  await col('년도 선택').getByRole('button', { name: '2024', exact: true }).click()
  await page
    .locator('div:has(> input[type=checkbox])', { hasText: '생활인구 (시간별)' })
    .locator('input')
    .check()
  await page.getByRole('button', { name: '프로젝트에 저장' }).click()
  await page.locator('[role=dialog]').waitFor()
}

async function saveNewProject(page, name) {
  await openSaveModal(page)
  await page.getByLabel('프로젝트 이름').fill(name)
  await page.locator('[role=dialog]').getByRole('button', { name: '저장', exact: true }).click()
}

async function uiLogin(page, email) {
  await page.goto(BASE + '/login')
  await page.getByLabel('이메일').fill(email)
  await page.getByLabel('비밀번호').fill(PW)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(BASE + '/')
  await page.locator('nav').getByRole('button', { name: '로그아웃' }).waitFor()
}

/**
 * 공통 시나리오 — 게스트/로그인 양 모드에서 동일하게 실행.
 * assertState(label, predicate) 는 모드별 저장소(localStorage / DB)를 대조한다.
 */
async function runCommonScenario(page, modeLabel, assertState) {
  const P1 = `${modeLabel}-P1`
  const P2 = `${modeLabel}-P2`

  // 저장 모달
  await openSaveModal(page)
  await page.locator('[role=dialog]').getByRole('button', { name: '저장', exact: true }).click()
  check(await page.locator('[role=dialog]').isVisible(), `${modeLabel}: 빈 이름 저장 무반응 (모달 유지 — 원본 :2180)`)
  await page.getByLabel('프로젝트 이름').fill(P1)
  await page.locator('[role=dialog]').getByRole('button', { name: '저장', exact: true }).click()
  check(
    await page.getByText('프로젝트가 저장됐습니다').isVisible(),
    `${modeLabel}: 신규 저장 → 토스트`
  )
  await saveNewProject(page, P2)
  await assertState(`${modeLabel}: 저장 2건 영속`, (list) => list.length === 2 && list[0].name === P1 && list[1].name === P2)

  // 기존 프로젝트에 추가 (변수 append — 이름 중복 제외 :2173)
  await openSaveModal(page)
  await page.locator('[role=dialog]').getByRole('button', { name: '기존 프로젝트에 추가' }).click()
  await page.getByLabel('저장할 프로젝트 선택').waitFor()
  const optionCount = await page.getByLabel('저장할 프로젝트 선택').locator('option').count()
  check(optionCount === 3, `${modeLabel}: 기존 탭 프로젝트 목록 (기본+2건)`, `option ${optionCount}`)
  // 대상 미선택 무반응 (:2161)
  await page.locator('[role=dialog]').getByRole('button', { name: '저장', exact: true }).click()
  check(await page.locator('[role=dialog]').isVisible(), `${modeLabel}: 기존 탭 대상 미선택 무반응`)
  await page.locator('[role=dialog]').getByLabel('저장할 프로젝트 선택').selectOption({ label: P1 })
  await page.locator('[role=dialog]').getByRole('button', { name: '저장', exact: true }).click()
  await assertState(`${modeLabel}: 기존 추가 — 이름 중복 제외 append`, (list) => {
    const p = list.find((x) => x.name === P1)
    return p && p.variables.length === 1 && p.variables[0].name === '생활인구 (시간별)'
  })

  // 목록 화면
  await page.goto(BASE + '/projects')
  await page.waitForLoadState('networkidle')
  await page.locator(`div:has(> span:text-is("${P1}"))`).last().waitFor()
  const names0 = await rowNames(page)
  check(names0.join(',') === `${P1},${P2}`, `${modeLabel}: 목록 행·순서`, names0.join(','))
  const dateText = await rowByName(page, P1).locator('> span').nth(2).innerText()
  check(/^\d{4}\.\d{2}\.\d{2}$/.test(dateText), `${modeLabel}: 저장 날짜 형식 YYYY.MM.DD`, dateText)
  const sharing0 = await rowByName(page, P1).locator('> div').nth(3).innerText()
  check(sharing0.trim() === '공유 안함', `${modeLabel}: 초기 공유여부 '공유 안함'`)

  // 별 토글
  await rowByName(page, P1).locator('> div').nth(1).click()
  await assertState(`${modeLabel}: 별 토글 → starred=true 영속`, (list) => list.find((x) => x.name === P1)?.starred === true)

  // 체크 / 전체 체크
  await rowByName(page, P1).locator('> div').first().click()
  check(await page.getByLabel(`${P1} 선택`).isChecked(), `${modeLabel}: 행 체크`)
  // 헤더 체크박스는 input 이 직접 클릭을 받는다 (행 체크박스만 pointer-events-none)
  await page.getByLabel('전체 선택').click()
  check(
    (await page.getByLabel(`${P1} 선택`).isChecked()) && (await page.getByLabel(`${P2} 선택`).isChecked()),
    `${modeLabel}: 전체 선택 (일부 체크 상태에서 → 전체 체크)`
  )
  await page.getByLabel('전체 선택').click()
  check(!(await page.getByLabel(`${P1} 선택`).isChecked()), `${modeLabel}: 전체 선택 재클릭 → 해제`)

  // 이동 (P2 체크 → 위로)
  await rowByName(page, P2).locator('> div').first().click()
  await page.getByRole('button', { name: '위로 이동' }).click()
  check((await rowNames(page)).join(',') === `${P2},${P1}`, `${modeLabel}: 위로 이동`)
  await assertState(`${modeLabel}: 이동 순서 영속`, (list) => list[0]?.name === P2 && list[1]?.name === P1)
  await page.getByRole('button', { name: '아래로 이동' }).click()
  check((await rowNames(page)).join(',') === `${P1},${P2}`, `${modeLabel}: 아래로 이동 복귀`)

  // 선택 다운로드 — 체크 0개여도 빈 배열 (원본 비일관 보존 :2253)
  await rowByName(page, P2).locator('> div').first().click() // 해제
  {
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '선택 다운로드' }).click(),
    ])
    const body = fs.readFileSync(await dl.path(), 'utf8')
    check(
      dl.suggestedFilename() === 'sospatial_projects.json' && body.trim() === '[]',
      `${modeLabel}: 선택 다운로드 0개 = 빈 배열 JSON (원본 비일관 보존)`
    )
  }

  // 상세
  await rowByName(page, P1).locator(`> span:text-is("${P1}")`).click()
  check(await page.getByText(`저장일 ${dateText}`, { exact: false }).isVisible(), `${modeLabel}: 상세 진입 + 저장일`)
  {
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '다운로드' }).click(),
    ])
    check(dl.suggestedFilename() === `${P1}.json`, `${modeLabel}: 상세 다운로드 파일명`, dl.suggestedFilename())
  }
  await page.locator('main').getByText('내 프로젝트').first().click()
  check((await rowNames(page)).length === 2, `${modeLabel}: BackLink 목록 복귀`)
  await rowByName(page, P1).locator(`> span:text-is("${P1}")`).click()
  await page.getByRole('heading', { name: 'My Projects' }).click()
  check((await rowNames(page)).length === 2, `${modeLabel}: h1 클릭 복귀`)

  // 공유 모달
  await rowByName(page, P1).getByRole('button', { name: '공유하기' }).click()
  const dlg = page.locator('[role=dialog]')
  await dlg.getByLabel('공유할 이메일').fill('friend@example.com')
  await dlg.getByRole('button', { name: '추가' }).click()
  await dlg.getByRole('button', { name: '공유하기' }).click()
  check(
    (await rowByName(page, P1).locator('> div').nth(3).innerText()).trim() === '내가 공유',
    `${modeLabel}: 공유 확정 → '내가 공유'`
  )
  await assertState(`${modeLabel}: sharedWith 영속`, (list) => {
    const p = list.find((x) => x.name === P1)
    const emails = p?.sharedWith ?? p?.shared_with ?? []
    return emails.length === 1 && emails[0] === 'friend@example.com'
  })
  await rowByName(page, P1).getByRole('button', { name: '공유하기' }).click()
  await dlg.getByRole('button', { name: '공유 취소' }).click()
  check(
    (await rowByName(page, P1).locator('> div').nth(3).innerText()).trim() === '공유 안함',
    `${modeLabel}: revoke → 비면 '공유 안함' 복귀`
  )
  await dlg.getByRole('button', { name: '취소' }).click()

  // 새로고침 유지
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.locator(`div:has(> span:text-is("${P1}"))`).last().waitFor()
  check((await rowNames(page)).join(',') === `${P1},${P2}`, `${modeLabel}: 새로고침 후 유지`)

  // 상세 삭제 (토스트 있음) / 선택 삭제 (토스트 없음 — 원본 비일관 보존)
  await rowByName(page, P2).locator(`> span:text-is("${P2}")`).click()
  await page.getByRole('button', { name: '프로젝트 삭제' }).click()
  check(await page.getByText('프로젝트가 삭제됐습니다').isVisible(), `${modeLabel}: 상세 삭제 → 토스트`)
  await assertState(`${modeLabel}: 상세 삭제 영속`, (list) => list.length === 1 && list[0].name === P1)
  // 직전 상세 삭제 토스트(2500ms 자동 소멸)가 사라진 뒤에 "토스트 없음"을 판정한다
  await page.getByText('프로젝트가 삭제됐습니다').waitFor({ state: 'hidden' })
  await rowByName(page, P1).locator('> div').first().click()
  await page.getByRole('button', { name: '선택 삭제' }).click()
  await page.waitForTimeout(400)
  check(
    !(await page.getByText('프로젝트가 삭제됐습니다').isVisible()),
    `${modeLabel}: 선택 삭제 → 토스트 없음 (원본 비일관 보존)`
  )
  await assertState(`${modeLabel}: 선택 삭제 영속 (0건)`, (list) => list.length === 0)
}

/* ════ 실행 ════ */
const browser = await chromium.launch()

// sort_order 적용 여부 (스키마 v2)
const probe = await admin.from('projects').select('sort_order').limit(1)
const hasSortOrder = !probe.error

/* ── A. 게스트 ── */
console.log('■ A. 게스트 (localStorage)')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/projects')
  await page.waitForLoadState('networkidle')
  check((await rowNames(page)).length === 0, '게스트: 초기 빈 목록 (헤더만 — 빈 상태 UI 없음)')
  await runCommonScenario(page, '게스트', async (label, pred) => {
    const list = await readGuest(page)
    check(pred(list), label)
  })
  await ctx.close()
}

if (!hasSortOrder) {
  console.log('\n⚠ 스키마 v2(sort_order) 미적용 — B(로그인)·C(마이그레이션)·D(두 탭) 스위트 생략.')
  console.log('  ALTER 적용 후 재실행할 것: alter table public.projects add column sort_order integer not null default 0;')
} else {
  /* ── B. 로그인 (DB) ── */
  console.log('\n■ B. 로그인 (Supabase DB)')
  const EMAIL_B = 'proj-verify-login@example.com'
  await deleteUserByEmail(EMAIL_B)
  const { data: ub } = await admin.auth.admin.createUser({ email: EMAIL_B, password: PW, email_confirm: true })
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await uiLogin(page, EMAIL_B)
    await page.goto(BASE + '/projects')
    await page.waitForLoadState('networkidle')
    check((await rowNames(page)).length === 0, '로그인: 초기 빈 목록 (DB)')
    await runCommonScenario(page, '로그인', async (label, pred) => {
      // 낙관적 업데이트 → persist 는 비동기 — DB 가 조건을 만족할 때까지 폴링
      const ok = await until(async () => pred(await dbRows(ub.user.id)))
      check(!!ok, `${label} [DB 실측]`)
    })
    // 게스트 저장소는 로그인 조작에 오염되지 않아야 한다
    check((await readGuest(page)).length === 0, '로그인: 게스트 localStorage 비오염 (0건 유지)')
    await ctx.close()
  }

  /* ── C. 마이그레이션 ── */
  console.log('\n■ C. 마이그레이션 (원본 보존 + 계정별 기록)')
  const EMAIL_C = 'proj-verify-mig@example.com'
  await deleteUserByEmail(EMAIL_C)
  const { data: uc } = await admin.auth.admin.createUser({ email: EMAIL_C, password: PW, email_confirm: true })
  const SEED = [
    { id: 101, name: '이전-A', starred: true, date: '2024.11.12', sharing: '공유 안함', variables: [] },
    { id: 102, name: '이전-B', starred: false, date: '2023.01.05', sharing: '내가 공유', variables: [], sharedWith: ['x@example.com'] },
  ]
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript((seed) => {
      if (!localStorage.getItem('sospatial_projects'))
        localStorage.setItem('sospatial_projects', JSON.stringify(seed))
    }, SEED)
    const page = await ctx.newPage()
    await page.goto(BASE + '/projects')
    await page.waitForLoadState('networkidle')
    check((await rowNames(page)).join(',') === '이전-A,이전-B', 'C: 게스트 시드 2건 표시')
    await uiLogin(page, EMAIL_C)
    const rows = await until(async () => {
      const r = await dbRows(uc.user.id)
      return r.length === 2 ? r : null
    })
    check(!!rows, 'C: 로그인 직후 DB 로 2건 이전')
    if (rows) {
      check(rows[0].name === '이전-A' && rows[1].name === '이전-B', 'C: 이전 순서 보존 (sort_order)')
      check(rows[0].starred === true && rows[1].sharing === '내가 공유' && rows[1].shared_with[0] === 'x@example.com', 'C: 필드 보존 (starred·sharing·sharedWith)')
      const d0 = new Date(rows[0].created_at)
      check(d0.getFullYear() === 2024 && d0.getMonth() === 10 && d0.getDate() === 12, 'C: 저장일 보존 (created_at=2024.11.12)', rows[0].created_at)
    }
    check((await readGuest(page)).length === 2, 'C: 원본 localStorage 보존 (승인 방식)')
    const mig = await readMigrated(page)
    check((mig[uc.user.id] ?? []).sort().join(',') === '101,102', 'C: 계정별 이전 기록 (id 목록)')
    await page.goto(BASE + '/projects')
    await page.waitForLoadState('networkidle')
    await page.locator('div:has(> span:text-is("이전-A"))').last().waitFor()
    check((await rowNames(page)).length === 2, 'C: /projects 가 DB 목록 표시')
    // 로그아웃 → 게스트 원본 복귀
    await page.locator('nav').getByRole('button', { name: '로그아웃' }).click()
    await page.locator('nav').getByRole('link', { name: '로그인' }).waitFor()
    await until(async () => (await rowNames(page)).length === 2)
    check((await rowNames(page)).join(',') === '이전-A,이전-B', 'C: 로그아웃 → 게스트 원본 복귀')
    // 재로그인 → 중복 이전 없음
    await uiLogin(page, EMAIL_C)
    await page.waitForTimeout(1500)
    check((await dbRows(uc.user.id)).length === 2, 'C: 재로그인 시 중복 이전 없음 (2건 유지)')
    await ctx.close()
  }

  /* ── D. 두 탭 ── */
  console.log('\n■ D. 두 탭 (로그인 전파·진행 중 쓰기 유실)')
  const EMAIL_D = 'proj-verify-tabs@example.com'
  await deleteUserByEmail(EMAIL_D)
  const { data: ud } = await admin.auth.admin.createUser({ email: EMAIL_D, password: PW, email_confirm: true })
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const pageA = await ctx.newPage()
    const pageB = await ctx.newPage()
    await pageB.goto(BASE + '/projects')
    await pageB.waitForLoadState('networkidle')
    // B 가 게스트로 저장 (전환 직전 진행 중 쓰기)
    await saveNewProject(pageB, '탭B-게스트')
    await pageB.goto(BASE + '/projects')
    check((await rowNames(pageB)).includes('탭B-게스트'), 'D: B 탭 게스트 저장')
    // A 탭 로그인
    await uiLogin(pageA, EMAIL_D)
    // 전파 측정 — auth-js 의 탭 간 onAuthStateChange 전파 경로
    const propagated = await until(
      async () => (await pageB.locator('nav').getByRole('button', { name: '로그아웃' }).count()) > 0,
      10000
    )
    check(true, `D: 로그인의 타 탭 전파 — ${propagated ? '전파됨 (B 탭 네비 로그아웃 전환)' : '전파 안 됨 (B 탭은 새로고침 전까지 게스트 UI 유지)'}`)
    // 진행 중이던 게스트 쓰기 유실 여부: DB 로 이전됐거나, localStorage 에 남아 있고 미이전 기록이면 유실 아님
    await pageB.waitForTimeout(2000)
    const inDb = (await dbRows(ud.user.id)).some((r) => r.name === '탭B-게스트')
    const guestList = await readGuest(pageB)
    const mig = await readMigrated(pageB)
    const stillLocal = guestList.some((p) => p.name === '탭B-게스트')
    const migratedIds = new Set(mig[ud.user.id] ?? [])
    const pendingLocal = stillLocal && !guestList.filter((p) => p.name === '탭B-게스트').every((p) => migratedIds.has(p.id))
    check(inDb || pendingLocal, 'D: 전환 순간 진행 중 쓰기 유실 없음', inDb ? 'DB 로 이전됨' : '로컬 보존 + 미이전 기록 (다음 로그인에 이전)')
    // B 탭이 remote 모드로 전환됐다면 B 에서의 쓰기가 DB 에 반영되는지
    if (propagated) {
      await pageB.goto(BASE + '/projects')
      await pageB.waitForLoadState('networkidle')
      const namesB = await until(async () => {
        const ns = await rowNames(pageB)
        return ns.length > 0 ? ns : null
      })
      check(!!namesB, 'D: B 탭 /projects 가 DB 목록 표시 (remote 전환)')
      const target = namesB?.[0]
      if (target) {
        await rowByName(pageB, target).locator('> div').nth(1).click()
        const ok = await until(async () => (await dbRows(ud.user.id)).find((r) => r.name === target)?.starred === true)
        check(!!ok, 'D: B 탭에서의 원격 쓰기 DB 반영 (별 토글)')
      }
      // A 로그아웃 → B 복귀 전파
      await pageA.locator('nav').getByRole('button', { name: '로그아웃' }).click()
      const back = await until(
        async () => (await pageB.locator('nav').getByRole('link', { name: '로그인' }).count()) > 0,
        10000
      )
      check(true, `D: 로그아웃의 타 탭 전파 — ${back ? '전파됨' : '전파 안 됨'}`)
    }
    await ctx.close()
  }

  // 정리
  for (const email of [EMAIL_B, EMAIL_C, EMAIL_D]) await deleteUserByEmail(email)
}

await browser.close()
console.log(`\n총 ${n}항목 — ${fail === 0 ? '전부 통과' : `실패 ${fail}건`}`)
process.exit(fail === 0 ? 0 : 1)
