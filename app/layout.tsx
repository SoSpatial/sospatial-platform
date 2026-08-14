import type { Metadata } from 'next'
import './globals.css'
import { SiteNav } from '@/components/layout/SiteNav'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FooterGate } from '@/components/layout/FooterGate'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // 페이지별 title/description 은 template 을 통해 OG 에도 자동 반영된다.
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-bg font-sans">
        {/*
          Pretendard Variable — jsDelivr CDN (CLAUDE.md 구현 원칙: CDN 방식 유지)
          원본: SoSpatial Platform.dc.html :11
          React 19 는 <link> 를 <head> 로 호이스팅한다.
          (node_modules/next/dist/docs/01-app/01-getting-started/11-css.md:348)

          preconnect 를 함께 둬서 DNS·TLS 핸드셰이크를 크리티컬 패스에서 앞당긴다.
          이 스타일시트는 precedence 때문에 렌더 블로킹이라 연결 지연이 곧 첫 페인트 지연이다.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
          precedence="default"
        />
        <SiteNav />
        <main className="flex-1">{children}</main>
        {/* /maps 는 100vh 앱 화면 — 푸터 미렌더 (FooterGate 주석 참조) */}
        <FooterGate>
          <SiteFooter />
        </FooterGate>
      </body>
    </html>
  )
}
