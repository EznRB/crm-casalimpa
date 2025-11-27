## Diagnóstico
- Receita de faturas: o endpoint `PATCH /api/invoices/:id` já insere receita em `cashflow_transactions` quando status vira `paid` (`src/app/api/invoices/[id]/route.ts:35-64`). Porém a UI atual marca pago via `updateInvoiceStatus` direto no Supabase, ignorando o endpoint, então não gera lançamento de caixa (`src/app/faturas/[id]/page.tsx:53-62`).
- Despesas manuais: funcionam via `createCashflowExpense` na página de Fluxo de Caixa (`src/app/fluxo-caixa/page.tsx:35-49` → `src/lib/db.ts:250-267`).
- Pagamento de diárias (funcionários): alterna apenas o campo `paid` sem criar despesa no caixa (`src/lib/db.ts:339-343`; UI em `src/app/funcionarios/[id]/registros/page.tsx:84-91`).
- Resumo do caixa: leitura direta de `cashflow_transactions` está correta (`src/lib/db.ts:176-248` e `src/app/api/cashflow/summary/route.ts:20-86`).

## Ajustes Necessários
- Centralizar alterações de status de fatura na rota de API para garantir criação automática de receita.
- Criar lançamento de despesa no caixa ao marcar registro de trabalho de funcionário como “Pago” (categoria `wages`).
- Corrigir carga de fatura na UI que usa `supabase` sem import explícito (`src/app/faturas/[id]/page.tsx:38-45`).
- Padronizar datas de transações: usar a data da ação (hoje) ou um campo `paid_at` da fatura, em vez de `issue_date` para receitas, quando disponível.

## Implementação Proposta
1) Faturas – uso da API
- Substituir `updateInvoiceStatus` na UI por chamada ao endpoint `PATCH /api/invoices/:id` (`src/app/faturas/[id]/page.tsx:53-62`), para garantir o `insert` no caixa (`src/app/api/invoices/[id]/route.ts:35-64`).
- Alternativa segura: alterar `src/lib/db.ts:updateInvoiceStatus` para chamar a rota HTTP, descontinuando atualização direta no Supabase (evita duplicidade de lançamentos).

2) Funcionários – lançar despesa ao pagar
- Em `src/app/api/employees/work-records/[id]/route.ts (PUT)`, ao `paid = true`, inserir em `cashflow_transactions` com:
  - `type: 'expense'`, `category: 'wages'`, `amount: totalAmount`, `transaction_date: workDate` (ou hoje), `description: 'Pagamento de diária: <nome>'`.
- Ajustar a UI (`src/app/funcionarios/[id]/registros/page.tsx:84-91`) para usar a rota `PUT` que contém essa lógica, ou trocar `toggleWorkRecordPaid` por um wrapper que chame a rota.

3) Data de receita de faturas
- Na rota de faturas, usar `new Date().toISOString().slice(0,10)` como `transaction_date` ou `paid_at` se existir; deixar `issue_date` como fallback.

4) Correção de import da UI de Faturas
- Importar `supabase` em `src/app/faturas/[id]/page.tsx` para leitura da fatura, ou migrar para `GET /api/invoices/:id` por consistência.

## Validação
- Cenário 1: marcar fatura como paga → verificar novo registro `income` em `cashflow_transactions` e atualização do resumo no mês (`src/app/fluxo-caixa/page.tsx`).
- Cenário 2: marcar diário de funcionário como paga → verificar novo registro `expense` com categoria `wages` e impacto no resumo.
- Cenário 3: lançar despesa manual → confirmar atualização imediata do resumo.
- Conferir em tempo real alterando o mês e recarregando; adicionar logs de verificação via UI (alerts já presentes).

## Observações
- Mantém RLS atual (`cashflow.sql:21-28`).
- Evitar duplicidade de lançamentos centralizando regras nos endpoints HTTP.
- Nomes de categorias existentes na UI: `products`, `transport`, `wages`, `other` — manter consistência com resumo por categoria.