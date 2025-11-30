# PRD Padronizado — CRM Casa Limpa

## 1. Visão Geral

- Objetivo: centralizar relacionamento com clientes, agendamentos, equipe e faturamento.
- Usuários: Admin, Operador, Financeiro, Técnico/Equipe.
- Módulos: Clientes, Agenda/Ordens, Equipe, Financeiro, Relatórios.

## 2. Requisitos Funcionais
- Clientes: CRUD, múltiplos endereços, tags e preferências.
- Agenda/Ordens: criação, validação de disponibilidade, reagendamento, histórico, status.
- Equipe: disponibilidade, competências, alocação automática.
- Financeiro: faturas, descontos, impostos, pagamentos (PIX, boleto, cartão), recibos/PDF.
- Relatórios: filtros por período/cliente/região/equipe, exportação CSV/PDF.

## 3. Fluxos Principais

### 3.1 Agendamento de Serviço
1. Buscar/registrar cliente
2. Definir data/horário, escopo e endereço
3. Validar disponibilidade e sugerir equipe
4. Confirmar (status "Agendado") e notificar cliente/equipe

### 3.2 Execução e Conclusão

1. Iniciar ("Em Execução")
2. Registrar ocorrências e materiais
3. Concluir e calcular total
4. Gerar fatura e enviar

### 3.3 Reagendamento/Cancelamento

1. Solicitar alteração
2. Revalidar disponibilidade
3. Atualizar mantendo histórico

## 4. Requisitos Não Funcionais

- Disponibilidade: 99% em horário comercial
- Segurança: autenticação/autorização por papéis; criptografia de dados sensíveis
- Desempenho: páginas principais < 2s
- Observabilidade: logs e auditoria


## 5. Critérios de Sucesso

- Agendamento < 1 minuto
- Conflitos de agenda reduzidos em 80%
- Faturas sem erros de cálculo

## 6. Referências de Implementação

- Tipos: `src/types/supabase.ts`
- Libs: `src/lib/*` (supabase, db, ai/provider, logger, ratelimit)
- Componentes: Dashboard, Navigation, CalendarView, ThemeToggle, ChatbotWidget, OrcamentoChatbot
- Páginas e APIs: `src/app/**/*` conforme módulos
- PWA: `public/manifest.json`

## 7. Anexo — Resumo de Código

Arquivo: `testsprite_tests/tmp/code_summary.json`
- Contém tech stack e mapeamento de funcionalidades/arquivos para suporte aos testes.
