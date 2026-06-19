-- STAT#55 Supabase schema (run in SQL Editor, then enable Realtime for stat_active_question)

create table if not exists public.stat_answers (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  branch text,
  game_type text not null,
  question_key text not null,
  answer_text text not null,
  is_correct boolean default false,
  submitted_at timestamptz default now()
);

create index if not exists stat_answers_submitted_at_idx
  on public.stat_answers (submitted_at desc);

create index if not exists stat_answers_question_idx
  on public.stat_answers (game_type, question_key);

alter table public.stat_answers enable row level security;

create policy "Allow anonymous insert"
  on public.stat_answers for insert to anon, authenticated with check (true);

create policy "Allow anonymous select"
  on public.stat_answers for select to anon, authenticated using (true);

create policy "Allow anonymous delete"
  on public.stat_answers for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_answers;

-- Live game sync: MC play page -> audience phones
create table if not exists public.stat_active_question (
  id text primary key,
  game_type text,
  question_key text,
  label text,
  updated_at timestamptz default now()
);

insert into public.stat_active_question (id, game_type, question_key, label)
values ('live', null, null, null)
on conflict (id) do nothing;

alter table public.stat_active_question enable row level security;

create policy "Allow anonymous read active question"
  on public.stat_active_question for select to anon, authenticated using (true);

create policy "Allow anonymous insert active question"
  on public.stat_active_question for insert to anon, authenticated with check (true);

create policy "Allow anonymous update active question"
  on public.stat_active_question for update to anon, authenticated using (true);

-- Enable Realtime for live MC ↔ phone sync
alter publication supabase_realtime add table public.stat_active_question;

-- Admin picks who MC shows for "คนตอบถูกเร็วที่สุด"
create table if not exists public.stat_winner_selection (
  game_type text not null,
  question_key text not null,
  player_name text not null,
  branch text,
  answer_text text,
  source_answer_id uuid,
  updated_at timestamptz default now(),
  primary key (game_type, question_key)
);

alter table public.stat_winner_selection enable row level security;

create policy "Allow anonymous read winner selection"
  on public.stat_winner_selection for select to anon, authenticated using (true);

create policy "Allow anonymous insert winner selection"
  on public.stat_winner_selection for insert to anon, authenticated with check (true);

create policy "Allow anonymous update winner selection"
  on public.stat_winner_selection for update to anon, authenticated using (true);

create policy "Allow anonymous delete winner selection"
  on public.stat_winner_selection for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_winner_selection;

-- First arrival prize (admin fills on event day -> MC home screen)
create table if not exists public.stat_first_arrival_prize (
  id text primary key,
  display_name text,
  student_id text,
  branch text,
  arrived_at text,
  updated_at timestamptz default now()
);

alter table public.stat_first_arrival_prize enable row level security;

create policy "Allow anonymous read first arrival prize"
  on public.stat_first_arrival_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert first arrival prize"
  on public.stat_first_arrival_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update first arrival prize"
  on public.stat_first_arrival_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete first arrival prize"
  on public.stat_first_arrival_prize for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_first_arrival_prize;

-- Last form registration prize (admin fills when form closes -> MC home screen)
create table if not exists public.stat_last_form_prize (
  id text primary key,
  display_name text,
  student_id text,
  branch text,
  registered_at text,
  updated_at timestamptz default now()
);

alter table public.stat_last_form_prize enable row level security;

create policy "Allow anonymous read last form prize"
  on public.stat_last_form_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert last form prize"
  on public.stat_last_form_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update last form prize"
  on public.stat_last_form_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete last form prize"
  on public.stat_last_form_prize for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_last_form_prize;

-- First teacher arrival prize (admin fills on event day -> MC home screen)
create table if not exists public.stat_first_teacher_prize (
  id text primary key,
  display_name text,
  teacher_title text,
  arrived_at text,
  updated_at timestamptz default now()
);

alter table public.stat_first_teacher_prize enable row level security;

create policy "Allow anonymous read first teacher prize"
  on public.stat_first_teacher_prize for select to anon, authenticated using (true);

create policy "Allow anonymous insert first teacher prize"
  on public.stat_first_teacher_prize for insert to anon, authenticated with check (true);

create policy "Allow anonymous update first teacher prize"
  on public.stat_first_teacher_prize for update to anon, authenticated using (true);

create policy "Allow anonymous delete first teacher prize"
  on public.stat_first_teacher_prize for delete to anon, authenticated using (true);

alter publication supabase_realtime add table public.stat_first_teacher_prize;

-- Random draw name lists (admin -> MC /random pages)
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
