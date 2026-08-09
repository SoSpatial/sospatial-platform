import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * robots.txt
 *
 * 크롤링 자체는 전부 허용하고, 색인 제외는 페이지별 metadata 의
 * robots: { index: false } 로 처리한다.
 * (Disallow 로 막으면 크롤러가 noindex 지시를 읽지 못해 오히려 색인이 남을 수 있다)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
