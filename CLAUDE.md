# SoSpatial Platform — 작업 기준 문서

> **이 문서의 규칙은 대화가 길어져도 항상 유효하다.**
> 컨텍스트가 요약되거나 세션이 새로 시작되어도, 아래 "확정된 요구사항"과 "검증 절차"는
> 계속 적용된다. 이 문서와 충돌하는 판단을 하지 말 것. 규칙을 바꾸려면 사용자의 명시적
> 지시가 있어야 하며, 그 경우 이 문서를 함께 갱신한다.

---

## 프로젝트 개요

Claude Design에서 내보낸 HTML 프로토타입(`design_handoff_sospatial/`)을
Next.js(App Router) + Tailwind CSS v4 프로젝트로 변환한다.

- `design_handoff_sospatial/SoSpatial Platform.dc.html` — 메인 프로토타입 (구현 대상 원본)
- `design_handoff_sospatial/Data page samples.dc.html` — 데이터 페이지 대안 레이아웃 (참고용, 채택 안 함)
- `design_handoff_sospatial/README.md` — 핸드오프 문서 (실제 코드와 충돌 시 실제 코드 우선)
- `reference/` — 원본 디자인 PNG 15장 (검증용)

---

## 1단계 완료 (2026-08-14)

### 배포

- **URL: https://sospatial-platform.vercel.app**
- GitHub `SoSpatial/sospatial-platform`, `main` 브랜치. Vercel 자동 배포.
- `NEXT_PUBLIC_SITE_URL` 은 **설정하지 않았다.** `VERCEL_PROJECT_PRODUCTION_URL` 로 해결된다.
  커스텀 도메인을 붙이면 그때 `NEXT_PUBLIC_SITE_URL` 을 설정하고 재배포할 것.

### 완료 범위

| 라우트 | 상태 | reference |
|---|---|---|
| `/` | 구현 완료 | 01-home |
| `/api` | 구현 완료 | 07-api |
| `/request` | 구현 완료 | 08-request-landing |
| `/request/source` | 구현 완료 | 09-request-source |
| `/request/upload` | 구현 완료 (파일 피커 모달 포함) | 10-request-upload |
| `/request/describe` | 구현 완료 | 11-request-describe |
| `/data` `/projects` `/maps` | `ComingSoon` 플레이스홀더 | — |
| `/terms` `/privacy` | `ComingSoon` 플레이스홀더 (푸터 링크 대상) | — |

부수 완료: 공통 네비·푸터, 반응형 375~1440px, 디자인 토큰, `focus-visible` 링,
`prefers-contrast: more` 대안, OG 이미지·아이콘·sitemap·robots, 토스트, 폼 a11y 연결.

### 회귀 기준선 (2026-08-14, 배포본 실측)

`node scripts/verify-deployed.mjs https://sospatial-platform.vercel.app` — 전 항목 통과.
reference 차분은 로컬과 배포가 **소수점 셋째 자리까지 동일**했다.

| 페이지 | raw % | ±1px 허용 % | avg delta | heightDelta |
|---|---|---|---|---|
| `/` | 1.386 | 0.771 | 1.18 | 145 |
| `/api` | 2.251 | 1.214 | 1.63 | 126 |
| `/request` | 2.815 | 0.951 | 2.33 | 120 |
| `/request/source` | 3.363 | 1.762 | 2.22 | 112 |
| `/request/upload` | 3.290 | 1.533 | 2.22 | — |
| `/request/describe` | 3.437 | 1.691 | 2.45 | 219 |

**이 표가 회귀 기준선이다.** 2단계에서 공통 컴포넌트(네비·푸터·프리미티브·토큰)를
건드린 뒤 이 수치가 움직이면 1단계 페이지에 회귀가 생긴 것이다.

⚠ **`/request/upload` 는 반드시 `scripts/verify-upload.mjs` 로 잰다.**
`verify-page.mjs` 로 재면 파일 **미선택** 기본 상태를 reference(선택 완료 상태)와
비교하게 돼 4.17 / 2.61 이라는 다른 수치가 나온다.
`screenshots/diff-upload.json` 에 남아 있는 값이 그것이므로 기준선으로 쓰지 말 것.

### 남은 작업

**2단계 — 화면 3개 + 모달 2종 (백엔드 없이 프로토타입 동작 재현)**

구현 순서 확정 (2026-08-14): **`/data` → `/projects` → `/maps`**.
/maps 는 3단계(실제 지도 SDK·AI 연동)와 가장 얽혀 있어 지금 만드는 목업의
상당 부분이 교체된다. 가장 나중에 만들수록 버리는 작업이 줄어든다.

- `/data` — landing 뷰 + select 뷰. **5↔6열 동적 필터 그리드**와 변수 선택 테이블이 핵심.
  라우트는 **`/data`(landing) + `/data/select?topic=한글키`(select) 로 분리** (2026-08-14 승인 —
  아래 "프로토타입 제약 vs 디자인 의도" 사례 4 참조).
- `/projects` — 목록 테이블 + 상세 뷰.
- `/maps` — 좌측 AI 채팅 + 우측 지도. 1단계에 선례가 전혀 없는 화면이다.
- 모달: 저장(Save Project) / 공유(Share). **편집(Edit) 모달은 보류** — 아래 결정 참조.

**2단계 반응형 범위 (2026-08-14 확정)**

- **`/data` landing 만 375px 까지 대응한다** (1단계와 같은 기준).
- `/data` select, `/projects`, `/maps` 는 **데스크톱 전용**.
  md 미만에서는 "데스크톱에서 이용해주세요" 안내 화면을 띄운다.
  안내 화면은 **`DesktopOnly` 컴포넌트 하나**로 만들어 세 화면이 공유한다.
- 근거: 6열 필터 그리드와 7열 테이블은 좁은 화면에서 근본적으로 다른 레이아웃이
  필요하고, 이는 원본에 존재하지 않는 디자인이다.

**편집(Edit) 모달 — 구현 보류 (2026-08-14 확정)**

