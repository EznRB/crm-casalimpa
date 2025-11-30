# Casa Limpa - CRM

Sistema de gerenciamento completo para empresas de limpeza pós-obra.

## Funcionalidades

- ✅ Gerenciamento de clientes (CRUD completo)
- ✅ Agendamentos com calendário interativo
- ✅ Emissão de faturas em PDF
- ✅ Relatórios de receita e performance
- ✅ Autenticação por magic link
- ✅ PWA - funciona offline no mobile

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Supabase (Auth + Banco + Storage)
- FullCalendar
- Puppeteer (PDF)

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

- Copie o arquivo `/.env.example` para dois arquivos locais:
  - `/.env` (usado por ferramentas de banco como Prisma)
  - `/.env.local` (usado pela aplicação Next.js)

Preencha os valores conforme seu projeto Supabase:

- `DATABASE_URL` — URL do Postgres (Supabase ou local)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave pública (client)
- `SUPABASE_SERVICE_ROLE_KEY` — chave de service role (server)
- `NEXTAUTH_URL` — opcional; não utilizado neste projeto (Auth via Supabase)
- `NEXT_PUBLIC_SITE_URL` — URL pública usada nos redirecionamentos de email (configure em produção)

No Vercel, configure os mesmos valores em Project Settings → Environment Variables.

## Migrações e Seed

### Migrações (Supabase)

- As migrações SQL estão em `supabase/migrations/*.sql`.
- Aplique no seu banco Supabase pelo SQL Editor (Dashboard) ou via Supabase CLI.
  - Opção SQL Editor: abra o arquivo `.sql`, copie e execute no editor do Supabase.
  - Opção CLI (opcional): instale o CLI e rode `supabase db push` apontando para seu projeto.

### Seed de dados

```bash
npm run seed
```

Requer `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` válidos no ambiente.

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Porta e Host

- Em desenvolvimento a app roda por padrão em `0.0.0.0:3001` via script.
- Em produção, `next start` respeita a variável `PORT`. Defina `PORT` no ambiente para ajustar a porta.

## Deploy

Deploy automático no Vercel configurado via GitHub Actions.
## Lançamento Rápido

- Página: `/lancamento-rapido` (mobile-first)
- API principal: `POST /api/lancamento-rapido`
- Duplicar último dia: `GET /api/lancamento-rapido/duplicar`
- Speech-to-Text:
  - Web Speech API no navegador
  - Opcional: `POST /api/speech/whisper` com `OPENAI_API_KEY`

## Resumo do Dia

- Página: `/resumo-do-dia`
- API: `GET /api/resumo-do-dia?date=YYYY-MM-DD`

## Deploy

- Configure `DATABASE_URL` e (opcional) `OPENAI_API_KEY`
- Commit e push para GitHub para acionar pipeline (ex.: Vercel)
