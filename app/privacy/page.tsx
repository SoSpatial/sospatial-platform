import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { PRIVACY } from '@/lib/content/legal'

export const metadata: Metadata = {
  // 실제 내용이 채워져 색인 대상 — noindex 해제 + sitemap 포함 (CLAUDE.md 색인 정책)
  title: '개인정보처리방침',
  description: 'SoSpatial 개인정보처리방침.',
}

/** 3단계 5번 — MVP 초안 (placeholder 3종은 lib/content/legal.ts 주석 참조) */
export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />
}
