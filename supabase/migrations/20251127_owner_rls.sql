alter table public.customers add column if not exists owner_user_id uuid;
create index if not exists customers_owner_user_id_idx on public.customers(owner_user_id);
alter table public.customers enable row level security;
alter table public.customers force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='customers' loop execute format('drop policy %I on public.customers', pol.policyname); end loop; end $$;
create policy customers_select_own on public.customers for select using (owner_user_id = auth.uid());
create policy customers_insert_own on public.customers for insert with check (owner_user_id = auth.uid());
create policy customers_update_own on public.customers for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy customers_delete_own on public.customers for delete using (owner_user_id = auth.uid());

alter table public.services add column if not exists owner_user_id uuid;
create index if not exists services_owner_user_id_idx on public.services(owner_user_id);
alter table public.services enable row level security;
alter table public.services force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='services' loop execute format('drop policy %I on public.services', pol.policyname); end loop; end $$;
create policy services_select_own on public.services for select using (owner_user_id = auth.uid());
create policy services_insert_own on public.services for insert with check (owner_user_id = auth.uid());
create policy services_update_own on public.services for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy services_delete_own on public.services for delete using (owner_user_id = auth.uid());

alter table public.appointments add column if not exists owner_user_id uuid;
create index if not exists appointments_owner_user_id_idx on public.appointments(owner_user_id);
alter table public.appointments enable row level security;
alter table public.appointments force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='appointments' loop execute format('drop policy %I on public.appointments', pol.policyname); end loop; end $$;
create policy appointments_select_own on public.appointments for select using (owner_user_id = auth.uid());
create policy appointments_insert_own on public.appointments for insert with check (owner_user_id = auth.uid());
create policy appointments_update_own on public.appointments for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy appointments_delete_own on public.appointments for delete using (owner_user_id = auth.uid());

alter table public.appointment_series add column if not exists owner_user_id uuid;
create index if not exists appointment_series_owner_user_id_idx on public.appointment_series(owner_user_id);
alter table public.appointment_series enable row level security;
alter table public.appointment_series force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='appointment_series' loop execute format('drop policy %I on public.appointment_series', pol.policyname); end loop; end $$;
create policy appointment_series_select_own on public.appointment_series for select using (owner_user_id = auth.uid());
create policy appointment_series_insert_own on public.appointment_series for insert with check (owner_user_id = auth.uid());
create policy appointment_series_update_own on public.appointment_series for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy appointment_series_delete_own on public.appointment_series for delete using (owner_user_id = auth.uid());

alter table public.invoices add column if not exists owner_user_id uuid;
create index if not exists invoices_owner_user_id_idx on public.invoices(owner_user_id);
alter table public.invoices enable row level security;
alter table public.invoices force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='invoices' loop execute format('drop policy %I on public.invoices', pol.policyname); end loop; end $$;
create policy invoices_select_own on public.invoices for select using (owner_user_id = auth.uid());
create policy invoices_insert_own on public.invoices for insert with check (owner_user_id = auth.uid());
create policy invoices_update_own on public.invoices for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy invoices_delete_own on public.invoices for delete using (owner_user_id = auth.uid());

alter table public.quotes add column if not exists owner_user_id uuid;
create index if not exists quotes_owner_user_id_idx on public.quotes(owner_user_id);
alter table public.quotes enable row level security;
alter table public.quotes force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='quotes' loop execute format('drop policy %I on public.quotes', pol.policyname); end loop; end $$;
create policy quotes_select_own on public.quotes for select using (owner_user_id = auth.uid());
create policy quotes_insert_own on public.quotes for insert with check (owner_user_id = auth.uid());
create policy quotes_update_own on public.quotes for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy quotes_delete_own on public.quotes for delete using (owner_user_id = auth.uid());

