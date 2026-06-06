# 🌾 Commodities Analytics — Data Engineering

> Sistema de previsão de preços e classificação de momento de compra de matérias-primas agrícolas (Milho, Soja, Arroz, Café e Feijão) usando Machine Learning com exposição via API REST.

---

## 📑 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Stack Tecnológica](#-stack-tecnológica)
4. [Estrutura de Diretórios](#-estrutura-de-diretórios)
5. [Configuração e Instalação](#-configuração-e-instalação)
6. [Módulo: Configuração (`src/config.py`)](#-módulo-configuração-srcconfigpy)
7. [Módulo: Carregamento de Dados (`src/data/loader.py`)](#-módulo-carregamento-de-dados-srcdataloaderpy)
8. [Módulo: Limpeza de Dados (`src/data/cleaner.py`)](#-módulo-limpeza-de-dados-srcdatacleanerpy)
9. [Módulo: Feature Engineering (`src/data/feature_engineering.py`)](#-módulo-feature-engineering-srcdatafeature_engineeringpy)
10. [Módulo: Modelo de Regressão (`src/models/regression.py`)](#-módulo-modelo-de-regressão-srcmodelsregressionpy)
11. [Módulo: Modelo de Classificação (`src/models/classification.py`)](#-módulo-modelo-de-classificação-srcmodelsclassificationpy)
12. [Módulo: Avaliação de Modelos (`src/models/evaluator.py`)](#-módulo-avaliação-de-modelos-srcmodelsevaluatorpy)
13. [Pipeline de Treino (`src/pipeline/train_pipeline.py`)](#-pipeline-de-treino-srcpipelinetrain_pipelinepy)
14. [Pipeline de Predição (`src/pipeline/predict_pipeline.py`)](#-pipeline-de-predição-srcpipelinepredict_pipelinepy)
15. [API REST — FastAPI (`src/api/`)](#-api-rest--fastapi-srcapi)
16. [Banco de Dados — PostgreSQL](#-banco-de-dados--postgresql)
17. [Docker & Deploy](#-docker--deploy)
18. [Testes](#-testes)
19. [Makefile — Comandos Úteis](#-makefile--comandos-úteis)

---

## 🎯 Visão Geral

O projeto **Commodities Analytics** é um sistema completo de engenharia de dados e ciência de dados que:

1. **Ingere** dados de preços mensais de commodities da CONAB (CSVs com separador `;` e encoding `latin-1`)
2. **Limpa e transforma** os dados brutos em features para Machine Learning
3. **Treina modelos** de regressão (XGBRegressor) e classificação (XGBClassifier)
4. **Expõe uma API REST** (FastAPI) para previsão de preços e recomendação de compra
5. **Persiste tudo** em um banco PostgreSQL

### Fluxo de Dados

```
CSV CONAB ──→ Limpeza ──→ Feature Engineering ──→ Treino ML ──→ Artefatos (.joblib)
                                                                      │
                                                                      ▼
PostgreSQL ◄── API REST (FastAPI) ◄── Predição/Classificação ◄── Artefatos
```

---

## 🏗 Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE DADOS                         │
│  ┌──────────┐   ┌──────────┐   ┌───────────────────────────┐  │
│  │ CSV CONAB│──▶│ Cleaner  │──▶│ Feature Engineering       │  │
│  │ (data/)  │   │          │   │ (lags, rolling, temporal) │  │
│  └──────────┘   └──────────┘   └───────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE MODELOS                         │
│  ┌─────────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │ XGBRegressor│   │ XGBClassifier   │   │ Evaluator       │  │
│  │ (preço)     │   │ (compra)        │   │ (MAE/R²/F1)     │  │
│  └─────────────┘   └─────────────────┘   └─────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CAMADA DE API                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ /health  │  │/predict  │  │/classify │  │/commodities   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CAMADA DE INFRAESTRUTURA                      │
│  ┌──────────────┐   ┌──────────┐   ┌───────────────────────┐  │
│  │ PostgreSQL   │   │ Docker   │   │ Docker Compose        │  │
│  │ (8 tabelas)  │   │          │   │ (db + api)            │  │
│  └──────────────┘   └──────────┘   └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Stack Tecnológica

| Categoria        | Tecnologia          | Versão    |
|-----------------|---------------------|-----------|
| Linguagem       | Python              | 3.12      |
| API             | FastAPI             | ≥ 0.115   |
| Servidor ASGI   | Uvicorn             | ≥ 0.30    |
| Servidor WSGI   | Gunicorn            | ≥ 22.0    |
| Validação       | Pydantic            | ≥ 2.0     |
| ORM/DB          | SQLAlchemy          | ≥ 2.0     |
| Driver DB       | psycopg2            | ≥ 2.9     |
| Dados           | Pandas / NumPy      | ≥ 2.2 / ≥ 1.26 |
| ML              | XGBoost             | ≥ 2.1     |
| Pré-processamento | scikit-learn      | ≥ 1.5     |
| Serialização    | joblib              | ≥ 1.4     |
| Visualização    | matplotlib / seaborn| ≥ 3.9 / ≥ 0.13 |
| Banco de dados  | PostgreSQL          | 17 (Alpine) |
| Container       | Docker / Compose    | -         |

---

## 📂 Estrutura de Diretórios

```
data_engineering/
├── src/                          # Código-fonte principal
│   ├── __init__.py
│   ├── config.py                 # Configurações centralizadas
│   ├── data/                     # Módulos de dados
│   │   ├── __init__.py
│   │   ├── loader.py             # Carregamento de CSVs
│   │   ├── cleaner.py            # Limpeza e padronização
│   │   └── feature_engineering.py # Criação de features
│   ├── models/                   # Módulos de ML
│   │   ├── __init__.py
│   │   ├── regression.py         # XGBRegressor (previsão preço)
│   │   ├── classification.py     # XGBClassifier (momento compra)
│   │   └── evaluator.py          # Métricas e visualização
│   ├── pipeline/                 # Orquestração
│   │   ├── __init__.py
│   │   ├── train_pipeline.py     # Pipeline completo de treino
│   │   └── predict_pipeline.py   # Pipeline de predição (usado pela API)
│   └── api/                      # API REST
│       ├── __init__.py
│       ├── main.py               # FastAPI app + startup
│       ├── schemas.py            # Pydantic models (request/response)
│       ├── dependencies.py       # Injeção de dependências (DB, modelos)
│       └── routes/               # Endpoints
│           ├── __init__.py
│           ├── health.py         # GET /api/v1/health
│           ├── commodities.py    # GET /api/v1/commodities
│           ├── predict.py        # POST /api/v1/predict
│           └── classify.py       # POST /api/v1/classify
├── data/                         # Dados brutos e processados
│   ├── PrecoMensalUF.csv         # Preços por UF (CONAB)
│   ├── PrecoMensalMun.csv        # Preços por Município (CONAB)
│   └── processed/                # Dados processados (gerados)
│       ├── train.csv
│       └── test.csv
├── database/                     # SQL de criação e seeds
│   ├── init.sql                  # DDL — 8 tabelas
│   ├── seed_all.sql              # Orquestrador de seeds
│   ├── seed_materias_primas.sql  # Seed: 5 commodities
│   ├── seed_usuarios.sql         # Seed: usuários teste
│   ├── seed_historico_precos.sql # Seed: histórico de preços
│   ├── seed_compras.sql          # Seed: compras de exemplo
│   └── seed_alertas.sql          # Seed: alertas de exemplo
├── artifacts/                    # Modelos treinados (gerados)
├── tests/                        # Testes automatizados
│   ├── test_api.py               # Testes dos endpoints
│   ├── test_loader.py            # Testes de dados e features
│   └── test_models.py            # Testes dos modelos ML
├── notebooks/                    # Jupyter notebooks (EDA)
│   └── data_explore.ipynb
├── docs/                         # Documentação extra
├── documents/                    # PRD e diagramas
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # PostgreSQL + API
├── Makefile                      # Atalhos de linha de comando
├── requirements.txt              # Dependências Python
├── .env.example                  # Template de variáveis de ambiente
└── .gitignore
```

---

## ⚙ Configuração e Instalação

### 1. Clonar e preparar ambiente

```bash
git clone <repo-url>
cd data_engineering

# Criar virtualenv
python -m venv .venv
source .venv/bin/activate  # macOS/Linux

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Conteúdo do `.env.example`:

```env
# PostgreSQL
POSTGRES_USER=commodities_user
POSTGRES_PASSWORD=commodities_pass
POSTGRES_DB=commodities_analytics
POSTGRES_PORT=5432

# API
API_PORT=8000
API_HOST=0.0.0.0
DATABASE_URL=postgresql://commodities_user:commodities_pass@db:5432/commodities_analytics

# Modelos
MODEL_PATH=./artifacts
```

### 3. Subir infraestrutura

```bash
# Subir PostgreSQL + API via Docker
make up

# Ou manualmente
docker compose up -d
```

### 4. Treinar modelos

```bash
make train

# Ou manualmente
python -m src.pipeline.train_pipeline
```

### 5. Iniciar API (desenvolvimento)

```bash
make serve

# Ou manualmente
uvicorn src.api.main:app --reload --port 8000
```

→ Acesse `http://localhost:8000/docs` para a documentação Swagger interativa.

---

## 🔧 Módulo: Configuração (`src/config.py`)

> **Responsabilidade:** Centralizar todas as configurações do projeto — caminhos, credenciais de banco, parâmetros de modelos e constantes globais.

Este módulo é importado por **todos os outros módulos**. Usa variáveis de ambiente (via `python-dotenv`) com fallback para valores padrão.

### Caminhos do projeto

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # Raiz do projeto
DATA_DIR = BASE_DIR / "data"                       # CSVs brutos
PROCESSED_DIR = DATA_DIR / "processed"             # Dados processados
ARTIFACTS_DIR = BASE_DIR / "artifacts"             # Modelos treinados
DATABASE_DIR = BASE_DIR / "database"               # Scripts SQL

# Garantir que diretórios existam ao importar
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
```

**O que faz:** Define todos os caminhos como `Path` objects. Ao importar o módulo, os diretórios `processed/` e `artifacts/` são criados automaticamente caso não existam.

### Conexão com banco de dados

```python
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://commodities_user:commodities_pass@localhost:5432/commodities_analytics",
)
```

**O que faz:** Lê a URL de conexão do ambiente. Se não encontrar, usa o valor padrão local.

### Configuração de CSV

```python
CSV_PARAMS: Dict[str, str] = {
    "sep": ";",         # CSVs da CONAB usam ponto-e-vírgula
    "decimal": ",",     # Decimal com vírgula (padrão BR)
    "encoding": "latin-1",  # Encoding dos arquivos
}
```

**O que faz:** Define os parâmetros de leitura dos CSVs da CONAB, que usam formatação brasileira.

### Produtos do MVP

```python
MVP_PRODUCTS: List[str] = ["MILHO", "SOJA", "ARROZ", "CAFE", "FEIJAO"]

PRODUCT_ID_MAP: Dict[int, str] = {
    1: "Milho", 2: "Soja", 3: "Arroz", 4: "Café", 5: "Feijão",
}
```

**O que faz:** Define quais commodities fazem parte do MVP e um mapeamento ID → nome para uso na API.

### Limiares de classificação

```python
CLASSIFICATION_THRESHOLDS: Dict[str, float] = {
    "bom": 3.0,    # variação > +3%  → bom momento para comprar
    "ruim": -3.0,  # variação < -3%  → mau momento para comprar
}
```

**O que faz:** Se o modelo prever que o preço vai **subir mais de 3%**, classifica como "bom" momento para comprar (compre agora antes que suba). Se prever queda de mais de 3%, classifica como "ruim" (espere o preço cair).

### Parâmetros de Feature Engineering

```python
LAG_PERIODS: List[int] = [1, 2, 3, 6]     # Lags de 1, 2, 3 e 6 meses
ROLLING_WINDOWS: List[int] = [3, 6]       # Médias móveis de 3 e 6 meses
TRAIN_TEST_SPLIT_RATIO: float = 0.8       # 80% treino / 20% teste
```

---

## 📥 Módulo: Carregamento de Dados (`src/data/loader.py`)

> **Responsabilidade:** Ler os CSVs brutos da CONAB e os datasets processados pelo pipeline.

### `load_uf_data()` — Carregar CSV por UF

```python
def load_uf_data(filepath: Path | None = None) -> pd.DataFrame:
```

Carrega o arquivo `PrecoMensalUF.csv` com os parâmetros brasileiros (`;`, `,`, `latin-1`).

**Exemplo de uso:**

```python
from src.data.loader import load_uf_data

df = load_uf_data()
print(df.shape)     # (algo como 69420, 9)
print(df.columns)
# ['produto', 'classificao_produto', 'id_produto', 'uf',
#  'regiao', 'ano', 'mes', 'dsc_nivel_comercializacao', 'valor_produto_kg']

print(df.head())
#   produto classificao_produto  id_produto   uf  regiao  ano  mes  ...  valor_produto_kg
# 0  MILHO    MILHO EM GRÃO           1      AC  Norte  2015   1  ...             0.85
```

**Fluxo interno:**
1. Verifica se o arquivo existe → se não, lança `FileNotFoundError`
2. Lê com `pd.read_csv()` usando `CSV_PARAMS` (separador `;`, decimal `,`, encoding `latin-1`)
3. Retorna o DataFrame

### `load_mun_data()` — Carregar CSV por Município

```python
def load_mun_data(filepath: Path | None = None) -> pd.DataFrame:
```

Idêntico ao `load_uf_data`, mas lê o `PrecoMensalMun.csv` que inclui colunas extras como `nom_municipio` e `cod_ibge`.

### `load_processed_data()` — Carregar dados processados

```python
def load_processed_data(processed_dir: Path | None = None) -> Tuple[pd.DataFrame, pd.DataFrame]:
```

Carrega os CSVs de treino e teste gerados pelo pipeline.

**Exemplo de uso:**

```python
from src.data.loader import load_processed_data

df_train, df_test = load_processed_data()
print(f"Treino: {df_train.shape}, Teste: {df_test.shape}")
# Treino: (350, 18), Teste: (70, 18)
```

---

## 🧹 Módulo: Limpeza de Dados (`src/data/cleaner.py`)

> **Responsabilidade:** Limpar, filtrar e padronizar os dados brutos para uso nos modelos.

### `clean_dataframe()` — Limpeza geral

```python
def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
```

**O que faz (passo a passo):**

1. **Strip whitespace** em todas as colunas de texto:
   ```python
   str_cols = df.select_dtypes(include=["object"]).columns
   for col in str_cols:
       df[col] = df[col].str.strip()
   ```
   Remove espaços em branco no início e fim de cada valor de texto.

2. **Conversão numérica** de `valor_produto_kg`:
   ```python
   df["valor_produto_kg"] = pd.to_numeric(df["valor_produto_kg"], errors="coerce")
   ```
   Converte a coluna de preço para numérico, substituindo valores inválidos por `NaN`.

3. **Conversão de ano/mês** para inteiro:
   ```python
   df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
   df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
   ```
   Usa `Int64` (nullable integer) para lidar com possíveis `NaN`.

**Exemplo de uso:**

```python
from src.data.loader import load_uf_data
from src.data.cleaner import clean_dataframe

df = load_uf_data()
df_clean = clean_dataframe(df)
# Agora: sem espaços em branco, tipos corretos
```

### `filter_mvp_products()` — Filtrar produtos do MVP

```python
def filter_mvp_products(df: pd.DataFrame, products: Optional[List[str]] = None) -> pd.DataFrame:
```

**O que faz:** Filtra o DataFrame para incluir apenas os 5 produtos do MVP (Milho, Soja, Arroz, Café, Feijão).

```python
mask = df["produto"].str.upper().isin(target_products)
return df[mask].copy()
```

**Exemplo de uso:**

```python
from src.data.cleaner import filter_mvp_products

df_mvp = filter_mvp_products(df_clean)
print(df_mvp["produto"].unique())
# ['MILHO', 'SOJA', 'ARROZ', 'CAFE', 'FEIJAO']
```

### `create_date_reference()` — Criar coluna de data

```python
def create_date_reference(df: pd.DataFrame) -> pd.DataFrame:
```

**O que faz:** Combina as colunas `ano` e `mes` em uma coluna `data_referencia` do tipo datetime.

```python
df["data_referencia"] = pd.to_datetime(
    df["ano"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
)
# Resultado: "2024" + "-" + "03" + "-01" → datetime 2024-03-01
```

### `aggregate_national_price()` — Agregar preço nacional

```python
def aggregate_national_price(df: pd.DataFrame) -> pd.DataFrame:
```

**O que faz:** Calcula a **média nacional** do preço por produto/mês, agrupando todas as UFs.

```python
agg_df = (
    df.groupby(["produto", "data_referencia"], as_index=False)["valor_produto_kg"]
    .mean()
    .sort_values(["produto", "data_referencia"])
    .reset_index(drop=True)
)
```

**Antes:** Múltiplas linhas por produto/mês (uma por UF)
**Depois:** Uma única linha por produto/mês com a média nacional

---

## 🔬 Módulo: Feature Engineering (`src/data/feature_engineering.py`)

> **Responsabilidade:** Criar features (variáveis preditivas) a partir dos dados históricos de preço.

### `create_lag_features()` — Features de lag (valores passados)

```python
def create_lag_features(df, col="valor_produto_kg", lags=None) -> pd.DataFrame:
```

**O que faz:** Cria colunas com o preço de **N meses atrás** para cada produto.

```python
for lag in lag_periods:  # [1, 2, 3, 6]
    df[f"preco_t-{lag}"] = df.groupby("produto")[col].shift(lag)
```

**Exemplo visual:**

| mês | preço | preco_t-1 | preco_t-2 | preco_t-3 |
|-----|-------|-----------|-----------|-----------|
| Jan | 5.00  | NaN       | NaN       | NaN       |
| Fev | 5.20  | 5.00      | NaN       | NaN       |
| Mar | 5.10  | 5.20      | 5.00      | NaN       |
| Abr | 5.30  | 5.10      | 5.20      | 5.00      |

### `create_rolling_features()` — Média e desvio padrão móvel

```python
def create_rolling_features(df, col="valor_produto_kg", windows=None) -> pd.DataFrame:
```

**O que faz:** Calcula estatísticas de janela deslizante:

- `media_movel_3m` — Média dos últimos 3 meses
- `media_movel_6m` — Média dos últimos 6 meses
- `desvio_3m` — Desvio padrão dos últimos 3 meses (só para janelas ≤ 3)

```python
for window in rolling_windows:  # [3, 6]
    grouped = df.groupby("produto")[col]
    df[f"media_movel_{window}m"] = grouped.transform(
        lambda x: x.rolling(window, min_periods=1).mean()
    )
```

### `create_temporal_features()` — Features temporais

```python
def create_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
```

**O que faz:** Extrai informações do calendário e aplica **encoding cíclico** para o mês.

```python
# Trimestre
df["trimestre"] = ((df["mes"] - 1) // 3) + 1

# Encoding cíclico: captura que Janeiro e Dezembro são "próximos"
df["mes_sin"] = np.sin(2 * np.pi * df["mes"] / 12)
df["mes_cos"] = np.cos(2 * np.pi * df["mes"] / 12)
```

**Por que encoding cíclico?** Com valores lineares (1-12), o modelo acharia que Janeiro (1) e Dezembro (12) são distantes. Com sin/cos, eles ficam próximos no espaço circular.

### `create_variation_features()` — Variação percentual

```python
def create_variation_features(df, col="valor_produto_kg") -> pd.DataFrame:
```

**O que faz:** Calcula a variação percentual em relação ao mês anterior e 3 meses atrás:

```python
df["variacao_pct_1m"] = ((df[col] - df["preco_t-1"]) / df["preco_t-1"]) * 100
df["variacao_pct_3m"] = ((df[col] - df["preco_t-3"]) / df["preco_t-3"]) * 100
```

### `create_all_features()` — Pipeline completo

```python
def create_all_features(df, price_col="valor_produto_kg") -> pd.DataFrame:
```

**O que faz:** Aplica **todas as transformações** em sequência:

```python
df = create_lag_features(df, col=price_col)       # 1. Lags
df = create_rolling_features(df, col=price_col)   # 2. Médias móveis
df = create_temporal_features(df)                  # 3. Features temporais
df = create_variation_features(df, col=price_col)  # 4. Variação %
```

**Features geradas:**

| Feature            | Descrição                                |
|--------------------|------------------------------------------|
| `preco_t-1`        | Preço do mês anterior                    |
| `preco_t-2`        | Preço de 2 meses atrás                   |
| `preco_t-3`        | Preço de 3 meses atrás                   |
| `preco_t-6`        | Preço de 6 meses atrás                   |
| `media_movel_3m`   | Média móvel de 3 meses                   |
| `media_movel_6m`   | Média móvel de 6 meses                   |
| `desvio_3m`        | Desvio padrão de 3 meses                 |
| `mes`              | Mês do ano (1-12)                        |
| `trimestre`        | Trimestre (1-4)                          |
| `mes_sin`          | Seno cíclico do mês                      |
| `mes_cos`          | Cosseno cíclico do mês                   |
| `variacao_pct_1m`  | Variação % em relação ao mês anterior    |
| `variacao_pct_3m`  | Variação % em relação a 3 meses atrás    |

---

## 📈 Módulo: Modelo de Regressão (`src/models/regression.py`)

> **Responsabilidade:** Treinar, prever e serializar o modelo de regressão para previsão de preço futuro.

### Hiperparâmetros padrão

```python
DEFAULT_REGRESSION_PARAMS: Dict[str, Any] = {
    "n_estimators": 200,       # 200 árvores
    "max_depth": 6,            # Profundidade máxima de cada árvore
    "learning_rate": 0.1,      # Taxa de aprendizado
    "subsample": 0.8,          # 80% das amostras por árvore
    "colsample_bytree": 0.8,   # 80% das features por árvore
    "random_state": 42,        # Reprodutibilidade
    "n_jobs": -1,              # Usar todos os cores
}
```

### `train_regression_model()` — Treinar modelo

```python
def train_regression_model(X_train, y_train, params=None) -> XGBRegressor:
```

**O que faz:** Instancia e treina um `XGBRegressor` com os dados fornecidos.

```python
model = XGBRegressor(**model_params)
model.fit(X_train, y_train)
return model
```

**Exemplo de uso:**

```python
from src.models.regression import train_regression_model

model = train_regression_model(X_train_scaled, y_train)
# model agora é um XGBRegressor treinado
```

### `predict_price()` — Gerar previsão

```python
def predict_price(model: XGBRegressor, X: np.ndarray) -> np.ndarray:
```

**O que faz:** Usa o modelo treinado para gerar previsões de preço.

```python
predictions = predict_price(model, X_test_scaled)
print(predictions)
# [5.23, 5.45, 5.12, ...]  ← Preços previstos em R$/kg
```

### `save_model()` / `load_model()` — Persistência

```python
# Salvar
save_model(model)  # Salva em artifacts/regression_model.joblib

# Carregar
model = load_model()  # Carrega de artifacts/regression_model.joblib
```

Usam `joblib.dump()` e `joblib.load()` para serializar/deserializar eficientemente.

---

## 🏷 Módulo: Modelo de Classificação (`src/models/classification.py`)

> **Responsabilidade:** Classificar o momento de compra de uma commodity como **bom**, **regular** ou **ruim**.

### `generate_labels()` — Gerar labels de classificação

```python
def generate_labels(df, price_col, future_price_col, thresholds=None) -> pd.Series:
```

**O que faz:** Com base na **variação percentual entre preço atual e futuro**, atribui uma classe:

```python
variacao_pct = ((df[future_price_col] - df[price_col]) / df[price_col]) * 100

# Regras:
# variação > +3%  → "bom" (2)   → preço vai SUBIR, compre AGORA
# variação < -3%  → "ruim" (0)  → preço vai CAIR, ESPERE
# entre -3% e +3% → "regular" (1) → preço estável
```

**Exemplo visual:**

| Preço Atual | Preço Futuro | Variação | Classificação |
|-------------|-------------|----------|---------------|
| R$ 5.00     | R$ 5.20     | +4.0%    | bom (2) ✅     |
| R$ 5.00     | R$ 5.05     | +1.0%    | regular (1) ➖ |
| R$ 5.00     | R$ 4.70     | -6.0%    | ruim (0) ❌    |

### `train_classification_model()` — Treinar classificador

```python
def train_classification_model(X_train, y_train, params=None) -> XGBClassifier:
```

**Hiperparâmetros padrão do classificador:**

```python
DEFAULT_CLASSIFICATION_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "eval_metric": "mlogloss",    # Multi-class log loss
    "random_state": 42,
    "n_jobs": -1,
}
```

---

## 📊 Módulo: Avaliação de Modelos (`src/models/evaluator.py`)

> **Responsabilidade:** Calcular métricas de avaliação e gerar visualizações dos resultados.

### `evaluate_regression()` — Métricas de regressão

```python
def evaluate_regression(y_true, y_pred) -> Dict[str, float]:
```

**Métricas calculadas:**

| Métrica | Fórmula | O que mede |
|---------|---------|------------|
| **MAE** | Média do \|erro\| | Erro médio absoluto em R$/kg |
| **RMSE** | √(Média do erro²) | Erro com penalidade para grandes desvios |
| **MAPE** | Média do \|erro\| / real × 100 | Erro percentual médio |
| **R²** | 1 - Σ(erro²)/Σ(variância) | Quanto o modelo explica da variação |

**Exemplo de uso:**

```python
from src.models.evaluator import evaluate_regression

metrics = evaluate_regression(y_true, y_pred)
print(metrics)
# {'mae': 0.23, 'rmse': 0.31, 'mape': 4.5, 'r2': 0.87}
```

### `evaluate_classification()` — Métricas de classificação

```python
def evaluate_classification(y_true, y_pred, labels=None) -> Dict[str, Any]:
```

**Métricas calculadas:**

| Métrica | O que mede |
|---------|------------|
| **Accuracy** | % de acertos total |
| **F1 Macro** | F1-score médio entre todas as classes |
| **Report** | Relatório detalhado por classe (precision, recall, f1) |
| **Confusion Matrix** | Matriz de confusão classes previstas vs reais |

### Funções de visualização

```python
# Gráfico Previsão vs Real
plot_predictions_vs_actual(y_true, y_pred, save_path="grafico_regressao.png")

# Heatmap da Confusion Matrix
plot_confusion_matrix(y_true, y_pred, save_path="confusion_matrix.png")
```

---

## 🚂 Pipeline de Treino (`src/pipeline/train_pipeline.py`)

> **Responsabilidade:** Orquestrar todo o fluxo de treino: carregar → limpar → transformar → treinar → salvar.

### Execução

```bash
python -m src.pipeline.train_pipeline
```

### Fluxo completo (8 etapas)

```
1/8 — Carregar dados CSV (load_uf_data)
2/8 — Limpar dados (clean_dataframe + filter_mvp_products)
3/8 — Criar referência temporal e agregar preços nacionais
4/8 — Criar features (create_all_features)
5/8 — Criar targets (regressão + classificação)
6/8 — Dividir dados (treino/teste temporal) — SEM data leakage
7/8 — Treinar modelos (XGBRegressor + XGBClassifier)
8/8 — Salvar artefatos (.joblib + .json)
```

### `_create_targets()` — Criação de targets

```python
def _create_targets(df: pd.DataFrame) -> pd.DataFrame:
```

**O que faz:**
- **Target de regressão:** `preco_futuro = shift(-1)` → o preço do mês seguinte
- **Target de classificação:** usando `generate_labels()` → bom/regular/ruim

```python
# O preço futuro é o preço do MÊS SEGUINTE (shift de -1)
df["preco_futuro"] = df.groupby("produto")["valor_produto_kg"].shift(-1)

# A classificação é gerada a partir da variação entre preço atual e futuro
df["classificacao"] = generate_labels(df, "valor_produto_kg", "preco_futuro")
```

### `_temporal_split()` — Split temporal

```python
def _temporal_split(df, ratio=0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
```

**O que faz:** Divide os dados em treino e teste de forma **temporal** (sem data leakage):

```python
dates = sorted(df["data_referencia"].unique())
split_idx = int(len(dates) * ratio)
train_dates = dates[:split_idx]  # 80% das datas mais ANTIGAS → TREINO
# As 20% mais recentes → TESTE
```

**Por que split temporal?** Se usássemos split aleatório, o modelo veria dados futuros durante o treino, criando data leakage e métricas artificialmente boas.

### `_get_feature_columns()` — Determinar features

```python
def _get_feature_columns(df) -> List[str]:
```

**O que faz:** Retorna todas as colunas do DataFrame **exceto** metadados e targets:

```python
exclude_cols = {
    "produto", "data_referencia", "valor_produto_kg",
    "preco_futuro", "classificacao", "ano", "uf", "regiao", ...
}
return [c for c in df.columns if c not in exclude_cols]
```

### Artefatos gerados

Após o treino, os seguintes arquivos são salvos em `artifacts/`:

| Arquivo | Conteúdo |
|---------|----------|
| `regression_model.joblib` | Modelo XGBRegressor treinado |
| `classification_model.joblib` | Modelo XGBClassifier treinado |
| `scaler.joblib` | StandardScaler treinado |
| `feature_columns.json` | Lista de nomes das features |

### Output esperado do treino

```
============================================================
PIPELINE DE TREINO — Commodities Analytics
============================================================
1/8 — Carregando dados CSV...
     Registros carregados: 69,420
2/8 — Limpando dados...
     Registros após filtro MVP: 34,500
3/8 — Criando referência temporal e agregando preços...
     Registros após agregação: 450
4/8 — Criando features...
5/8 — Criando targets (regressão e classificação)...
     Registros válidos para treino: 420
6/8 — Dividindo dados (treino/teste temporal)...
     Treino: 336 | Teste: 84
7/8 — Treinando modelos...
     → Treinando XGBRegressor...
     → Treinando XGBClassifier...
     Regressão  — MAE: 0.2345 | RMSE: 0.3120 | R²: 0.8723
     Classificação — Accuracy: 0.7857 | F1 (macro): 0.7534
8/8 — Salvando artefatos...
     Artefatos salvos em: /path/to/artifacts
============================================================
PIPELINE CONCLUÍDO COM SUCESSO!
============================================================
```

---

## 🔮 Pipeline de Predição (`src/pipeline/predict_pipeline.py`)

> **Responsabilidade:** Carregar artefatos treinados e fornecer funções de predição usadas pela API.

### `load_artifacts()` — Carregar todos os artefatos

```python
def load_artifacts(artifacts_dir=None) -> Dict[str, Any]:
```

**O que faz:** Carrega os 4 artefatos de uma vez e retorna um dicionário:

```python
artifacts = load_artifacts()
# {
#     "regression_model": <XGBRegressor>,
#     "classification_model": <XGBClassifier>,
#     "scaler": <StandardScaler>,
#     "feature_columns": ["preco_t-1", "preco_t-2", ...],
# }
```

### `predict_future_price()` — Prever preço futuro

```python
def predict_future_price(artifacts, features, id_materia_prima, periodos=3) -> List[Dict]:
```

**O que faz (passo a passo):**

1. Normaliza as features com o scaler treinado
2. Usa o modelo de regressão para prever o preço base
3. Gera previsões para N períodos futuros com ajuste incremental
4. Calcula a variação percentual em relação ao preço atual

**Retorno:**

```python
[
    {"periodo": "2026-05", "preco_previsto": 5.23, "variacao_pct": 2.35},
    {"periodo": "2026-06", "preco_previsto": 5.31, "variacao_pct": 3.91},
    {"periodo": "2026-07", "preco_previsto": 5.28, "variacao_pct": 3.33},
]
```

### `classify_purchase_moment()` — Classificar momento de compra

```python
def classify_purchase_moment(artifacts, features, preco_atual, id_materia_prima) -> Dict:
```

**O que faz:**

1. Normaliza features e usa o **classificador** para determinar a classe
2. Usa o **regressor** para prever o preço futuro (para justificativa)
3. Gera uma justificativa em linguagem natural

**Retorno:**

```python
{
    "id_materia_prima": 1,
    "nome": "Milho",
    "preco_atual": 5.10,
    "previsao_media_futura": 5.35,
    "variacao_percentual": 4.90,
    "classificacao": "bom",
    "justificativa": "Preço de Milho tende a subir 4.9%. Momento favorável para compra."
}
```

**Mapeamento de justificativas:**

| Classificação | Justificativa |
|---------------|---------------|
| **bom** | "Preço tende a subir X%. Momento favorável para compra." |
| **regular** | "Preço deve se manter estável (variação de X%). Momento neutro." |
| **ruim** | "Preço tende a cair X%. Recomendado aguardar." |

---

## 🌐 API REST — FastAPI (`src/api/`)

### Entrypoint (`src/api/main.py`)

**O que faz:**
1. Cria a aplicação FastAPI com metadata (título, versão, descrição)
2. Configura CORS para aceitar requests de qualquer origem
3. Registra 4 routers com prefixo `/api/v1`
4. No startup, pré-carrega os modelos ML em cache

```python
app = FastAPI(
    title="Commodities Analytics API",
    description="API de previsão de preços e classificação de compras de matérias-primas agrícolas",
    version="1.0.0",
    lifespan=lifespan,       # Gerencia startup/shutdown
    docs_url="/docs",         # Swagger UI
    redoc_url="/redoc",       # ReDoc
)
```

**Lifecycle (lifespan):**

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Pré-carregar modelos ML
    if check_models_loaded():
        logger.info("Modelos ML carregados com sucesso!")
    else:
        logger.warning("Modelos ML não encontrados.")
    
    yield  # App roda aqui
    
    # SHUTDOWN
    logger.info("Encerrando API...")
```

### Dependências (`src/api/dependencies.py`)

**O que faz:** Gerencia injeção de dependências para as rotas:

#### Sessão de banco de dados

```python
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db      # Fornece a sessão para a rota
    finally:
        db.close()    # Garante que sempre fecha
```

#### Carregamento de modelos com cache

```python
@lru_cache()  # Cache: carrega o modelo APENAS UMA VEZ
def get_regression_model():
    return joblib.load(ARTIFACTS_DIR / "regression_model.joblib")

@lru_cache()
def get_classification_model():
    return joblib.load(ARTIFACTS_DIR / "classification_model.joblib")

@lru_cache()
def get_scaler():
    return joblib.load(ARTIFACTS_DIR / "scaler.joblib")
```

**Por que `@lru_cache`?** Os modelos são grandes e leva tempo para desserializar. O cache garante que são carregados apenas uma vez, na primeira request.

### Schemas Pydantic (`src/api/schemas.py`)

> Define os **contratos** da API: o que cada endpoint aceita e retorna.

#### Request de Previsão

```python
class PredictRequest(BaseModel):
    id_materia_prima: int    # ID da commodity (1-5)
    periodos_futuros: int = Field(default=3, ge=1, le=12)  # 1 a 12 meses
```

#### Response de Previsão

```python
class PredictResponse(BaseModel):
    id_materia_prima: int
    nome: str
    previsoes: List[PrevisaoItem]    # Lista de previsões por período
    modelo_utilizado: str = "XGBRegressor"
    data_geracao: datetime
```

#### Request/Response de Classificação

```python
class ClassifyRequest(BaseModel):
    id_materia_prima: int

class ClassifyResponse(BaseModel):
    id_materia_prima: int
    nome: str
    preco_atual: float
    previsao_media_futura: float
    variacao_percentual: float
    classificacao: str            # "bom" | "regular" | "ruim"
    justificativa: str
```

### Rotas (Endpoints)

#### `GET /` — Root

```bash
curl http://localhost:8000/
```

```json
{
    "app": "Commodities Analytics API",
    "version": "1.0.0",
    "docs": "/docs",
    "health": "/api/v1/health"
}
```

---

#### `GET /api/v1/health` — Health Check

**O que faz:** Verifica se a API está operacional e se os modelos estão carregados.

```bash
curl http://localhost:8000/api/v1/health
```

```json
{
    "status": "ok",
    "version": "1.0.0",
    "models_loaded": true
}
```

---

#### `GET /api/v1/commodities` — Listar matérias-primas

**O que faz:** Consulta a tabela `materia_prima` no PostgreSQL e retorna todas as commodities cadastradas.

```bash
curl http://localhost:8000/api/v1/commodities
```

```json
[
    { "id_materia_prima": 1, "nome": "Milho",  "categoria": "Grãos",       "unidade_medida": "kg", "ativo": true },
    { "id_materia_prima": 2, "nome": "Soja",   "categoria": "Oleaginosas", "unidade_medida": "kg", "ativo": true },
    { "id_materia_prima": 3, "nome": "Arroz",  "categoria": "Grãos",       "unidade_medida": "kg", "ativo": true },
    { "id_materia_prima": 4, "nome": "Café",   "categoria": "Estimulantes","unidade_medida": "kg", "ativo": true },
    { "id_materia_prima": 5, "nome": "Feijão", "categoria": "Leguminosas", "unidade_medida": "kg", "ativo": true }
]
```

**Fluxo interno:**
1. Recebe sessão do DB via `Depends(get_db)`
2. Executa SQL: `SELECT * FROM materia_prima ORDER BY id_materia_prima`
3. Mapeia resultado para `CommodityResponse`

---

#### `GET /api/v1/commodities/{id}/history` — Histórico de preços

**O que faz:** Retorna o histórico de preços de uma commodity específica.

```bash
curl http://localhost:8000/api/v1/commodities/1/history
```

```json
{
    "id_materia_prima": 1,
    "nome": "Milho",
    "historico": [
        { "data_referencia": "2024-01-01", "preco_medio": 4.85, "fonte_dado": "CONAB", "regiao": null },
        { "data_referencia": "2024-02-01", "preco_medio": 5.10, "fonte_dado": "CONAB", "regiao": null }
    ]
}
```

**Fluxo interno:**
1. Verifica se a matéria-prima existe → 404 se não
2. Consulta `historico_preco` ordenado por data
3. Retorna com `HistoricoPrecoResponse`

---

#### `POST /api/v1/predict` — Previsão de preço

**O que faz:** Gera previsões de preço futuro usando o modelo XGBRegressor.

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1, "periodos_futuros": 3}'
```

```json
{
    "id_materia_prima": 1,
    "nome": "Milho",
    "previsoes": [
        { "periodo": "2026-05", "preco_previsto": 5.23, "variacao_pct": 2.35 },
        { "periodo": "2026-06", "preco_previsto": 5.31, "variacao_pct": 3.91 },
        { "periodo": "2026-07", "preco_previsto": 5.28, "variacao_pct": 3.33 }
    ],
    "modelo_utilizado": "XGBRegressor",
    "data_geracao": "2026-04-24T02:00:00"
}
```

**Fluxo interno (`src/api/routes/predict.py`):**

1. **Validação:** Verifica se `id_materia_prima` existe no banco → 404 se não
2. **Carrega artefatos:** `get_artifacts()` (modelo, scaler, features) → 503 se não disponíveis
3. **Busca dados recentes:** Últimos 7 preços do banco para construir features
4. **Gera previsões:** Chama `predict_future_price()` do pipeline
5. **Persiste:** Salva as previsões na tabela `previsao_preco`
6. **Retorna:** `PredictResponse` com as previsões

---

#### `POST /api/v1/classify` — Classificação de compra

**O que faz:** Classifica o momento atual de compra como bom, regular ou ruim.

```bash
curl -X POST http://localhost:8000/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1}'
```

```json
{
    "id_materia_prima": 1,
    "nome": "Milho",
    "preco_atual": 5.10,
    "previsao_media_futura": 5.35,
    "variacao_percentual": 4.90,
    "classificacao": "bom",
    "justificativa": "Preço de Milho tende a subir 4.9%. Momento favorável para compra."
}
```

**Fluxo interno (`src/api/routes/classify.py`):**

1. **Validação:** Verifica se a commodity existe → 404 se não
2. **Busca preço atual:** Último preço do `historico_preco`
3. **Busca dados recentes:** Últimos 7 preços para construir features
4. **Classifica:** Chama `classify_purchase_moment()` do pipeline
5. **Persiste:** Salva na tabela `recomendacao_compra`
6. **Retorna:** `ClassifyResponse` com classificação e justificativa

---

## 🗄 Banco de Dados — PostgreSQL

### Diagrama de Tabelas

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────────┐
│   usuario    │     │  materia_prima   │     │   historico_preco     │
├──────────────┤     ├──────────────────┤     ├───────────────────────┤
│ id_usuario   │◄──┐ │ id_materia_prima │◄─┐  │ id_historico_preco    │
│ nome         │   │ │ nome             │  │  │ id_materia_prima (FK) │
│ email        │   │ │ categoria        │  │  │ data_referencia       │
│ senha_hash   │   │ │ unidade_medida   │  │  │ preco_medio           │
│ telefone     │   │ │ ativo            │  │  │ fonte_dado            │
└──────────────┘   │ └──────────────────┘  │  │ regiao_opcional       │
                   │                       │  └───────────────────────┘
┌──────────────────┤                       │
│    compra        │  ┌────────────────────┤  ┌───────────────────────┐
├──────────────────┤  │    previsao_preco  │  │ recomendacao_compra   │
│ id_compra        │  ├────────────────────┤  ├───────────────────────┤
│ id_usuario (FK)  │  │ id_previsao_preco  │  │ id_recomendacao       │
│ id_materia (FK)──┤  │ id_materia (FK)────┤  │ id_materia (FK)───────┤
│ data_compra      │  │ periodo_previsto   │  │ preco_atual_referencia│
│ quantidade       │  │ preco_previsto     │  │ previsao_media_futura │
│ preco_unitario   │  │ variacao_%_prev    │  │ variacao_percentual   │
│ valor_total      │  │ modelo_utilizado   │  │ classificacao_compra  │
│ economia_estim   │  │ versao_modelo      │  │ justificativa_resumida│
└──────────────────┘  └────────────────────┘  └───────────────────────┘

┌──────────────┐     ┌──────────────────┐
│    alerta    │     │   notificacao    │
├──────────────┤     ├──────────────────┤
│ id_alerta    │◄────│ id_alerta (FK)   │
│ id_usuario   │     │ id_usuario (FK)  │
│ id_materia   │     │ canal_envio      │
│ tipo_alerta  │     │ titulo           │
│ valor_limite │     │ mensagem         │
│ variacao_%   │     │ status_envio     │
│ ativo        │     │ enviado_em       │
└──────────────┘     └──────────────────┘
```

### DDL — Criação das tabelas (`database/init.sql`)

As 8 tabelas são criadas na ordem de dependências de FKs:

```sql
-- 1. Usuário
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario       SERIAL PRIMARY KEY,
    nome             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    senha_hash       VARCHAR(255) NOT NULL,
    telefone_opcional VARCHAR(20),
    canal_notificacao_preferido VARCHAR(50) DEFAULT 'email',
    criado_em        TIMESTAMP DEFAULT NOW(),
    atualizado_em    TIMESTAMP DEFAULT NOW()
);

-- 2. Matéria-Prima
CREATE TABLE IF NOT EXISTS materia_prima (
    id_materia_prima SERIAL PRIMARY KEY,
    nome             VARCHAR(255) NOT NULL,
    categoria        VARCHAR(100),
    unidade_medida   VARCHAR(20) NOT NULL DEFAULT 'kg',
    ativo            BOOLEAN DEFAULT TRUE,
    criado_em        TIMESTAMP DEFAULT NOW()
);

-- 3. Histórico de Preço
CREATE TABLE IF NOT EXISTS historico_preco (
    id_historico_preco SERIAL PRIMARY KEY,
    id_materia_prima   INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    data_referencia    DATE NOT NULL,
    preco_medio        NUMERIC(12,2) NOT NULL,
    fonte_dado         VARCHAR(100) DEFAULT 'CONAB',
    regiao_opcional    VARCHAR(100),
    criado_em          TIMESTAMP DEFAULT NOW()
);
```

### Seeds — Dados iniciais

```sql
-- seed_materias_primas.sql — 5 commodities do MVP
INSERT INTO materia_prima (nome, categoria, unidade_medida, ativo)
VALUES
    ('Milho',  'Grãos',       'kg', TRUE),
    ('Soja',   'Oleaginosas', 'kg', TRUE),
    ('Arroz',  'Grãos',       'kg', TRUE),
    ('Café',   'Estimulantes','kg', TRUE),
    ('Feijão', 'Leguminosas', 'kg', TRUE);
```

### Índices de performance

```sql
CREATE INDEX IF NOT EXISTS idx_historico_preco_materia ON historico_preco(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_historico_preco_data ON historico_preco(data_referencia);
CREATE INDEX IF NOT EXISTS idx_previsao_materia ON previsao_preco(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_compra_usuario ON compra(id_usuario);
CREATE INDEX IF NOT EXISTS idx_compra_materia ON compra(id_materia_prima);
```

---

## 🐳 Docker & Deploy

### Dockerfile (Multi-stage build)

```dockerfile
# Stage 1: Builder — Instalar dependências
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime — Imagem final leve
FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/
COPY artifacts/ ./artifacts/
EXPOSE 8000

# Health check embutido
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:8000/api/v1/health'); r.raise_for_status()" || exit 1

# Produção: Gunicorn com workers Uvicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "src.api.main:app"]
```

**Por que multi-stage?** O stage `builder` instala todas as dependências. O stage `runtime` copia apenas os binários resultantes, eliminando cache do pip, headers de compilação etc. Resultado: imagem ~3x menor.

### Docker Compose

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: commodities_db
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data                                    # Dados persistentes
      - ./database/init.sql:/docker-entrypoint-initdb.d/01_init.sql       # DDL auto-executado
      - ./database/seed_all.sql:/docker-entrypoint-initdb.d/02_seed_all.sql  # Seeds
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]

  api:
    build: .
    container_name: commodities_api
    ports:
      - "${API_PORT:-8000}:8000"
    depends_on:
      db:
        condition: service_healthy    # Só inicia APÓS o DB estar pronto
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MODEL_PATH=/app/artifacts
```

---

## 🧪 Testes

### Estrutura de testes

```
tests/
├── test_api.py       # Testes dos endpoints (5 classes, 12 testes)
├── test_loader.py    # Testes de dados e features (4 classes, 11 testes)
└── test_models.py    # Testes dos modelos ML (5 classes, 9 testes)
```

### Executar testes

```bash
# Rodar todos os testes
make test
# ou
pytest tests/ -v

# Com cobertura de código
make test-cov
# ou
pytest tests/ -v --cov=src --cov-report=term-missing
```

### `test_api.py` — Testes dos endpoints

```python
class TestHealthEndpoint:
    def test_health_returns_200(self):
        """Health check deve retornar status 200."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self):
        """Health check deve retornar status 'ok'."""
        data = client.get("/api/v1/health").json()
        assert data["status"] == "ok"

class TestPredictEndpoint:
    def test_predict_invalid_type(self):
        """Deve rejeitar tipo inválido com 422."""
        response = client.post("/api/v1/predict", json={"id_materia_prima": "abc"})
        assert response.status_code == 422
```

### `test_loader.py` — Testes de dados

```python
class TestLoadUFData:
    def test_load_uf_data_shape(self):
        """CSV de UF deve ter 9 colunas e > 0 linhas."""
        df = load_uf_data()
        assert df.shape[1] == 9
        assert len(df) > 0

class TestFeatureEngineering:
    def test_create_lag_features(self):
        """Features de lag devem ser criadas corretamente."""
        df = pd.DataFrame({
            "valor_produto_kg": [1.0, 2.0, 3.0, 4.0, 5.0],
            "produto": ["MILHO"] * 5,
        })
        result = create_lag_features(df, lags=[1, 2])
        assert "preco_t-1" in result.columns
        assert result["preco_t-1"].iloc[1] == 1.0    # preco_t-1 do 2º item = preço do 1º
        assert pd.isna(result["preco_t-1"].iloc[0])   # 1º item não tem lag

    def test_temporal_split_no_data_leakage(self):
        """Split temporal não deve vazar dados futuros."""
        # max(train_dates) < min(test_dates) → SEM LEAKAGE ✅
```

### `test_models.py` — Testes dos modelos ML

```python
class TestRegressionModel:
    def test_predict_returns_array(self, model, feature_count):
        """Predição deve retornar array numpy com formato correto."""
        X = np.zeros((3, feature_count))
        preds = model.predict(X)
        assert isinstance(preds, np.ndarray)
        assert preds.shape == (3,)

class TestEvaluator:
    def test_evaluate_regression(self):
        """Métricas de regressão devem retornar dict com chaves esperadas."""
        y_true = np.array([1.0, 2.0, 3.0])
        y_pred = np.array([1.1, 2.2, 2.8])
        metrics = evaluate_regression(y_true, y_pred)
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "r2" in metrics
```

> **Nota:** Testes que dependem do PostgreSQL ou de artefatos treinados são marcados com `@pytest.mark.skipif` e pulados automaticamente quando a infraestrutura não está disponível.

---

## 🧰 Makefile — Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `make up` | Sobe os containers (PostgreSQL + API) |
| `make down` | Para os containers |
| `make down-v` | Para os containers E apaga volumes (banco zerado) |
| `make logs` | Acompanha logs dos containers em tempo real |
| `make db-shell` | Abre terminal `psql` dentro do container do banco |
| `make db-tables` | Lista as tabelas no banco (`\dt`) |
| `make train` | Executa o pipeline de treino dos modelos |
| `make notebooks` | Inicia Jupyter Notebook |
| `make serve` | Inicia API em modo de desenvolvimento (hot-reload) |
| `make serve-prod` | Inicia API em modo de produção (Gunicorn, 4 workers) |
| `make test` | Roda todos os testes |
| `make test-cov` | Roda testes com cobertura de código |
| `make build` | Faz build das imagens Docker |
| `make deploy` | Build + up em um só comando |
| `make clean` | Remove `__pycache__`, checkpoints e arquivos de cobertura |
| `make seed` | Re-executa os seeds no banco |

---

## 📄 Licença

Projeto acadêmico — FATEC.
