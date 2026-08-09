import type { FeatureLink } from '@/components/home/FeatureCard'

/**
 * 홈 CORE FEATURES 카드 콘텐츠
 * 원본: SoSpatial Platform.dc.html :118-214
 * 한국어 카피는 원본 그대로다.
 */
export type FeatureCardContent = {
  key: 'data' | 'maps' | 'request'
  title: string
  desc: string
  chips: string[]
  links: FeatureLink[]
}

export const FEATURE_CARDS: FeatureCardContent[] = [
  {
    key: 'data',
    title: '바로 쓰는 데이터',
    desc: '표준화된 공간 데이터를 검색·미리보기 후 원하는 포맷으로 내려받습니다.',
    chips: ['데이터 다운로드', 'API 연동'],
    links: [
      { label: '데이터 둘러보기', href: '/data' },
      { label: 'API 연동', href: '/api' },
    ],
  },
  {
    key: 'maps',
    title: '분석·시각화',
    desc: '지도 위에서 데이터를 시각화하고, 대화형 AI로 공간 패턴을 분석합니다.',
    chips: ['지도 분석', '시각화', 'AI 상담'],
    links: [{ label: '분석 시작하기', href: '/maps' }],
  },
  {
    key: 'request',
    title: '인사이트·컨설팅',
    desc: '실제 분석 사례를 보고, 우리 지역·업종에 맞는 데이터 컨설팅을 의뢰합니다.',
    chips: ['컨설팅 사례', '맞춤 의뢰'],
    links: [{ label: '사례·컨설팅 보기', href: '/request' }],
  },
]
