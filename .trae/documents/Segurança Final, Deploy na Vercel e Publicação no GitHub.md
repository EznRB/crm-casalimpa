# Plano de Ação

## Verificação e Endurecimento de Segurança
- Auditoria de APIs: confirmar `getAuthUser` e 401 em todas as rotas `src/app/api/**` (amostra verificada com grep).
- Segredos: garantir que `SUPABASE_SERVICE_ROLE_KEY` fique apenas em server/seed; validar ausência em código cliente.
- Cabeçalhos de segurança: adicionar via `middleware` (`Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`).
- Rate limiting: aplicar limite por IP nas rotas sensíveis (login/geração de PDFs) usando uma solução stateless compatível com Vercel.
- Validação de input: incorporar `zod` nos endpoints de escrita (clientes, serviços, employees, cashflow) para tipagem/limites.
- Logs: já centralizados com `requestId`; revisar mensagens e níveis em production.
- Cookie dev_auth: já restringido a dev; garantir que não haja outros bypasses.

## Testes de Segurança (Playwright)
- Sem autenticação: tentar `GET/POST` nas rotas (`/api/clients`, `/api/services`, `/api/employees`) e esperar `401`.
- Com sessão válida: executar `GET`/`POST` e validar `200/201` e schema de resposta.
- CSRF básico: simular requisições cross-origin e confirmar bloqueio por ausência de sessão.
- Rate limiting: bater 20 requisições em <1min em rota alvo e esperar `429`.
- PDF: forçar entradas grandes e medir duração (<30s, conforme `vercel.json`).
- Headers: validar presença de CSP, XFO, XCTO, RP, Permissions-Policy nas respostas de páginas.

## Deploy na Vercel — Passo a Passo
1. Criar repositório no GitHub (público ou privado).
2. Importar projeto na Vercel: New Project → Import Git Repository.
3. Framework: Next.js detectado automaticamente; confirmar `buildCommand: npm run build` e `outputDirectory: .next`.
4. Região: manter `gru1` (São Paulo) conforme `vercel.json`.
5. Variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `NEXT_PUBLIC_SITE_URL` (ex.: `https://seu-domínio.vercel.app`)
   - `HF_ACCESS_TOKEN` (opcional)
   - Dica: pode criar um Secret `site-url` e usar em `vercel.json` (já mapeado).
6. Deploy Preview: habilitar via CI (já configurado em `.github/workflows/ci.yml`).
7. Deploy Prod: push na `main` dispara build e deploy; validar logs e página `/api/health`.

## Subir o Projeto para seu GitHub — Passo a Passo
- Em PowerShell na raiz do projeto:
  - `git init`
  - `git add -A`
  - `git commit -m "Projeto CRM Casa Limpa — setup"`
  - `git branch -M main`
  - `git remote add origin https://github.com/<seu-usuario>/<nome-repo>.git`
  - `git push -u origin main`
- Alternativas:
  - Via `gh` CLI: `gh repo create <nome-repo> --source . --public --push`
  - Via GitHub Desktop: File → Add local repository → Publish.

## Execução Proposta
- Implementar cabeçalhos de segurança no `middleware` e rate limiting leve em rotas críticas.
- Adicionar validação com `zod` nos endpoints de escrita.
- Escrever testes Playwright para cenários acima e rodar no CI.
- Preparar comandos para publicar no GitHub e conectar com Vercel.

Se aprovado, aplico os cabeçalhos e rate limiting, adiciono validações, crio testes, e forneço os comandos prontos para push no seu repositório GitHub (você só informa `<seu-usuario>/<nome-repo>`).