## O que será feito
- Atualizar `c:\Users\Enzo Marcelo\Desktop\testes SOLO TRAE\crm casa limpa\.env.local` com os valores fornecidos do seu projeto Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL` → URL do projeto
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key
  - `SUPABASE_SERVICE_ROLE_KEY` → service role key (apenas backend/scripts)
- Não expor as chaves em logs, código cliente ou mensagens.

## Onde é usado no código
- Cliente: `src/lib/supabase.ts:4–15` valida as variáveis e cria o cliente.
- SSR/Server: `src/lib/supabaseServer.ts:5–8` e `src/middleware.ts:9–12` utilizam as mesmas variáveis públicas.
- Scripts: `scripts/seed.js:6–15` usa `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
- Login: `src/app/login/page.tsx:21–24` exibe erro quando `supabase` não está configurado.

## Passos de verificação
- Reiniciar `npm run dev` para recarregar envs.
- Abrir `http://localhost:3000/login` (ou 3001) e validar:
  - Mensagem de configuração ausente NÃO aparece.
  - Botão “Enviar link mágico por email” habilita após preencher email.
  - Botão “Entrar” funcional (vai depender de credenciais válidas já existentes).
- (Opcional) Executar `node scripts/seed.js` para verificar o uso da `service role` e popular dados.

## Segurança
- `.env.local` permanece fora do versionamento (respeitar `.gitignore`).
- `SUPABASE_SERVICE_ROLE_KEY` nunca será usada no cliente, apenas em server/scripts.

## Resultado esperado
- Cliente Supabase instanciado corretamente.
- Fluxo de login funcional.
- Scripts com permissão de escrita funcionando quando necessário com a service role.