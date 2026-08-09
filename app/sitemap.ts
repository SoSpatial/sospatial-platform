import type { MetadataRoute } from 'next'
import { SITE_URL, SITEMAP_ROUTES } from '@/lib/site'

/**
 * sitemap.xml
 *
 * "준비 중" 플레이스홀더(/data, /projects, /maps)와 아직 내용이 없는
 * /terms, /privacy 는 제외한다. 해당 페이지에는 robots: { index: false } 도 함께 준다.
 *
 * lastModified 는 빌드 시각으로 고정한다. 정적 사이트라 재배포 시점이 곧 갱신 시점이다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return SITEMAP_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : 0.8,
  }))
}
