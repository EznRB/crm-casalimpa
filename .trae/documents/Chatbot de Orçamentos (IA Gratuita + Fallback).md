## Objetivo
- Adicionar um chatbot simples na aba de Orçamentos para orientar a criação/edição de orçamentos com sugestões inteligentes, perguntas guiadas e preenchimento do template.
- Utilizar um provedor de IA gratuito via Hugging Face Inference API quando houver token configurado; caso contrário, oferecer fallback local sem IA (regras e respostas heurísticas úteis).

## Escolha de IA Gratuita
- Provedor: Hugging Face Inference API (gratuito com token pessoal, sujeito a limites de uso).
- Modelo sugerido: `mistralai/Mistral-7B-Instruct-v0.2` ou `meta-llama/Llama-3.1-8B-Instruct` (boa qualidade geral).
- Configuração: variável de ambiente `HF_ACCESS_TOKEN` em `.env.local`/Vercel; sem token, o chatbot funciona no modo heurístico (sem chamadas externas).

## Backend (API)
- Criar rota `POST /api/chatbot/budget`:
  - Entrada: `{ messages: Array<{ role: 'user'|'assistant'|'system', content: string }>, context: { cliente, serviço, residência, área_m2, modalidade, validade, itens, subtotal, total } }`.
  - Com `HF_ACCESS_TOKEN`: enviar prompt ao Hugging Face (`https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`) com `inputs` e `parameters` (máx. tokens, temperatura, top_p).
  - Sem token: responder com regras pré-programadas (ex.: sugestões de modalidade, estimativas baseadas em área, mensagem guia, checklist).
  - Retorno: `{ reply: string }` (sem streaming, simplicidade).
  - Segurança: nunca logar `HF_ACCESS_TOKEN`; validar tamanhos e sanitizar conteúdos.

## Frontend (UI do Chatbot)
- Criar componente `src/components/OrcamentoChatbot.tsx`:
  - Botão flutuante (“Ajuda”) no canto inferior direito, abre painel com histórico e input.
  - Envia mensagens para `/api/chatbot/budget` incluindo contexto do formulário atual.
  - Suporta “Aplicar sugestão” em respostas estruturadas (ex.: preencher `valid_until`, adicionar item padrão, ajustar `service_modality`).
- Integração nas páginas:
  - `src/app/orcamentos/novo/page.tsx`: incluir `<OrcamentoChatbot ...propsDerivadasDoForm />` passando estado atual (cliente, serviço, residência, área, modalidade, itens, subtotal/total, notas, template).
  - `src/app/orcamentos/[id]/page.tsx`: idem, construindo `context` a partir do orçamento carregado e dos itens.

## Prompt e Lógica
- System prompt: “Você é um assistente de criação de orçamentos da Casa Limpa. Dê respostas curtas, práticas e acionáveis. Não invente valores; sugira com base em: tipo de residência, metragem, serviço, modalidade, itens e totais. Produza também sugestões de texto para o template.”
- Incluir no `user prompt` um resumo do contexto e a pergunta do usuário.
- Fallback heurístico: respostas geradas por funções locais, como:
  - Estimativa de tempo de serviço por área e modalidade.
  - Itens sugeridos (materiais, taxa de deslocamento, hora técnica) com valores padrão configuráveis.
  - Texto pronto para a seção de “Condições e Validade”.

## Experiência do Usuário
- Ações rápidas no chat:
  - “Adicionar item sugerido” → insere linha em `items`.
  - “Definir validade” → seta `valid_until`.
  - “Preencher template” → atualiza `richHtml` com texto sugerido.
- Mensagens exibem contexto relevante e instruções passo a passo.

## Implementação
- Adicionar componente React e estilos com Tailwind (seguindo padrão do projeto).
- Adicionar rota API em `src/app/api/chatbot/budget/route.ts` usando `NextResponse`.
- No frontend, tratar erros e mostrar fallback caso API retorne indisponível.

## Configuração e Segurança
- `.env.local`: `HF_ACCESS_TOKEN=***` (opcional). Sem token, chatbot opera no modo heurístico.
- Não armazenar chaves no repositório; informar no README de projeto/Configurações.

## Testes
- Manual: abrir `/orcamentos/novo`, interagir com o chatbot, pedir sugestões de itens, modalidade e validade; aplicar alterações ao formulário.
- Verificar `/orcamentos/[id]` com orçamento real; pedir revisão de template e geração de texto.

## Entregáveis
- Componente `OrcamentoChatbot` integrado às páginas de Orçamentos.
- Rota `POST /api/chatbot/budget` com integração Hugging Face e fallback heurístico.
- Sem streaming para simplicidade inicial; pronto para evoluir se necessário.

## Riscos e Mitigações
- Limites/latência Hugging Face: manter fallback local e mensagens claras.
- Contexto grande: resumir itens e dados essenciais no prompt.
- SSR/ícones: evitar libs que causem erros; usar Tailwind e elementos nativos.