-- Quotes (orçamentos) e itens de orçamento
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  service_id uuid references public.services(id),
  residence_type text not null,
  area_m2 numeric not null,
  service_modality text not null,
  valid_until date,
  discount numeric not null default 0,
  taxes numeric not null default 0,
  subtotal numeric not null,
  total numeric not null,
  status text not null default 'rascunho' check (status in ('rascunho','enviado','aceito','recusado','expirado')),
  notes text,
  rich_content jsonb,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null,
  total numeric not null
);

-- Índices úteis
create index if not exists idx_quotes_status on public.quotes (status);
create index if not exists idx_quotes_created_at on public.quotes (created_at);

-- RLS
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

create policy if not exists quotes_select_authenticated
  on public.quotes for select
  to authenticated using (true);

create policy if not exists quotes_write_authenticated
  on public.quotes for all
  to authenticated using (true) with check (true);

create policy if not exists quote_items_select_authenticated
  on public.quote_items for select
  to authenticated using (true);

create policy if not exists quote_items_write_authenticated
  on public.quote_items for all
  to authenticated using (true) with check (true);
