## Revisão Técnica
- Conferir páginas criadas/alteradas:
  - `src/app/lancamento-rapido/page.tsx` (UI mobile-first, auto-save, “Falar e Registrar”).
  - `src/app/resumo-do-dia/page.tsx` (dashboard diário).
- Conferir APIs:
  - `POST /api/lancamento-rapido` (transação Prisma com `$executeRaw` para `cashflow_transactions`).
  - `GET /api/lancamento-rapido/duplicar` (duplicação de último dia, formato do payload principal).
  - `GET /api/resumo-do-dia` (agregados do dia).
  - `POST /api/speech/whisper` (opcional, usa `OPENAI_API_KEY`).
- Verificar compatibilidade com Supabase:
  - Uso de `owner_user_id` em consultas/raw.
  - Tabelas `appointments`/`cashflow_transactions` acessadas via SQL bruto sem modelos Prisma.

## Ajustes Identificados
- Atualizar a página para usar `GET /api/lancamento-rapido/duplicar` (hoje chama `GET /api/lancamento-rapido`).
- Completar `mergeVoiceIntoState` para adicionar funcionários (hoje não insere presença/diária no estado).
- Adicionar validação extra na API para garantir consistência quando materiais/observação forem agregados sem `obrasStatus`.
- Criar testes unitários para `parseVoice` (frases modelo e variações numéricas PT-BR).

## Testes e Verificação
- Rodar `type-check` e corrigir erros TypeScript existentes.
- Testar manualmente:
  - Fluxo “Duplicar último dia” e lançamento por voz.
  - KPIs em `/resumo-do-dia` para datas com e sem lançamentos.
- Se disponível, rodar smoke tests em dev e validar auto-save.

## Deploy
- Atualizar `README` com novas rotas e variáveis (`OPENAI_API_KEY`).
- Commitar em Git:
  - `git add . && git commit -m "feat: lançamento rápido + duplicar + STT + resumo do dia"`
  - `git push` para GitHub.
- Redeploy:
  - Acionar pipeline (ex.: Vercel) para build e deploy automático.
  - Validar em produção as rotas e páginas criadas.

## Plano de Execução
1) Corrigir rota na página para `GET /api/lancamento-rapido/duplicar`.
2) Completar `mergeVoiceIntoState` para funcionários.
3) Escrever testes unitários do parser e rodar `type-check`.
4) Atualizar docs; commit/push; disparar deploy.

Confirma aplicar essas correções e seguir com commit, push e redeploy?