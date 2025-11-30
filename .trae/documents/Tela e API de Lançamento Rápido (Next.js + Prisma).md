## Objetivo
- Criar a página `/lancamento-rapido` para registrar, em menos de 1 minuto, dados diários de obra em uma única tela com checklist, edição inline, suporte a teclado (Enter adiciona linha) e auto‑save a cada 1s.
- Persistir em uma rota central `/api/lancamento-rapido` usando transação Prisma para os modelos existentes e integração com a base atual para gastos.

## Arquitetura
- Frontend: React Client Components no App Router (`src/app/**`), Tailwind para UI e padrões já usados em páginas como `src/app/funcionarios/page.tsx:1`.
- Backend: API Route em `src/app/api/lancamento-rapido/route.ts` com `POST` (salvar tudo) e `GET` (duplicar último dia). Autenticação via Supabase Server, como em `src/lib/supabaseServer.ts:22`.
- Persistência:
  - Prisma (transação) para: `employees` (registros diários em `employee_work_records`), atualização de status e notas de `appointments`.
  - Gastos do dia via tabela existente `cashflow_transactions` (já usada pela API atual), mantendo compatibilidade: `src/app/api/cashflow/expense/route.ts:18`.
  - Observações rápidas e materiais: agregadas em `appointments.notes` do(s) atendimento(s) do dia.

## Mapeamento de Dados
- Funcionários presentes hoje: cria/atualiza `employee_work_records` (data de trabalho, diária/horas, total). Modelos Prisma já existem: `prisma/schema.prisma:116`.
- Horas trabalhadas ou diária: campo `workDays` (padrão diária=1) e `dailyRate`; se horas fornecidas, converte para fração de dia (ex.: 4h → 0.5). Total = `workDays * dailyRate`.
- Gastos do dia (descrição + valor): insere em `cashflow_transactions` com `type='expense'` e `category` apropriada (ex.: `materials`, `fuel`, `other`). API similar a `src/app/api/cashflow/expense/route.ts:18`.
- Materiais usados: lista textual por obra, persistida em `appointments.notes` com prefixo “Materiais: …”.
- Status das obras do dia: atualiza `appointments.status` no dia (model Prisma: `prisma/schema.prisma:45..62`). Obra = `appointments` ou `appointment_series` conforme uso atual (`src/app/api/jobs/route.ts:12`).
- Observações rápidas: agrega nas `appointments.notes` com prefixo “Obs: …”.

## Páginas e Componentes
- `src/app/lancamento-rapido/page.tsx`
  - Client component com layout simples (checklist) e estado global do dia.
  - Botões: `Salvar Tudo` (POST imediato) e `Duplicar último dia` (GET preenche estado).
  - Auto‑save: `useEffect` com debounce/interval 1s, abortando requisições concorrentes.
- `src/components/lancamento-rapido/ListaFuncionariosPresenca.tsx`
  - Lista com checkboxes de funcionários (`getEmployees` em `src/lib/db.ts:363`) e edição inline de `workDays`, `dailyRate`, `notes`.
  - Enter adiciona nova linha de presença; validações mínimas (valores > 0).
- `src/components/lancamento-rapido/ListaGastos.tsx`
  - Tabela de “descrição + valor”, edição inline e Enter para nova linha.
  - Validações: descrição não vazia e valor > 0.
- `src/components/lancamento-rapido/ListaMateriais.tsx`
  - Lista textual por obra (seleção de obra), edição inline e Enter para nova linha.
  - Persistência: agrega em `appointments.notes` do dia.
- `src/components/lancamento-rapido/StatusObras.tsx`
  - Carrega obras do dia via `/api/jobs?from=today&to=today` (`src/app/api/jobs/route.ts:17`), apresenta status como checklist/toggle.

## API `/api/lancamento-rapido`
- `POST`
  - Autentica com `getAuthUser` (`src/lib/supabaseServer.ts:22`).
  - Inicia transação Prisma: cria/atualiza `employee_work_records` do dia; atualiza `appointments.status` e concatena notas/materiais.
  - Após commit da transação Prisma, insere gastos via Supabase em `cashflow_transactions` (mantendo o fluxo financeiro atual do sistema).
  - Idempotência: evita duplicar registros por `(employeeId, workDate)` e não repete notas se já presentes.
- `GET`
  - “Duplicar último dia”: coleta último dia com registros (`employee_work_records` + `cashflow_transactions`) e retorna payload para preencher a UI.

## Interações e UX
- Edição inline: usa `contentEditable` ou inputs curtos, seguindo padrão já usado em `src/app/orcamentos/[id]/page.tsx` para edição inline.
- Suporte a teclado: Enter cria linha; Escape cancela edição; Tab navega entre campos.
- Auto‑save: salva incrementalmente a cada 1s quando há mudanças; `Salvar Tudo` força persistência imediata.

## Validações e Erros
- Validação mínima no cliente: campos obrigatórios e números positivos.
- No servidor: validação de schema do payload; mensagens amigáveis; retorno 400/401/500 conforme.
- Rollback: transação Prisma garante atomicidade para funcionários/obras; se gasto falhar, retorna erro e loga evento (gastos ficam fora da transação por pertencerem à tabela financeira existente).

## Entregáveis (arquivos)
- `src/app/lancamento-rapido/page.tsx`
- `src/components/lancamento-rapido/ListaFuncionariosPresenca.tsx`
- `src/components/lancamento-rapido/ListaGastos.tsx`
- `src/components/lancamento-rapido/ListaMateriais.tsx`
- `src/components/lancamento-rapido/StatusObras.tsx`
- `src/app/api/lancamento-rapido/route.ts`

## Verificação
- Rodar em dev e validar fluxo completo.
- Testar Enter para adicionar linhas e auto‑save.
- Conferir inserções: 
  - Registros em `employee_work_records` (Prisma).
  - Status/notas de `appointments`.
  - Gastos em `cashflow_transactions` (via API existente).

## Observação Técnica
- O projeto usa Supabase extensivamente para finanças (gastos). Para cumprir “transação Prisma” sem alterar modelos, a transação cobrirá as partes em Prisma (funcionários/obras), e gastos serão gravados no fluxo financeiro atual. Se desejarmos 100% Prisma, seria necessário adicionar modelos Prisma para `cashflow_transactions` (o que contrariaria o requisito de não alterar modelos).