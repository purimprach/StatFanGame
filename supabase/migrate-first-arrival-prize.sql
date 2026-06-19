-- รันไฟล์นี้ใน Supabase SQL Editor (ครั้งเดียว)
-- สำหรับกรอกชื่อผู้มางานคนแรกวันงาน → ซิงก์ไปจอ MC อัตโนมัติ

create table if not exists public.stat_first_arrival_prize (
  id text primary key,
  display_name text,
  student_id text,
  branch text,
  arrived_at text,
  updated_at timestamptz default now()
);

alter table public.stat_first_arrival_prize enable row level security;

drop policy if exists "Allow anonymous read first arrival prize"
  on public.stat_first_arrival_prize;
drop policy if exists "Allow anonymous insert first arrival prize"
  on public.stat_first_arrival_prize;
drop policy if exists "Allow anonymous update first arrival prize"
  on public.stat_first_arrival_prize;
drop policy if exists "Allow anonymous delete first arrival prize"
  on public.stat_first_arrival_prize;

create policy "Allow anonymous read first arrival prize"
  on public.stat_first_arrival_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert first arrival prize"
  on public.stat_first_arrival_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update first arrival prize"
  on public.stat_first_arrival_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete first arrival prize"
  on public.stat_first_arrival_prize for delete to anon, authenticated using (true);

do $$
begin
  alter publication supabase_realtime add table public.stat_first_arrival_prize;
exception
  when duplicate_object then null;
end $$;
