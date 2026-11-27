-- Wallet & Free Chat Ticket tables for SajuFact (복주머니 코인 + 매일 밤 11시 무료 수다권)
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

create index if not exists idx_saju_chat_messages_wallet_id
  on public.saju_chat_messages (wallet_id, created_at desc);

alter table public.saju_wallets enable row level security;
alter table public.saju_chat_messages enable row level security;

drop policy if exists "Allow anon read wallets" on public.saju_wallets;
create policy "Allow anon read wallets"
  on public.saju_wallets for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow anon insert wallets" on public.saju_wallets;
create policy "Allow anon insert wallets"
  on public.saju_wallets for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow anon update wallets" on public.saju_wallets;
create policy "Allow anon update wallets"
  on public.saju_wallets for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow anon read chat messages" on public.saju_chat_messages;
create policy "Allow anon read chat messages"
  on public.saju_chat_messages for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow anon insert chat messages" on public.saju_chat_messages;
create policy "Allow anon insert chat messages"
  on public.saju_chat_messages for insert
  to anon, authenticated
  with check (true);
