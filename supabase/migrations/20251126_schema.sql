-- CRM Casa Limpa – Migração de esquema Supabase (idempotente)

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text not null,
  address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_name on public.customers (name);

-- Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price numeric not null,
  description text,
  duration_minutes int not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_services_name on public.services (name);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  appointment_date date not null,
  appointment_time text not null,
  status text not null default 'scheduled',
  price numeric not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appointments_date on public.appointments (appointment_date);
create index if not exists idx_appointments_status on public.appointments (status);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique not null references public.appointments(id) on delete cascade,
  invoice_number text unique not null,
  issue_date date not null default (now()::date),
  due_date date not null default (now()::date + interval '30 days'),
  subtotal numeric not null,
  tax numeric not null default 0,
  total numeric not null,
  status text not null default 'pending',
  pdf_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_invoices_status on public.invoices (status);

-- Cashflow Transactions
create table if not exists public.cashflow_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  category text,
  amount numeric not null,
  transaction_date date not null,
  client_id uuid references public.customers(id),
  invoice_id uuid references public.invoices(id),
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_cashflow_date on public.cashflow_transactions (transaction_date);

-- Company
create table if not exists public.company (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  phone text not null,
  email text not null,
  address jsonb not null,
  bank_info jsonb,
  logo_url text,
  updated_at timestamptz not null default now()
);

-- Employees
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text not null,
  cpf text unique not null,
  address jsonb,
  position text not null default 'Funcionário',
  salary numeric,
  daily_rate numeric not null default 150,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_employees_name on public.employees (name);

-- Employee Work Records
create table if not exists public.employee_work_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null,
  work_days numeric not null default 1,
  daily_rate numeric not null default 150,
  total_amount numeric not null,
  notes text,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_work_records_employee_date on public.employee_work_records (employee_id, work_date);

-- RLS (habilitar e permitir apenas usuários autenticados)
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices enable row level security;
alter table public.cashflow_transactions enable row level security;
alter table public.company enable row level security;
alter table public.employees enable row level security;
alter table public.employee_work_records enable row level security;

create policy if not exists "Authenticated read" on public.customers for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.customers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.services for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.services for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.appointments for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.appointments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.invoices for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.invoices for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.cashflow_transactions for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.cashflow_transactions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.company for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.company for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.employees for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.employees for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated read" on public.employee_work_records for select using (auth.role() = 'authenticated');
create policy if not exists "Authenticated write" on public.employee_work_records for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

