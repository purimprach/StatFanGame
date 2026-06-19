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