- 원본 마크업 없음 — 프로토타입에서 도달 불가능한 **죽은 state** 다
  (state·핸들러는 `:1732`, `:2219-2240` 에 있으나 그리는 `sc-if` 블록과
  `openEditModal` 호출부가 파일 어디에도 없다).
- `15-modal-edit-data.png` 는 `05-projects-detail.png` 와 md5 동일한 중복 파일이다.
- 죽은 state 였다면 디자인 의도가 확정되지 않은 것이므로 **재추출 요청도 하지 않는다.**
- 편집 기능이 실제로 필요해지는 **3단계에서 신규 설계 + 사용자 별도 확인** (푸터와 같은 취급).

**3단계 — 백엔드**

- 폼 제출 `fetch` 연결. 제출 핸들러는 이미 `async (payload) => {}` 한 지점으로 모여 있고
  토스트는 그 성공 경로에 있으므로, **토스트를 건드리지 않고 `fetch` 만 끼우면 된다.**
- 인증(로그인·회원가입 — 현재 링크만 존재), 데이터 검색·다운로드, 프로젝트 영속화,
  외부 스토리지 연동(파일 피커는 현재 목업).
- **편집(Edit) 모달 신규 설계 + 사용자 별도 확인** (2단계에서 보류한 것 — 위 결정 참조).
- `/terms` `/privacy` 실제 내용. 채워지면 `robots` 를 지우고 `SITEMAP_ROUTES` 에 추가한다.

---

## 프리미티브 재고 (2단계 착수 기준)

1단계에서 만든 것 중 **2단계에 그대로 쓰이는 것 / 손봐야 하는 것 / 새로 만들어야 하는 것**.
원본 근거 줄 번호는 각 컴포넌트 파일 상단 주석에 있다.

### 그대로 쓰는 것

| 컴포넌트 | 2단계 사용처 |
|---|---|
| `layout/PageRoot` | 신규 페이지 3개 루트 (pageEnter) |
| `layout/Section` | 전 섹션 배경·거터 |
| `layout/Container` | **`wide`(1200) = /data select 뷰, `search`(660) = /data 랜딩 히어로** — 둘 다 1단계 미사용이나 원본 근거로 미리 정의해 둠 |
| `layout/SiteNav` `SiteFooter` | 변경 없음 (플레이스홀더가 실 페이지로 바뀔 뿐) |
| `ui/Card` | 필터 그리드 셸(`radius="panel"` 14px = 원본 :245 와 일치), 카테고리 카드, 테이블 셸 |
| `ui/Chip` | /data 인기 검색어 pill (원본 :387 — `pill` variant 근거가 이미 이것) |
| `ui/IconBadge` | 카테고리 카드 38, 전체 카드 42, 모달 헤더 32 — **SIZE 4종이 이미 전부 /data 근거로 정의돼 있다** |
| `ui/SectionHeading` | `sm`(19px) = "주제별 둘러보기" 원본 :399 |
| `ui/AccentLink` | `sm`(13.5px) = "전체보기" 원본 :412 |
| `ui/Toast` | 저장·공유·삭제 완료 토스트 (원본이 같은 토스트를 재사용) |
| `form/FormField` `TextInput` `SelectInput` | 모달 폼 입력 |
| `icons/LogoMark` `ArrowRight` | 공통 |

### 손봐야 하는 것

| 항목 | 무엇이 부족한가 |
|---|---|
| `ui/Button` | **`danger` variant 없음.** 프로젝트 삭제 버튼이 `rgba(255,80,80,0.08)` 배경 / `0.18` 보더 / `rgba(255,120,120,0.8)` 글자다 (원본 :836). 모달 취소 버튼 `padding:9px 20px / 13.5px` (:946, :988)도 `sm`(8/20, 13.5) `md`(12/24, 14) 어디에도 안 맞는다 — size 를 늘릴지 className 으로 덮을지 정할 것 |
| `request/FilePickerModal` | 모달 셸(backdrop + 패널 + 헤더/본문/푸터)의 **유일한 선례**. 저장·공유 모달과 backdrop 농도(0.75 vs 0.7)와 z-index(1000 vs 2000)가 다르므로, 셸을 `ui/Modal` 로 추출하고 **차이는 prop 으로 열어둔다** (통일 금지 원칙) |
| 체크박스 | 현재 `FilePickerModal` 안에 인라인. 테이블 행 선택에서 반복되므로 추출 후보 |
| `request/BackLink` | /data select "← 데이터 검색", /projects 상세 "← 내 프로젝트"(:822) 가 같은 패턴. 원본 값이 다를 수 있으니 실측 후 재사용 판단 |

### 새로 만들어야 하는 것

| 항목 | 근거 / 주의 |
|---|---|
| `FilterGrid` + `FilterColumn` | 원본 :245, `filterGridCols` :2362. `repeat(5,1fr)` ↔ `repeat(6,1fr)` 동적. **Tailwind JIT 는 런타임 문자열을 못 잡으므로 두 클래스를 정적으로 써서 조건 분기할 것** |
| `FilterList` | max-height 220px / `overflow-y:auto` / `overscroll-behavior:contain`. **세부 지역 컬럼만** 그룹 헤더(10.5px/700/ink-30/uppercase/보더 line-04)가 추가로 붙는다 (:308-313) |
| `DataTable` | 컬럼 정의를 **prop 으로 받는다.** 세 화면이 전부 다르다 — 변수 선택 `44px 1fr 1fr auto`(:350), 프로젝트 목록 `52px 72px 1fr 60px 130px 120px 90px`(:870), 프로젝트 상세 `1fr 2fr 0.8fr 0.8fr 0.8fr 0.8fr`(:843). 행 패딩도 10/12/13/14/16px 로 제각각이니 **통일하지 말 것** |
| `Tabs` | 저장 모달 신규/기존 탭 (:971-986). 선례 없음 |
| `EmailChipInput` | 공유 모달 이메일 추가 + 칩 목록 (:938-943). 선례 없음 |
| `DesktopOnly` | md 미만 "데스크톱에서 이용해주세요" 안내 — /data select·/projects·/maps 가 공유. 원본에 없는 화면이므로 reference 검증 제외 (푸터·ComingSoon 과 같은 취급) |
| 아이콘 다수 | 필터 컬럼 헤더 6종(그리드/목록/단위/핀/지도핀/달력), 다운로드, 휴지통, 별(starred), 뒤로 화살표 |
| `/maps` 전체 | 좌측 AI 채팅 + 우측 지도(:996~). 재사용 가능한 선례가 없다. 별도 조사 필요 |

