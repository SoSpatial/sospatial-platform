/**
 * 요청 방식 카드의 미리보기 블록 — 카드마다 구조가 달라 개별 컴포넌트로 둔다.
 * 원본: :1182 (소스) / :1200-1203 (업로드) / :1221-1223 (설명)
 */

/** 1번 — 인풋 모양 한 줄 (:1182) */
export function SourcePreview() {
  return (
    <div className="mb-3.5 rounded-input border border-line-07 bg-fill-03 px-3 py-2.25 text-11-5 text-ink-22">
      예) data.go.kr, KOSIS, census.gov 등
    </div>
  )
}

/** 2번 — 점선 드롭존 (:1200-1203) */
export function UploadPreview() {
  return (
    <div className="mb-3.5 rounded-field border-[1.5px] border-dashed border-line-10 bg-fill-03 p-4 text-center">
      <p className="text-12 text-ink-32">파일을 드래그하거나 클릭하여 업로드하세요</p>
      <p className="mt-1 text-11 text-ink-20">CSV, Excel, Shapefile, GeoJSON 지원</p>
    </div>
  )
}

/** 3번 — 예시 문장 2줄 (:1221-1223) */
export function DescribePreview() {
  return (
    <div className="mb-3.5 rounded-field border border-line-07 bg-fill-03 p-3">
      <p className="text-11-5 leading-1-6 text-ink-28">
        예: 서울시 상권 변화와 유동인구의 관계를 분석하고 싶어요.
        <br />예: 미세먼지 높은 지역의 건강 영향 데이터가 필요해요.
      </p>
    </div>
  )
}
