# 📘 Referência da API — Commodities Analytics

> **Base URL:** `http://localhost:8000`
> **Versão:** 1.0.0
> **Docs interativos:** [Swagger UI](/docs) | [ReDoc](/redoc)

---

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/commodities` | Listar matérias-primas |
| `GET` | `/api/v1/commodities/{id}/history` | Histórico de preços |
| `POST` | `/api/v1/predict` | Previsão de preço |
| `POST` | `/api/v1/classify` | Classificação momento de compra |

---

## 1. GET /api/v1/health

**Descrição:** Verifica se a API está operacional e se os modelos ML estão carregados.

**Response (200):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "models_loaded": true
}
```

**Exemplo:**
```bash
curl http://localhost:8000/api/v1/health
```

---

## 2. GET /api/v1/commodities

**Descrição:** Retorna todas as matérias-primas cadastradas no sistema.

**Response (200):**
```json
[
  {
    "id_materia_prima": 1,
    "nome": "Milho",
    "categoria": "Grãos",
    "unidade_medida": "kg",
    "ativo": true
  },
  {
    "id_materia_prima": 2,
    "nome": "Soja",
    "categoria": "Oleaginosas",
    "unidade_medida": "kg",
    "ativo": true
  }
]
```

**Exemplo:**
```bash
curl http://localhost:8000/api/v1/commodities
```

---

## 3. GET /api/v1/commodities/{id}/history

**Descrição:** Retorna o histórico de preços de uma matéria-prima específica.

**Parâmetros de path:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID da matéria-prima |

**Response (200):**
```json
{
  "id_materia_prima": 1,
  "nome": "Milho",
  "historico": [
    {
      "data_referencia": "2024-12-01",
      "preco_medio": 1.22,
      "fonte_dado": "CONAB",
      "regiao": null
    },
    {
      "data_referencia": "2025-01-01",
      "preco_medio": 1.18,
      "fonte_dado": "CONAB",
      "regiao": null
    }
  ]
}
```

**Response (404):**
```json
{
  "detail": "Matéria-prima com ID 99 não encontrada."
}
```

**Exemplo:**
```bash
curl http://localhost:8000/api/v1/commodities/1/history
```

---

## 4. POST /api/v1/predict

**Descrição:** Gera previsões de preço futuro para uma matéria-prima usando o modelo XGBRegressor.

**Request body:**
```json
{
  "id_materia_prima": 1,
  "periodos_futuros": 3
}
```

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id_materia_prima` | int | ✅ | — | ID da matéria-prima |
| `periodos_futuros` | int | ❌ | 3 | Meses futuros (1-12) |

**Response (200):**
```json
{
  "id_materia_prima": 1,
  "nome": "Milho",
  "previsoes": [
    {
      "periodo": "2026-05",
      "preco_previsto": 1.62,
      "variacao_pct": 4.52
    },
    {
      "periodo": "2026-06",
      "preco_previsto": 1.65,
      "variacao_pct": 6.45
    },
    {
      "periodo": "2026-07",
      "preco_previsto": 1.68,
      "variacao_pct": 8.39
    }
  ],
  "modelo_utilizado": "XGBRegressor",
  "data_geracao": "2026-04-24T01:00:00"
}
```

**Códigos de status:**

| Status | Descrição |
|--------|-----------|
| 200 | Previsão gerada com sucesso |
| 404 | Matéria-prima não encontrada |
| 422 | Dados de entrada inválidos |
| 503 | Modelos não disponíveis |

**Exemplo:**
```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1, "periodos_futuros": 3}'
```

---

## 5. POST /api/v1/classify

**Descrição:** Classifica o momento atual de compra como **bom**, **regular** ou **ruim** com base em previsões de preço.

**Request body:**
```json
{
  "id_materia_prima": 1
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_materia_prima` | int | ✅ | ID da matéria-prima |

**Response (200):**
```json
{
  "id_materia_prima": 1,
  "nome": "Milho",
  "preco_atual": 1.55,
  "previsao_media_futura": 1.62,
  "variacao_percentual": 4.52,
  "classificacao": "bom",
  "justificativa": "Preço de Milho tende a subir 4.5%. Momento favorável para compra."
}
```

**Valores de `classificacao`:**

| Valor | Critério | Significado |
|-------|----------|-------------|
| `bom` | Variação > +3% | Preço vai subir — compre agora |
| `regular` | -3% ≤ variação ≤ +3% | Preço estável — momento neutro |
| `ruim` | Variação < -3% | Preço vai cair — aguarde |

**Códigos de status:**

| Status | Descrição |
|--------|-----------|
| 200 | Classificação gerada |
| 404 | Matéria-prima não encontrada / Sem histórico |
| 422 | Dados de entrada inválidos |
| 503 | Modelos não disponíveis |

**Exemplo:**
```bash
curl -X POST http://localhost:8000/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1}'
```

---

## Autenticação

A API atualmente **não requer autenticação**. Em produção, a integração com o backend NestJS gerencia auth centralmente.

## CORS

Configurado para aceitar todas as origens (`*`). Em produção, restringir para os domínios do NestJS e frontends.

## Erros

Todos os erros retornam JSON no formato:
```json
{
  "detail": "Mensagem descrevendo o erro."
}
```
