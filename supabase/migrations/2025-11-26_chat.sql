create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text null,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('user','assistant','tool')),
  content jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_tools_executions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null,
  tool_name text not null,
  input jsonb not null,
  output jsonb null,
  status text default 'completed',
  created_at timestamptz default now()
);

create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  payload jsonb not null,
  status text default 'pending',
  scheduled_for timestamptz null,
  executed_at timestamptz null,
  created_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_tools_executions enable row level security;
alter table public.automation_jobs enable row level security;

create index if not exists chat_messages_session_idx on public.chat_messages(session_id);
create index if not exists chat_tools_session_idx on public.chat_tools_executions(session_id);
create index if not exists chat_sessions_user_idx on public.chat_sessions(user_id);

create policy chat_sessions_owner on public.chat_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy chat_messages_owner on public.chat_messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy chat_tools_owner on public.chat_tools_executions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy automation_jobs_owner on public.automation_jobs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

