import type { Metadata } from 'next'
import { DesktopOnly } from '@/components/ui/DesktopOnly'
import { MapsView } from '@/components/maps/MapsView'

export const metadata: Metadata = {
  // 앱 작업 화면 — /data/select·/projects 와 같은 취급으로 noindex 유지·sitemap 미포함
  robots: { index: false, follow: true },
  title: '지도·시각화',
  description: '지도 위에서 데이터를 시각화하고, 대화형 AI로 공간 패턴을 분석합니다.',
}

/**
 * 지도·시각화 — 원본 :996-1154 (100% 정적 목업 — 바인딩·핸들러 없음)
 * 검증 기준: reference/06-maps.png (1440×964 = 네비 64 + 지도 900)
 * md 미만은 DesktopOnly (CLAUDE.md 2단계 반응형 범위).
 */
export default function MapsPage() {
  return (
    <DesktopOnly title="지도·시각화">
      <MapsView />
    </DesktopOnly>
  )
}
