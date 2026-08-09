# SoSpatial Platform

AI-Ready 공간 데이터 플랫폼의 웹 프론트엔드.

Claude Design에서 내보낸 HTML 프로토타입(`design_handoff_sospatial/`)을
Next.js App Router 프로젝트로 옮긴 것이다. 원본의 색상·여백·타이포그래피를
그대로 유지하는 것이 최우선 제약이며, 모든 페이지는 `reference/`의 원본 캡처와
픽셀 단위로 대조해 검증한다.

> **작업하기 전에 [`CLAUDE.md`](./CLAUDE.md)를 먼저 읽을 것.**
> 확정된 요구사항, 구현 원칙, 페이지별 검증 절차, 원본과 의도적으로 다르게 둔 항목이
> 전부 거기에 있다. 이 README는 실행 방법만 다룬다.

## 스택

| | |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 — 설정 파일 없이 `app/globals.css`의 `@theme` 블록으로 토큰 정의 |
| 폰트 | Pretendard Variable (jsDelivr CDN). `next/font` 미사용 |
| 아이콘 | 원본 인라인 SVG를 그대로 유지. 아이콘 라이브러리 미사용 |
| 검증 | Playwright — `scripts/`의 스크립트로 reference PNG와 픽셀 대조 |

의존성은 `next` / `react` / `react-dom` 3개뿐이다. UI 라이브러리는 쓰지 않는다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # 프로덕션 빌드 (전 라우트 정적 생성)
npm run start      # 빌드 결과 실행
npm run lint
```

### 환경변수

```bash
cp .env.example .env.local
```

`NEXT_PUBLIC_SITE_URL` 하나뿐이고 배포 도메인을 넣는다.
사이트 절대 URL(`metadataBase` · OG · `sitemap.xml` · `robots.txt`)은 아래 순서로 정해진다.

```
NEXT_PUBLIC_SITE_URL  >  VERCEL_PROJECT_PRODUCTION_URL  >  http://localhost:3000
```

로컬에서는 비워두면 되고, **Vercel에 배포할 때도 보통 비워둬도 된다** —
2순위를 Vercel이 자동으로 채운다(프로젝트 설정의
*Enable access to System Environment Variables*가 켜져 있어야 한다).
Vercel이 아닌 곳에 배포하거나 정본 도메인을 직접 지정하려면 1순위에 넣는다.
셋 다 없어 localhost로 떨어진 채 배포되면 빌드 로그에 경고가 뜬다.

우선순위 회귀 검증: `node scripts/check-site-url.mjs`

## 폴더 구조

```
app/                      라우트 (App Router)
  layout.tsx              공통 레이아웃 · 전역 metadata · Pretendard <link>
  globals.css             ★ 디자인 토큰 전체 (@theme). 색상·폰트 크기·간격·브레이크포인트
  page.tsx                홈 /
  api/                    /api
  request/                /request + source · upload · describe (4개 실제 라우트)
  data/ projects/ maps/   "준비 중" 플레이스홀더 (noindex)
  terms/ privacy/         푸터 링크 대상 플레이스홀더 (noindex)
  icon.svg                파비콘 32×32
  apple-icon.png          홈 화면 아이콘 180×180 (알파 없는 RGB)
  opengraph-image.tsx     OG 이미지 1200×630 — 루트 1개를 전 페이지가 상속
  sitemap.ts robots.ts

components/
  layout/                 SiteNav · SiteFooter · Container · Section · PageRoot
  ui/                     Button · Card · Chip · Toast · IconBadge …
  form/                   FormField · 인풋/셀렉트/텍스트에어리어 · VariableInputList
  home/ api/ request/     페이지별 섹션 컴포넌트와 목업
  icons/                  원본에서 그대로 옮긴 인라인 SVG

lib/
  site.ts                 사이트 상수 · SITE_URL · sitemap 라우트 목록
  nav.ts                  네비게이션 링크 정의
  cn.ts                   className 병합
  content/                페이지 문구·데이터 (마크업과 분리)

assets/                   OG 이미지 생성용 Pretendard 서브셋 (웹에 서빙되지 않음)
scripts/                  Playwright 검증 · 실측 · 진단 스크립트
design_handoff_sospatial/ ★ 원본 프로토타입 HTML — 구현의 기준
reference/                ★ 원본 디자인 캡처 PNG 15장 — 검증의 기준
```

`design_handoff_sospatial/`과 `reference/`는 절대 삭제하지 않는다.
구현이 맞는지 판단할 근거가 이 둘밖에 없다.

경로 별칭은 `@/*` → 프로젝트 루트다. (`import { cn } from '@/lib/cn'`)

## 디자인 토큰

전부 `app/globals.css`의 `@theme` 블록에 있다. 별도 `tailwind.config`는 없다.

- **하이픈이 소수점이다** — `text-13-5` = 13.5px, `leading-1-65` = line-height 1.65
- 텍스트 색은 흰색 투명도 9단계(`ink` → `ink-70` → … → `ink-20`), 보더는 `line-*` 4단계
- 브레이크포인트는 **5개 전부 px**로 정의한다. 일부만 px로 덮어쓰면 미디어쿼리
  정렬 순서가 깨진다 (`globals.css` 주석과 CLAUDE.md에 사례 기록)

## 검증

페이지를 수정하면 reference와 대조한다.

```bash
npm run dev                                          # 다른 터미널에서 서버 실행
node scripts/verify-page.mjs / 01-home.png home      # 라우트, reference 파일, 출력 이름
```

1440×900 뷰포트에서 전체 페이지를 촬영해 reference PNG와 차분한다.
`diffPercentAligned`가 ±1px 정렬 오차를 허용한 값이고, 이쪽을 기준으로 본다.

현재 기준선 — 홈 0.771% · API 1.214% · request 0.951% ·
source 1.762% · upload 1.533% · describe 1.691%.
남은 차이는 대부분 캡처 환경의 래스터라이즈 차이이며,
어떤 항목이 그에 해당하는지는 CLAUDE.md의 "reference 환경 차이"에 정리돼 있다.

`/request/upload`는 reference가 파일 선택 완료 상태로 캡처돼 있어
전용 스크립트를 쓴다: `node scripts/verify-upload.mjs`

기타 스크립트: `verify-a11y-forms.mjs`(폼 접근성) · `verify-deploy.mjs`(메타·아이콘·고대비) ·
`verify-og.mjs`(OG 이미지) · `responsive.mjs` · `scan-bands.mjs`(경계 실측) ·
`diagnose-minwidth.mjs`(가로 넘침 원인 추적)

## OG 이미지

`app/opengraph-image.tsx`가 빌드 시점에 1200×630 PNG를 생성한다(정적).
루트 1개만 두고 전 페이지가 상속한다 — 페이지별 이미지는 만들지 않는다.

폰트는 `assets/Pretendard-Bold.subset.woff`(5KB)다.
**문구를 바꾸면 서브셋을 다시 만들어야 한다** — 서브셋에 없는 글자는
오류 없이 조용히 두부(.notdef)로 렌더된다.

```bash
pip install fonttools brotli      # pyftsubset 필요
node scripts/subset-og-font.mjs   # 원본 woff가 없으면 자동으로 내려받는다
```

## 현재 범위

구현 완료: 홈 · `/api` · `/request`(landing/source/upload/describe) · 375px까지 반응형
플레이스홀더: `/data` · `/projects` · `/maps` · `/terms` · `/privacy`

폼 제출은 토스트를 띄우고 payload를 `console.log`한다. 백엔드는 아직 없고,
제출 핸들러 한 지점에 `fetch`만 끼우면 되도록 만들어져 있다.