### ★ 데이터 편집 모달 — 원본에 **디자인이 존재하지 않는다** → 구현 보류 확정

- `showEditModal` / `editChecked` state 와 `openEditModal` / `closeEditModal` /
  삭제 핸들러가 `:1732`, `:2219-2240` 에 있다.
- **그런데 마크업이 없다.** 파일 전체에서 편집 모달을 그리는 `sc-if` 블록이 없고,
  `openEditModal` 을 **호출하는 곳도 없다** (정의 :2221 한 줄이 전부).
- `15-modal-edit-data.png` 는 `05-projects-detail.png` 와 md5 동일한 중복 파일이다.
- **결정 (2026-08-14): 2단계에서 구현하지 않고, 재추출 요청도 하지 않는다.**
  죽은 state 였다면 디자인 의도가 확정되지 않은 것이다. 편집 기능이 실제로
  필요해지는 3단계에서 신규 설계 + 사용자 별도 확인 (위 "남은 작업" 참조).

---

## 확정된 요구사항

### [범위]

- 이번 단계는 홈(/), API(/api), Request(/request — landing/source/upload/describe 4개 뷰)만 구현한다.
- /data, /projects, /maps 는 라우트와 네비게이션 링크만 만들고
  "준비 중" 플레이스홀더 페이지로 둔다. 내부 로직은 구현하지 않는다.
- 네비게이션과 푸터는 전 페이지 공통 레이아웃으로 만든다.
  네비 우측은 실제 코드 기준 3개(폴더 아이콘 버튼 / 로그인 / 회원가입).
  로그인·회원가입은 이번 단계에서 링크만 있고 동작하지 않는다.

### [반응형]

- 이번 범위 3개 페이지는 375px까지 대응한다.
- 데스크톱 1100px 고정 폭이 기준이고, 좁아질 때 거터 32px → 20px로 줄인다.
- Request 폼의 1fr 280px 그리드는 좁은 화면에서 1열로 떨어뜨리고
  sticky 사이드바는 sticky를 해제해 폼 아래로 내린다.
- 홈 CORE FEATURES 3열 카드는 3 → 2 → 1열, API 카드 그리드는 4 → 2 → 1열.

### [디자인 토큰]

- globals.css의 @theme 블록에 CSS 변수로 전부 정의한다.
- 소수점 폰트 크기(10.5 / 11.5 / 12.5 / 13.5 / 14.5 / 15.5 / 16.5px)를
  이름 있는 토큰으로 만든다. 임의값(text-[13.5px]) 사용을 최소화할 것.
