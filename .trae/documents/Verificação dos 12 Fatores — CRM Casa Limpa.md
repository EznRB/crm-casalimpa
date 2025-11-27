# Verificar Sistema pelos 12 Passos e Corrigir Lacunas

## Estado Atual por Fator
- 1. Codebase Única — OK
  - Única app Next.js com App Router em `src/app/**`; `package.json` único; lock-file presente (`package-lock.json`).
- 2. Dependências Controladas — OK
  - Gerenciadas via `package.json` e `package-lock.json`; `.gitignore` cobre `node_modules`.
- 3. Configuração em Arquivos — OK
  - `.env`, `.env.local`, `.env.example`, `.env.local.example`; uso de `process.env` em `src/lib/supabase.ts`, `src/lib/supabaseServer.ts`, `src/middleware.ts`; mapeamento em `vercel.json`.
- 4. Serviços de Apoio Desacoplados — OK
  - `Supabase` encapsulado em `src/lib/supabase*.ts`; HuggingFace via `src/lib/ai/provider.ts`; PDFs via rotas dedicadas.
- 5. CI/CD Pipeline — OK
  - `.github/workflows/ci.yml` roda lint/type-check/build/test e deploy no Vercel; `vercel.json` configura regiões e duration.
- 6. Aplicação Sem-Estado — OK
  - Sessão via cookies do Supabase no middleware; sem escrita em disco; PDFs/CSV gerados em memória.
- 7. Port Binding — OK
  - Dev: `next dev --hostname 0.0.0.0 -p 3001` (`package.json:6`); Prod: `next start` (usa `PORT` do ambiente).
- 8. Concorrência — Parcial
  - `Promise.all` em pontos específicos; sem fila/pool ou backpressure em streaming.
- 9. Descartabilidade — Parcial
  - `puppeteer` fecha recursos; falta `AbortController` e hooks de shutdown (irrelevantes em serverless, mas úteis fora).
- 10. Paridade Dev/Prod — Parcial
  - Cookie `dev_auth` no `src/middleware.ts` pode burlar login em produção; `NEXT_PUBLIC_SITE_URL` não definido em `vercel.json`.
- 11. Logs como Stream de Eventos — Falta
  - Uso disperso de `console.*`; sem logger central, níveis, `requestId` ou SSE.
- 12. Processos de Admin — OK
  - `scripts/seed.js` e testes Playwright; sem migrações formais (Prisma legado não usado).

Referências de código exemplares:
- CI: `.github/workflows/ci.yml`; Deploy: `vercel.json`.
- Autenticação: `src/middleware.ts`, `src/lib/supabaseServer.ts`.
- Configs: `src/lib/supabase.ts`, `.env.local.example`.
- PDFs: `src/app/api/invoices/[id]/pdf/route.ts:84-106`, `src/app/api/reports/pdf/route.ts:210-229`.
- Dev script: `package.json:6`.

## Riscos Prioritários
- Bypass de autenticação via `dev_auth` ativo em produção (`src/middleware.ts`).
- Falta de logger estruturado dificulta operação e auditoria.
- `NEXT_PUBLIC_SITE_URL` ausente em produção pode gerar links de e-mail inconsistentes.
- Streaming sem controle de backpressure.

## Plano de Adequação
- Logging
  - Criar `src/lib/logger.ts` com níveis (`debug/info/warn/error`), JSON por padrão e `requestId`.
  - Incluir wrapper de handlers para logar início/fim/erros nas rotas `src/app/api/**/route.ts`.
  - Gerar e propagar `x-request-id` no `src/middleware.ts`.
- Segurança/Paridade
  - Condicionar o cookie `dev_auth` exclusivamente a `NODE_ENV === 'development'` e removê-lo do fluxo em produção.
  - Definir `NEXT_PUBLIC_SITE_URL` em Vercel (prod e preview) para redirecionos.
- Descartabilidade
  - Adicionar `AbortController` nas chamadas externas; manter `browser.close()` já existente.
  - Opcional: endpoint `/api/health` simples retornando `200`.
- Concorrência
  - Introduzir limite de concorrência leve (ex.: `p-queue`) nas rotas mais intensas e `Promise.allSettled` onde apropriado.
  - No streaming do chatbot, aplicar pausas/backpressure.
- Port Binding/Docs
  - Documentar uso de `PORT` no `README.md`; `next start` respeita variável sem alterações de código.

## Validação
- Rodar testes existentes (Playwright) e incluir cenários de autenticação e geração de PDF.
- Verificar logs JSON no ambiente local e em Vercel.
- Testar fluxo de login/magic link com `NEXT_PUBLIC_SITE_URL` configurado.

Se aprovar, aplico os ajustes acima, refatoro as rotas críticas para usar o logger e removo o bypass em produção, além de configurar a variável no Vercel.