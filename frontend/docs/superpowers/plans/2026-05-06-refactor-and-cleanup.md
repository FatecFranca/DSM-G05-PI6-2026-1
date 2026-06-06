# Plano de Implementação: Refatoração e Limpeza

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralizar API/Auth, reorganizar pastas e limpar CSS morto para melhorar a manutenibilidade.

**Architecture:** Cliente de API centralizado com fetch, Context API para autenticação e estrutura modular por domínio.

**Tech Stack:** Next.js (App Router), TypeScript, React Context API.

---

### Task 1: Infraestrutura de API e Autenticação

**Files:**
- Create: `src/lib/api-client.ts`
- Create: `src/contexts/AuthContext.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Criar o cliente de API centralizado**
Crie um wrapper do fetch que injeta tokens e trata erros 401.

- [ ] **Step 2: Criar o AuthContext**
Implemente o contexto que gerencia o estado do usuário e persiste o token.

- [ ] **Step 3: Envolver a aplicação com o AuthProvider**
Adicione o provider no `layout.tsx` raiz.

- [ ] **Step 4: Commit**
`git add src/lib/api-client.ts src/contexts/AuthContext.tsx src/app/layout.tsx`
`git commit -m "infra: add api client and auth context"`

---

### Task 2: Refatoração de Serviços e Páginas de Auth

**Files:**
- Modify: `src/services/auth.ts`
- Modify: `src/services/commodities.ts`
- Modify: `src/app/page.tsx` (Login)
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Atualizar serviços para usar o apiClient**
Remova lógica de headers manuais e use o novo cliente.

- [ ] **Step 2: Refatorar LoginPage**
Use `useAuth` para login em vez de chamar o serviço e setar localStorage manualmente.

- [ ] **Step 3: Refatorar DashboardLayout**
Use `useAuth` para obter dados do usuário e realizar logout.

- [ ] **Step 4: Commit**
`git add src/services/ src/app/page.tsx src/app/dashboard/layout.tsx`
`git commit -m "refactor: migrate services and auth pages to new infra"`

---

### Task 3: Reestruturação de Pastas e Semântica

**Files:**
- Move: `src/app/dashboard/purchases` -> `src/app/dashboard/orders`
- Move: `src/app/dashboard/commodity` -> `src/app/dashboard/commodities`
- Move: `src/app/dashboard/partners` -> `src/app/dashboard/suppliers`
- Modify: `src/app/dashboard/layout.tsx` (atualizar links)

- [ ] **Step 1: Renomear pastas no sistema de arquivos**
Execute os comandos de move e atualize os imports internos se necessário.

- [ ] **Step 2: Atualizar navegação**
Mude os links no componente de Dock do dashboard.

- [ ] **Step 3: Commit**
`git add src/app/dashboard/`
`git commit -m "arch: restructure folders for better semantics"`

---

### Task 4: Limpeza de Estilos e CSS Morto

**Files:**
- Modify: `src/app/globals.css`
- Delete: Arquivos CSS redundantes
- Modify: Componentes afetados

- [ ] **Step 1: Unificar variáveis e componentes básicos no globals.css**
Mova definições de cores e botões padrão.

- [ ] **Step 2: Auditar e remover classes não utilizadas**
Use busca global para verificar se classes em arquivos CSS ainda são referenciadas no JSX.

- [ ] **Step 3: Commit**
`git add src/app/globals.css src/**/*.css`
`git commit -m "clean: remove unused styles and unify theme"`
