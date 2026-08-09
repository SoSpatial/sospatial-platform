import { cn } from '@/lib/cn'

/**
 * 페이지 루트 래퍼
 * 원본은 모든 페이지 루트 div 에 animation: pageEnter 0.35s ease 를 준다.
 * (SoSpatial Platform.dc.html :65, :223, :568, :788, :997, :1158)
 */
export function PageRoot({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('animate-page-enter', className)}>{children}</div>
}
