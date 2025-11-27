## Objetivo
- Concluir a padronização das páginas restantes para usar `src/lib/db.ts`, removendo chamadas diretas ao `supabase` nos componentes.

## Funções a Adicionar em `src/lib/db.ts`
- Funcionários: `getEmployeeById(id)`, `createEmployee(payload)`, `updateEmployee(id, payload)`, `deleteEmployee(id)`
- Registros: `addEmployeeWorkRecord({ employeeId, workDate, workDays, dailyRate, notes })`, `toggleWorkRecordPaid(id, paid)`
- Empresa: `saveCompany(payload)` (upsert: atualiza se existir `id`, senão cria)
- Clientes/Serviços (opcional, para completude): `createCustomer`, `updateCustomer`, `createService`, `updateService`

## Refatorações por Página
- `src/app/funcionarios/page.tsx`
  - Trocar busca e exclusão por `db.getEmployees()` e `db.deleteEmployee(id)`
- `src/app/funcionarios/novo/page.tsx`
  - Substituir verificação de CPF e criação por `db` (`getEmployees`/filtro e `createEmployee`)
- `src/app/funcionarios/[id]/editar/page.tsx`
  - Carregar com `db.getEmployeeById(id)` e salvar com `db.updateEmployee(id, payload)` mantendo a verificação de duplicidade de CPF
- `src/app/funcionarios/[id]/registros/page.tsx`
  - Carregar registros com `db.getEmployeeWorkRecords(id)`
  - Criar registro com `db.addEmployeeWorkRecord(...)`
  - Alternar pago/pendente com `db.toggleWorkRecordPaid(recordId, next)`
- `src/app/configuracoes/page.tsx`
  - Trocar leitura e gravação por `db.getCompany()` e `db.saveCompany(payload)`
- (Opcional) `src/app/faturas/[id]/page.tsx`
  - Usar `db.updateInvoiceStatus(id, status)` na atualização de status

## Segurança e Validações
- Manter validações existentes (CPF único, valores > 0, campos obrigatórios).
- Não alterar fluxos de UI; somente a fonte de dados.

## Testes/Verificação
- Validar cadastro/edição/exclusão de funcionários e criação/alternância de registros.
- Validar leitura e salvamento de configurações da empresa.
- Garantir estados de loading/erro e toasts continuam comportados.

Confirma a execução dessas refatorações e adição das funções no `db`?