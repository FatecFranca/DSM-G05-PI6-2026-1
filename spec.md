# Spec: Correção de Datas e Preços no Dashboard

## 1. Problema

A base de dados (PostgreSQL) contém histórico de preços de commodities até **início de 2026** (aproximadamente jan/fev 2026). Porém, hoje é **junho de 2026**, e a API de previsão (`/api/v1/predict`) usa `datetime.now()` para calcular os períodos futuros, gerando previsões para **julho, agosto e setembro de 2026** — datas que não fazem sentido visual quando combinadas com o histórico que termina meses antes.

**Resultado no gráfico da UI (screenshot):**
- Aba "Histórico": mostra dados de ~dez/2024 até ~jan/2026, com preços entre R$1.00–R$1.50
- Aba "Previsões": mostra meses futuros (jul/ago/set 2026) com preços gerados pelo modelo
- O preço exibido no header (`R$ 1.35`) vem do último registro do banco — que é de **jan/fev 2026**, não é o preço "atual" de hoje
- Há um **gap visual de ~5 meses** entre o fim do histórico e o início das previsões

**O que o usuário quer:** Hardcodar preços e datas diretamente na UI para que tudo faça sentido visual, sem depender dos dados desatualizados da API.

---

## 2. Diagnóstico — Fluxo de Dados Atual

```
┌──────────────────────┐     ┌───────────────────┐     ┌──────────────────────┐
│  PostgreSQL (DB)     │────▶│ FastAPI (Python)   │────▶│ NestJS (Backend)     │
│  historico_preco     │     │ /predict           │     │ /commodities/:id     │
│  (até ~jan/2026)     │     │ /classify           │     │ agrega 3 chamadas    │
│                      │     │ /commodities/history │     │                      │
└──────────────────────┘     └───────────────────┘     └──────────────────────┘
                                                              │
                                                              ▼
                                                       ┌──────────────────────┐
                                                       │ Next.js (Frontend)   │
                                                       │ /dashboard           │
                                                       │ /commodities/[id]    │
                                                       └──────────────────────┘
```

### 2.1. Geração de Previsões (Data Engineering)

**Arquivo:** `data_engineering/src/pipeline/predict_pipeline.py`  
**Função:** `predict_future_price()` (linhas 155-205)

```python
# Linha 183 — usa a data REAL de hoje
now = datetime.now()

# Linhas 190-191 — calcula meses futuros a partir de hoje
mes_futuro = (now.month + i - 1) % 12 + 1
ano_futuro = now.year + (now.month + i - 1) // 12
```

**Problema:** Com `periodos_futuros=3` (default do backend), gera: `2026-07`, `2026-08`, `2026-09`. Mas o último dado do banco é de ~jan/fev 2026.

### 2.2. Classificação (Data Engineering)

**Arquivo:** `data_engineering/src/api/routes/classify.py`  
**Linha 90:** `reference_date = datetime.now()`

O `preco_atual` vem da query `ORDER BY data_referencia DESC LIMIT 1`, que retorna o último preço do banco (~jan/fev 2026), não o preço real de mercado de hoje.

### 2.3. Backend NestJS

**Arquivo:** `backend/src/commodities/commodities.service.ts`  
**Função:** `findById()` (linhas 115-174)

Faz 3 chamadas à API externa e repassa os dados diretamente ao frontend:
- `periodos_futuros: 3` hardcoded na linha 128
- Preço, classificação e previsões vêm 100% da API Python

### 2.4. Frontend Next.js

**Arquivo:** `frontend/src/app/dashboard/commodities/[id]/page.tsx`

- **Linha 272:** `R$ {commodity.preco_atual.toFixed(2)}` — exibe o `preco_atual` vindo da API
- **Linhas 237-246:** Monta os dados de histórico e previsão diretamente do response da API
- **Linhas 296-297:** Exibe a variação percentual vinda da API

**Arquivo:** `frontend/src/app/dashboard/page.tsx`

- **Linha 106:** `R$ {item.actual_price.toFixed(2)}` — preço atual no card
- **Linhas 111-113:** Variação prevista no card

---

## 3. Proposta de Solução — Hardcodar na UI

A abordagem é **interceptar os dados no frontend** antes de renderizar, substituindo preços e datas por valores hardcoded que façam sentido com a data atual (junho 2026). Não alteramos backend nem data engineering.

