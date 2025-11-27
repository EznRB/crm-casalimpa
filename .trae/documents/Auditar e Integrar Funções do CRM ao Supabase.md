## Visão Geral
- Verifiquei todo o código e mapeei integrações com Supabase já existentes em: `customers`, `services`, `appointments`, `invoices`, `cashflow_transactions`, `company`, `employees`, `employee_work_records`.
- Páginas e APIs já usam Supabase diretamente ou via rotas de API na pasta `src/app/api/*`.
- Única área com acesso indireto (via `fetch` para API) é Fluxo de Caixa; o backend dessas rotas já usa Supabase.

## O que Falta/Padronizar
- Padronizar acesso ao banco: hoje há mistura de chamadas diretas ao Supabase no cliente e chamadas via `fetch` para APIs que usam Supabase no servidor.
- Fluxo de Caixa (`src/app/fluxo-caixa/page.tsx`): mover operações de leitura/criação de despesas para um serviço compartilhado que usa Supabase (cliente) ou manter via API porém centralizar em uma camada de acesso ao banco.
- Tipagem e reuso: consolidar consultas em um módulo `db` com funções reutilizáveis e tipadas.

## Plano de Implementação
1. Criar camada de acesso ao banco (`src/lib/db.ts`)
- Expor funções: `getCustomers`, `getServices`, `getAppointments`, `getInvoices`, `createInvoice`, `updateInvoiceStatus`, `getCashflowTransactions`, `createCashflowExpense`, `getEmployees`, `createEmployee`, `updateEmployee`, `deleteEmployee`, `getEmployeeWorkRecords`, `addEmployeeWorkRecord`, `toggleWorkRecordPaid`, `getCompany`, `saveCompany`.
- Internamente usar `supabase.from(...).select/insert/update/delete` com retorno tipado.

2. Refatorar Fluxo de Caixa
- Atualizar `src/app/fluxo-caixa/page.tsx` para usar `db.getCashflowTransactions` e `db.createCashflowExpense` em vez de `fetch` para `/api/cashflow/*`.
- Garantir cálculo/labels no cliente permanecem iguais; apenas troca a fonte de dados.

3. Padronizar Páginas Principais para a Camada `db`
- Clientes, Serviços, Agendamentos, Faturas, Funcionários e Registros: substituir chamadas diretas ao `supabase` nas páginas por funções do `db`.
- Manter as rotas de API para cenários SSR/segurança quando necessário (ex.: geração de PDF), mas preferir o `db` para CRUDs simples no cliente.

4. Segurança e Políticas (Supabase)
- Confirmar variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` presentes.
- Validar RLS nas tabelas usadas: permitir operações necessárias e bloquear acesso indevido.
- Opcional: mover operações sensíveis (ex.: lançamentos de `cashflow_transactions`) para API com `service_role` se houver necessidade de privilégios elevados.

5. Testes e Verificação
- Rodar o app e validar listagem/criação/edição em: Clientes, Serviços, Agendamentos, Faturas, Funcionários, Registros e Fluxo de Caixa.
- Verificar Faturas: listagem, detalhes, mudança de status e geração de PDF continuam funcionando.
- Conferir que estados de loading/erro e toasts permanecem consistentes.

## Entregáveis
- Módulo `src/lib/db.ts` com funções tipadas e reutilizáveis.
- Páginas refatoradas para usar a camada `db`.
- Ajustes de segurança (RLS) documentados e verificados.
- Testes manuais concluídos nas telas citadas.

Confirma executar o plano e iniciar pelas funções de Fluxo de Caixa e criação do módulo `db`?