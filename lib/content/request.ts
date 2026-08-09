import type { RequestMethodColor } from '@/components/request/RequestMethodCard'
import type { ProcessStep } from '@/components/request/ProcessSteps'

/**
 * Request 랜딩 콘텐츠 — 원본 SoSpatial Platform.dc.html :1161-1279
 * 한국어 카피는 원본 그대로다.
 */
export type RequestMethod = {
  key: 'source' | 'upload' | 'describe'
  n: number
  color: RequestMethodColor
  title: string
  desc: string
  chips: string[]
  href: string
}

/** 요청 방식 3종 (:1176-1232) */
export const REQUEST_METHODS: RequestMethod[] = [
  {
    key: 'source',
    n: 1,
    color: 'blue',
    title: '데이터 소스를 알고 있어요',
    desc: '원하는 데이터 사이트나 출처를 알고 있으면 수집·정제·공간 정합을 함께 합니다.',
    chips: ['data.go.kr', 'KOSIS', 'OpenStreetMap'],
    href: '/request/source',
  },
  {
    key: 'upload',
    n: 2,
    color: 'emerald',
    title: '데이터를 가지고 있어요',
    desc: '보유 중인 데이터를 업로드하면 공간 단위 정합 및 분석 가능한 형태로 가공합니다.',
    chips: ['공간 정합', '포맷 변환', 'API 연동'],
    href: '/request/upload',
  },
  {
    key: 'describe',
    n: 3,
    color: 'violet',
    title: '어떤 데이터가 필요한지만 설명할게요',
    desc: '필요한 분석이나 연구 목적을 설명하시면 적합한 데이터와 공간 단위를 전문가가 제안합니다.',
    chips: ['자유 형식', '전문가 매칭'],
    href: '/request/describe',
  },
]

/** 진행 절차 4단계 (:1241-1275) — 설명의 <br> 은 원본 그대로 유지한다 */
export const PROCESS_STEPS: ProcessStep[] = [
  { label: 'STEP 1', title: '요청 접수', desc: ['요청서 제출 확인'] },
  { label: 'STEP 2', title: '검토 및 상담', desc: ['담당자 검토 후', '일정 안내'] },
  { label: 'STEP 3', title: '데이터 준비', desc: ['맞춤 데이터', '수집·가공'] },
  { label: 'STEP 4', title: '결과 제공', desc: ['데이터 전달', '사후 지원'] },
]
