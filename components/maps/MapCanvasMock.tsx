import { cn } from '@/lib/cn'
import { HEAT_BLOBS, MAP_MARKERS } from '@/lib/content/maps'

/**
 * 지도 캔버스 목업 — 원본 :1094(그리드), :1105-1109(블롭), :1112-1129(마커)
 *
 * ★ 3단계 교체 경계: 이 파일 전체가 **지도 SDK 로 대체될 목업**이다.
 *   그리드·히트맵 블롭·마커는 전부 CSS 로 그린 정적 장식 — SDK 도입 시 이 컴포넌트를
 *   지도 인스턴스로 갈아끼우면 된다. MapPane 의 오버레이(검색바·줌·범례·라벨)는 남는다.
 *
 *   그리드  32px, fill-025 (홈 목업의 fill-03 과 다름 — 별개)
 *   블롭    radial-gradient + blur — 홈 blob 토큰과 알파·크기 전부 달라 콘텐츠 파일의
 *           리터럴 값 사용 (lib/content/maps.tsx 주석 참조)
 *   마커    1위 22px chart-green/보더 2.5px/글자 #0A0A0A, 2·3위 20/18px steel/2px/흰 글자
 *           라벨 10px bg scrim-55 radius 4
 *
 * 그라디언트는 값에 쉼표가 있어 Tailwind 임의값 대신 style 로 준다 (MapAnalysisMock 선례).
 */
export function MapCanvasMock() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-fill-025) 1px, transparent 1px),' +
            'linear-gradient(90deg, var(--color-fill-025) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {HEAT_BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.w,
            height: b.h,
            background: `radial-gradient(ellipse, ${b.color} 0%, transparent 70%)`,
            filter: `blur(${b.blur}px)`,
          }}
        />
      ))}

      {MAP_MARKERS.map((m) => (
        <div
          key={m.rank}
          className="absolute flex flex-col items-center gap-0.75"
          style={{ top: m.top, left: m.left }}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-inverse shadow-[0_2px_8px_var(--color-scrim-40)]',
              m.primary
                ? 'border-[2.5px] bg-chart-green text-marker-ink'
                : 'border-2 bg-steel text-ink'
            )}
            style={{ width: m.size, height: m.size }}
          >
            <span className="text-9 font-extrabold">{m.rank}</span>
          </div>
          <span className="whitespace-nowrap rounded-tag bg-scrim-55 px-1.5 py-0.5 text-10 font-semibold text-ink">
            {m.label}
          </span>
        </div>
      ))}
    </>
  )
}
