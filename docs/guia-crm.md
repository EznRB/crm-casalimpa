# Guia Intuitivo do CRM Casa Limpa

Este guia explica, em linguagem simples, como o CRM Casa Limpa funciona tanto para quem usa no dia a dia quanto o que acontece “por trás dos panos”.

## Índice
- [1. O que é o CRM](#1-o-que-é-o-crm)
- [2. Como usar no dia a dia](#2-como-usar-no-dia-a-dia)
- [3. Como o sistema funciona internamente](#3-como-o-sistema-funciona-internamente)
- [4. Segurança e privacidade](#4-segurança-e-privacidade)
- [5. Problemas comuns e soluções](#5-problemas-comuns-e-soluções)
- [6. Glossário](#6-glossário)
- [7. Diagramas simples dos fluxos](#7-diagramas-simples-dos-fluxos)

## 1. O que é o CRM
O CRM Casa Limpa é um sistema web que organiza:
- Clientes (quem contrata o serviço)
- Agendamentos (datas e horários dos serviços)
- Faturas (cobranças geradas após os serviços)
- Funcionários e registros de trabalho
- Fluxo de caixa (receitas e despesas)
- Relatórios (informações para acompanhar o negócio)

Você acessa pelo navegador, faz login e usa os menus para ir direto ao que precisa.

Em palavras bem simples:
- É como um caderno digital que guarda seus clientes, seus horários de trabalho e suas cobranças.
- Ele também soma o que entrou (pagamentos) e o que saiu (despesas), mostrando o resultado do mês.

## 2. Como usar no dia a dia
Abaixo está um roteiro simples de uso típico:

- Entrar no sistema:
  - Acesse a página de login e entre com email/senha ou receba um link por email.
  - Referência técnica: `src/app/login/page.tsx:16`.

- Cadastrar/editar clientes:
  - Vá em “Clientes”, crie novos ou edite existentes. Pode buscar por nome, email ou telefone.
  - Referências: UI `src/app/clientes/page.tsx:18` e APIs `src/app/api/clients/route.ts:4`, `src/app/api/clients/[id]/route.ts:4`.

- Gerenciar serviços:
  - Cadastre serviços (ex.: limpeza padrão, limpeza pesada), com preço e duração.
  - Referência de API: `src/app/api/services/route.ts:4`.

- Agendar serviços:
  - Em “Agendamentos”, veja calendário ou lista, crie novos e mude status (confirmado, concluído, etc.).
  - Referência: UI `src/app/agendamentos/page.tsx:28`.

- Concluir serviço e gerar fatura:
  - Marque o agendamento como concluído e gere a fatura associada.
  - Referências: UI `src/app/agendamentos/page.tsx:78-107` e API `src/app/api/invoices/route.ts:17`.

- Visualizar e baixar faturas:
  - Em “Faturas”, veja a lista, detalhes e baixe o PDF.
  - Referências: UI `src/app/faturas/page.tsx:36` e PDF `src/app/api/invoices/[id]/pdf/route.ts:51`.

- Registrar despesas e acompanhar fluxo de caixa:
  - Lance despesas (produtos, transporte, diárias) e veja o resumo do mês.
  - Referências: UI `src/app/fluxo-caixa/page.tsx:13` e APIs `src/app/api/cashflow/expense/route.ts:4`, `src/app/api/cashflow/summary/route.ts:4`.

- Gerar relatórios:
  - Baixe CSV ou PDF de agendamentos, clientes e finanças.
  - Referências: UI `src/app/relatorios/page.tsx:96` e API PDF `src/app/api/reports/pdf/route.ts:5`.

- Configurar dados da empresa (usados nas faturas/relatórios):
  - Atualize nome, CNPJ, contato, endereço e dados bancários.
  - Referência: UI `src/app/configuracoes/page.tsx:31`.

### Resumo em palavras simples
- Primeiro você cadastra o cliente e o serviço; depois agenda dia e horário.
- Quando o serviço é feito, você marca como concluído e gera a fatura.
- Ao receber o pagamento, marca a fatura como paga; isso entra como receita no caixa.
- Despesas (como produtos e transporte) você lança no fluxo de caixa.
- No final, o fluxo de caixa mostra quanto entrou, saiu e sobrou naquele mês.

Dica: sempre mantenha o status do agendamento e da fatura atualizados para que os relatórios e o caixa fiquem corretos.

## 3. Como o sistema funciona internamente

### 3.1 Arquitetura
- O site usa **Next.js 14** com React e Tailwind (visual). O tema escuro/claro é aplicado no carregamento: `src/app/layout.tsx:39-43`.
- As regras de negócio rodam em **rotas API** do Next: arquivos `src/app/api/**/route.ts`.
- Os dados ficam no **Supabase** (Postgres gerenciado + autenticação), acessado no navegador e no servidor: `src/lib/supabase.ts:14`, `src/lib/supabaseServer.ts:4`.
- É um **PWA** (aplicativo web instalável/offline básico) configurado em `next.config.js:2`.

### 3.2 Autenticação e proteção
- Login/cadastro/link mágico via Supabase: `src/app/login/page.tsx:16`.
- Um **middleware** verifica se você está logado ao acessar páginas; se não, redireciona para `/login`: `src/middleware.ts:36-45`.
- No servidor, a sessão é lida por cookies e compartilhada com o Supabase: `src/lib/supabaseServer.ts:4`.

### 3.3 Modelo de dados (tabelas)
- Clientes: `customers` (`src/types/supabase.ts:12`).
- Serviços: `services` (`src/types/supabase.ts:45`).
- Agendamentos (ligam cliente+serviço a uma data): `appointments` (`src/types/supabase.ts:75`).
- Faturas (ligadas a um agendamento): `invoices` (`src/types/supabase.ts:129`).
- Fluxo de caixa (receitas/ despesas): `cashflow_transactions` (`src/types/supabase.ts:179`).
- Empresa (dados exibidos em PDFs): `company` (`src/types/supabase.ts:230`).
- Funcionários e registros de trabalho: `employees` e `employee_work_records` (`src/types/supabase.ts:266`, `src/types/supabase.ts:314`).

### 3.4 Fluxos principais
- Clientes: APIs tratam listar/criar/editar/excluir com verificação de usuário (`src/app/api/clients/route.ts:4`, `src/app/api/clients/[id]/route.ts:4`).
- Agendamentos: a UI mostra calendário/lista e permite alterar status; o servidor atualiza com segurança (`src/app/api/jobs/[id]/route.ts:4`).
- Faturas: criadas a partir de agendamentos. Ao marcar como “paga”, o sistema insere uma **receita** no fluxo de caixa (`src/app/api/invoices/[id]/route.ts:35-64`).
- PDFs: gerados no servidor com Puppeteer, incluindo dados do cliente, serviço e empresa (`src/app/api/invoices/[id]/pdf/route.ts:91`).
- Fluxo de caixa: resumo mensal (receitas, despesas, resultado) em `src/app/api/cashflow/summary/route.ts:4`.
- Relatórios: CSV direto no navegador e PDF pelo servidor (`src/app/relatorios/page.tsx:96`, `src/app/api/reports/pdf/route.ts:5`).

### 3.5 Comunicação front ↔ back
Há dois jeitos de conversar com os dados:
- Direto do navegador para o Supabase (rápido para telas simples): ex. `src/components/Dashboard.tsx:41`.
- Via **API do Next** (para regras mais sensíveis e garantir autenticação no servidor): ex. marcar fatura como paga `src/app/api/invoices/[id]/route.ts:35`.

## 7. Diagramas simples dos fluxos

### Login e acesso
```
Navegador -> Página de Login (email/senha ou link) -> Supabase Auth
           -> Middleware verifica sessão -> Se ok, Dashboard
```
Referências: `src/app/login/page.tsx:16`, `src/middleware.ts:36-45`.

### Do agendamento até o dinheiro no caixa
```
Cadastrar Cliente/Serviço
   |
Criar Agendamento (data/horário)
   |
Marcar como Concluído
   |
Gerar Fatura (ligada ao agendamento)
   |
Receber pagamento -> Marcar Fatura como Paga
   |
Registrar Receita automática no Fluxo de Caixa
   |
Resumo Mensal: receitas - despesas = resultado
```
Referências: `src/app/agendamentos/page.tsx:78-107`, `src/app/api/invoices/route.ts:17`, `src/app/api/invoices/[id]/route.ts:35-64`, `src/app/api/cashflow/summary/route.ts:4`.

### Relatórios (CSV e PDF)
```
UI Relatórios -> Escolhe tipo e período
   |
CSV: gerado no navegador
PDF: gerado no servidor (Puppeteer)
   |
Download do arquivo
```
Referências: `src/app/relatorios/page.tsx:96`, `src/app/api/reports/pdf/route.ts:5`.

### Dados da empresa nos PDFs
```
Página Configurações -> Tabela company
   |
Usado em PDF de Faturas e Relatórios
```
Referências: `src/app/configuracoes/page.tsx:31`, `src/app/api/invoices/[id]/pdf/route.ts:41-50`.

## 4. Segurança e privacidade
- Só usuários logados acessam páginas do sistema (`src/middleware.ts:36-45`).
- As rotas do servidor sempre verificam o usuário (`src/lib/supabaseServer.ts:22`).
- Senhas e chaves nunca ficam expostas nas páginas; variáveis de ambiente controlam o acesso (`src/lib/supabase.ts:3`).

## 5. Problemas comuns e soluções
- Não consigo entrar:
  - Verifique se recebeu o email de link mágico ou se a senha está correta.
  - Se seguir logado mas cair no login, limpe cookies e tente novamente.
- Erro ao gerar PDF:
  - Verifique se a fatura existe e se há dados de cliente/serviço. Tente novamente.
- Despesas não aparecem no resumo:
  - Confirme o mês selecionado e a data da despesa (`src/app/fluxo-caixa/page.tsx:79-84`).

## 6. Glossário
- Cliente: quem contrata o serviço.
- Serviço: tipo de trabalho (ex.: limpeza padrão) com preço/duração.
- Agendamento: compromisso com data/horário, status e preço.
- Fatura: cobrança gerada para um agendamento, pode ter PDF.
- Receita: entrada de dinheiro (ex.: fatura paga).
- Despesa: saída de dinheiro (ex.: compra de produtos).
- Fluxo de caixa: visão do dinheiro que entra e sai.

---

Se quiser se aprofundar, cada seção tem referências de arquivo e linha no código (`file_path:line_number`) para facilitar a navegação técnica.
