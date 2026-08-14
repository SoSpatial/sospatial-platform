/**
 * /maps 대화·지도 목업 콘텐츠 — 원본 SoSpatial Platform.dc.html :1020-1150
 *
 * ★ 3단계 교체 경계: 이 파일 전체가 **버려질 목업 데이터**다.
 *   실 AI 연동 시 대화(메시지·순위·칩)는 응답 스트림으로, 마커·범례는 분석 결과로
 *   대체된다. 채팅 패널·지도 오버레이의 프레임(components/maps/)은 남는다.
 *   문구·수치·시각("오후 2:14")은 원본 그대로다.
 */

/** AI 인사 (:1027) — strong 액센트 포함 리치 텍스트라 JSX 로 둔다 */
export const AI_GREETING = (
  <>
    안녕하세요! 저는 SoSpatial 공간분석 AI입니다.
    <br />
    <br />
    궁금한 걸 <strong className="font-bold text-accent">평소 말로</strong> 물어보시면, 알맞은
    데이터를 골라 지도와 근거로 답해드릴게요.
  </>
)

/** 사용자 질문 (:1033-1034) */
export const USER_MESSAGE = {
  text: '서울에서 유동인구가 많고 미세먼지가 낮은 지역은 어디야?',
  time: '오후 2:14',
}

/** AI 분석 본문 (:1044) */
export const AI_ANALYSIS_INTRO = (
  <>
    <strong className="font-bold text-accent">생활이동인구</strong>와{' '}
    <strong className="font-bold text-accent">미세먼지 농도</strong>를 결합해 분석했어요. 지도에
    복합 지수를 표시했습니다.
  </>
)

/** 순위 카드 3개 (:1046-1066) — 1위만 green 강조 */
export type RankRow = { rank: number; name: string; score: string; top: boolean }
export const RANKS: RankRow[] = [
  { rank: 1, name: '마포구 홍대 일대', score: '94점', top: true },
  { rank: 2, name: '성동구 성수 일대', score: '87점', top: false },
  { rank: 3, name: '강남구 역삼 일대', score: '81점', top: false },
]

export const REPORT_BUTTON_LABEL = '이 분석을 보고서로 받기 →'

/** 추천 칩 (:1078-1080) */
export const SUGGESTED_CHIPS = ['강남구 더 자세히', '시간대별 비교', '대중교통 포함']

export const INPUT_PLACEHOLDER = '예: 어린이 통학이 위험한 곳은 어디인가요?'
export const CHAT_CAPTION =
  '분석은 공개 공간데이터를 기반으로 하며, 예산 신청 근거 자료로 활용할 수 있습니다.'

/** 지도 마커 3개 (:1112-1129) — 크기·색·좌표 전부 원본 인라인 값 */
export type MapMarker = {
  rank: number
  label: string
  top: string
  left: string
  size: number
  /** 1위만 chart-green + 흰 글자 아님(#0A0A0A) + 보더 2.5px */
  primary: boolean
}
export const MAP_MARKERS: MapMarker[] = [
  { rank: 1, label: '홍대', top: '30%', left: '30%', size: 22, primary: true },
  { rank: 2, label: '성수', top: '24%', left: '54%', size: 20, primary: false },
  { rank: 3, label: '역삼', top: '50%', left: '50%', size: 18, primary: false },
]

/**
 * 히트맵 블롭 5개 (:1105-1109)
 * ⚠ 홈 MapAnalysisMock 의 blob 토큰(알파 0.55/0.45/0.5/0.4)과 **알파·크기·blur·좌표가
 *   전부 다르다** — 기저색 계열만 같을 뿐 별개 목업이다. 통합 금지 (2026-08-14 승인).
 */
export type HeatBlob = {
  top: string
  left: string
  w: number
  h: number
  color: string
  blur: number
}
export const HEAT_BLOBS: HeatBlob[] = [
  { top: '28%', left: '28%', w: 200, h: 180, color: 'rgba(52,211,153,0.7)', blur: 30 },
  { top: '22%', left: '52%', w: 160, h: 140, color: 'rgba(52,211,153,0.5)', blur: 25 },
  { top: '48%', left: '48%', w: 140, h: 120, color: 'rgba(250,204,21,0.4)', blur: 22 },
  { top: '38%', left: '20%', w: 110, h: 100, color: 'rgba(251,146,60,0.35)', blur: 18 },
  { top: '58%', left: '55%', w: 100, h: 90, color: 'rgba(239,68,68,0.38)', blur: 16 },
]

export const MAP_SEARCH_LABEL = '지역 검색 · 서울특별시'
export const LEGEND_TITLE = '유동인구 × 미세먼지 적합도'
export const MAP_BOTTOM_LABEL = '서울 · 250m 격자 · 표시 3곳'
