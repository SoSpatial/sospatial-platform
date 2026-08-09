import type { ComponentType } from 'react'
import {
  GridIcon,
  SearchIcon,
  ZapIcon,
  ClockIcon,
  UsersIcon,
  BarChartIcon,
  HeartIcon,
  TruckIcon,
  BuildingIcon,
  CloudIcon,
  BookIcon,
  ClockHandIcon,
} from '@/components/icons/api'

type IconComponent = ComponentType<{ size?: number }>

/**
 * API 페이지 콘텐츠
 * 원본: SoSpatial Platform.dc.html :566-784
 * 모든 한국어 카피는 원본 그대로다 (CLAUDE.md: 실제 의도된 카피이므로 그대로 보존).
 */

export type ApiFeature = { icon: IconComponent; title: string; desc: string }

/** 특징 밴드 4종 (:595-630) */
export const API_FEATURES: ApiFeature[] = [
  {
    icon: GridIcon,
    title: '표준화된 공간 단위',
    desc: '행정구역, 격자(100m~1km) 등 표준 단위로 제공',
  },
  {
    icon: SearchIcon,
    title: '공간 쿼리 지원',
    desc: '반경, 영역, 비교, 교차 등 다양한 공간 분석 지원',
  },
  {
    icon: ZapIcon,
    title: 'AI-Ready 데이터',
    desc: '바로 분석과 모델링에 활용 가능한 정제된 구조로 제공',
  },
  {
    icon: ClockIcon,
    title: '시계열 제공',
    desc: '연도/분기/월/일 단위로 시간에 따른 변화 분석 가능',
  },
]

export type ApiCardItem = {
  icon: IconComponent
  name: string
  path: string
  desc: string
  tags: string[]
}

/** 전체 API 카드 8종 (:641-778) */
export const API_CARDS: ApiCardItem[] = [
  {
    icon: UsersIcon,
    name: 'Population API',
    path: '/api/population',
    desc: '인구, 세대, 연령구조, 외국인 등 인구통계 데이터를 제공합니다.',
    tags: ['인구', '세대', '연령구조'],
  },
  {
    icon: BarChartIcon,
    name: 'Business API',
    path: '/api/business',
    desc: '사업체 수, 업종, 개폐업, 공실률 등 사업체 관련 데이터를 제공합니다.',
    tags: ['사업체수', '업종', '개폐업'],
  },
  {
    icon: HeartIcon,
    name: 'Health API',
    path: '/api/health',
    desc: '건강지표, 질병발생, 취약성 지수, 환경노출 데이터를 제공합니다.',
    tags: ['건강지표', '환경'],
  },
  {
    icon: TruckIcon,
    name: 'Mobility API',
    path: '/api/mobility',
    desc: '이동량, 대중교통, 접근성, 통행패턴 등 이동 데이터를 제공합니다.',
    tags: ['대중교통', '이동량'],
  },
  {
    icon: BuildingIcon,
    name: 'Housing API',
    path: '/api/housing',
    desc: '주택 유형, 노후도, 공시가격, 거래 데이터를 제공합니다.',
    tags: ['주택', '부동산'],
  },
  {
    icon: CloudIcon,
    name: 'Environment API',
    path: '/api/environment',
    desc: '대기질, 기온, 강수, 소음 등 환경 데이터를 제공합니다.',
    tags: ['대기질', '기후'],
  },
  {
    icon: BookIcon,
    name: 'Education API',
    path: '/api/education',
    desc: '학교 위치, 학생수, 학원 분포, 교육 접근성 데이터를 제공합니다.',
    tags: ['학교', '학원'],
  },
  {
    icon: ClockHandIcon,
    name: 'Economy API',
    path: '/api/economy',
    desc: '매출, 소비, 카드 이용, 경제활동 관련 데이터를 제공합니다.',
    tags: ['매출', '소비'],
  },
]