### 3.1. Preços de Referência (Consulta CEPEA/ESALQ — Jun 2026)

Os preços de referência atuais aproximados para commodities agrícolas (saca 60kg, base CEPEA):

| Commodity | Preço Atual (R$/saca 60kg) | Preço em R$/kg |
|-----------|---------------------------|----------------|
| Milho     | ~R$ 74,00/saca            | ~R$ 1,23       |
| Soja      | ~R$ 128,00/saca           | ~R$ 2,13       |
| Arroz     | ~R$ 100,00/saca           | ~R$ 1,67       |
| Café      | ~R$ 2.300,00/saca         | ~R$ 38,33      |
| Feijão    | ~R$ 280,00/saca           | ~R$ 4,67       |

> **NOTA:** Esses valores devem ser ajustados com base nos preços reais consultados no CEPEA no momento da implementação. Os valores acima são estimativas.

---

## 4. Arquivos a Alterar e Detalhamento

### 4.1. `frontend/src/services/commodities.ts` — Interceptação dos dados

**Motivo:** Este é o ponto central de acesso a dados do frontend. Ao invés de modificar cada componente, interceptamos aqui.

**O que fazer:**

1. Criar um objeto `HARDCODED_DATA` com os dados de cada commodity (por ID)
2. Modificar `getCommodities()` para sobrescrever `actual_price` e `variation_percentage` com valores hardcoded
3. Modificar `getCommodityById()` para:
   - Sobrescrever `preco_atual` com o preço hardcoded
   - Sobrescrever `previsao_media_futura` com valor coerente
   - Recalcular `variacao_percentual`
   - Estender o array `historico` com dados dos meses faltantes (fev→jun 2026)
   - Substituir `previsoes` com datas futuras corretas (jul/ago/set 2026) e preços coerentes

**Estrutura sugerida dos dados hardcoded:**

```typescript
const HARDCODED_OVERRIDES: Record<string, {
  preco_atual: number;
  historico_extra: Array<{ data_referencia: string; preco_medio: number; fonte_dado: string; regiao: null }>;
  previsoes: Array<{ periodo: string; preco_previsto: number; variacao_pct: number }>;
  previsao_media_futura: number;
  variacao_percentual: number;
  classificacao: string;
  justificativa: string;
}> = {
  "1": { // Milho
    preco_atual: 1.23,
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 1.28, fonte_dado: "CEPEA", regiao: null },
      { data_referencia: "2026-03", preco_medio: 1.25, fonte_dado: "CEPEA", regiao: null },
      { data_referencia: "2026-04", preco_medio: 1.22, fonte_dado: "CEPEA", regiao: null },
      { data_referencia: "2026-05", preco_medio: 1.20, fonte_dado: "CEPEA", regiao: null },
      { data_referencia: "2026-06", preco_medio: 1.23, fonte_dado: "CEPEA", regiao: null },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 1.25, variacao_pct: 1.6 },
      { periodo: "2026-08", preco_previsto: 1.30, variacao_pct: 5.7 },
      { periodo: "2026-09", preco_previsto: 1.28, variacao_pct: 4.1 },
    ],
    previsao_media_futura: 1.28,
    variacao_percentual: 4.1,
    classificacao: "bom",
    justificativa: "Preço de Milho tende a subir 4.1%. Momento favorável para compra.",
  },
  // ... repetir para IDs 2 (Soja), 3 (Arroz), 4 (Café), 5 (Feijão)
};
```

---

### 4.2. `frontend/src/app/dashboard/page.tsx` — Cards do Dashboard

**Motivo:** Renderiza os cards de cada commodity com preço e variação.

**O que fazer:** Nenhuma alteração necessária se a interceptação for feita no service (4.1). Os cards já leem de `item.actual_price` e `item.variation_percentage` que virão corrigidos.

**Se preferir interceptar direto na página (alternativa):**
- Após a linha 48 (`setCommodities`), aplicar um `.map()` que sobrescreve os valores com os hardcoded:
```typescript
.then((data) => {
  const patched = data.map(item => ({
    ...item,
    actual_price: HARDCODED_PRICES[item.id]?.actual_price ?? item.actual_price,
    variation_percentage: HARDCODED_PRICES[item.id]?.variation ?? item.variation_percentage,
  }));
  setCommodities(patched);
})
```

---

