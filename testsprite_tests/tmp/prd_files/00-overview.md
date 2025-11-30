# CRM Casa Limpa — PRD (Visão Geral)

## Objetivo

Centralizar o relacionamento com clientes, agendamentos de serviços de limpeza, equipe e faturamento, com foco em eficiência operacional e qualidade do atendimento.

## Usuários e Perfis

- Admin: configurações, relatórios, gestão de usuários e permissões.
- Operador: cadastro de clientes, criação/edição de ordens de serviço e agendamentos.
- Financeiro: geração de faturas, controle de recebíveis e relatórios financeiros.
- Técnico/Equipe: visualização de agenda, status das ordens e confirmação de execução.


## Módulos

- Clientes: CRUD, histórico, tags, preferências e endereços.
- Agenda/Ordens: calendário, alocação de equipe, status (Novo, Agendado, Em Execução, Concluído, Cancelado).
- Equipe: disponibilidade, competências, alocação por região.
- Financeiro: faturas, métodos de pagamento, descontos, impostos.
- Relatórios: produtividade, retenção, receita por período e por cliente.


## Requisitos Não Funcionais

- Disponibilidade: 99% em horário comercial.
- Segurança: autenticação, autorização por papéis e criptografia de dados sensíveis.
- Desempenho: carregamento de páginas principais < 2s em rede padrão.
- Observabilidade: logs de ações críticas e auditoria.


## Critérios de Sucesso

- Tempo médio de agendamento < 1 minuto.
- Redução de conflitos de agenda em 80% via validações.
- Emissão de faturas sem erros de cálculo.
