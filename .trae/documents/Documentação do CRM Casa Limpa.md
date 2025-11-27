## Visão Geral do Sistema
- Objetivo: centralizar atendimento, agendamentos, faturamento e finanças de serviços de limpeza.
- Principais áreas: Clientes, Agendamentos, Faturas, Funcionários, Fluxo de Caixa, Relatórios, Configurações.
- Navegação principal e tema: `src/components/Navigation.tsx:21` e `src/components/ThemeToggle.tsx` carregados em `src/app/layout.tsx:45`.

## Arquitetura Técnica
- Frontend: Next.js 14 (App Router) com React 18 e Tailwind (`tailwind.config.js:3`). PWA habilitado em `next.config.js:2`.
- Backend: Route Handlers do Next em `src/app/api/**/route.ts`, atuando como camada de regras de negócio.
- Dados: Supabase (Postgres + Auth) via clientes SSR/Browser (`src/lib/supabase.ts:14`, `src/lib/supabaseServer.ts:4`). Tipos das tabelas em `src/types/supabase.ts:12`.
- Autenticação: Supabase + Middleware de proteção por rota (`src/middleware.ts:62`).
- Geração de PDFs: Puppeteer em rotas server-side (ex.: `src/app/api/invoices/[id]/pdf/route.ts:51`).

## Autenticação e Acesso
- Fluxo de login/cadastro e link mágico: `src/app/login/page.tsx:16` usando `supabase.auth`.
- Proteção automática: middleware redireciona não autenticados para `/login` (`src/middleware.ts:36-45`).
- Sessão no servidor com cookies sincronizados (`src/lib/supabaseServer.ts:4` e `src/middleware.ts:13-25`).

## Modelo de Dados (Supabase)
- Clientes: `customers` (contatos e endereço) `src/types/supabase.ts:12`.
- Serviços: `services` (nome, preço base, duração) `src/types/supabase.ts:45`.
- Agendamentos: `appointments` (cliente, serviço, data, status, preço) `src/types/supabase.ts:75`.
- Faturas: `invoices` (vinculada a um agendamento) `src/types/supabase.ts:129`.
- Fluxo de caixa: `cashflow_transactions` (receitas e despesas) `src/types/supabase.ts:179`.
- Empresa: `company` (dados usados em faturas/relatórios) `src/types/supabase.ts:230`.
- Funcionários e registros: `employees`, `employee_work_records` `src/types/supabase.ts:266`, `src/types/supabase.ts:314`.

## Fluxos de Negócio
### Clientes
- Listar, criar, editar, excluir: APIs em `src/app/api/clients/route.ts:4` e `src/app/api/clients/[id]/route.ts:4`.
- UI: `src/app/clientes/page.tsx:18` (listagem e busca); telas de novo/editar em `src/app/clientes/novo/page.tsx` e `src/app/clientes/[id]/editar/page.tsx`.

### Serviços
- CRUD básico: `src/app/api/services/route.ts:4`.
- UI: `src/app/servicos/page.tsx` e telas de novo/editar.

### Agendamentos
- Visualização em calendário e lista (`src/app/agendamentos/page.tsx:28`, calendário em `src/components/CalendarView.tsx`).
- Atualização de status e exclusão: `src/app/api/jobs/[id]/route.ts:4`.
- Criação de fatura a partir de agendamento concluído: front chama `POST /api/invoices` (`src/app/agendamentos/page.tsx:94`).

### Faturas
- Listagem com cliente/serviço relacionado: `src/app/api/invoices/route.ts:8` e UI `src/app/faturas/page.tsx:36`.
- Detalhe da fatura: `src/app/api/invoices/[id]/route.ts:4` e UI `src/app/faturas/[id]/page.tsx`.
- Marcar como paga e registrar receita no caixa: `src/app/api/invoices/[id]/route.ts:35-64`.
- Geração de PDF (com dados da empresa): `src/app/api/invoices/[id]/pdf/route.ts:41-50` e `generateInvoiceHTML` `src/app/api/invoices/[id]/pdf/route.ts:91`.

### Fluxo de Caixa
- Resumo mensal (receitas, despesas, resultado): `src/app/api/cashflow/summary/route.ts:4` e UI `src/app/fluxo-caixa/page.tsx:13`.
- Registro de despesa: `src/app/api/cashflow/expense/route.ts:4`, criado pela UI `src/app/fluxo-caixa/page.tsx:39`.

### Funcionários
- Cadastro/edição: `src/app/api/employees/route.ts:4` e `src/app/api/employees/[id]/route.ts:21`.
- Registros de trabalho (diárias): `src/app/api/employees/[id]/work-records/route.ts:24` com UI em `src/app/funcionarios/[id]/registros/page.tsx`.

### Relatórios
- CSV gerado no cliente: `src/app/relatorios/page.tsx:96`.
- PDF gerado no servidor: `src/app/api/reports/pdf/route.ts:5`, acionado por `src/app/relatorios/page.tsx:149`.
- Relatório mensal (jobs e invoices): `src/app/api/reports/monthly/route.ts:4`.

### Configurações
- Dados da empresa usados em PDFs de fatura e relatórios: UI `src/app/configuracoes/page.tsx:31`, leitura/escrita na tabela `company`.

## Comunicação Front ↔ Back
- Padrão 1 (direto ao Supabase no cliente): telas leem/escrevem com `supabase.from(...)` (ex.: `src/components/Dashboard.tsx:41`).
- Padrão 2 (via API protegida server-side): chamadas a `/api/...` para lógica sensível (ex.: marcar fatura como paga `src/app/api/invoices/[id]/route.ts:35`).
- Rotas API sempre verificam usuário via `getAuthUser` (`src/lib/supabaseServer.ts:22`).

## UI, Tema e PWA
- Tema escuro/claro persistido em `localStorage`: script inline `src/app/layout.tsx:39-43`.
- Navegação fixa em todas as páginas: `src/app/layout.tsx:46`.
- PWA: registro do service worker e cache configurados em `next.config.js:2-24`.

## Tratamento de Erros e Mensagens
- No servidor: respostas JSON com status apropriado (`NextResponse`) em todas as rotas API.
- No cliente: loaders, alerts/toasts (`sonner`) e validações simples (ex.: `src/app/relatorios/page.tsx:87`).

## Entregável
- Criarei um arquivo `docs/guia-crm.md` em Português, destinado a leigos, com:
  - Explicações passo a passo dos fluxos acima usando linguagem simples.
  - Mini-diagramas textuais para “o que acontece por trás” em cada ação.
  - Links para trechos de código com referências `file_path:line_number` para quem quiser se aprofundar.
- Incluirei um glossário (Cliente, Agendamento, Fatura, Receita/Despesa) e uma seção “Como resolver problemas comuns”.

## Próximos Passos
- Escrever o conteúdo completo no `docs/guia-crm.md` com as seções acima.
- Passar uma revisão rápida de linguagem e clareza.
- Opcional: adicionar índice navegável e âncoras.

Confirma que devo prosseguir criando o documento no repositório com essa estrutura?