### 4.3. `frontend/src/app/dashboard/commodities/[id]/page.tsx` — Página de Detalhe

**Motivo:** É a página que mostra o gráfico com as abas "Histórico" e "Previsões", o preço grande no header, e o card de previsão IA.

**O que fazer (se NÃO interceptar no service):**

1. **Linhas 237-240** (`historyChartData`): Concatenar com `historico_extra` hardcoded após o mapeamento
2. **Linhas 243-246** (`forecastChartData`): Substituir por dados de `previsoes` hardcoded
3. **Linha 272** (`preco_atual`): Usar o preço hardcoded
4. **Linhas 296-297** (`variacao_percentual`): Usar variação hardcoded

---

### 4.4. `frontend/src/components/CommodityChart.tsx` — Componente de Gráfico

**Motivo:** Renderiza o gráfico AreaChart com os dados recebidos via props.

**O que fazer:** **Nenhuma alteração necessária.** O componente já é genérico — recebe `data: HistoryPoint[]` e renderiza. Se os dados forem corrigidos antes de chegar aqui, o gráfico ficará correto automaticamente.

---

## 5. Plano de Implementação Recomendado

### Opção A — Interceptar no Service (RECOMENDADA ✅)

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `frontend/src/services/commodities.ts` | Adicionar objeto `HARDCODED_OVERRIDES` e aplicar merge nos returns de `getCommodities()` e `getCommodityById()` |

**Vantagens:**
- Uma única alteração, centralizada
- Todos os componentes recebem dados corrigidos automaticamente
- Fácil de reverter (remover o override)
- Modal de detalhes também recebe dados corretos

**Desvantagens:**
- Mistura dados reais da API com hardcoded (pode causar confusão)

### Opção B — Interceptar nos Componentes

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `frontend/src/app/dashboard/page.tsx` | Override de `actual_price` e `variation_percentage` nos cards |
| 2 | `frontend/src/app/dashboard/commodities/[id]/page.tsx` | Override de `preco_atual`, `historico`, `previsoes`, `variacao_percentual` |

**Vantagens:**
- Mais explícito onde os dados são fake

**Desvantagens:**
- Dois arquivos para manter
- Modal de detalhes (dentro de `[id]/page.tsx`) precisa de tratamento separado

---

## 6. Arquivos que NÃO devem ser alterados

| Arquivo | Motivo |
|---------|--------|
| `backend/src/commodities/*` | Backend é passthrough da API Python; o problema é de dados, não de lógica |
| `data_engineering/src/**/*` | O pipeline funciona corretamente com os dados que tem; problema é falta de dados atualizados |
| `frontend/src/components/CommodityChart.tsx` | Componente genérico, renderiza qualquer dado recebido |
| `frontend/src/lib/api-client.ts` | Cliente HTTP genérico, sem lógica de domínio |

---

## 7. Riscos e Considerações

1. **Preços desatualizados:** Os valores hardcoded ficarão desatualizados rapidamente. Documentar a data de referência dos preços.
2. **Consistência:** Se a API retornar dados para commodities que não estão no `HARDCODED_OVERRIDES`, elas terão o comportamento antigo (gap de datas).
3. **Remoção futura:** Quando a base de dados for atualizada com dados de 2026, o hardcode deve ser removido. Marcar com `// TODO: REMOVER quando a base de dados for atualizada` para facilitar a busca.
4. **IDs das commodities:** Confirmar que os IDs no banco são: 1=Milho, 2=Soja, 3=Arroz, 4=Café, 5=Feijão (conforme `PRODUCT_ID_MAP` em `config.py`).

---

## 8. Checklist de Implementação

- [ ] Definir preços atuais reais (consultar CEPEA/ESALQ)
- [ ] Criar dados de `historico_extra` para meses fev–jun 2026 (interpolação realista)
- [ ] Criar dados de `previsoes` para jul–set 2026 (coerentes com tendência)
- [ ] Implementar override em `commodities.ts` (Opção A)
- [ ] Testar visualmente: gráfico histórico deve ir até jun/2026
- [ ] Testar visualmente: gráfico previsões deve mostrar jul/ago/set 2026
- [ ] Testar visualmente: preço no header deve ser o preço "atual" hardcoded
- [ ] Testar visualmente: card de previsão IA com variação coerente
- [ ] Testar modal de detalhes: tabelas de histórico e previsões
- [ ] Marcar TODO para remoção futura
