/**
 * SITE_URL 폴백 우선순위 검증 — 환경변수 조합별로 빌드해보지 않고 모듈만 평가한다.
 * lib/site.ts 는 TS 라 자식 프로세스에서 node --experimental-strip-types 로 읽는다.
 */
import { execFileSync } from 'node:child_process'

const CASES = [
  { label: '로컬 (아무것도 없음)', env: {} },
  {
    label: 'Vercel 1차 배포 (시스템 변수만)',
    env: { VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'sospatial-platform.vercel.app' },
  },
  {
    label: 'Vercel + 커스텀 도메인 자동',
    env: { VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'sospatial.kr' },
  },
  {
    label: 'NEXT_PUBLIC_SITE_URL 우선',
    env: {
      VERCEL: '1',
      VERCEL_PROJECT_PRODUCTION_URL: 'sospatial-platform.vercel.app',
      NEXT_PUBLIC_SITE_URL: 'https://www.sospatial.kr',
    },
  },
  { label: '끝 슬래시 제거', env: { NEXT_PUBLIC_SITE_URL: 'https://sospatial.kr/' } },
  { label: 'Vercel 인데 시스템 변수 꺼짐 (경고 나와야 함)', env: { VERCEL: '1' } },
]

const CODE = `
import { SITE_URL, SITE_URL_SOURCE, SITE_URL_IS_FALLBACK } from './lib/site.ts'
console.log(JSON.stringify({ SITE_URL, SITE_URL_SOURCE, SITE_URL_IS_FALLBACK }))
`

for (const c of CASES) {
  const out = execFileSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', CODE], {
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: '', VERCEL: '', VERCEL_PROJECT_PRODUCTION_URL: '', ...c.env },
    encoding: 'utf8',
    // console.warn 은 stderr 로 나가므로 그대로 흘려보내 눈으로 확인한다
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  const lines = out.trim().split('\n')
  const json = JSON.parse(lines.pop())
  console.log(`${c.label}`)
  console.log(`   → ${json.SITE_URL}   (source: ${json.SITE_URL_SOURCE}, fallback: ${json.SITE_URL_IS_FALLBACK})`)
  lines.filter(Boolean).forEach((l) => console.log(`   로그: ${l}`))
}
