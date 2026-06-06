# Reestruturação Semântica de Pastas e Rotas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renomear diretórios e rotas para nomes mais semânticos e padronizados (purchases -> orders, commodity -> commodities, partners -> suppliers).

**Architecture:** Refatoração de nomes de diretórios e atualização de referências em todo o código fonte, garantindo a integridade dos links e imports.

**Tech Stack:** Next.js (App Router), TypeScript, CSS Modules.

---

### Task 1: Preparação e Renomeação de Diretórios

**Files:**
- Modify: `src/app/dashboard/purchases` -> `src/app/dashboard/orders`
- Modify: `src/app/dashboard/commodity` -> `src/app/dashboard/commodities`
- Modify: `src/app/dashboard/partners` -> `src/app/dashboard/suppliers`

- [ ] **Step 1: Renomear pasta purchases para orders**
```powershell
Rename-Item -Path "src/app/dashboard/purchases" -NewName "orders"
```

- [ ] **Step 2: Renomear pasta commodity para commodities**
```powershell
Rename-Item -Path "src/app/dashboard/commodity" -NewName "commodities"
```

- [ ] **Step 3: Renomear pasta partners para suppliers**
```powershell
Rename-Item -Path "src/app/dashboard/partners" -NewName "suppliers"
```

- [ ] **Step 4: Renomear arquivos CSS internos**
```powershell
Rename-Item -Path "src/app/dashboard/orders/purchases.css" -NewName "orders.css"
Rename-Item -Path "src/app/dashboard/suppliers/partners.css" -NewName "suppliers.css"
```

### Task 2: Atualização de Componentes e Imports Internos

**Files:**
- Modify: `src/app/dashboard/orders/page.tsx`
- Modify: `src/app/dashboard/suppliers/page.tsx`
- Modify: `src/app/dashboard/commodities/[id]/page.tsx`

- [ ] **Step 1: Atualizar OrdersPage e CSS import**
- Alterar `PurchasesPage` para `OrdersPage`
- Alterar `./purchases.css` para `./orders.css`

- [ ] **Step 2: Atualizar SuppliersPage e CSS import**
- Alterar `PartnersPage` para `SuppliersPage`
- Alterar `./partners.css` para `./suppliers.css`

- [ ] **Step 3: Atualizar CommodityDetailPage import de CSS**
- Alterar `../commodity-detail.css` para `../commodity-detail.css` (Caminho corrigido devido ao movimento da pasta)

### Task 3: Atualização de Links e Referências Globais

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/commodities/[id]/page.tsx`

- [ ] **Step 1: Atualizar links na Dock (layout.tsx)**
- Alterar `/dashboard/purchases` para `/dashboard/orders`
- Alterar `/dashboard/partners` para `/dashboard/suppliers`

- [ ] **Step 2: Atualizar links na Dashboard (page.tsx)**
- Alterar `/dashboard/commodity/` para `/dashboard/commodities/`

- [ ] **Step 3: Atualizar link de 'Registrar Compra' (commodities/[id]/page.tsx)**
- Alterar `/dashboard/purchases` para `/dashboard/orders`

### Task 4: Verificação e Commit

- [ ] **Step 1: Verificar se há outras ocorrências perdidas**
- Executar grep para garantir que nada ficou para trás.

- [ ] **Step 2: Commit das alterações**
```bash
git add .
git commit -m "refactor: rename dashboard routes to more semantic names (orders, commodities, suppliers)"
```
