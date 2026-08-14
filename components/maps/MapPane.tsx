import { GuideSearchIcon } from '@/components/icons/guide'
import { MapCanvasMock } from '@/components/maps/MapCanvasMock'
import { MAP_SEARCH_LABEL, LEGEND_TITLE, MAP_BOTTOM_LABEL } from '@/lib/content/maps'

/**
 * 지도 영역 — 원본 :1093-1151. flex-1 / relative / bg #162231 / overflow hidden
 *
 * ★ 3단계 교체 경계: 이 프레임과 오버레이 4종(검색바·줌·범례·하단 라벨)은 **남는
 *   구조**다. 내용물(MapCanvasMock)만 지도 SDK 로 교체된다.
 *
 *   검색바   top 16 / left 16 / right 72 / z 10 — 라이트 UI(white 0.92, #888, #555).
 *            원본이 input 이 아니라 span 이다 (정적 표시 — 그대로 재현)
 *   줌       top 60 / right 16 — 32px 흰 버튼 2개, − 위에 scrim-08 구분선, 무동작(원본)
 *   범례     bottom 48 / left 16 — bg rgba(18,28,38,0.92) + backdrop-blur 8 / radius 10
 *            그라디언트 red → amber → chart-green (:1134)
 *   하단 라벨 bottom 16 / 중앙 — fill-06 + blur 8 + line-08 + pill
 */
export function MapPane() {
  return (
    <div className="relative flex-1 overflow-hidden bg-map-bg">
      <MapCanvasMock />

      {/* 검색바 :1097-1102 */}
      <div className="absolute left-4 right-18 top-4 z-10">
        <div className="flex items-center gap-2 rounded-ctrl bg-map-light-92 px-3.5 py-2.25">
          <span className="text-map-ink-soft">
            <GuideSearchIcon size={14} />
          </span>
          <span className="text-13 text-map-ink">{MAP_SEARCH_LABEL}</span>
        </div>
      </div>

      {/* 줌 :1142-1145 — 원본에 onClick 없음 (무동작) */}
      <div className="absolute right-4 top-15 overflow-hidden rounded-ctrl shadow-[0_2px_10px_var(--color-scrim-30)]">
        <button
          type="button"
          aria-label="확대"
          className="block h-8 w-8 cursor-pointer bg-map-light-90 text-18 text-map-ink-zoom hover:bg-inverse"
        >
          +
        </button>
        <button
          type="button"
          aria-label="축소"
          className="block h-8 w-8 cursor-pointer border-t border-scrim-08 bg-map-light-90 text-18 text-map-ink-zoom hover:bg-inverse"
        >
          −
        </button>
      </div>

      {/* 범례 :1132-1139 */}
      <div className="absolute bottom-12 left-4 rounded-btn border border-line-10 bg-map-panel px-3.5 py-2.75 backdrop-blur-[8px]">
        <p className="mb-1.75 text-10-5 font-semibold text-ink-55">{LEGEND_TITLE}</p>
        <div
          className="mb-1 h-1.75 w-25 rounded-tag"
          style={{
            background:
              'linear-gradient(to right, var(--color-red), var(--color-amber), var(--color-chart-green))',
          }}
        />
        <div className="flex w-25 justify-between">
          <span className="text-9-5 text-ink-35">낮음</span>
          <span className="text-9-5 text-ink-35">높음</span>
        </div>
      </div>

      {/* 하단 라벨 :1148-1150 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill border border-line-08 bg-fill-06 px-3.5 py-1.25 backdrop-blur-[8px]">
        <p className="text-11 text-ink-40">{MAP_BOTTOM_LABEL}</p>
      </div>
    </div>
  )
}
