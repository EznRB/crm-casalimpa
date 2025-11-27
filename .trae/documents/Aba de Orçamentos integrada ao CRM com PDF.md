## Objetivo
- Criar a aba "Orçamentos" integrada ao CRM, permitindo criar, editar, listar, enviar e gerar PDF de orçamentos.
- Basear-se em dados existentes: clientes, serviços, tipo de residência, metragem, modalidade, itens e totais.
- Usar Supabase (tabelas novas), Next.js App Router, Tailwind e o mesmo padrão de geração de PDF já usado em faturas.

## Integração na Navegação
- Adicionar item "Orçamentos" no array `navigation` junto a "Faturas" em `src/components/Navigation.tsx:11-20` (padrão de itens e ícones existente). Ex.: `{ name: 'Orçamentos', href: '/orcamentos', icon: FileText }`.

## Modelo de Dados (Supabase)
- Criar tabelas novas com chaves e relações bem definidas:
1) `public.quotes`
- `id uuid pk default gen_random_uuid()`
- `customer_id uuid references public.customers(id) on delete set null`
- `service_id uuid references public.services(id) on delete set null`
- `residence_type text not null` (valores típicos: casa, apartamento, comercial)
- `area_m2 numeric not null`
- `service_modality text not null` (ex.: avulso, mensal, semanal, quinzenal)
- `valid_until date null` (data de validade do orçamento)
- `discount numeric default 0`
- `taxes numeric default 0`
- `subtotal numeric not null`
- `total numeric not null`
- `status text default 'rascunho'` (rascunho, enviado, aceito, recusado, expirado)
- `notes text null`
- `rich_content jsonb null` (conteúdo rico do template preenchido)
- `pdf_url text null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `created_by uuid null` (opcional, referência ao usuário autenticado `auth.users`)

2) `public.quote_items`
- `id uuid pk default gen_random_uuid()`
- `quote_id uuid references public.quotes(id) on delete cascade`
- `description text not null`
- `quantity numeric not null default 1`
- `unit text default 'un'`
- `unit_price numeric not null`
- `total numeric not null`
- Índice por `quote_id`.

- Racional: refletir estrutura de faturas/serviços já usada, manter joins simples e permitir itens flexíveis.
- Políticas RLS: seguir o padrão atual do projeto (sem RLS custom); acesso é protegido via middleware e auth.

## Tipos TypeScript
- Atualizar `src/types/supabase.ts` para incluir `quotes` e `quote_items` com `Row/Insert/Update/Relationships` (padrão igual às demais tabelas já descritas em `customers`, `services`, `invoices`).

## Acesso a Dados (Wrapper)
- Adicionar funções em `src/lib/db.ts` seguindo o padrão existente:
- `getQuotes`: lista com ordenação por `created_at` desc; inclui relações resumidas de cliente/serviço.
- `getQuoteById`: detalhe com `customers(name, phone, email, address)`, `services(name, base_price, duration_minutes)` e itens.
- `createQuote`, `updateQuote`, `deleteQuote`.
- `addQuoteItem`, `updateQuoteItem`, `deleteQuoteItem`.
- Padrão de erros e checagem de `supabase` igual a `getServices`, `createInvoice`, etc. Ver referência: `src/lib/db.ts:23-28`, `50-75`, `105-116`.

## Rotas e Páginas (App Router)
- `src/app/orcamentos/page.tsx` (lista)
- `src/app/orcamentos/novo/page.tsx` (criação)
- `src/app/orcamentos/[id]/page.tsx` (edição/visualização)
- Padrão visual e UX similar a `src/app/servicos/page.tsx:66-175` (tabela, busca, ações) e `src/app/faturas/[id]/page.tsx` para ações específicas.

### Fluxo do Usuário
- Lista: filtra por status, cliente, período; ações: visualizar, editar, gerar PDF, excluir.
- Criação (wizard em passos):
  1. Selecionar cliente (`getCustomers`).
  2. Selecionar serviço/modalidade (`getServices` + campos residência/área).
  3. Adicionar itens (descrição/quantidade/valor) com totais auto-calculados.
  4. Preencher notas e conteúdo rico (template pronto com variáveis).
  5. Definir validade e salvar (gera `quotes` + `quote_items`).
- Edição: atualizar campos, re-gerar PDF e marcar status (enviado/aceito/recusado/expirado).

## Editor tipo "Word" com Template
- Introduzir dependência leve de editor rich text para o conteúdo:
  - Opção A: `react-quill` (simplicidade, client-side; adequado ao padrão `use client`).
  - Opção B: `@tiptap/react` (mais robusto; maior footprint).
- Renderizar o "template" do orçamento com placeholders (ex.: {{cliente.nome}}, {{servico.nome}}, {{area_m2}}) que são preenchidos automaticamente e ficam editáveis.
- Armazenar o conteúdo estruturado em `rich_content` (jsonb) e, para PDF, renderizar HTML com CSS consistente.

## Geração de PDF
- Nova rota: `GET /api/orcamentos/:id/pdf` em `src/app/api/orcamentos/[id]/pdf/route.ts`.
- Reutilizar abordagem de `puppeteer`/fallback `puppeteer-core + @sparticuz/chromium` como em `src/app/api/invoices/[id]/pdf/route.ts:49-72`.
- Montar HTML do orçamento (cabeçalho com empresa em `company`, dados do cliente, itens e totais, validade, termos) seguindo o mesmo estilo do HTML de fatura em `src/app/api/invoices/[id]/pdf/route.ts:109-389`.
- Retornar `application/pdf` inline; opcional: gravar no Storage e salvar `pdf_url` em `quotes`.

## Integração com Empresa/Clientes/Serviços
- Usar `getCompany()` (cabecalho, dados de contato, banco) conforme `src/lib/db.ts:277-281`.
- Joins de cliente e serviço iguais aos usados em `invoices`/`appointments` (ver `src/lib/db.ts:118-125`).

## Proteção e Autenticação
- Aproveitar `middleware` e `getAuthUser` para autorizar o acesso às rotas e PDFs (`src/app/api/invoices/[id]/pdf/route.ts:9-13`).
- Reutilizar lógica de logout/redirect já existente em `src/components/Navigation.tsx:27-31`.

## Validações e Status
- Status do orçamento: `rascunho`, `enviado`, `aceito`, `recusado`, `expirado`.
- Validade: calcular `valid_until` ao salvar e exibir alertas se expirado.
- Totais: `subtotal = soma(itens)`, `total = subtotal - discount + taxes`.

## Testes e Verificação
- Manual: criar orçamento, adicionar itens, salvar, listar, editar, gerar PDF, verificar dados e layout.
- Integração: validar joins de cliente/serviço e exibição na tabela.
- PDF: testar no ambiente local; em produção (Vercel), usar fallback `puppeteer-core + @sparticuz/chromium`.

## Alterações previstas
- Dados: criar tabelas `quotes` e `quote_items` no Supabase.
- Código:
  - Atualizar `src/types/supabase.ts` com novos tipos.
  - Adicionar wrappers em `src/lib/db.ts` para orçamentos.
  - Criar páginas em `src/app/orcamentos/*`.
  - Criar rota `src/app/api/orcamentos/[id]/pdf/route.ts`.
  - Atualizar navegação em `src/components/Navigation.tsx:11-20`.

## Riscos e Mitigações
- Dependência de editor rich text: optar por `react-quill` para simplicidade; fallback para `textarea` se necessário.
- Geração de PDF em produção: usar fallback já comprovado com `@sparticuz/chromium`.
- Tipos do Supabase: garantir que `src/types/supabase.ts` reflita o schema; documentar SQL.

## Próximos Passos (após aprovação)
- Criar as tabelas no Supabase com SQL fornecido.
- Atualizar os tipos e implementar as páginas/rotas.
- Validar fluxo completo e PDF no ambiente local e produção.