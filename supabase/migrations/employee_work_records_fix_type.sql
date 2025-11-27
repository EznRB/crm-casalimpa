-- Permitir meio-dia: tornar workDays numérico
alter table public.employee_work_records
  alter column "workDays" type numeric(5,2) using "workDays"::numeric;
alter table public.employee_work_records
  alter column "workDays" set default 1.0;
