## Visão Geral
- Projeto em `Next.js 14` com `Tailwind`, PWA via `next-pwa`, autenticação Supabase.
- Responsividade boa na maioria das telas (grids e listas), mas há lacunas em navegação mobile e linhas longas sem wrap.
- Deploy para Vercel configurado, porém variáveis de ambiente públicas não batem com o que o app consome.

## Melhorias de Responsividade (Mobile-First)
- Navegação mobile: substituir o menu oculto em telas pequenas por fallback amigável.
  - Atualizar `src/components/Navigation.tsx:39` (menu): remover `hidden` em `<sm>` e oferecer uma das opções:
    - Opção A: barra rolável horizontal já em mobile (`flex overflow-x-auto whitespace-nowrap`) e `md:flex-wrap`.
    - Opção B: menu hambúrguer simples com `useState`, drawer e `aria-expanded`.
- Listas com muitos metadados: evitar overflow em telas estreitas.
  - `src/app/agendamentos/page.tsx:198`: trocar `className="flex items-center space-x-4 mt-1"` por `flex flex-wrap gap-x-4 gap-y-1`.
  - `src/components/Dashboard.tsx:167`: trocar `className="flex items-center justify-between ..."` por `flex flex-wrap gap-2 ...` para empilhar quando necessário.
- Faturas (lista): reduzir linhas muito longas e empilhar dados no mobile.
  - `src/app/faturas/page.tsx:137-153`: aplicar `flex-col sm:flex-row`, `gap-2`, e `truncate`/`break-words` onde couber.
- Viewport explícito:
  - `src/app/layout.tsx:32-44`: adicionar `<meta name="viewport" content="width=device-width, initial-scale=1" />` no `<head>`.

## Otimizações de Performance (Mobile)
- Prefetch seletivo: links do menu podem manter prefetch padrão do Next; se páginas pesarem, desabilitar com `prefetch={false}` nos menos usados.
- Imagens: projeto usa ícones SVG; se forem adicionadas imagens, usar `next/image` e configurar domínios em `next.config.js`.
- Code splitting: opcionalmente carregar componentes pesados com `next/dynamic` (ex.: `CalendarView`) se o custo de JS impactar tempo de interação.
- PWA: já habilitado; manter `skipWaiting` e `register`, revisar offline para rotas críticas apenas se for requisito.

## Preparativos de Deploy
- Variáveis de ambiente na Vercel:
  - `vercel.json:11-15` usa `SUPABASE_URL`/`SUPABASE_ANON_KEY`, mas o app lê `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Adicionar no `env` da Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` mapeando para os secrets correspondentes.
  - Manter `SUPABASE_SERVICE_ROLE_KEY` para `scripts/seed.js` e tarefas server-side.
- Puppeteer em serverless:
  - `src/app/api/invoices/[id]/pdf/route.ts` usa `puppeteer`. Em Vercel serverless, preferível `puppeteer-core` + `@sparticuz/chromium` para compatibilidade.
  - Plano: trocar dependência e ajustar launch (`chromium.executablePath()`, flags) para evitar erros em produção.
- Build/Qualidade:
  - Rodar `npm run type-check`, `npm run lint` e testes (`npm run test`).
  - Verificar `next build` sem warnings críticos.

## Verificações Finais
- PWA: `public/manifest.json` presente; ícones ok. Testar instalação no Android/iOS.
- Acessibilidade: botões com áreas de toque ≥ 40px já atendidos; manter foco visível (`focus:ring`).
- Segurança: nenhum secret em client; apenas `NEXT_PUBLIC_*` no browser.
- SEO interno: como é CRM, `robots.txt`/`sitemap` são opcionais.

## Diffs Propostos (ao aprovar)
- `src/components/Navigation.tsx:39`: aplicar fallback mobile (barra rolável ou hambúrguer simples).
- `src/app/agendamentos/page.tsx:198`: adicionar `flex-wrap` e `gap` para evitar overflow.
- `src/components/Dashboard.tsx:167`: permitir wrap e `gap`.
- `src/app/faturas/page.tsx:137-153`: empilhar no mobile e truncar textos longos.
- `src/app/layout.tsx:32-44`: inserir meta `viewport`.
- `vercel.json:11-15`: incluir `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- (Opcional) `api/pdf`: migrar para `puppeteer-core` + `@sparticuz/chromium`.

Confirma seguir com essas alterações e validações para fechar a versão final?