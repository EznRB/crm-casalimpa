## Objetivo
- Padronizar todo acesso ao Supabase via `src/lib/db.ts`, reduzir duplicações de tipos e uniformizar carregamento/CRUD nas páginas.

## Expansão da Camada `db`
- Adicionar funções: `createCustomer`, `updateCustomer`, `createService`, `updateService`, `createAppointment`, `updateAppointment`, `deleteAppointment` (já criada), `createInvoice` (já criada com retorno), `getAppointments` (sem relações) e `getAppointmentsForCalendar`.
- Garantir retornos tipados usando `Database` e validar entradas mínimas (ex.: datas válidas, preço > 0).

## Refatoração de Páginas/Componentes
- Clientes:
  - `src/app/clientes/novo/page.tsx`: usar `db.createCustomer(...)`.
  - (Se existir edição) `src/app/clientes/[id]/editar/page.tsx`: usar `db.updateCustomer(...)`.
- Serviços:
  - `src/app/servicos/novo/page.tsx`: usar `db.createService(...)`.
  - `src/app/servicos/[id]/editar/page.tsx`: usar `db.updateService(...)`.
- Agendamentos:
  - `src/app/agendamentos/novo/page.tsx`: usar `db.createAppointment(...)` e fontes `db.getCustomers()`/`db.getServices()`.
  - `src/components/CalendarView.tsx`: ler com `db.getAppointmentsForCalendar(...)`.
  - `src/components/Dashboard.tsx`: trocar contagens/listas para `db`.
- Faturas:
  - `src/app/faturas/nova/page.tsx`: usar `db.createInvoice(...)` com validação.

## Tipos e Duplicações
- Substituir interfaces locais simples por tipos derivados de `Database` quando possível (ex.: `CustomerRow`, `ServiceRow`, `AppointmentRow`, `InvoiceRow`).
- Evitar divergências de nome de campo (ex.: `createdAt` vs `created_at`) mantendo mapping consistente onde necessário.

## Tratamento de Erro e Loading
- Manter padrão atual de `try/catch` com `alert` e estado `loading`/`saving`.
- Uniformizar mensagens de sucesso/erro; sem criar novos arquivos, padronizar strings nas páginas refatoradas.

## Segurança
- Revisar RLS no Supabase (fora do código) para permitir somente operações necessárias por usuário autenticado.
- Manter operações sensíveis no backend (PDF e agregações financeiras) quando exigirem privilégios.

## Verificação
- Testar CRUDs em Clientes, Serviços, Agendamentos e Faturas após refatoração.
- Validar Calendar/Dashboard com consultas via `db`.

Deseja que eu execute agora todas essas padronizações e testes?