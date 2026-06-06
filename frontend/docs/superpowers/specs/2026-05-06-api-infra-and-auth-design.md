# Design Spec: Task 1 - Infraestrutura de API e Autenticação

## 1. Visão Geral
Implementar um cliente de API centralizado e um sistema de gerenciamento de autenticação via React Context no Next.js (App Router).

## 2. Arquitetura

### 2.1 API Client (`src/lib/api-client.ts`)
- **Tipo**: Abstração funcional sobre o `fetch` nativo.
- **Responsabilidades**:
  - Injeção automática do header `Authorization: Bearer <token>`.
  - Tratamento centralizado de erros (401, 403, 500, etc.).
  - Redirecionamento para `/` em caso de 401 (Unauthorized).
  - Parsing automático de JSON.
- **Interface**:
  ```typescript
  export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => Promise<T>,
    post: <T>(endpoint: string, body: any, options?: RequestInit) => Promise<T>,
    put: <T>(endpoint: string, body: any, options?: RequestInit) => Promise<T>,
    delete: <T>(endpoint: string, options?: RequestInit) => Promise<T>,
  }
  ```

### 2.2 AuthContext (`src/contexts/AuthContext.tsx`)
- **Tipo**: React Context Provider.
- **Responsabilidades**:
  - Gerenciar o estado global do usuário (`user`).
  - Prover funções de `login`, `logout` e `register`.
  - Persistir o token no `localStorage`.
  - Proteger rotas (pode ser usado em conjunto com Middleware futuramente, mas aqui focado no estado).
- **Tipos**:
  ```typescript
  export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
  }

  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
  }
  ```

### 2.3 Integração Global (`src/app/layout.tsx`)
- Envolver o `children` com o `AuthProvider`.
- Garantir que o `AuthProvider` esteja dentro do `ThemeProvider` (ou o contrário, dependendo da necessidade de temas baseados em usuário). Preferencialmente `AuthProvider` externo para que o tema possa ser acessado por componentes autenticados.

## 3. Fluxo de Autenticação
1. Usuário entra na página de login.
2. Chama `authService.login`.
3. Token é salvo no `localStorage`.
4. `AuthContext` atualiza o estado para `isAuthenticated: true`.
5. Requisições subsequentes via `apiClient` incluem o token.
6. Se o servidor retornar 401, `apiClient` limpa o `localStorage` e recarrega a página ou redireciona.

## 4. Considerações de Segurança
- Uso de `accessToken` no `localStorage`.
- Verificação de ambiente (`typeof window !== 'undefined'`) para evitar erros no SSR.

## 5. Plano de Testes (Conceitual)
- Validar se o header Authorization é enviado.
- Validar se o logout limpa o estado.
- Validar se o 401 causa redirecionamento.
