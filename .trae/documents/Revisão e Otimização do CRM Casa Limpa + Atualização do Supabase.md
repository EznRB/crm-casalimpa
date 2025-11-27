## Visão Geral do Estado Atual
- Next.js App Router com autenticação via Supabase, cookie/session gerido em `src/middleware.ts:1-80`.
- Cliente Supabase no browser em `src/lib/supabase.ts:1-15` e no servidor em `src/lib/supabaseServer.ts:4-24`.
- API Routes para clientes, serviços, faturas, fluxo de caixa usam Supabase (ex.: `src/app/api/clients/route.ts:4-15`, `src/app/api/invoices/route.ts:4-35`).
- Há uso misto de Prisma apenas em Funcionários (`src/app/api/employees/route.ts:1-48`), porém o frontend usa diretamente tabelas Supabase (`src/app/funcionarios/page.tsx:29-43`).

## Problemas Encontrados
- Cookie setAll ausente no cliente de servidor: `src/lib/supabaseServer.ts:13-15` não persiste cookies; pode quebrar refresh de sessão.
- Supabase possivelmente nulo sem proteção em vários pontos (ex.: `src/hooks/useAuth.ts:11-27`, `src/components/Navigation.tsx:25-28`).
- Ícone não importado: uso de `<Save />` sem import em `src/app/funcionarios/[id]/registros/page.tsx:242`.
- Tipagem do Supabase incompleta: `src/types/supabase.ts` não inclui `employees` e `employee_work_records`; risco de inconsistência de nomes (camelCase vs snake_case).
- Mistura de Prisma sem dependência instalada no `package.json` (não há `@prisma/client`); API de funcionários ficará quebrada.
- PDF de fatura depende de `pdf_url`, mas a geração está em `/api/invoices/[id]/pdf` e nunca atualiza `pdf_url` (ex.: `src/app/faturas/page.tsx:84-90`).
- `.gitignore` não ignora `.env.local`; há chaves reais em `.env.local:1-4` (risco de commit acidental).

## Atualização das Tabelas no Supabase
- Criar/ajustar tabelas e colunas em snake_case alinhadas ao código:
  - `customers`: `id`, `name`, `email` (unique), `phone`, `address` (json), `notes`, `created_at`, `updated_at`.
  - `services`: `id`, `name`, `base_price` (numeric), `description`, `duration_minutes` (int, default 60), `active` (bool), `created_at`.
  - `appointments`: `id`, `customer_id` (fk customers), `service_id` (fk services), `appointment_date` (date), `appointment_time` (text), `status` (enum textual), `price` (numeric), `notes`, `created_at`, `updated_at`.
  - `invoices`: `id`, `appointment_id` (unique fk appointments), `invoice_number` (unique), `issue_date` (date default now), `due_date` (date), `subtotal` (numeric), `tax` (numeric), `total` (numeric), `status` (text), `pdf_url`, `created_at`.
  - `cashflow_transactions`: `id`, `type` (income|expense), `category`, `amount` (numeric), `transaction_date` (date), `client_id` (fk customers), `invoice_id` (fk invoices), `description`, `created_at`.
  - `company`: `id`, `name`, `cnpj`, `phone`, `email`, `address` (json), `bank_info` (json), `logo_url`, `updated_at`.
  - `employees`: `id`, `name`, `email` (unique, null), `phone`, `cpf` (unique), `address` (json), `position`, `salary` (numeric, null), `daily_rate` (numeric), `active` (bool), `notes`, `created_at`, `updated_at`.
  - `employee_work_records`: `id`, `employee_id` (fk employees), `work_date` (date), `work_days` (numeric), `daily_rate` (numeric), `total_amount` (numeric), `notes`, `paid` (bool), `created_at`, `updated_at`.
- Índices recomendados: `appointments(status)`, `appointments(appointment_date)`, `invoices(appointment_id)`, `cashflow_transactions(transaction_date)`, `employee_work_records(employee_id, work_date)`.
- Relações e FKs conforme `src/types/supabase.ts:112-127,169-177` e o uso em páginas (join de `appointments -> customers, services`).
- Políticas RLS mínimas: habilitar RLS e permitir acesso ao usuário autenticado em todas as tabelas usadas pelo CRM (escopo único do projeto, sem multi-tenant).

## Correções e Melhorias (sem alterar comportamento)
- Implementar cookies no servidor: replicar estratégia de `src/middleware.ts:13-25` dentro de `getServerSupabase` para `setAll`.
- Proteger uso do cliente no browser: checar `supabase` nulo em hooks e componentes antes de usar (ex.: `useAuth`, `Navigation`, páginas de listagem).
- Importar ícone faltante: adicionar import de `Save` (lucide-react) em `src/app/funcionarios/[id]/registros/page.tsx`.
- Unificar Funcionários no Supabase: substituir `prisma` em `src/app/api/employees/route.ts` por operações Supabase, mantendo o mesmo contrato do frontend.
- Tipar Employees: estender `src/types/supabase.ts` com `employees` e `employee_work_records` para segurança de tipos.
- PDF de Faturas: trocar lógica do cliente para abrir `/api/invoices/{id}/pdf` quando `pdf_url` estiver vazio; manter `pdf_url` para cache quando existir.
- Segurança: adicionar `.env.local` ao `.gitignore`; manter `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor (sem prefixo `NEXT_PUBLIC`).

## Otimizações Seguras de Lógica
- Dashboard: reduzir round-trips agrupando consultas (usar API `/api/reports/monthly` para consolidar contagens e receita) ou usar `select('*', { count: 'exact', head: true })` apenas onde necessário.
- Fluxo de Caixa: validar payload no servidor (`api/cashflow/expense`) e normalizar números (já em `route.ts:9-16`), adicionar limites e categorias conhecidas.
- Listagens: padronizar `.order` em colunas indexadas e limitar paginação quando aplicável.
- Supabase SSR: centralizar obtenção do usuário via `getAuthUser` e remover duplicações ad-hoc de `createClient` em `auth/callback`.

## Testes e Verificação
- Smoke e2e: navegar login → dashboard → clientes/serviços → criar agendamento concluído → gerar fatura → abrir PDF.
- API: validar respostas e erros 401 sem sessão para endpoints (`clients`, `services`, `invoices`, `cashflow`).
- Tipos: verificação `npm run type-check` depois de estender `src/types/supabase.ts`.

## Entregáveis
- Ajuste de `getServerSupabase` com cookies.
- Proteções de null em componentes e hooks.
- Import do ícone `Save` corrigido.
- API de Funcionários migrada para Supabase.
- Tipos atualizados `src/types/supabase.ts` (employees, work_records).
- Lógica de PDF usando endpoint dedicado.
- `.gitignore` atualizado para `.env.local`.

Confirma proceder com estas alterações e migrações no Supabase? 