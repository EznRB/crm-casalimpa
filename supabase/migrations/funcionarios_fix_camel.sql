-- Ajustar nomes de colunas para camelCase conforme o código

-- employees
alter table public.employees rename column createdat to "createdAt";
alter table public.employees rename column updatedat to "updatedAt";
alter table public.employees rename column dailyrate to "dailyRate";

-- employee_work_records
alter table public.employee_work_records rename column employeeid to "employeeId";
alter table public.employee_work_records rename column workdate to "workDate";
alter table public.employee_work_records rename column workdays to "workDays";
alter table public.employee_work_records rename column dailyrate to "dailyRate";
alter table public.employee_work_records rename column totalamount to "totalAmount";
alter table public.employee_work_records rename column createdat to "createdAt";
alter table public.employee_work_records rename column updatedat to "updatedAt";