- 텍스트 투명도 9단계(#FFF → 0.7 → 0.55 → 0.45 → 0.4 → 0.35 → 0.3 → 0.25 → 0.2)와
  보더 4단계(0.04 / 0.06~0.08 / 0.1~0.12 / 0.18)도 각각 토큰화한다.
- README가 3색이라고 한 것과 달리 실제 코드에는 보라/에메랄드/블루/오렌지/레드가
  더 있다. 실제 코드 기준으로 전부 토큰에 포함시킨다.

### [구현 원칙]

- README와 실제 코드가 충돌하면 항상 실제 코드를 따른다.
  (1단계에서 찾은 8개 불일치 항목 전부 해당)
- 아이콘은 원본 인라인 SVG를 그대로 유지한다.
  lucide-react 등 라이브러리로 교체하지 말 것 — 획 두께와 크기가 미묘하게 달라진다.
- 폰트는 Pretendard Variable, jsDelivr CDN 방식을 유지한다.
  (샘플 파일의 Google Fonts 방식은 잘못된 것이므로 쓰지 말 것)
- style-hover 커스텀 속성은 Tailwind hover: 변형으로 전환한다.
- 로고 마크(20×20 SVG, 2×2 그리드, 대각선 opacity 1 / 0.35)는
  크기만 props로 받는 단일 컴포넌트로 만든다.
- pageEnter 애니메이션(0.35s ease, opacity 0→1 + translateY 12px→0)을
  모든 페이지 루트에 유지한다.
- **`grid-cols-[1fr_280px]` 의 `1fr` 은 `minmax(auto, 1fr)` 이라 최소값이 min-content 다.**
  (2026-08-09 추가 — Request 폼 반응형에서 발견)
  좁은 화면에서 컬럼이 컨테이너를 넘치면, 원인은 그 안의
  **줄바꿈되지 않는 가로 flex 행** 이다. 폼마다 그 행이 달라 넘침 폭도 달랐다
  (source 라디오 4개 352 / upload 드롭존 용량 박스 240 / describe 제출 행 170).
  → 진단은 `scripts/diagnose-minwidth.mjs` 로 행을 하나씩 숨겨 폭 변화를 본다.
  → 1열로 바꿔도 그 행 자체의 min-content 가 카드 폭을 넘길 수 있으니
    `flex-wrap` 을 함께 확인할 것. (라디오 행 286px vs 375px 카드 269px)
- **컴포넌트 베이스 클래스에 `display` 를 넣으면 호출부의 `hidden` 이 무력화될 수 있다.**
  (2026-08-09 추가 — 홈 반응형 패스에서 발견)
  Tailwind 는 클래스 문자열 순서가 아니라 **CSS 출력 순서**로 승부가 난다.
  같은 속성(display)의 유틸리티는 뒤에 출력된 쪽이 이기므로,
  `Button` 베이스의 `inline-block` 이 호출부의 `hidden md:block` 을 덮어써
  네비 "로그인"이 375px 에서 숨겨지지 않았다.
  → 베이스에는 꼭 필요한 경우에만 display 를 넣고, 필요하면 조건부로 적용한다.
    (Button 은 `<a>` 로 렌더할 때만 inline-block 을 준다)
  같은 이유로 `p-*`, `text-*` 등도 베이스에 넣으면 호출부 오버라이드가 불안정하다.
  변형이 필요하면 className 오버라이드보다 prop(variant/size)으로 여는 편이 안전하다.
- **프리미티브로 묶을 때 원본이 페이지마다 다르게 쓰는 값을 통일하지 않는다.**
  차이가 있으면 prop 으로 열어둔다.
  (2026-08-09 추가 — /request/upload 검증에서 발견)
  예: 진행 스텝 pill 이 source(:1295)는 `display:flex` 인데
  upload(:1470)·describe(:1602)는 블록이라 pill 높이가 6px 다르다.
  하나로 묶어 flex 로 통일했더니 폼 카드가 6px 위로 올라갔다.
  → `textPillDisplay` prop 으로 원본 그대로 재현.
  묶는 과정에서 원본의 불일치를 "정리"하려는 충동을 경계할 것.
- **브레이크포인트는 반드시 5개 전부 px로 통일한다.**
  (2026-08-09 추가 — API 페이지 검증에서 발견한 버그 재발 방지)
  Tailwind 기본값은 rem 인데 일부만 px 로 덮어쓰면 rem/px 를 수치 비교하지 못해
  미디어쿼리 정렬이 깨진다. 실제로 xl 만 px 로 바꿨더니 출력 순서가
  xl(1180px) → sm(40rem) → md(48rem) 이 되어, 1440px 에서 sm:grid-cols-2 가
  xl:grid-cols-4 를 덮어썼다(API 카드가 4열이 아닌 2열로 렌더).
  `--breakpoint-*: initial` 로 초기화한 뒤 sm/md/lg/xl/2xl 을 전부 px 로 정의한다.
- **라벨↔컨트롤 연결은 `useId()` + render-prop 으로 한다.** `cloneElement` 는 쓰지 않는다.
  (2026-08-09 추가) `FormField` 가 `{ id, labelId }` 를 자식 함수에 내려주고, 호출부가
  받은 id 를 직접 컨트롤에 붙인다. 자식의 구조를 몰라도 되고, 래퍼가 한 겹 끼어도 깨지지 않는다.
  라벨 1개에 컨트롤 N개인 경우(연도 시작/종료, 변수 입력 목록)는 `as="group"` 으로
  `role="group" aria-labelledby` 를 씌우고 각 컨트롤에 `aria-label` 을 따로 준다.
- **컨트롤 클래스에 `outline-none` 을 넣지 않는다.** 넣으면 `globals.css` 의
  `:focus-visible` 링이 무력화돼 키보드 사용자가 현재 위치를 잃는다.
  원본의 `outline:none` 은 **디자인 의도가 아니라 프로토타입의 관성적 처리**로 본다.
  (2026-08-10 확정) 편집 가능 필드가 마우스 클릭에도 링을 띄우는 것은 브라우저가 의도한
  동작이므로 그대로 둔다. `:focus-visible:not(:active)` 같은 제한은 걸지 말 것 —
  클릭 중엔 안 보이다가 손을 떼면 뜨는 어색한 동작이 되거나 표시가 아예 사라진다.

---

## 확정된 결정 사항 (2차 — 계획 승인 시점)

### 1. 푸터 — 최소 푸터를 신규 설계

- 구성: **로고 + 카피라이트 + 링크 3~4개의 1단 구성**
- 원본(프로토타입·README·reference PNG 15장) 어디에도 푸터가 없으므로
  **reference 검증 대상에서 제외**한다.
- 대신 **별도로 사용자에게 확인받는다.** 자체 판단으로 확정하지 말 것.

### 2. Request 라우팅 — 실제 라우트로 분리

```
/request            landing
/request/source
/request/upload
/request/describe
```

- 각 페이지에 **개별 `metadata`(title, description)** 를 붙인다.
- **판단 근거 (기록용):** 원본이 단일 `currentPage` / `requestView` state였던 것은
  `<x-dc>` 프로토타입 런타임이 단일 컴포넌트 트리만 지원했기 때문이며,
  **디자인 의도가 아니라 도구의 제약**이다.
  따라서 이 변경은 "README와 실제 코드가 충돌하면 실제 코드를 따른다" 원칙의
  **예외가 아니다.** 시각적 결과물은 원본과 동일하게 유지되며,
  달라지는 것은 URL·딥링크·뒤로가기 동작뿐이다.

### 3. 폼 제출 — 원본 토스트를 이번 단계에서 구현

- **원본 토스트 스펙 그대로 구현**: 하단 중앙 고정, `#2A2A2A` 배경,
  `1px solid rgba(255,255,255,0.12)`, radius 10px, padding `12px 24px`,
  `#5CC974` 8px 도트, 14px/500 텍스트, `box-shadow: 0 8px 32px rgba(0,0,0,0.4)`,
  z-index 3000, **2500ms 후 자동 소멸**.
- 제출 시 동작: `"요청이 접수되었습니다"` 토스트 + 폼 payload를 `console.log`.
- **다음 단계에서 토스트는 그대로 두고 `fetch`만 끼워 넣을 수 있는 구조로 만들 것.**
  (제출 핸들러를 `async (payload) => {...}` 한 지점으로 모으고,
  토스트 표시는 그 핸들러의 성공 경로에 둔다.)

### 4~11. 제안 확정 항목

| # | 항목 | 확정 |
|---|---|---|
| 4 | TypeScript | 사용 |
| 5 | `src/` 디렉터리 | 미사용 — 루트에 `app/ components/ lib/` |
| 6 | 폰트 크기 토큰 명명 | **Tailwind v4에서 `--text-10-5` 형태(하이픈)가 유효한지 먼저 검증**하고, 가능하면 그 방식. 불가능하면 `--text-105`(×10) 유지 + `globals.css` 상단에 명명 규칙 주석을 눈에 띄게 표기. 어느 쪽인지 근거와 함께 사용자에게 보고 |
| 7 | hover `transition` | 원본대로 **미추가** |
| 8 | 포커스 링 | `focus-visible`에만 최소 링 추가 (원본 시각 유지 + 키보드 접근성) |
| 9 | 브레이크포인트 | sm 640 / md 768 / lg 1024 / **xl 1180** (1100 콘텐츠 + 좌우 40 거터) |
| 10 | "준비 중" 페이지 | 로고 + 페이지명 + "준비 중입니다" 최소 구성 |
| 11 | `15-modal-edit-data.png` 중복 | 해당 단계 진입 시 재추출 요청 |

---

## 프로토타입 제약 vs 디자인 의도 — 판단 사례

원본의 어떤 동작을 그대로 재현할지, 실사용 동작으로 바꿀지는 아래 기준으로 판단한다.

- **`<x-dc>` 런타임·정적 목업의 제약에서 온 동작** → 실사용 동작으로 바꾼다.
  단, 시각 결과물은 원본과 동일하게 유지하고 **원본에 근거 없는 기능을 발명하지 않는다.**
- **원본 CSS·마크업에 명시된 것** → 그대로 재현한다 (hover 스펙, 페이지 간 불일치 값 포함).

| # | 사례 | 판단 |
|---|---|---|
| 1 | Request URL 구조 (결정 2) | 단일 `requestView` state 는 런타임 제약 → 4개 실제 라우트로 분리 |
| 2 | `outline:none` (구현 원칙) | 프로토타입의 관성적 처리 → `focus-visible` 링 추가 |
| 3 | describe 글자수 카운터 | 원본은 정적 "0 / 1000" → 실입력 길이를 반영. 단 `maxLength` 는 원본에 없으므로 넣지 않음 (기능 발명 금지의 예) |
| 4 | `/data` landing↔select 라우팅 (2026-08-14 승인) | 단일 `dataView` state → **`/data` + `/data/select?topic=` 실제 라우트 분리.** topic 쿼리 값은 한글 키 그대로 (영문 슬러그는 발명). 세부 필터 상태(주제 외 5종)는 원본대로 클라이언트 state — URL 에 넣지 않는다. select 복귀 시 필터 리셋(`goDataLanding` :2332)은 언마운트로 자연 획득 |
| 5 | `/data` 검색 input 의 Enter (2026-08-14 확정) | 원본은 Enter 무반응(input 바인딩 없음 :382) — 정적 프로토타입 제약으로 보고 **Enter 를 지원한다. 단 검색 버튼 클릭과 완전히 동일한 동작만** 한다 (`data-topic=""` → '전체' 로 select 진입). 검색어 처리 기능을 발명하지 않으며, **검색어가 버려지는 것 자체는 원본대로 유지** |
| 6 | (반례 — 재현 쪽) 인기 데이터 행 hover 의 `transition:padding 0.15s` (:488) | 원본 `style-hover` 에 **명시**돼 있으므로 그대로 재현 (hover 시에만 transition — 진입은 애니메이션, 이탈은 즉시). 결정 7 "transition 미추가"는 원본에 없는 transition 을 더하지 말라는 뜻이지, 명시된 것을 빼라는 뜻이 아니다 |

---

## 원본과 달라지는 부분 (검증 시 차이로 보고하지 말 것)

| # | 항목 | 이유 | reference 검증 |
|---|---|---|---|
| 1 | **푸터** | 원본에 존재하지 않음. 신규 설계 (위 결정 1번) | **제외** — 사용자에게 별도 확인 |
| 2 | **반응형 전체 (375~1180px)** | 원본은 데스크톱 1100px 고정 전용. 100% 신규 판단 | **제외** — 1440px만 검증 |
| 3 | **Request URL 구조** | 4개 실제 라우트로 분리 (위 결정 2번). 시각적 결과는 동일 | 시각 검증에는 영향 없음 |
| 4 | **글자 획 굵기(안티에일리어싱)** | reference 쪽 글자가 미세하게 더 두꺼움. 캡처 OS·렌더러 차이로 CSS로 제거 불가. 위치·박스 크기는 일치함을 실측 확인 | **제외** — 굵기만 해당. 위치·크기 차이는 반드시 보고 |
| 5 | **hover 전환 속도** | 원본 `style-hover`는 프로토타입 런타임 속성이며 `transition` 없음. 동일하게 transition 미적용 | 정적 캡처라 영향 없음 |
| 6 | **페이지 전환/스크롤** | 단일 state → Next 라우터. `pageEnter` 애니메이션은 유지, `window.scrollTo({top:0})`는 Next 기본 스크롤 복원으로 대체 | 영향 없음 |
| 7 | **`<select>` 화살표** | 네이티브 select — OS/브라우저마다 모양이 다름. reference의 화살표는 캡처 환경 것 | **제외** |
| 8 | **폰트 로딩 FOUT** | jsDelivr CDN `<link>` 유지 지시(`next/font` 미사용) | 영향 없음 |
| 9 | **포커스 링** | 원본은 `outline:none`만 있음. `focus-visible`에만 최소 링 추가 (결정 8번). **실측 결과 `<input>`·`<textarea>`·`<select>` 는 마우스 클릭에도 `:focus-visible` 이 매칭돼 링이 뜬다** — 명세상 키보드 입력을 받는 컨트롤의 정의된 동작이다. 라디오·버튼·링크는 클릭 시 링이 뜨지 않는다 | 정적(비포커스) 캡처라 영향 없음 |
| 10 | **API 히어로 우측 빈 컬럼** | 원본이 `1fr 340px` 그리드인데 우측 셀이 비어 있음. 좌측 폭을 결정하므로 **그대로 재현**. 임의로 채우거나 그리드를 없애지 말 것 | 재현 대상 (차이 아님) |
| 11 | **푸터 카피라이트 연도가 빌드 시점에 고정** | `{new Date().getFullYear()}` 를 서버 컴포넌트에서 평가하고 해당 라우트가 정적 생성이므로, 해가 바뀌어도 재빌드 전까지 갱신되지 않는다. 사용자 인지·승인 하에 현행 유지. 자동 갱신이 필요해지면 푸터를 클라이언트 컴포넌트로 분리하거나 동적 렌더링으로 전환할 것 | 해당 없음 |

---

## 배포 준비 (확정 사항)

### 도메인 — `SITE_URL` 결정 순서
- `lib/site.ts` 가 단일 출처. `metadataBase` / `openGraph.url` / `sitemap.xml` / `robots.txt` 가 전부 여기서 나온다.
- 우선순위: **`NEXT_PUBLIC_SITE_URL` > `VERCEL_PROJECT_PRODUCTION_URL` > `http://localhost:3000`**
- **Vercel 시스템 변수를 2순위에 넣은 이유** (2026-08-10 확정):
  배포 전에는 `*.vercel.app` 주소를 모르고 배포 후에는 이미 빌드가 끝나 있어서,
  환경변수만 쓰면 **1차 배포의 절대 URL 이 반드시 틀린다.**
  Vercel 문서상 `VERCEL_PROJECT_PRODUCTION_URL` 은 빌드·런타임 모두에서 쓸 수 있고,
  프리뷰 배포에서도 항상 프로덕션 도메인을 가리킨다 — OG 이미지 URL 처럼 프로덕션을
  가리켜야 하는 링크를 만들라고 문서가 직접 권하는 용도다. 프로토콜은 붙어 있지 않다.
- **`VERCEL_URL` 은 쓰지 않는다.** 배포마다 값이 바뀌는 배포 전용 주소라
  canonical·sitemap 에 넣으면 안 되고, Standard Deployment Protection 과도 충돌한다.
- 이 파일은 **서버 전용**(metadata / sitemap / robots)에서만 임포트한다. 클라이언트
  컴포넌트에서 쓰면 `NEXT_PUBLIC_` 접두어가 없는 2순위가 비므로, 그때는 1순위를 반드시 설정한다.
- `SITE_URL_SOURCE`(`'env' | 'vercel' | 'fallback'`)로 출처를 판별할 수 있고,
  Vercel 빌드 로그에 `[site] SITE_URL = ...` 한 줄이 남는다. localhost 로 떨어지면 경고가 뜬다.
- 우선순위 회귀 검증: `node scripts/check-site-url.mjs`

### 색인 정책
- **sitemap 포함**: `/`, `/api`, `/request`, `/request/{source,upload,describe}` — 6개뿐.
- **제외 + `noindex, follow`**: `/data`, `/projects`, `/maps`, `/terms`, `/privacy`.
  내용이 없는 플레이스홀더다. `robots.txt` 의 `Disallow` 가 아니라 **페이지별 메타**로 막는다
  (Disallow 는 크롤을 막을 뿐 색인을 막지 못하고, `noindex` 를 읽지도 못하게 만든다).
- 각 페이지 콘텐츠가 실제로 채워지면 `robots` 를 지우고 `SITEMAP_ROUTES` 에 추가한다.
- `/data` landing 완성 시 `/data` 는 noindex 제거 + sitemap 추가.
  **`/data/select` 는 noindex 유지·sitemap 미포함** (쿼리 의존 작업 화면, 2026-08-14 확정).

### 아이콘
- `app/icon.svg` (32×32, `#181818` 배경 rx=7) + `app/apple-icon.png` (180×180, **알파 없는 RGB**).
  iOS 는 자체 마스크로 깎으므로 apple-icon 은 모서리를 직각으로 두고 배경을 불투명하게 채운다.
- `scripts/make-apple-icon.mjs` 로 재생성한다. 로고 기하는 `components/icons/LogoMark.tsx` 와 동일.
- `app/favicon.ico`(Next 스캐폴딩 기본값)는 삭제했다. 되살리지 말 것 — `icon.svg` 보다 우선한다.

### 고대비 대안 (`prefers-contrast: more`)
- 원본 팔레트의 저알파 텍스트는 WCAG 미달이다(#181818 기준 ink-30 2.71 / ink-25 2.26 / ink-20 1.89).
- **범위를 의도적으로 좁혔다**: `--color-ink-25` 만 0.45 로 올린다 → placeholder·글자수 카운터
  2.26 → 4.49. 통계 라벨·API 경로 등 보조 텍스트(ink-30/28/22/20)는 건드리지 않는다.
  "읽히지 않으면 조작이 불가능한 것"과 "정보가 덜 보이는 것"은 다른 문제다.
- 기본 상태에는 영향이 없어 reference 차분 6개가 그대로 유지된다.

---

## Git 규칙

- 스캐폴딩 **직전에** `git init` 하고 `.gitignore`를 설정한다.
  (`node_modules`, `.next`, `.env*`, `.DS_Store` 포함)
- **`design_handoff_sospatial/` 과 `reference/` 는 커밋에 포함한다.**
  원본과 검증 기준이므로 유실되면 안 된다. `.gitignore`에 절대 넣지 말 것.
- **스캐폴딩 완료 직후 첫 커밋**을 남긴다.
- 이후에는 **각 페이지가 검증을 통과하고 사용자 승인을 받은 시점에** 커밋한다.
- **커밋 메시지는 한국어로 작성한다.**

---

## 중단점 (반드시 멈추고 승인받을 것)

1. **`globals.css` 토큰 정의가 끝나면 코드 전문을 보여주고 확인을 받는다.**
   확인 전에 컴포넌트나 페이지를 만들지 말 것.
2. **0번(스캐폴딩) 완료 시점에 dev 서버를 띄우고 네비게이션 영역을 가장 먼저 검증한다.**
   네비는 전 페이지 공통이라 여기서 틀리면 전부 틀린다.
   플레이스홀더 페이지 3개도 이때 함께 확인한다.
3. 각 페이지 구현 후 비교표를 보여주고 승인을 받는다 (아래 검증 절차 6번).
4. 푸터 디자인은 별도로 확인받는다.

---

## 예외 처리

- 기존 폴더에 `design_handoff_sospatial/`, `reference/`, `CLAUDE.md` 가 이미 있어서
  `create-next-app` 이 거부할 수 있다.
  **이 경우 기존 파일을 절대 삭제하지 말고** 우회 방법을 찾거나 사용자에게 알린다.
- `create-next-app` 이 대화형 프롬프트를 띄워 진행이 막히면
  실행할 명령어를 정확히 알려주고 사용자가 실행할 때까지 기다린다.
- Next.js 스캐폴딩이 어떤 이유로든 막히면, 그것과 무관하게
  **`globals.css` 토큰 정의를 먼저 작성해서 보여준다.**
  스캐폴딩은 그 다음에 해결한다. 토큰 설계는 프로젝트 초기화와 독립적이다.

---

## 검증 절차 (계획 승인 후 구현 시 매 페이지마다 반드시 수행)

프로젝트 루트의 /reference 폴더에 원본 디자인 PNG가 들어있다.
각 페이지 구현이 끝날 때마다 아래를 수행한다:

1. 해당 페이지의 reference 이미지를 읽는다.
2. 구현된 페이지를 Playwright로 동일한 뷰포트(1440×900)에서 스크린샷 촬영한다.
   Playwright가 없으면 설치 명령을 나에게 알려주고 내가 실행할 때까지 기다린다.
3. 두 이미지를 나란히 비교하고, 다음 항목을 순서대로 점검한다:
   - 레이아웃: 요소 위치, 정렬, 컬럼 수, 콘텐츠 폭
   - 간격: 섹션 패딩, 요소 간 마진, 카드 내부 패딩
   - 타이포: 폰트 크기, 굵기, 자간, 행간
   - 색상: 배경, 텍스트 계층, 보더 투명도, 액센트
   - 누락: 원본에 있는데 구현에 없는 요소
4. 차이점을 표로 정리해서 보고한다. 형식:
   | 위치 | 원본 | 구현 | 수정 필요 |
5. 차이가 있으면 수정하고 2~4를 반복한다.
   차이가 없거나 의도적으로 다르게 한 것만 남으면 다음 페이지로 넘어간다.
6. "원본과 동일하다"고 자체 판단하지 말고,
   비교표를 나에게 보여준 뒤 내 승인을 받고 넘어갈 것.

---

## 참고: 1단계 분석에서 확인된 README ↔ 실제 코드 불일치 8건

구현 시 **항상 오른쪽(실제 코드)을 따른다.**

| # | 항목 | README | 실제 코드 (← 따를 것) |
|---|---|---|---|
| 1 | `dataView` 값 | `'landing' \| 'results'` | `'landing' \| 'select'` |
| 2 | 필터 열 개수 | 5열 고정 | 지역 선택 시 세부 지역 열 추가 → 5↔6열 동적 |
| 3 | 홈 카드1 목업 인풋 | 2개 (주제 */지역 *) | 3개 (주제 */단위 */지역 *) |
| 4 | 네비 우측 | 고스트 버튼 1개 + 회원가입 | 폴더 아이콘 버튼 + 로그인 + 회원가입 (3개) |
| 5 | 홈 히어로 통계 행 | 누락 | 1,240+ / 48종 / 98% 3개 존재 |
| 6 | 차트 색상 | 3색 한정 | 보라·에메랄드·블루·오렌지·레드 추가 사용 |
| 7 | 콘텐츠 최대 폭 | 1100px 고정 | 데이터 select 뷰만 1200px |
| 8 | 반응형 | 데스크톱 전용 | (미정의 → 위 [반응형] 항목으로 확정) |

---

## 참고: reference 이미지 ↔ 페이지 매핑

모든 PNG는 2880px 폭 = 1440 CSS px @2x, 전체 페이지 캡처.

| 파일 | 대응 화면 | 이번 범위 |
|---|---|---|
| `01-home.png` | `/` 홈 | ✅ |
| `02-data-landing.png` | `/data` (dataView: landing) | ❌ 다음 단계 |
| `03-data-select.png` | `/data` (dataView: select) | ❌ 다음 단계 |
| `04-projects-list.png` | `/projects` 목록 | ❌ 다음 단계 |
| `05-projects-detail.png` | `/projects` 상세 | ❌ 다음 단계 |
| `06-maps.png` | `/maps` | ❌ 다음 단계 |
| `07-api.png` | `/api` | ✅ |
| `08-request-landing.png` | `/request` landing | ✅ |
| `09-request-source.png` | `/request` source 폼 | ✅ |
| `10-request-upload.png` | `/request` upload 폼 (파일 선택 완료 상태) | ✅ |
| `11-request-describe.png` | `/request` describe 폼 | ✅ |
| `12-modal-save-project.png` | 저장 모달 | ❌ 다음 단계 |
| `13-modal-share.png` | 공유 모달 | ❌ 다음 단계 |
| `14-modal-file-picker.png` | 파일 피커 모달 | ❌ 다음 단계 |
| `15-modal-edit-data.png` | ⚠️ `05-projects-detail.png`와 바이트 단위로 동일한 중복 파일 | ❌ |

**★ 재추출이 필요한 reference (모달 단계 진입 시 요청할 것)**

모달 reference 4장 중 2장이 사용 불가다.

| 파일 | 문제 | 확인 방법 |
|---|---|---|
| `14-modal-file-picker.png` | **파일 피커 모달이 캡처되지 않았다.** `10-request-upload.png` 와 픽셀 비교 시 `x 0–938, y 0–64`(네비 좌측)만 다르고 나머지는 동일하다. 모달 백드롭 일부만 그려지고 패널은 없다 | `node scripts/diff-refs.mjs 10-request-upload.png 14-modal-file-picker.png` |
| `15-modal-edit-data.png` | `05-projects-detail.png` 와 **md5 동일**. 편집 모달이 아니라 프로젝트 상세 화면이다 | `md5sum reference/*.png` |

→ 파일 피커 모달은 원본 HTML `:1662-1720` 을 기준으로 구현했고 computed 값으로만 확인했다.
   재추출본을 받으면 다시 검증할 것.

→ **편집 모달(15번)은 재추출을 요청하지 않는다 (2026-08-14 확정).** 원본 HTML 에
   마크업이 없는 죽은 state 라 재추출로 해결되지 않는다
   (위 "프리미티브 재고 — 데이터 편집 모달" 항목 참조). 3단계에서 신규 설계한다.
   재추출 요청 대상은 **14번(파일 피커) 1장뿐**이다.

→ 나머지 13장은 2026-08-14 md5 전수 검사에서 중복·이상 없음.
   02/03/04/05/06 (2단계 대상)은 정상이므로 그대로 검증에 쓸 수 있다.

---

## reference 환경 차이 (검증 시 차이로 보고하지 않는 항목)

reference PNG 는 이 프로젝트와 다른 환경에서 캡처됐다. 아래 5종은 **모두 확인된
환경 차이이며 수정 대상이 아니다.** 이후 보고에서는 이 섹션을 참조만 하고
매번 재설명하지 않는다.

**★ 공통 원칙: 이 계열 차이를 맞추려고 원본 CSS 에 없는 선언을 추가하지 않는다.**
특정 환경에만 맞고 다른 환경에서 어긋나기 때문이다.

### 1. 글자 획 굵기 (래스터라이즈)

reference 쪽 글자가 미세하게 더 두껍다. 위치·박스 크기는 정확히 일치한다
(네비 "회원가입" 알약 실측 좌 232 / 우 1238 / 상 16 / 하 48 양쪽 동일).
검증된 각 구간의 잔여 차분 1.1~1.4% 가 대부분 이 항목이다.

⚠ **원인은 "Pretendard 미로드"가 아니다.** 그 가설은 통제 실험으로 반증됐다.
구현 페이지를 (A) Pretendard 로드 / (B) CDN 차단 두 조건으로 촬영해 각각 차분한 결과:

| 조건 | 차이 픽셀 비율 | 평균 델타 |
|---|---|---|
| A) Pretendard 로드 | **1.44%** | 1.21 |
| B) Pretendard 차단 | 4.18% | 5.41 |

