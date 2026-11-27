-- 사주팩트(SajuFact) Supabase 초기 스키마
-- Supabase SQL Editor 또는 마이그레이션(init_sajufact_schema)에 적용됩니다.

create extension if not exists "pgcrypto";

-- 1. 사주 리포트 영구 보관 및 결과 캐싱 테이블
create table if not exists public.saju_reports (
  id text primary key,
  user_name text not null,
  gender text not null check (gender in ('female', 'male')),
  birth_date text not null,
  calendar_type text not null check (calendar_type in ('solar', 'lunar')),
  birth_hour text not null,
  worry text not null,
  menu text not null,
  dominant_element text not null,
  report_json jsonb not null,
  paid_plan text check (paid_plan in ('single', 'allinone')),
  keeper_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saju_reports_created_at
  on public.saju_reports (created_at desc);

-- 2. 결제 내역 테이블 (포트원 / 토스페이먼츠 연동용)
create table if not exists public.saju_payments (
  id uuid primary key default gen_random_uuid(),
  report_id text not null references public.saju_reports(id) on delete cascade,
  merchant_uid text unique not null,
  plan text not null check (plan in ('single', 'allinone')),
  amount integer not null check (amount in (990, 1910, 2900)),
  pay_method text not null check (pay_method in ('kakao', 'toss', 'naver', 'card')),
  status text not null default 'paid' check (status in ('ready', 'paid', 'cancelled', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_saju_payments_report_id
  on public.saju_payments (report_id);

-- 3. Row Level Security (RLS)
alter table public.saju_reports enable row level security;
alter table public.saju_payments enable row level security;

create policy "Allow anon read reports"
  on public.saju_reports for select
  to anon, authenticated
  using (true);

create policy "Allow anon upsert reports"
  on public.saju_reports for insert
  to anon, authenticated
  with check (true);

create table if not exists public.saju_wallets (
  wallet_id text primary key,
  user_name text not null,
  birth_date text not null,
  gender text not null default 'female',
  calendar_type text not null default 'solar',
  birth_hour text not null default '10',
  coins integer not null default 1 check (coins >= 0),
  free_chat_tickets integer not null default 1 check (free_chat_tickets >= 0),
  last_free_reset_key text not null default '',
  unlocked_themes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saju_chat_messages (
  id uuid primary key default gen_random_uuid(),
  wallet_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.saju_wallets enable row level security;
alter table public.saju_chat_messages enable row level security;
