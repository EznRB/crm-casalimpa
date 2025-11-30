# TestSprite – Relatório de Testes

---

## 1️⃣ Metadados

- Projeto: `crm casa limpa`
- Data: 2025-11-27
- Gerado por: TestSprite + Assistente de Engenharia

---

## 2️⃣ Sumário por Requisito

### Autenticação

- Contexto: Login via Supabase (senha, magic link, OAuth) falhando com `400`. Sem credenciais válidas nem opção OAuth acessível.
- Casos:
  - TC001 OAuth Login Success → ❌ Failed
    - Erro: opção de OAuth ausente/inacessível na tela de login
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/110654bf-04e1-4d37-ac73-648ed0877f7b>
  - TC002 OAuth Login Failure → ❌ Failed
    - Erro: sem opção OAuth para validar falha
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/b7eb1df0-b661-47e7-8beb-af439a1b50d4>
  - TC008 RBAC Enforcement → ❌ Failed
    - Erro: senha admin falhou; magic link enviado mas sem confirmação
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/bccad318-1781-4f0a-bb20-d1ab7b0ca24c>

### Clientes (CRUD)

- Bloqueado por login.
- Casos:
  - TC003 Client CRUD Operations → ❌ Failed
    - Erro: credenciais inválidas impedem navegação
    - Console: chamadas `auth/v1/token` retornando 400
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/54397222-9148-431a-889f-3f0cb711f1e4>

### Agendamentos e Fluxo

- Bloqueado por login; múltiplos 400 em token/otp/signup.
- Casos:
  - TC004 Schedule + Team Allocation → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/b31d2e5c-4b7d-40b5-b90f-cf5f64072219>
  - TC005 Reschedule with Revalidation → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4b6a98bf-13d3-49f3-ab42-767c8637be19>
  - TC014 Scheduling Performance → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4c63f7cc-1931-4bbe-be35-aa55070e8177>

### Faturas

- Bloqueado por login.
- Casos:
  - TC007 Invoice Creation + Reconciliation → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/1644d71d-3c01-4d2d-b25c-72160e7bca1c>

### Relatórios

- Bloqueado por login.
- Casos:
  - TC009 Generate Reports + Export CSV/PDF → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/7f8ef85b-d1c7-4d74-b53f-fa81028adffd>

### Chatbot (Orçamentos)

- Bloqueado por login.
- Casos:
  - TC010 Chatbot Budget Assistance → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/f82e31e9-a218-44a1-9868-faa9ca22911d>

### Equipe/Funcionários

- Bloqueado por login.
- Casos:
  - TC012 Team Management → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/55fa099c-898d-4b11-b661-fa313be585a0>

### UI/Usabilidade

- Bloqueado por login.
- Casos:
  - TC013 UI Responsiveness + Theme Toggle → ❌ Failed
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4df88ea4-d475-4323-93c7-80b4540d056c>

### Saúde do Sistema

- Casos:
  - TC011 Health Check Endpoint → ✅ Passed
    - Observação: endpoint de health responde corretamente
    - Visualização: <https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/d96ffd2d-991b-4ad5-b3dc-d656d565d078>

---

## 3️⃣ Cobertura & Métricas

- Total: 16
- Passed: 1
- Failed: 15
- Cobertura de requisitos:
  - Autenticação: 3 casos (0/3)
  - Clientes/CRUD: 1 caso (0/1)
  - Agendamentos/Fluxo: 3 casos (0/3)
  - Faturas: 1 caso (0/1)
  - Relatórios: 1 caso (0/1)
  - Chatbot: 1 caso (0/1)
  - Equipe/Funcionários: 1 caso (0/1)
  - UI/Usabilidade: 1 caso (0/1)
  - Saúde do Sistema: 1 caso (1/1)

---

## 4️⃣ Achados Principais

- Falhas de autenticação via Supabase impedem navegação e testes das áreas principais.
- Respostas `400` em `auth/v1/token`, `auth/v1/otp`, `auth/v1/signup` sugerem chaves/URL de Supabase inválidas ou credenciais de teste ausentes.
- Health-check está operacional indicando servidor Next.js acessível, rotas API ativas.

---

## 5️⃣ Recomendações

- Garantir configuração de ambiente:
  - Definir `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` válidos.
  - Se usar autenticação server-side, conferir `SUPABASE_SERVICE_ROLE_KEY` em rotas que exigem serviço.
  - Revisar `src/lib/supabase.ts` e `src/hooks/useAuth.ts` para chaves carregadas de `process.env` e fluxo de login.
- Disponibilizar credenciais de teste:
  - Criar usuário seed no Supabase (e.g., `testsprite@example.com`) ou habilitar magic link com inbox controlado.
- Habilitar opção de OAuth na tela de login (se aplicável) ou ajustar testes para login por email/senha.
- Após corrigir autenticação, reexecutar plano para validar CRUD, agendamentos, faturas e relatórios.

---

## 6️⃣ Próximos Passos

- Corrigir configuração de autenticação e fornecer credenciais.
- Rodar novamente os 16 testes.
- Adicionar cenários adicionais para permissões (RBAC) e desempenho quando login estiver funcional.
