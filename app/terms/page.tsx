import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { TERMS } from '@/lib/content/legal'

export const metadata: Metadata = {
  // 실제 내용이 채워져 색인 대상 — noindex 해제 + sitemap 포함 (CLAUDE.md 색인 정책)
  title: '이용약관',
  description: 'SoSpatial 서비스 이용약관.',
}

/** 3단계 5번 — MVP 초안 (placeholder 3종은 lib/content/legal.ts 주석 참조) */
export default function TermsPage() {
  return <LegalPage doc={TERMS} />
}
