import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE_NAME } from '@/lib/site'

/**
 * 루트 OG 이미지 — 전 페이지가 상속한다. 페이지별 개별 이미지는 만들지 않는다.
 *
 * 폰트는 assets/Pretendard-Bold.subset.woff (OG 전용 서브셋).
 * 이 파일에 쓰는 글자를 바꾸면 scripts/subset-og-font.sh 의 문자 목록도 함께 갱신할 것 —
 * 서브셋에 없는 글자는 조용히 두부(.notdef)로 나온다.
 * Satori 는 WOFF2 를 지원하지 않는다. WOFF/TTF/OTF 만 쓸 것.
 */
export const alt = 'SoSpatial — AI-Ready 공간 데이터 플랫폼'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#181818'
const ACCENT = '#C4A882'

export default async function Image() {
  const font = await readFile(join(process.cwd(), 'assets', 'Pretendard-Bold.subset.woff'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          padding: '72px 80px',
          fontFamily: 'Pretendard',
        }}
      >
        {/* 로고 마크 + 워드마크 — components/icons/LogoMark.tsx 와 같은 기하 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 44, height: 44, gap: 6.6 }}>
            <div style={{ width: 18.7, height: 18.7, borderRadius: 4.4, background: ACCENT }} />
            <div style={{ width: 18.7, height: 18.7, borderRadius: 4.4, background: ACCENT, opacity: 0.35 }} />
            <div style={{ width: 18.7, height: 18.7, borderRadius: 4.4, background: ACCENT, opacity: 0.35 }} />
            <div style={{ width: 18.7, height: 18.7, borderRadius: 4.4, background: ACCENT }} />
          </div>
          <div style={{ fontSize: 36, letterSpacing: '-0.02em', color: '#FFFFFF' }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, letterSpacing: '0.14em', color: ACCENT }}>AI-READY</div>
          <div
            style={{
              display: 'flex',
              fontSize: 82,
              lineHeight: 1.22,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              marginTop: 18,
            }}
          >
            공간 데이터 플랫폼
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              letterSpacing: '-0.015em',
              color: 'rgba(255,255,255,0.55)',
              marginTop: 26,
            }}
          >
            흩어진 공간 데이터를 바로 쓸 수 있게
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 64, height: 3, background: ACCENT }} />
          <div style={{ fontSize: 24, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.4)' }}>
            찾고 · 분석하고 · 함께 활용하세요
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }],
    }
  )
}
