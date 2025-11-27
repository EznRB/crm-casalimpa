## Estado Atual
- `src/lib/supabase.ts:4-15` valida `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` e retorna `null` se forem inválidos.
- `src/app/login/page.tsx:21-24` bloqueia ações quando `supabase` é `null` e mostra mensagem de configuração ausente.
- `.env.local` contém placeholders (`https://example.supabase.co` e uma anon key curta), o que reprova a validação atual.
- SSR e rotas: `src/lib/supabaseServer.ts:5-17` e `src/middleware.ts:9-29,33-45` usam as mesmas variáveis públicas e redirecionam para `/login` quando não há usuário.

## O que vou fazer
1. Atualizar `.env.local` com valores reais:
   - `NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key real>`
   - (Opcional server-side) `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>` se usar `scripts/seed.js`.
2. Reiniciar o servidor de desenvolvimento para recarregar variáveis.
3. Confirmar que `isValidEnv` passa em `src/lib/supabase.ts` e que `supabase` deixa de ser `null`.
4. Verificar fluxos de autenticação no cliente:
   - Login com senha (`src/app/login/page.tsx:25-36`).
   - Cadastro com confirmação por email (`src/app/login/page.tsx:38-49`).
   - Link mágico (`src/app/login/page.tsx:66-71`).
5. Verificar SSR/middleware:
   - Acesso autenticado redireciona corretamente e APIs protegem com `getAuthUser` (`src/lib/supabaseServer.ts:20-24`).
6. (Melhoria opcional) Unificar uso do cliente no callback usando `@/lib/supabase` para evitar duplicação (`src/app/auth/callback/page.tsx:7-10`).

## Critérios de Aceite
- `supabase` inicializa sem `null` em páginas cliente.
- Login com email/senha cria `session` e navega para `/`.
- Cadastro envia email e `/auth/callback` processa sessão.
- Link mágico envia email e autentica via callback.
- Middleware redireciona visitantes não logados para `/login` e mantém sessão em páginas autenticadas.

Confirme para eu aplicar as correções no `.env.local`, reiniciar o servidor e validar os fluxos de autenticação end‑to‑end.