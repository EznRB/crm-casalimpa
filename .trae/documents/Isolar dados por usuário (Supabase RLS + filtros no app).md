## Diagnóstico
- As consultas não filtram por usuário/tenant e as tabelas core não têm coluna de proprietário.
- Exemplos: `src/lib/db.ts:33` lista todos os `customers`; `src/app/api/clients/route.ts:8-12` retorna todos os clientes sem escopo.
- O seed (`scripts/seed.js:94-111`) insere dados “globais”. Resultado: qualquer autenticado vê/cria/edita tudo.

## Estratégia
- Implementar isolamento por usuário com uma coluna `owner_user_id` em todas as tabelas de CRM e políticas RLS que limitam leitura/escrita ao `auth.uid()`.
- Atualizar o app para sempre filtrar por `owner_user_id = user.id` e preencher `owner_user_id` em inserts.
- Corrigir o seed para gerar dados privados do usuário escolhido (admin) ou desabilitar em produção.

## Migração de Banco (Supabase)
- Adicionar `owner_user_id uuid not null` nas tabelas: `customers`, `services`, `appointments`, `appointment_series`, `invoices`, `cashflow_transactions`, `company`, `employees`, `employee_work_records`, `quotes`, `quote_items`, `quote_images`.
- Criar índices por `owner_user_id` para performance.
- Habilitar RLS e adicionar políticas:
  - Read: `using (owner_user_id = auth.uid())`
  - Insert/Update/Delete: `with check (owner_user_id = auth.uid())`
- Garantir consistência em relações: manter `owner_user_id` nas filhas igual ao da tabela pai (aplicado pelo app).

## Atualizações de Código
- Server-side (APIs): incluir filtro e atribuição:
  - `src/app/api/clients/route.ts:8-12` → `.eq('owner_user_id', user.id)`; `POST` → `insert([{...body, owner_user_id: user.id}])`.
  - Repetir para `services`, `appointments`, `invoices`, `employees`, `cashflow`, `quotes` e sub-recursos (`quote_items`, `quote_images`).
- Client-side (`src/lib/db.ts`): aplicar `.eq('owner_user_id', user.id)` em todos os `get*` e adicionar `owner_user_id` nos `insert`.
  - Exemplos: `getCustomers` (`src/lib/db.ts:33`), `getInvoices` (`src/lib/db.ts:87`), `getAppointments` (`src/lib/db.ts:182`).
- Tipos: atualizar `src/types/supabase.ts` adicionando `owner_user_id` nas `Row/Insert/Update` das tabelas afetadas.

## Seed e Dados Existentes
- `scripts/seed.js`: inserir `owner_user_id` (do usuário admin criado em `ensureAdminUser`) na criação de `customers` e `services`.
- Produção: desabilitar seed ou torná-lo idempotente e privado.
- Backfill: script único para preencher `owner_user_id` em linhas existentes (decisão: tudo para cada dono correspondente; se desconhecido, mover temporariamente para admin até reclassificação).

## Verificação
- Testar com duas contas (Enzo e Daniel): cada uma só enxerga/gera seus dados.
- Validar RLS: tentar acessar IDs de outro usuário e confirmar erro de autorização.
- Checar relatórios e PDFs: endpoints como `src/app/api/invoices/[id]/pdf/route.ts` devem filtrar por `owner_user_id` e falhar para registros alheios.

## Considerações
- Alternativa multi-empresa: usar `tenant_id` em vez de `owner_user_id` se houver compartilhamento entre usuários de uma mesma empresa.
- Performance: índices por `owner_user_id` + colunas usadas em filtros (ex.: datas) nos relatórios.
- Segurança: `dev_auth` já fica restrito ao `NODE_ENV !== 'production'`; manter assim.

Se aprovar, executo: criar migração RLS, atualizar tipos e aplicar filtros/atribuições no código e no seed, depois validar com testes de duas contas.