차단 시 차이가 2.9배 **늘었다.** reference 는 Pretendard 로 렌더된 것이 맞다.
동일 폰트를 쓰되 래스터라이저(캡처 OS/렌더러)가 다른 것으로 본다.
→ 폰트 미로드를 전제로 판단하지 말 것.

### 2. 텍스트 조판 폭

배지·버튼·칩이 reference 에서만 2줄로 넘친다. 원본 CSS 로는 줄바꿈될 이유가 없다.
- 01-home "AI-Ready 공간 데이터 플랫폼" 배지, 홈 카드 칩 전부
- 07-api "개발자용" 배지, "문서 보기" 버튼
- 08-request-landing "Custom Data Request" 배지

**실측 근거:** reference 배지의 박스 폭이 구현과 동일(≈199px)한데 텍스트만 2줄이다.
박스가 min-content 로 잘못 계산됐다면 박스 자체가 좁아졌어야 하는데 그렇지 않다.
즉 박스 계산은 정상이고 그 안에서 텍스트만 넘쳤다 — 조판 폭이 미세하게 더 넓다.
1번(획이 더 두꺼움)과 방향이 일치한다.
→ 맞추려면 CSS 에 없는 폭 제약을 만들어야 하므로 하지 않는다.

### 3. `line-height: normal` 계산

