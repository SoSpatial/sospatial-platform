import type { TopicKey } from './topics'

/**
 * /data landing 콘텐츠
 * 원본: SoSpatial Platform.dc.html :371-561. 문구·수치 전부 원본 그대로.
 * landing 마크업은 100% 정적이다 — 카드 개수·랭킹·칩 모두 하드코딩이며
 * TOPIC_DATA 에서 파생되지 않는다.
 */

/**
 * 인기 검색 칩 :387-390
 * 키워드 검색이 아니라 주제로 매핑돼 select 로 진입한다 (data-topic 속성).
 */
export type PopularKeyword = { label: string; topic: TopicKey }
export const POPULAR_KEYWORDS: PopularKeyword[] = [
  { label: '생활인구', topic: '인구·사회' },
  { label: '상권', topic: '경제·산업' },
  { label: '고령인구', topic: '인구·사회' },
  { label: '대기질', topic: '환경·기후' },
]

/** 주제 카드 8장 :418-473 — 개수는 원본 하드코딩 값 */
export type DataCategory = { topic: Exclude<TopicKey, '전체'>; count: number }
export const DATA_CATEGORIES: DataCategory[] = [
  { topic: '인구·사회', count: 214 },
  { topic: '교통·이동', count: 186 },
  { topic: '경제·산업', count: 158 },
  { topic: '건강·복지', count: 97 },
  { topic: '안전·재난', count: 73 },
  { topic: '환경·기후', count: 64 },
  { topic: '국토·도시', count: 142 },
  { topic: '기타·융합', count: 106 },
]

/**
 * 지금 인기 있는 데이터 랭킹 8행 :488-553
 * meta 는 원본 문자열 리터럴 그대로 둔다 — category/unit/region 으로
 * 분해하면 조합 규칙을 발명하게 된다. 7행 "안전·복지"는 TOPIC_DATA 에
 * 없는 표기지만 원본 :541 그대로다 (정리하지 말 것).
 */
export type PopularDataset = { name: string; meta: string }
export const POPULAR_DATASETS: PopularDataset[] = [
  { name: '생활 이동인구 (OD)', meta: '교통·이동 · 격자 250m · 전국' },
  { name: '사업체 분포 (업종별)', meta: '경제·산업 · 격자 100m · 전국' },
  { name: '미세먼지 농도 (시간별)', meta: '환경·기후 · 격자 1km · 전국' },
  { name: '고령인구 비율', meta: '인구·사회 · 행정동 · 전국' },
  { name: '토지이용 현황', meta: '국토·도시 · 집계구 · 전국' },
  { name: '지하철역 이용객 (시간별)', meta: '교통·이동 · 시군구 · 전국' },
  { name: '범죄 발생 건수', meta: '안전·복지 · 행정동 · 전국' },
  { name: '공시지가', meta: '경제·산업 · 시군구 · 전국' },
]

/** 접힌 상태에서 보이는 행 수 — 원본은 :488-519 4행이 sc-if 밖의 정적 마크업 */
export const POPULAR_COLLAPSED_COUNT = 4
