## Estado atual do projeto

* Stack: Next.js 14, React 18, Tailwind, next-pwa, Supabase (`@supabase/supabase-js`), Puppeteer. Sem NextAuth, Playwright ou Jest.

* Auth: Supabase Auth já implementado com magic link (`/login` + `/auth/callback`) e `middleware.ts` protegendo rotas.

* Dados: Supabase é usado nas páginas e API; há `prisma/schema.prisma` e migrações SQL em `supabase/migrations`.

* Páginas: clientes/serviços/agendamentos/faturas/relatórios já existem; alguns arquivos de criação/edição estão vazios.

* API: `/api/invoices/[id]/pdf` e `/api/reports/pdf` (pequeno bug de filename).

* PWA: já configurado; UI com Tailwind; sem testes nem CI.

## PR: task/3 - Configuração de ambiente e variáveis

* Criar `.env.example` consolidando variáveis:

  * `DATABASE_URL` (Postgres — Supabase ou local)

  * `NEXT_PUBLIC_SUPABASE_URL` (opcional se não usar client-side)

  * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (opcional)

  * `SUPABASE_SERVICE_ROLE_KEY` (opcional, somente server-side)

  * `NEXTAUTH_URL` (apenas se adotarmos NextAuth; hoje não necessário)

* Atualizar `README.md` com:

  * Passo a passo: copiar `.env.example` → `.env.local`/`.env`

  * Opções de banco: apontar Supabase Postgres ou local

  * Migrações (Prisma ou Supabase) e seed: `npm run db:migrate` e `npm run seed`

  * Configuração no Vercel: mapear `SUPABASE_*` e `DATABASE_URL`

* Aceitação: Dev replica `.env.example`, executa migrações e seed com instruções do README.

## PR: task/4 - Autenticação simples

* Reaproveitar Supabase Auth já implementado (magic link); polir `/login` (mensagens, validação simples).

* Garantir proteção de rotas:

  * Middleware mantém redirect para `/login` em páginas.

  * APIs protegidas retornam `401` se ausência de sessão.

* Documentar no README o fluxo e variáveis de auth.

* Aceitação: Login via magic link funciona; APIs e páginas protegidas exigem sessão e retornam `401` quando apropriado.

## PR: task/5 - CRUD Clients & Services

* API REST:

  * `/api/clients` — `GET` (lista), `POST` (cria)

  * `/api/clients/:id` — `GET`, `PATCH`, `DELETE`

  * `/api/services` — `GET`, `POST`

  * `/api/services/:id` — `GET`, `PATCH`, `DELETE`

* UI:

  * `/clients` lista + botão “Novo Cliente”

  * `/clients/new` formulário (validações simples)

  * `/clients/[id]` detalhe + editar/remover

  * `/services` lista + criação/edição/remoção

* Integrar páginas existentes (clientes/serviços) aos endpoints (substituir chamadas diretas quando necessário).

* Aceitação: Criar/editar/excluir clientes e serviços refletem na listagem; serviços usáveis ao criar job.

## PR: task/6 - Agendamentos (Jobs) + Calendar

* API `/api/jobs`:

  * `POST` cria job (ligações a `client` e `service`)

  * `GET?from&to` lista por intervalo

  * `PATCH` (status: `scheduled|done|cancelled`)

  * `DELETE`

* UI:

  * `/calendar` com `CalendarView` (já existe) integrado à API

  * `/jobs` lista diária

  * Ação rápida “Marcar como feito” e, após `done`, botão “Criar Invoice”

* Aceitação: Job agendado aparece no calendário; marcar `done` habilita criação de invoice pré-populada.

## PR: task/7 - Invoices: criação, PDF e marcação pago

* API `/api/invoices`:

  * `POST`, `GET`, `GET/:id`, `GET/:id/pdf`, `PATCH status`

* Geração de PDF:

  * Corrigir bug de `filename` em `/api/reports/pdf`

  * Reusar rota `/api/invoices/[id]/pdf` e salvar no Supabase Storage se configurado; fallback para `public/pdfs/`

* UI:

  * `/invoices` lista

  * `/invoices/new` criação

  * `/invoices/[id]` preview + gerar PDF + marcar pago (atualiza `paidAt` e `status`)

* Aceitação: Invoice vinculada a job; PDF gera URL e é baixável; marcar como `paid` atualiza corretamente.

## PR: task/8 - Relatórios e Export

* API:

  * `/api/reports/client/:id?month=YYYY-MM` → CSV/PDF

  * `/api/reports/monthly?month=YYYY-MM` → resumo (jobs + invoices + totais)

* UI:

  * `/reports` com seleção `client/month` e botões “Exportar CSV/PDF”

* Aceitação: CSV com colunas e totais corretos; PDF legível.

## PR: task/9 - Tests (Unit + E2E)

* Unit (Jest):

  * Calcular total de invoice (itens, descontos, impostos se houver)

  * Parser de dados (normalização de inputs)

* E2E (Playwright):

  * Fluxo crítico: login → criar cliente → agendar → marcar `done` → criar invoice → gerar PDF → marcar pago

* CI: rodar testes em GH Actions, falhar com regressões.

* Aceitação: CI executa testes e falha em caso de regressão mínima coberta.

## PR: task/10 - CI/CD + Deploy

* Workflow `.github/workflows/ci.yml`: `lint → test → build → deploy preview`

* Integração Vercel: deploy em PR e push/merge em `main`

* README: instruções para secrets (Supabase + Vercel), Storage e Postgres.

* Aceitação: PR cria preview; merge em `main` aciona deploy no Vercel.

## PR: task/11 - Polimento UI/UX e PWA

* Tailwind: padronizar componentes, microcopy em PT-BR, ícones (Heroicons/Lucide)

* PWA: revisar `next-pwa` e cache básico (páginas estáticas, ícones, manifest)

* Aceitação: UI consistente; PWA instala e abre offline em páginas estáticas.

## PR: task/12 - Documentação final + vídeo roteiro

* `README.md` completo: run/seed/deploy, passos claros

* `docs/api.md`: endpoints e payloads com exemplos JSON

* `video_script.md`: roteiro 60–90s do fluxo principal

* Aceitação: Qualquer dev roda local seguindo README; roteiro pronto.

## PR: task/13 (opcional) - OCR de recibos

* Endpoint `/api/ocr/receipt` usando `tesseract.js` (web worker/wasm) para sugerir `amount`, `date`, `desc`

* UI `/receipts/scan` com upload/câmera

* Aceitação: OCR preenche sugestão com confiança mínima.

## Estratégia técnica e notas

* Preferir Supabase como fonte de dados e auth; evitar expor `SERVICE_ROLE_KEY` no client.

* Em APIs, validar sessão e retornar `401` quando não autenticado.

* PDFs: priorizar Supabase Storage; se indisponível, salvar em `public/pdfs/` no MVP.

* Documentar claramente variáveis e segredos; nunca commitar chaves.

* Entregas incrementais por PR, somente merge após CI verde e revisão básica.

