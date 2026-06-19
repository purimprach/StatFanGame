-- Random draw name lists (admin fills -> MC home /random pages)

create table if not exists public.stat_draw_lists (
  id text primary key,
  students jsonb not null default '{"BIT":[],"INS":[],"STAT":[]}'::jsonb,
  teachers jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

insert into public.stat_draw_lists (id, students, teachers)
values ('live', '{"BIT":[],"INS":[],"STAT":[]}'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.stat_draw_lists enable row level security;

create policy "Allow anonymous read draw lists"
  on public.stat_draw_lists for select to anon, authenticated using (true);

create policy "Allow anonymous insert draw lists"
  on public.stat_draw_lists for insert to anon, authenticated with check (true);

create policy "Allow anonymous update draw lists"
  on public.stat_draw_lists for update to anon, authenticated using (true);

create policy "Allow anonymous delete draw lists"
  on public.stat_draw_lists for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_draw_lists;