alter table public.quote_items add column if not exists owner_user_id uuid;
create index if not exists quote_items_owner_user_id_idx on public.quote_items(owner_user_id);
alter table public.quote_items enable row level security;
alter table public.quote_items force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='quote_items' loop execute format('drop policy %I on public.quote_items', pol.policyname); end loop; end $$;
create policy quote_items_select_own on public.quote_items for select using (owner_user_id = auth.uid());
create policy quote_items_insert_own on public.quote_items for insert with check (owner_user_id = auth.uid());
create policy quote_items_update_own on public.quote_items for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy quote_items_delete_own on public.quote_items for delete using (owner_user_id = auth.uid());

alter table public.quote_images add column if not exists owner_user_id uuid;
create index if not exists quote_images_owner_user_id_idx on public.quote_images(owner_user_id);
alter table public.quote_images enable row level security;
alter table public.quote_images force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='quote_images' loop execute format('drop policy %I on public.quote_images', pol.policyname); end loop; end $$;
create policy quote_images_select_own on public.quote_images for select using (owner_user_id = auth.uid());
create policy quote_images_insert_own on public.quote_images for insert with check (owner_user_id = auth.uid());
create policy quote_images_update_own on public.quote_images for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy quote_images_delete_own on public.quote_images for delete using (owner_user_id = auth.uid());

alter table public.cashflow_transactions add column if not exists owner_user_id uuid;
create index if not exists cashflow_transactions_owner_user_id_idx on public.cashflow_transactions(owner_user_id);
alter table public.cashflow_transactions enable row level security;
alter table public.cashflow_transactions force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='cashflow_transactions' loop execute format('drop policy %I on public.cashflow_transactions', pol.policyname); end loop; end $$;
create policy cashflow_transactions_select_own on public.cashflow_transactions for select using (owner_user_id = auth.uid());
create policy cashflow_transactions_insert_own on public.cashflow_transactions for insert with check (owner_user_id = auth.uid());
create policy cashflow_transactions_update_own on public.cashflow_transactions for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy cashflow_transactions_delete_own on public.cashflow_transactions for delete using (owner_user_id = auth.uid());

alter table public.company add column if not exists owner_user_id uuid;
create index if not exists company_owner_user_id_idx on public.company(owner_user_id);
alter table public.company enable row level security;
alter table public.company force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='company' loop execute format('drop policy %I on public.company', pol.policyname); end loop; end $$;
create policy company_select_own on public.company for select using (owner_user_id = auth.uid());
create policy company_insert_own on public.company for insert with check (owner_user_id = auth.uid());
create policy company_update_own on public.company for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy company_delete_own on public.company for delete using (owner_user_id = auth.uid());

alter table public.employees add column if not exists owner_user_id uuid;
create index if not exists employees_owner_user_id_idx on public.employees(owner_user_id);
alter table public.employees enable row level security;
alter table public.employees force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='employees' loop execute format('drop policy %I on public.employees', pol.policyname); end loop; end $$;
create policy employees_select_own on public.employees for select using (owner_user_id = auth.uid());
create policy employees_insert_own on public.employees for insert with check (owner_user_id = auth.uid());
create policy employees_update_own on public.employees for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy employees_delete_own on public.employees for delete using (owner_user_id = auth.uid());

alter table public.employee_work_records add column if not exists owner_user_id uuid;
create index if not exists employee_work_records_owner_user_id_idx on public.employee_work_records(owner_user_id);
alter table public.employee_work_records enable row level security;
alter table public.employee_work_records force row level security;
do $$ declare pol record; begin for pol in select policyname from pg_policies where schemaname='public' and tablename='employee_work_records' loop execute format('drop policy %I on public.employee_work_records', pol.policyname); end loop; end $$;
create policy employee_work_records_select_own on public.employee_work_records for select using (owner_user_id = auth.uid());
create policy employee_work_records_insert_own on public.employee_work_records for insert with check (owner_user_id = auth.uid());
create policy employee_work_records_update_own on public.employee_work_records for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy employee_work_records_delete_own on public.employee_work_records for delete using (owner_user_id = auth.uid());
