import { PageRoot } from '@/components/layout/PageRoot'
import { ChatPanel } from '@/components/maps/ChatPanel'
import { MapPane } from '@/components/maps/MapPane'

/**
 * 지도·시각화 — 원본 :996-1154
 * 루트 :997 — height calc(100vh − 64px) / flex / overflow hidden 풀블리드 앱 화면.
 * 페이지 스크롤 없음 (메시지 영역만 내부 스크롤). 푸터는 이 라우트에서 렌더하지 않는다
 * (FooterGate — CLAUDE.md "원본과 달라지는 부분" 1번).
 */
export function MapsView() {
  return (
    <PageRoot className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg">
      <ChatPanel />
      <MapPane />
    </PageRoot>
  )
}
