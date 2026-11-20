-- Chạy trong Supabase > SQL Editor
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 20),
  av text,
  uid text,
  text text not null check (char_length(text) <= 500),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "read messages" on public.messages for select to anon using (true);
create policy "send messages" on public.messages for insert to anon with check (true);
alter publication supabase_realtime add table public.messages;
