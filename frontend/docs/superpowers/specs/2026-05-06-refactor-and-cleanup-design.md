# Especificação Técnica: Refatoração e Limpeza do Commodities Analytics

**Data:** 2026-05-06
**Status:** Em Revisão
**Objetivo:** Centralizar a lógica de autenticação e API, organizar a estrutura de pastas e remover código/estilos mortos.

---

## 1. Arquitetura do Sistema

### 1.1 Cliente de API Centralizado (`src/lib/api-client.ts`)
Substituiremos o uso direto de `fetch` nos serviços por um cliente especializado:
- **Interceptor de Requisição:** Adiciona automaticamente o header `Authorization: Bearer <token>`.
- **Tratamento de Erros:** Captura erros 401 e dispara o logout automático.
- **Base URL:** Centralizada via variável de ambiente.

### 1.2 Gerenciamento de Estado (`src/contexts/AuthContext.tsx`)
Um contexto React para gerenciar o ciclo de vida do usuário:
- `user`: Objeto com dados do usuário logado.
- `isAuthenticated`: Booleano para proteção de rotas.
- `login(credentials)`: Função centralizada de login.
- `logout()`: Limpa tokens e redireciona.

---

## 2. Reestruturação de Pastas

A estrutura atual será migrada para um padrão modular:

| Caminho Atual | Novo Caminho Sugerido | Motivo |
| :--- | :--- | :--- |
| `src/services/` | `src/services/` | Mantido, mas refatorado para usar o `apiClient`. |
| `src/app/dashboard/purchases/` | `src/app/dashboard/orders/` | Nomeclatura mais semântica para o domínio. |
| `src/app/dashboard/commodity/` | `src/app/dashboard/commodities/` | Padronização para plural. |
| `src/app/dashboard/partners/` | `src/app/dashboard/suppliers/` | Especificidade técnica (fornecedores). |
| `src/components/` | `src/components/ui/` | Separar componentes de UI genéricos de componentes de domínio. |

---

## 3. Estratégia de Estilização

### 3.1 Unificação de Temas
- Mover variáveis de cores repetidas nos arquivos `.css` individuais para o `globals.css`.
- Criar classes utilitárias no `globals.css` para: `.card-glass`, `.btn-primary`, `.input-standard`.

### 3.2 Limpeza
- Utilizar `grep` para identificar classes CSS definidas mas não utilizadas no JSX.
- Remover arquivos `.css` que possuam menos de 5 linhas de estilo único, incorporando-os ao componente ou ao global.

---

## 4. Plano de Transição (Execution Phases)

1. **Fase 1: Infraestrutura** (API Client + AuthContext).
2. **Fase 2: Migração de Serviços** (Refatoração de `auth.ts`, `commodities.ts`, etc).
3. **Fase 3: Reestruturação de Pastas** (Move arquivos e atualiza imports).
4. **Fase 4: Faxina de Estilos** (Remoção de CSS morto e unificação).

---

## 5. Critérios de Sucesso
- Nenhuma chamada `localStorage.getItem("accessToken")` fora do `api-client` ou `AuthContext`.
- Redução de pelo menos 15% no volume total de linhas de CSS.
- Build do Next.js passando sem erros de importação após renomeação de pastas.
