import type { Metadata } from 'next'
import './globals.css'
import { SiteNav } from '@/components/layout/SiteNav'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: {
    default: 'SoSpatial — AI-Ready 공간 데이터 플랫폼',
    template: '%s · SoSpatial',
  },
  description:
    '흩어진 공간 데이터를 바로 쓸 수 있게. 데이터를 찾고, AI로 분석하고, 전문가와 함께 활용하세요.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      {/*
        flex 컬럼 + main flex-1 로 콘텐츠가 짧아도 푸터가 화면 하단에 붙는다.
        (min-h-screen 만으로는 푸터 아래에 빈 공간이 남는다)
      */}
      <body className="flex min-h-screen flex-col bg-bg font-sans">
        {/*
          Pretendard Variable — jsDelivr CDN (CLAUDE.md 구현 원칙: CDN 방식 유지)
          원본: SoSpatial Platform.dc.html :11
          React 19 는 <link rel="stylesheet"> 를 <head> 로 호이스팅한다.
          (node_modules/next/dist/docs/01-app/01-getting-started/11-css.md:348)
        */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
          precedence="default"
        />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
