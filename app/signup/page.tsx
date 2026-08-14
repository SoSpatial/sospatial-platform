import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  // 인증 화면은 색인 대상이 아니다 (CLAUDE.md 색인 정책 — 작업 화면과 동일 취급)
  robots: { index: false, follow: true },
  title: '회원가입',
  description: '이메일과 비밀번호만으로 SoSpatial 을 시작하세요.',
}

/** 3단계 신규 화면 — 원본에 없음 (reference 검증 제외, 기존 디자인 시스템만 사용) */
export default function SignupPage() {
  return <SignupForm />
}
