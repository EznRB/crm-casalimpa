## Contexto e Uso no Código
- Cliente (browser): `src/lib/supabase.ts:4–15` lê `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` e só cria o cliente quando a URL começa com `https://`, contém `.supabase.co`, não é `example.supabase.co`, e a anon key tem comprimento > 20.
- SSR/Server: `src/lib/supabaseServer.ts:5–8` e `src/middleware.ts:9–12` usam as mesmas variáveis públicas.
- Login: `src/app/login/page.tsx:21–24` mostra erro quando `supabase` é `null` (variáveis incorretas/ausentes) e desativa botões (`:143–156`).
- Scripts backend: `scripts/seed.js:6–15` usa `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

## O que deve ser corrigido
- Criar/atualizar `c:\Users\Enzo Marcelo\Desktop\testes SOLO TRAE\crm casa limpa\.env.local` com valores reais:
  - `NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>`
  - (Opcional, apenas server/scripts) `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>`
- Garantir que a URL é exatamente a do projeto (com `https://` e domínio `.supabase.co`).
- Usar a anon key pública (Admin/Service key NÃO deve ser usada no cliente).
- Manter `SUPABASE_SERVICE_ROLE_KEY` sem o prefixo `NEXT_PUBLIC` e usá-la somente em código de servidor/scripts.

## Como obter os valores corretos
- No Supabase Dashboard: `Project Settings → API`.
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`.
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (apenas backend/scripts).

## Verificação
- Reiniciar o servidor de desenvolvimento após alterar `.env.local`.
- Acessar `/login` e validar que a mensagem de configuração ausente não aparece (`src/app/login/page.tsx:21–24`) e os botões não ficam desabilitados (`:143–156`).
- Executar o seed opcional: `node scripts/seed.js` para confirmar `SUPABASE_SERVICE_ROLE_KEY` (somente se desejar popular dados).

## Segurança
- Não versionar `.env.local` e nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente.
- Em deploy, configurar as mesmas variáveis no provedor (ex.: Vercel), mantendo a service role como segredo.

## Resultado esperado
- `supabase` passa a ser instanciado (`src/lib/supabase.ts:15`), o login funciona e scripts que exigem service role conseguem executar com segurança no backend.