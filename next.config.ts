import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * dev 오버레이 인디케이터를 끈다.
   * 켜져 있으면 좌하단 배지가 검증용 스크린샷에 찍혀 reference 비교를 방해한다.
   * 컴파일·런타임 에러는 그대로 표시된다.
   * (node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.md:22)
   */
  devIndicators: false,
}

export default nextConfig
