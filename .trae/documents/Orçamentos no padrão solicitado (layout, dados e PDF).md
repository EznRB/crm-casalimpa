## Objetivo
- Alinhar a aba de Orçamentos ao exemplo fornecido: cabeçalho com faixa/brasão, título do serviço, relatório inicial, atividades (lista), galeria de imagens, tabela de preços, métodos de pagamento, condições de contrato, assinaturas e data, além do link “assinar documento online”.
- Atualizar schema do Supabase, UI (criação/edição/lista) e geração de PDF para refletir esse padrão.

## Mudanças Principais
- Expandir o modelo de `quotes` para incluir campos textuais e estruturados (título, relatório, atividades, pagamento, contrato, assinatura, etc.).
- Adicionar suporte a imagens do orçamento (upload para Storage + tabela relacional).
- Reescrever o HTML do PDF para seguir a identidade visual e seções do exemplo.
- Melhorar UI das páginas `/orcamentos/novo` e `/orcamentos/[id]` com editor, lista de atividades, galeria e tabela de preços.

## Schema Supabase
1) Alterar `public.quotes` (novos campos):
- `title text not null` (ex.: “Limpeza pós obra”)
- `initial_report text null`
- `activities jsonb null` (lista de strings)
- `payment_methods jsonb null` (ex.: ["pix", "transferencia"]) 
- `contract_terms text null`
- `sign_url text null` (link para assinatura online)
- `client_label text null` (ex.: "Arquiteta Flávia")
- `client_subtitle text null` (ex.: "Condomínio Calabassa torre 03 Ap 82")
- `signed_by_client boolean default false`
- `signed_by_company boolean default false`

2) Nova tabela `public.quote_images`:
- `id uuid pk default gen_random_uuid()`
- `quote_id uuid references public.quotes(id) on delete cascade`
- `url text not null`
- `caption text null`
- Índice em `quote_id`.

3) Storage
- Bucket `quotes` para imagens; caminho `quotes/{quote_id}/{filename}`.

## Tipos TypeScript
- `src/types/supabase.ts`: adicionar novos campos em `quotes` e nova tabela `quote_images` (Row/Insert/Update/Relationships).

## Data Layer (wrappers)
- `src/lib/db.ts`:
  - Atualizar `createQuote`, `updateQuote`, `getQuoteById` para lidar com novos campos.
  - Funções para imagens: `addQuoteImage`, `deleteQuoteImage`, `listQuoteImages`.

## UI – Criação/Edição
- `src/app/orcamentos/novo/page.tsx` e `src/app/orcamentos/[id]/page.tsx`:
  - Seções:
    - Cabeçalho: `title`, `client_label`, `client_subtitle` (inputs simples).
    - “Relatório Inicial”: textarea com contagem de caracteres.
    - “Descrição das atividades”: editor de lista (adicionar/remover itens) persistindo em `activities`.
    - “Imagens”: upload múltiplo para Storage (`supabase.storage.from('quotes').upload`) e grid com miniaturas (remove/legenda).
    - “Preços”: tabela já existente de itens (descrição/qtd/un/valor unitário + total calculado, BRL format).
    - “Métodos de pagamento”: checkboxes (PIX, TED, cartão, dinheiro), persistindo em `payment_methods`.
    - “Condições de contrato”: textarea para termos.
    - “Assinaturas”: campos labels (empresa/cliente) e indicador de status; opcional gerar `sign_url` (placeholder).
    - Rodapé: “Criado em …” baseado em `created_at`.
  - Comportamento: validar campos mínimos (title, cliente, serviço, área, pelo menos 1 item), BRL format, clamping de desconto/taxas.

## PDF – Layout
- `src/app/api/orcamentos/[id]/pdf/route.ts`:
  - Reescrever `generateQuoteHTML(quote, company)` para:
    - Faixa superior verde e logomarca central (`company.logo_url` quando disponível) + razão social/telefone.
    - Título central (quote.title).
    - Bloco de cliente: `client_label` e `client_subtitle`.
    - “Relatório Inicial”: parágrafos do `initial_report`.
    - “Descrição das atividades”: lista (bulleted) renderizada a partir de `activities`.
    - Galeria: grid de miniaturas das `quote_images`.
    - “Preços”: tabela com itens, quantidades, unitário e total, somando subtotal/total.
    - “Métodos de pagamento”: badges (PIX, etc.).
    - “Condições de contrato”: texto.
    - “Assinaturas”: linhas com labels (empresa e cliente) e data “Criado em …”.
    - Link “assinar documento online” (se `sign_url`).
  - CSS inline compatível com Puppeteer e responsivo para A4.

## Integração do Chatbot
- Ajustar prompts para sugerir automaticamente:
  - Texto do relatório inicial e atividades (lista) com base em `title`, residência e área.
  - Itens padrão e formas de pagamento.
  - Termos de contrato.
- Botões “Aplicar sugestão” já integram campos; expandir para `activities`, `contract_terms` e `payment_methods`.

## Validações e UX
- Campos obrigatórios: `title`, cliente/serviço, área, pelo menos 1 item.
- BRL: mostrar `subtotal`, `desconto`, `taxas`, `total` com `Intl.NumberFormat('pt-BR', {currency:'BRL'})`.
- Upload: bloquear PDF se existirem uploads pendentes.

## Testes
- Fluxo: criar orçamento completo com imagens e termos; gerar PDF; revisar layout conforme exemplo.
- Edição: atualizar atividades/imagens/termos e re-gerar PDF.
- Produção: validar fallback `puppeteer-core + @sparticuz/chromium`.

## Entregáveis
- Schema SQL para Supabase (tabela e alterações).
- Tipos e wrappers atualizados.
- UI das páginas com seções conforme exemplo.
- PDF renderizando com layout alinhado.
- Chatbot cobrindo novos campos.

## Observações
- Caso o Storage não esteja configurado, manter galeria oculta e avisar usuário para configurar o bucket. Depois, habilitar upload e preview.
- O login offline continua disponível em dev; em prod, use Supabase. 