create extension if not exists vector;

create table if not exists public.chat_kb_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  embedding vector(384),
  created_at timestamptz default now()
);

alter table public.chat_kb_documents enable row level security;
create policy chat_kb_owner on public.chat_kb_documents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists chat_kb_user_idx on public.chat_kb_documents(user_id);
create index if not exists chat_kb_tags_idx on public.chat_kb_documents using gin (tags);

