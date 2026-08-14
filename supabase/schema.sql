-- ============================================================================
-- SoSpatial Platform — 3단계 스키마 v1 (2026-08-14)
-- 적용 방법: Supabase Dashboard → SQL Editor → New query → 전문 붙여넣기 → Run
-- 전체가 하나의 트랜잭션으로 실행되므로 중간에 실패하면 아무것도 적용되지 않는다.
--
-- 설계 근거는 CLAUDE.md "3단계 착수" 섹션의 확정 결정 6건.
--   결정 1: 비로그인은 localStorage(현행), 로그인은 이 DB. useProjects() 내부만 교체.
--   결정 2: Request 제출은 로그인 필수 → user_id 는 제출 시점에 항상 존재.
--   결정 5: 공유는 데이터 저장만(shared_with 배열). 접근 공유 RLS 는 보류.
-- users 테이블은 만들지 않는다 — Supabase Auth 의 auth.users 를 그대로 쓴다.
-- ============================================================================

-- updated_at 자동 갱신용 (Supabase 기본 제공 확장)
create extension if not exists moddatetime with schema extensions;

-- ── projects ────────────────────────────────────────────────────────────────
-- lib/projects.ts 의 Project 타입과 1:1 대응.
--   id 를 bigint identity 로 두는 이유: 앱의 Project.id 가 number 라서
--   uuid 로 바꾸면 "스토어 내부만 교체" 원칙이 깨진다. RLS 로 소유가 격리되므로
--   순번 id 노출은 무해하다.
--   date(표시용 문자열)는 컬럼으로 두지 않는다 — 어댑터가 created_at 에서 만든다.
--   variables 는 jsonb 통짜 (ProjectVariable[] 그대로). MVP 에서 정규화는 과설계.
create table public.projects (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 200),
  starred     boolean not null default false,
  sharing     text not null default '공유 안함',   -- DataSelect 저장 초기값과 동일
  variables   jsonb not null default '[]'::jsonb,
  shared_with text[] not null default '{}',        -- 결정 5: 이메일 목록 데이터만 저장
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure extensions.moddatetime (updated_at);

alter table public.projects enable row level security;

-- 소유자만 전 작업 가능. 보류 중인 "접근 공유"가 3단계 이후 구현되면
-- shared_with 기반 select 정책을 별도로 추가한다 (이 정책은 건드리지 않는다).
create policy "projects_owner_all"
  on public.projects
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── requests ────────────────────────────────────────────────────────────────
-- Request 폼 3종의 접수 레코드. 필드가 폼마다 달라 payload jsonb + method 판별자.
--   user_id 가 nullable 인 이유: 제출은 로그인 필수(결정 2 — insert 정책이 강제)지만,
--   이후 계정이 삭제돼도 접수 기록은 운영용으로 보존해야 하므로 on delete set null.
--   email 은 제출 시점의 회신 주소 스냅샷 — 계정이 사라져도 레코드에 남는다.
--   status 는 지금은 'received' 고정. 관리자 화면(보류)이 붙을 때 갱신한다.
create table public.requests (
  id         bigint generated always as identity primary key,
  user_id    uuid default auth.uid() references auth.users (id) on delete set null,
  email      text not null check (position('@' in email) > 1),
  method     text not null check (method in ('source', 'upload', 'describe')),
  payload    jsonb not null,
  status     text not null default 'received',
  created_at timestamptz not null default now()
);

create index requests_user_id_idx on public.requests (user_id);

alter table public.requests enable row level security;

-- 로그인 사용자가 자기 명의로만 insert. update/delete 정책은 의도적으로 없음 —
-- 접수 후 변조 불가. 운영자 조회는 service role(RLS 우회)로만 한다.
create policy "requests_insert_own"
  on public.requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 접수 내역 조회 허용 (지금 쓰는 화면은 없지만 향후 "내 요청" 화면 대비,
-- 노출 범위는 본인 것뿐이라 무해)
create policy "requests_select_own"
  on public.requests
  for select
  to authenticated
  using (auth.uid() = user_id);