10.5px 요소에서 라인박스가 reference 12px, 구현 13px 이다
(`10.5 × 1.2 = 12.6` 이 환경마다 다르게 확정됨).
홈 카드1 목업의 인풋 박스 높이가 30 vs 31px 로 갈렸고, 그 1px 이 누적돼
목업 191 vs 193px, 카드 높이 395 vs 396.9px 차이가 됐다.
→ `line-height` 를 명시하면 그 환경에서만 맞으므로 선언하지 않는다.

### 4. `filter: blur()` 그라디언트 농도

blur 처리된 radial-gradient 블롭의 농도가 reference 쪽이 3~4% 더 진하다.
홈 카드2 목업(`MapAnalysisMock`) 실측:

| 채널 | 원본 총량 | 구현 총량 | 비율 |
|---|---|---|---|
| R | 2703k | 2597k | 96.1% |
| G | 3871k | 3763k | 97.2% |
| B | 2912k | 2796k | 96.0% |

**기하는 일치한다.** 채널별 강도 가중 무게중심이 소수점까지 같다
(R 188.6/115.0 vs 188.4/115.2, G 174.5/96.1 vs 173.9/96.3, B 189.4/88.5 vs 189.1/88.2).
위치·크기·blur 반경·색·opacity 가 모두 원본 CSS 와 일치하므로
`filter: blur()` 커널 구현 차이로 본다.
→ 맞추려면 blur 값이나 opacity 를 원본과 다르게 조작해야 하므로 하지 않는다.
→ blur 가 들어간 목업은 기하와 색이 맞으면 통과로 본다.

