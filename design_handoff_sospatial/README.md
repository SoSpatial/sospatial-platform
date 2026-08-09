# Handoff: SoSpatial — AI-Ready 공간 데이터 플랫폼

## Overview
SoSpatial is a Korean-language spatial-data platform. Users browse and filter public spatial datasets by topic → sub-topic → unit → region → year, save selections into **projects**, share projects with teammates, explore data on a **map/analysis** view, connect via an **API**, and submit **custom data requests (맞춤 의뢰)**.

This bundle contains the interactive HTML prototype of the full product plus a secondary file exploring alternative layouts for the data page.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show intended look and behavior. They are **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, Vue, etc.) using its established patterns, component library, routing, and data layer. If no environment exists yet, choose an appropriate stack (React + TypeScript + a CSS solution of your choice is a natural fit — the prototype is already React-shaped) and implement there.

Note on the prototype's format: it uses a small in-house template runtime (`<x-dc>` templates + a `Component extends DCLogic` class with `state` / `setState` / `renderVals()`). This maps almost 1:1 onto a React class or hook component — `renderVals()` returns the values the template consumes. Read it as React, not as a framework to adopt.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interaction states are final. Recreate pixel-accurately using the codebase's existing libraries. All copy in the prototype is real intended Korean copy — preserve it verbatim.

