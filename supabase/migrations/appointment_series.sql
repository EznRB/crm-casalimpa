-- Tabela de séries de agendamentos e vínculo em appointments
create table if not exists public.appointment_series (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  start_date date not null,
  estimated_end_date date,
  status text not null default 'in_progress' check (status in ('scheduled','confirmed','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists series_id uuid references public.appointment_series(id);

create index if not exists idx_appointments_series on public.appointments (series_id);

-- RLS
alter table public.appointment_series enable row level security;

create policy if not exists appointment_series_select_authenticated
  on public.appointment_series for select
  to authenticated using (true);

create policy if not exists appointment_series_write_authenticated
  on public.appointment_series for all
  to authenticated using (true) with check (true);
