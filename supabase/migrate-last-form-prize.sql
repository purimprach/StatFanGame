-- รันไฟล์นี้ใน Supabase SQL Editor (ครั้งเดียว)
-- สำหรับกรอกชื่อผู้กรอกฟอร์มคนสุดท้าย → ซิงก์ไปจอ MC อัตโนมัติ

create table if not exists public.stat_last_form_prize (
  id text primary key,
  display_name text,
  student_id text,
  branch text,
  registered_at text,
  updated_at timestamptz default now()
);

alter table public.stat_last_form_prize enable row level security;

drop policy if exists "Allow anonymous read last form prize"
  on public.stat_last_form_prize;
drop policy if exists "Allow anonymous insert last form prize"
  on public.stat_last_form_prize;
drop policy if exists "Allow anonymous update last form prize"
  on public.stat_last_form_prize;
drop policy if exists "Allow anonymous delete last form prize"
  on public.stat_last_form_prize;

create policy "Allow anonymous read last form prize"
  on public.stat_last_form_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert last form prize"
  on public.stat_last_form_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update last form prize"
  on public.stat_last_form_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete last form prize"
  on public.stat_last_form_prize for delete to anon, authenticated using (true);

do $$
begin
  alter publication supabase_realtime add table public.stat_last_form_prize;
exception
  when duplicate_object then null;
end $$;