Two things are intentionally faked and must be replaced with real implementations:
- **Persistence** — projects are stored in `localStorage` under key `sospatial_projects`. Replace with the real backend.
- **Maps** — the map surface is a CSS-drawn placeholder (grid lines + pins). Replace with a real map (Mapbox GL / Kakao Map / Naver Map, per the product's licensing).

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Page background | `#181818` | All page backgrounds, nav bar |
| Surface / alt section | `#222222` | Alternating sections (feature card band) |
| Card surface | `#181818` | Cards on `#222222` bands |
| Inset surface | `#242424` | Inputs, filter grid, nested panels |
| Control surface | `#333333` | Active segmented-tab pill |
| Accent (brand) | `#C4A882` | Warm tan — links, active filters, primary highlights, logo |
| Accent tint bg | `rgba(196,168,130,0.08–0.12)` | Selected filter row / selected chip background |
| Accent tint border | `rgba(196,168,130,0.2–0.28)` | Selected chip border |
| Text primary | `#FFFFFF` | Headings |
| Text secondary | `rgba(255,255,255,0.7)` | Body, secondary buttons |
| Text tertiary | `rgba(255,255,255,0.55)` | Labels, inactive filter items |
| Text quaternary | `rgba(255,255,255,0.45)` | Inactive tab labels |
| Text faint | `rgba(255,255,255,0.25)` | Placeholder text |
| Hairline | `rgba(255,255,255,0.04)` | Row dividers inside lists |
| Border subtle | `rgba(255,255,255,0.06–0.08)` | Inset panel borders |
| Border card | `rgba(255,255,255,0.07)` | Card outlines |
| Border control | `rgba(255,255,255,0.1–0.18)` | Buttons, chips |
| Inverse button | `#FFFFFF` bg / `#111111` text | Primary CTA; hover bg `#E8E8E8` |
| Chart blue | `#6B8FFF` | Data-viz series 2 |
| Chart green | `#34D399` | Data-viz series 3 |

Only three chart colors are used: `#C4A882`, `#6B8FFF`, `#34D399`. Do not introduce more without extending the system.

### Typography
- **Family:** `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- `-webkit-font-smoothing: antialiased` on body.

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero H1 | 52px | 900 | -2.5px | 1.18 |
| Section H2 | 28px | 800 | -0.8px | — |
| Eyebrow (e.g. "CORE FEATURES") | 11px | 700 | 3px, uppercase | — |
| Nav logo wordmark | 16px | 700 | -0.4px | — |
| Card title | ~18px | 700 | — | — |
| Body | 14–15px | 400–500 | -0.2px on CTAs | 1.5–1.6 |
| Link / inline action | 14px | 600 | — | — |
| Button label | 13.5–15px | 500 (secondary) / 600 (primary) | — | — |
| Chip / meta | 12–12.5px | 500–600 | — | — |
| Filter list item | 13px | 600 active / 400 inactive | — | — |
| Micro (mock UI inside cards) | 10.5px | — | — | 1.5 |

### Spacing, radius, misc
- Content max-width: **1100px**; page gutter **32px**.
- Nav height: **64px**, `position: sticky; top: 0; z-index: 100`, background `#181818`, `backdrop-filter: blur(16px)`, no bottom border.
- Section padding: hero `100px 32px 84px`; standard section `80px 32px 100px`; app pages `48px 32px 80px`.
- Card padding: `28px`; internal content block `24px 28px 28px`.
- Radii: pill `99px`; large card `20px`; medium card/panel `14px`; button `10px`; small button `8px`; input/inset `6–7px`; chat bubble `10px 10px 2px 10px`.
- Page-enter animation: `@keyframes pageEnter { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform: translateY(0) } }`, applied as `pageEnter 0.35s ease` to each page root.
- Full-height app pages use `min-height: calc(100vh - 64px)`; the map page uses `height: calc(100vh - 64px)` with `overflow: hidden`.

---

## Screens / Views

Routing in the prototype is a single `currentPage` state value. Map these to real routes.

| `currentPage` | Suggested route | Screen |
|---|---|---|
| `home` | `/` | Marketing home |
| `data` | `/data` | Data selection & results |
| `api` | `/api` | API documentation / connect |
| `projects` | `/projects` | Saved projects list + detail |
| `maps` | `/maps` | Map & analysis workspace |
| `request` | `/request` | Custom data request (맞춤 의뢰) |

### Global — Navigation bar
Sticky, 64px tall, `#181818`. Left: logo — a 20×20 SVG of four 8.5×8.5 rounded squares (`rx=2`) in a 2×2 grid, diagonal pair at full opacity `#C4A882`, off-diagonal pair at `opacity 0.35`; gap 9px; wordmark "SoSpatial" 16px/700 white. Logo has `margin-right: 52px` then the nav links. Right cluster: a secondary ghost button (`1px solid rgba(255,255,255,0.18)`, transparent, `rgba(255,255,255,0.7)` text) and **회원가입** — white pill, `#111` text, 600, hover `#E8E8E8`. All nav buttons: `padding: 8px 20px`, radius 8px, 13.5px.

### 1. Home (`home`)
**Purpose:** explain the product and route into the three core jobs.

- **Hero** — centered, max-width 680px, background `#181818`, padding `100px 32px 84px`.
  - Badge pill: 6px `#C4A882` dot + "AI-Ready 공간 데이터 플랫폼" (12.5px, `rgba(255,255,255,0.5)`), `1px solid rgba(255,255,255,0.1)`, bg `rgba(255,255,255,0.05)`, radius 99px, `margin-bottom: 32px`.
  - H1: "흩어진 공간 데이터를" / line break / "바로 쓸 수 있게." — the second line in `#C4A882`.
  - Sub-paragraph, then a 10px-gap button row: primary white CTA → `/data`, secondary ghost CTA.
- **Core features band** — background `#222222`, padding `80px 32px 100px`.
  - Eyebrow "CORE FEATURES" + H2 "필요한 곳에서 바로 시작하세요", centered, `margin-bottom: 48px`.
  - Three cards in a row, each `#181818`, radius 20px, `1px solid rgba(255,255,255,0.07)`, flex column. Each card has a **185px-tall illustrative mock header** built from plain divs (no images), then a body with title, description, chips (`rgba(255,255,255,0.05)` bg, `1px solid rgba(255,255,255,0.1)`, radius 99px, 12px text), then one or two accent text links with a 14px right-arrow SVG (`stroke-width: 2.5`).
    1. **Data search card** — mock of the filter form (two placeholder inputs "주제 *" / "지역 *", a selected accent row, two skeleton bars). Links: "데이터 둘러보기" → `/data`, "API 연동" → `/api`.
    2. **Map analysis card** — mock map: absolutely positioned grid background (`linear-gradient` 1px lines, `rgba(255,255,255,0.03)`). Chips include "AI 상담". Link: "분석 시작하기" → `/maps`.
    3. **Custom request card** — mock report card (60% width) with an accent title bar, skeleton lines, and a 5-bar chart (13px bars, heights 90/58/72/42/68%, colors tan/blue/green/tan/blue), plus two overlaid chat bubbles — a neutral one (`rgba(255,255,255,0.08)`) and an accent one (`#C4A882` bg, `#1A1A1A` text, radius `10px 10px 2px 10px`, max-width 140px). Chips include "맞춤 의뢰". Link: "사례·컨설팅 보기" → `/request`.

### 2. Data page (`data`)
Two sub-views driven by `dataView` (`landing` → `results`).

**Filter selection view**
- Optional project context pill at top when arriving from a saved project (`viewingProjectName`): folder SVG + name, accent tint bg/border, radius 8px.
- **Filter grid**: a single bordered container (`#242424`, `1px solid rgba(255,255,255,0.07)`, radius 14px, `overflow: hidden`) split into columns via `grid-template-columns` computed at runtime. Columns, left to right: **주제 → 세부 주제 → 단위 → 지역 → 년도**. Each column is a scrollable list of rows.
  - Row (inactive): `padding: 9px 16px`, 13px, `rgba(255,255,255,0.55)`, `border-bottom: 1px solid rgba(255,255,255,0.04)`.
  - Row (active): same padding, `#C4A882` text, weight 600, background `rgba(196,168,130,0.08)`, `border-left: 2px solid #C4A882`.
  - Multi-select per column; each list includes a "전체" (All) option. Later columns are populated by de-duplicating the union of options implied by the earlier selections (see State Management).
- **Results**: a checkbox list of matching variables; each has a name and metadata. A save action opens the save modal.
- Validation before saving (in order, first failure wins, shown as an inline warning that auto-clears after 3000ms):
  1. `주제를 선택해 주세요.`
  2. `세부 주제를 선택해 주세요.`
  3. `단위를 선택해 주세요.`
  4. `지역을 선택해 주세요.`
  5. `년도를 선택해 주세요.`
  6. `저장할 데이터를 1개 이상 선택해 주세요.`

**Save-to-project modal**
- Segmented control, two tabs (`새 프로젝트` / `기존 프로젝트`): each `flex: 1`, `padding: 7px`, radius 6px, 13px/600; active `#333` bg with white text, inactive transparent with `rgba(255,255,255,0.45)`.
- New: text input for project name. Existing: `<select>` of saved projects.
- Confirm writes the selection into the project and shows a toast.

### 3. Projects page (`projects`)
List of saved projects; selecting one opens its detail (`viewingProject`). Each project stores `{ id, name, sharing, sharedWith[], date, items[] }`. Row actions: open in data page (sets `viewingProjectName`), share, delete. Multi-select via `projectChecked`.

**Share modal** — email chip input: type an email, press add → chip appears in a list; each chip has a remove control. Already-shared addresses are listed separately with a revoke control. Confirming sets the project's `sharing` to `내가 공유` and stores `sharedWith`; revoking all resets it to `공유 안함`. Empty submissions are ignored; duplicates are ignored.

### 4. Maps page (`maps`)
Full-bleed workspace: `height: calc(100vh - 64px)`, `display: flex`, `overflow: hidden`. Sidebar of layers/filters beside a map canvas, with an AI consultation panel. Replace the placeholder canvas with a real map SDK; keep the sidebar chrome as designed.

### 5. API page (`api`)
Documentation-style page on `#181818`: endpoint descriptions and code samples for connecting to the dataset API.

### 6. Request page (`request`)
Custom data request flow with its own sub-view state (`requestView`, starting at `landing`). Navigating between sub-views scrolls the window to top (`window.scrollTo({ top: 0 })`).

---

## Interactions & Behavior
- **Page transitions:** every page root plays `pageEnter 0.35s ease` on mount. Navigation resets `requestView` to `landing`; navigating to `data` also clears `viewingProjectName` and resets `dataView` to `landing`; navigating to `projects` clears `viewingProject` and `projectChecked`.
- **Hover:** primary white buttons → `#E8E8E8`. Ghost buttons lighten their border/text. Cards and list rows have subtle background lifts. Every interactive element sets `cursor: pointer`.
- **Toasts:** `showToastMsg(msg)` sets `showToast: true` and auto-dismisses after **2500ms**.
- **Inline warnings:** auto-clear after **3000ms**.
- **Modals:** click on the backdrop closes; clicks inside call `stopPropagation`.
- **Filter cascade:** selecting topics repopulates sub-topics; selecting sub-topics repopulates the variable list, de-duplicated by variable name. Selecting "전체" in a column means "all options from the selected parents".
- **Responsive:** the prototype is desktop-only (fixed 1100px content column). Confirm the responsive requirement with design before shipping — mobile layouts are not specified here.

## State Management
Prototype state (all on one component; split into route-level state + a store in production):

```
currentPage: 'home' | 'data' | 'api' | 'projects' | 'maps' | 'request'
dataView:    'landing' | 'results'
requestView: 'landing' | ...
filterTopic / filterSubTopic / filterUnit / filterRegion / filterYear : string[]
dataChecked: string[]            // selected result rows
projects: Project[]              // persisted
viewingProject / viewingProjectName / projectChecked
showSaveModal, saveMode ('new'|'existing'), saveProjectName, saveTargetId, saveWarnMsg
showShareModal, shareProjectId, shareEmail, shareEmails[]
showToast, toastMsg
showFilePicker, pickerService, pickedFile
```

Reference data lives in a `TOPIC_DATA` map (`topic → { subTopics: string[], variables: { [subTopic]: {name, ...}[] } }`) and a Korean administrative-region map (`시/도 → 구/군[]`, e.g. 서울특별시 → 강남구, 강동구, …). In production both come from the API — treat the in-file copies as fixtures for the shape.

**Persistence:** `localStorage['sospatial_projects']`, written in `componentDidUpdate` whenever `projects` changes; a one-time reset flag `sospatial_reset_v1` clears stale data on first load. Replace both with real API calls.

**Data fetching needed:** topic/sub-topic/unit/region/year taxonomy, variable search by filter combination, project CRUD, project sharing (invite by email, revoke), map layer/tile data, custom-request submission.

## Assets
No external image assets. All illustration is inline SVG or CSS-drawn divs. The logo is the inline four-square SVG described above. Fonts: Pretendard (self-host or load from a CDN in the target app).

## Files
- `SoSpatial Platform.dc.html` — the full prototype (all six screens, all modals, all logic).
- `Data page samples.dc.html` — alternative layout explorations for the data page. Reference only; the shipped direction is the one in the main file.
