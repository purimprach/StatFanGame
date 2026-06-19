-- รันไฟล์นี้ใน Supabase SQL Editor (ครั้งเดียว)
-- สำหรับกรอกชื่ออาจารย์มางานคนแรกวันงาน → ซิงก์ไปจอ MC อัตโนมัติ

create table if not exists public.stat_first_teacher_prize (
  id text primary key,
  display_name text,
  teacher_title text,
  arrived_at text,
  updated_at timestamptz default now()
);

alter table public.stat_first_teacher_prize enable row level security;

drop policy if exists "Allow anonymous read first teacher prize"
  on public.stat_first_teacher_prize;
drop policy if exists "Allow anonymous insert first teacher prize"
  on public.stat_first_teacher_prize;
drop policy if exists "Allow anonymous update first teacher prize"
  on public.stat_first_teacher_prize;
drop policy if exists "Allow anonymous delete first teacher prize"
  on public.stat_first_teacher_prize;

create policy "Allow anonymous read first teacher prize"
  on public.stat_first_teacher_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert first teacher prize"
  on public.stat_first_teacher_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update first teacher prize"
  on public.stat_first_teacher_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete first teacher prize"
  on public.stat_first_teacher_prize for delete to anon, authenticated using (true);

do $$
begin
  alter publication supabase_realtime add table public.stat_first_teacher_prize;
exception
  when duplicate_object then null;
end $$;