※ 블롭이 겹치는 영역에서는 색 계열(hue) 분류가 오염된다.
   비교는 **R/G/B 채널별 무게중심** 같은 방법 독립적 지표로 할 것.

### 5. 페이지 하단 48px 잘림

`scripts/bottom-gap.mjs` 측정 결과, 원본 CSS 의 마지막 섹션 `padding-bottom` 이
페이지마다 다른데도 **모든 reference PNG 의 하단 여백이 정확히 48px** 이다.

| 파일 | 원본 CSS padding-bottom | reference 실측 |
|---|---|---|
| 01-home.png | 100px | 49px |
| 02-data-landing.png | 80px | 48px |
| 07-api.png | 80px | 48px |
| 08-request-landing.png | 72px | 48px |
| 09/10/11-request-*.png | 72px | 48px |

캡처 도구가 하단을 고정 48px 로 정규화한 것이다.
→ 마지막 섹션 하단 패딩은 reference 로 검증할 수 없다. 원본 CSS 를 따른다.
→ 전체 페이지 높이가 reference 보다 큰 것은 정상이다.
   (그 위 구간의 높이·위치는 정상적으로 검증 대상이다)

### 검증 시 유용한 기법

- **±1px 정렬 오차 허용 차분** (`scripts/verify-page.mjs`) — 위 1~3 으로 생기는
  1px 누적 이동을 걷어내고 실제 차이만 본다. 원시 차분과 함께 보고한다.
- **카드 하단 기준 상대 좌표 비교** — 목업 높이 차이로 위쪽이 밀려도
  본문 레이아웃이 맞는지 독립적으로 검증된다.
- **배경색 전환점 스캔** (`scripts/scan-bands.mjs`, `scan-row.mjs`) —
  섹션·카드 경계를 reference PNG 에서 직접 실측한다.
