-- Extensões necessárias
create extension if not exists "pgcrypto";

-- Tabela de funcionários
create table if not exists public.employees (
  id           text primary key default gen_random_uuid()::text,
  name         varchar(255) not null,
  email        varchar(255) unique,
  phone        varchar(50) not null,
  cpf          varchar(14) not null unique,
  address      jsonb,
  position     varchar(100) not null default 'Funcionário',
  salary       numeric(12,2),
  dailyRate    numeric(10,2) not null default 150,
  active       boolean not null default true,
  notes        text,
  createdAt    timestamptz not null default now(),
  updatedAt    timestamptz not null default now()
);

-- Índices úteis
create index if not exists employees_name_idx on public.employees (name);
create index if not exists employees_active_idx on public.employees (active);

-- Tabela de registros de trabalho
create table if not exists public.employee_work_records (
  id           text primary key default gen_random_uuid()::text,
  employeeId   text not null references public.employees(id) on delete cascade,
  workDate     timestamptz not null,
  workDays     int not null default 1,
  dailyRate    numeric(10,2) not null default 150,
  totalAmount  numeric(12,2) generated always as ((workDays::numeric) * dailyRate) stored,
  notes        text,
  paid         boolean not null default false,
  createdAt    timestamptz not null default now(),
  updatedAt    timestamptz not null default now()
);

create index if not exists employee_work_records_employee_idx on public.employee_work_records (employeeId);
create index if not exists employee_work_records_paid_idx on public.employee_work_records (paid);
create index if not exists employee_work_records_workdate_idx on public.employee_work_records (workDate);

-- Habilitar RLS
alter table public.employees enable row level security;
alter table public.employee_work_records enable row level security;

-- Políticas simples: permitir usuários autenticados ler/escrever
create policy employees_select_authenticated
  on public.employees for select
  to authenticated
  using (true);

create policy employees_insert_authenticated
  on public.employees for insert
  to authenticated
  with check (true);

create policy employees_update_authenticated
  on public.employees for update
  to authenticated
  using (true)
  with check (true);

create policy employees_delete_authenticated
  on public.employees for delete
  to authenticated
  using (true);

create policy employee_work_records_select_authenticated
  on public.employee_work_records for select
  to authenticated
  using (true);

create policy employee_work_records_insert_authenticated
  on public.employee_work_records for insert
  to authenticated
  with check (true);

create policy employee_work_records_update_authenticated
  on public.employee_work_records for update
  to authenticated
  using (true)
  with check (true);

create policy employee_work_records_delete_authenticated
  on public.employee_work_records for delete
  to authenticated
  using (true);
