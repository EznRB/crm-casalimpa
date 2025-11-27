## Objetivo
- Adicionar um botão flutuante no canto inferior direito do dashboard que abre um chatbot.
- Integrar o chatbot ao contexto do CRM para resolver dúvidas recorrentes, executar ações operacionais e automatizar processos repetitivos.
- Persistir sessões e mensagens no Supabase e opcionalmente habilitar base de conhecimento com busca semântica.

## Abordagem de IA (gratuita)
- Utilizar Hugging Face Inference API com `mistralai/Mistral-7B-Instruct` via `HF_ACCESS_TOKEN` (já há integração similar no projeto).
- Abstrair o provedor para permitir troca futura (ex.: OpenRouter/DeepSeek), mantendo o padrão de mensagens e ferramentas.
- Fallback heurístico local quando o token estiver ausente ou a API falhar.

## UI/UX
- Criar `src/components/ChatbotWidget.tsx` (derivado de `OrcamentoChatbot.tsx`) com:
  - Botão flutuante fixo (`position: fixed; bottom: 24px; right: 24px`).
  - Janela de chat com histórico, sugestões rápidas ("Criar cliente", "Agendar serviço", "Resumo financeiro", "Consultar agenda", "Gerar fatura").
  - Streaming de respostas, indicadores de execução de ferramentas e confirmações antes de ações sensíveis.
- Injetar o widget no `Dashboard` (e opcionalmente no `layout` para acesso global).

## Backend
- Nova rota `src/app/api/chatbot/assistant/route.ts`:
  - Recebe `sessionId`, `messages[]`, `context` (user, role, página atual, entidade selecionada).
  - Chama provedor de IA e suporta "tool calling" para ações do CRM.
  - Stream de tokens via `ReadableStream` e eventos para resultados de ferramentas.
- Biblioteca de ferramentas (server-side) com checagens de permissão:
  - `createClient`, `updateClient`, `scheduleJob`, `createInvoice`, `sendPaymentReminder`, `fetchKpis`, `listAgenda`, `addNoteToClient`, `escalateTicket`.
  - Todas registram execução e retorno em Supabase (audit).

## Contexto e Integração
- Construir system prompt com:
  - Perfil do usuário (id, nome, papel), empresa/filial, idioma.
  - Página corrente e entidade ativa (cliente, agendamento, fatura etc.).
  - Políticas de segurança (não executar ações sem permissão; pedir confirmação).
- Persistir sessões e mensagens no Supabase e recuperar histórico.
- Opcional (RAG): tabela de documentos com embeddings (`pgvector`) usando `sentence-transformers/all-MiniLM-L6-v2` via HF para consultas semânticas.

## Supabase: novas tabelas
- `chat_sessions`: `id uuid`, `user_id uuid`, `title text`, `status text`, `created_at timestamptz`.
- `chat_messages`: `id uuid`, `session_id uuid`, `role text` (`user|assistant|tool`), `content jsonb`, `created_at timestamptz`.
- `chat_tools_executions`: `id uuid`, `session_id uuid`, `tool_name text`, `input jsonb`, `output jsonb`, `status text`, `created_at timestamptz`.
- `automation_jobs`: `id uuid`, `type text`, `payload jsonb`, `status text`, `scheduled_for timestamptz`, `executed_at timestamptz`, `created_at timestamptz`.
- (Opcional) `chat_kb_documents`: `id uuid`, `source text`, `title text`, `content text`, `tags text[]`, `embedding vector`.
- Índices por `session_id`, `user_id` e `created_at`; políticas RLS por usuário/empresa.

## Segurança e Logs
- Aplicar RLS em tabelas de chat; ferramentas verificam papel (`admin`, `financeiro`, `atendimento`).
- Pedir confirmação explícita antes de ações que alteram dados (ex.: faturas, agendamentos).
- Auditoria: gravar input/output das ferramentas e status.

## Validações e UX
- Testes manuais: ciclo completo de chat, execução de 2–3 ferramentas, persistência de histórico.
- Testes de falha: sem `HF_ACCESS_TOKEN`, queda de provedor, falta de permissão.
- Medir tempo de resposta e garantir que a UI permanece responsiva com streaming.

## Passos de Implementação
1. Criar `ChatbotWidget.tsx` reutilizando padrões de `OrcamentoChatbot.tsx` e habilitar streaming.
2. Adicionar o widget ao `src/components/Dashboard.tsx`.
3. Implementar `api/chatbot/assistant/route.ts` com provedor HF e suporte a ferramentas.
4. Criar módulo `src/server/chat/tools.ts` com ações do CRM e checagens de permissão.
5. Adicionar camada de contexto (user/role/página/entidade) ao system prompt.
6. Criar migrations SQL para novas tabelas e políticas RLS no Supabase.
7. (Opcional) Implementar `chat_kb_documents` com embeddings e busca semântica.
8. Testar fluxos e ajustar sugestões rápidas e mensagens do sistema.

## Configuração de Ambiente
- `HF_ACCESS_TOKEN` (Hugging Face Inference API).
- Reutilizar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` já existentes.

## Entregáveis Técnicos
- Componentes: `ChatbotWidget.tsx`.
- Rotas: `api/chatbot/assistant/route.ts`.
- Server libs: `src/lib/ai/provider.ts`, `src/server/chat/tools.ts`, `src/server/chat/session.ts`.
- SQL migrations: criação de tabelas e RLS.

## Validação Final
- Executar o projeto local, abrir dashboard, interagir com o chatbot e confirmar execuções de ferramentas afetando dados reais no Supabase com logs e RLS ativos.
