-- Run this migration in Supabase SQL Editor if MCP migration confirmation was auto-cancelled.
alter table public.saju_payments
  drop constraint if exists saju_payments_amount_check;

alter table public.saju_payments
  add constraint saju_payments_amount_check
  check (amount in (990, 1910, 2900));

create index if not exists idx_saju_reports_user_name
  on public.saju_reports (user_name);

create index if not exists idx_saju_reports_keeper_phone
  on public.saju_reports (keeper_phone);

create index if not exists idx_saju_payments_report_id
  on public.saju_payments (report_id);

drop policy if exists "Allow anon update reports" on public.saju_reports;
create policy "Allow anon update reports"
  on public.saju_reports for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow anon insert payments" on public.saju_payments;
create policy "Allow anon insert payments"
  on public.saju_payments for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow anon read payments" on public.saju_payments;
create policy "Allow anon read payments"
  on public.saju_payments for select
  to anon, authenticated
  using (true);
