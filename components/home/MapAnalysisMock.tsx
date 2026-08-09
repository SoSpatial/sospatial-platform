/**
 * 카드2 목업 — 지도 히트맵 + 대화 말풍선 (원본 :157-164)
 *
 * 래퍼   height 185px / position relative / overflow hidden / flex-shrink 0
 *        ★ 카드3 과 마찬가지로 원본에 height 선언이 있다. 그대로 유지한다.
 *        패딩이 없어 그리드가 카드 폭 전체를 덮는다.
 *
 * 그리드 position absolute / inset 0
 *        linear-gradient 2겹(가로선·세로선) 각 1px, rgba(255,255,255,0.03)
 *        background-size 22px 22px
 *
 * 블롭 4개  position absolute / radial-gradient(ellipse, 색 0%, transparent 70%)
 *   1  top 10% left 15%  130×110  green  0.55  blur 22px
 *   2  top 40% left 44%  100× 90  yellow 0.45  blur 16px
 *   3  top  5% left 58%   90× 80  blue   0.50  blur 16px
 *   4  top 55% left  6%   70× 65  orange 0.40  blur 12px
 *
 * 말풍선 2개 (11px / line-height 1.5 / padding 7px 12px)
 *   질문  bottom 36 right 16 / fill-10 / ink-85 / 500 / max-w 170
 *         radius 10px 10px 2px 10px  (우하단이 2px)
 *   답변  bottom  8 left  16 / scrim-35 / ink-65 / max-w 200
 *         radius 10px 10px 10px 2px  (좌하단이 2px — 질문과 좌우 반전)
 */
const BLOBS = [
  { pos: 'top-[10%] left-[15%]', size: 'h-[110px] w-[130px]', color: 'var(--color-blob-green)', blur: 'blur-[22px]' },
  { pos: 'top-[40%] left-[44%]', size: 'h-[90px] w-[100px]', color: 'var(--color-blob-yellow)', blur: 'blur-[16px]' },
  { pos: 'top-[5%] left-[58%]', size: 'h-[80px] w-[90px]', color: 'var(--color-blob-blue)', blur: 'blur-[16px]' },
  { pos: 'top-[55%] left-[6%]', size: 'h-[65px] w-[70px]', color: 'var(--color-blob-orange)', blur: 'blur-[12px]' },
]

export function MapAnalysisMock() {
  return (
    <div className="relative h-[185px] shrink-0 overflow-hidden">
      {/*
        2겹 linear-gradient 는 값 안에 쉼표가 들어가 Tailwind 임의값으로 쓰면
        가독성이 크게 떨어져 인라인 스타일로 둔다. 색은 토큰을 참조한다.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-fill-03) 1px, transparent 1px),' +
            'linear-gradient(90deg, var(--color-fill-03) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {BLOBS.map((b, i) => (
        <div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.blur}`}
          style={{ background: `radial-gradient(ellipse, ${b.color} 0%, transparent 70%)` }}
        />
      ))}

      <div className="absolute right-4 bottom-9 max-w-[170px] rounded-btn rounded-br-[2px] bg-fill-10 px-3 py-1.75 text-11 leading-1-5 font-medium text-ink-85">
        출산율이 가장 낮은 지역은?
      </div>
      <div className="absolute bottom-2 left-4 max-w-[200px] rounded-btn rounded-bl-[2px] bg-scrim-35 px-3 py-1.75 text-11 leading-1-5 text-ink-65">
        경북·서울 순으로 낮게 나타납니다
      </div>
    </div>
  )
}
