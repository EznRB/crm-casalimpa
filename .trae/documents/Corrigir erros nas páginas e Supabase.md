## Diagnóstico Rápido
- "net::ERR_ABORTED" em várias rotas é efeito colateral do App Router abortando requisições quando ocorre um erro no render/server; corrigimos as causas e esses aborts somem.
- Agendamentos: erro 42703 “appointments.start_time” indica uso de `start_time` no cliente; o schema usa `appointment_time`.
- Calendário: UI lê `a.customers.email`, mas `getAppointmentsForCalendar()` não busca email; e o fluxo de criação de série está incompleto (uso de `supabase` sem import e bloco quebrado).
- Faturas: trace mostra warning de setState durante render; além disso, há exceções quando algum relacionamento vem nulo.
- Orçamentos: PGRST205 “public.quotes não existe”; o código usa `quotes/quote_items`, mas o banco não tem essas tabelas.

## Correções em Agendamentos/Calendário
1. `src/components/CalendarView.tsx`
- Substituir todo uso de `start_time` por `appointment_time` (render e tipos). Ex.: lista do dia em `src/components/CalendarView.tsx:386–393`.
- Importar `supabase` de `@/lib/supabase` e proteger chamadas com `if (!supabase) return alert(...)` no handler “Adicionar dias à obra” e na criação de série.
- Completar `submitSeries` para inserir a série quando `!seriesTarget?.seriesId`:
  ```ts
  const { error: sErr } = await supabase.from('appointment_series').insert({
    id: seriesId,
    customer_id: customerId,
    service_id: serviceId,
    start_date: startDate,
    estimated_end_date: estimatedEnd,
    status: 'in_progress',
    notes: notes || null,
  })
  ```
  e tratar `sErr` antes de criar os agendamentos. Referência: `src/components/CalendarView.tsx:223–249`.
- No modal de detalhes, usar `a.customers.email || '—'` para evitar quebra se o email não vier. Referência: `src/components/CalendarView.tsx:441–443`.

2. `src/lib/db.ts`
- Incluir email do cliente no select de calendário:
  - Alterar `getAppointmentsForCalendar()` em `src/lib/db.ts:166–173` para: `select("*, customers (name, phone, email), services (name, duration_minutes)")`.

## Correções em Faturas
- Tornar renderização defensiva para relacionamentos:
  - Em `src/app/faturas/page.tsx:118–123`, usar `invoice.appointments?.customers?.name || '—'` e `invoice.appointments?.services?.name || '—'`.
- O warning de setState durante render é típico do Fast Refresh; garantir que nenhum `setState` ocorra fora de `useEffect` (já está). A correção acima evita exceptions que disparam o overlay.

## Correções em Orçamentos
1. Banco
- Criar migração para `quotes` e `quote_items` conforme tipos de `src/types/supabase.ts:240–317, 318–355` (colunas, FKs e RLS básicas). Salvar em `supabase/migrations/quotes.sql`.

2. UI
- Manter renderizações defensivas já existentes (`?.`) e tratar vazios.

## Ajustes de Esquema Supabase
- Criar migração para `appointment_series` (se ausente), alinhada a `src/types/supabase.ts:139–189`, com FK para `customers` e `services`, e RLS para usuários autenticados.
- Validar consistência de nomes camelCase vs snake_case em funcionários; as funções de dados usam snake_case (já coberto por migrações de ajuste `funcionarios_fix_camel.sql`).

## Verificação
- Rodar o projeto e navegar por: `/agendamentos`, `/agendamentos/novo`, `/faturas`, `/orcamentos`, `/fluxo-caixa`.
- Confirmar:
  - Calendário mostra horários usando `appointment_time` e email não quebra.
  - Faturas listam cliente/serviço sem exceptions.
  - Orçamentos carregam com o novo schema.
  - Logs de `net::ERR_ABORTED` cessam após os erros 42703/PGRST205 sumirem.

Se aprovar, aplico os edits nos arquivos citados e adiciono as migrações (quotes e appointment_series), depois valido em preview.