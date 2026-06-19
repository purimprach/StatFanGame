-- รันเฉพาะไฟล์นี้ถ้า stat_answers / stat_active_question มีอยู่แล้ว
-- (อย่ารัน schema.sql ทั้งไฟล์ซ้ำ — จะ error policy ซ้ำ)

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

drop policy if exists "Allow anonymous read winner selection"
  on public.stat_winner_selection;
drop policy if exists "Allow anonymous insert winner selection"
  on public.stat_winner_selection;
drop policy if exists "Allow anonymous update winner selection"
  on public.stat_winner_selection;
drop policy if exists "Allow anonymous delete winner selection"
  on public.stat_winner_selection;

create policy "Allow anonymous read winner selection"
  on public.stat_winner_selection for select to anon, authenticated using (true);

create policy "Allow anonymous insert winner selection"
  on public.stat_winner_selection for insert to anon, authenticated with check (true);

create policy "Allow anonymous update winner selection"
  on public.stat_winner_selection for update to anon, authenticated using (true);

create policy "Allow anonymous delete winner selection"
  on public.stat_winner_selection for delete to anon, authenticated using (true);

do $$
begin
  alter publication supabase_realtime add table public.stat_winner_selection;
exception
  when duplicate_object then null;
end $$;
