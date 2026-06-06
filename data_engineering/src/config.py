"""Configurações centralizadas do projeto Commodities Analytics.

Carrega variáveis de ambiente e define constantes globais
usadas por todos os módulos do pipeline e da API.
"""

from pathlib import Path
from typing import Dict, List
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv não instalado, usar env vars do sistema


# ── Paths ────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATABASE_DIR = BASE_DIR / "database"

# Garantir que diretórios de output existam
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


# ── Database ─────────────────────────────────────────────────
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://commodities_user:commodities_pass@localhost:5432/commodities_analytics",
)


# ── CSV Config ───────────────────────────────────────────────
CSV_UF_FILENAME = "PrecoMensalUF.csv"
CSV_MUN_FILENAME = "PrecoMensalMun.csv"

CSV_PARAMS: Dict[str, str] = {
    "sep": ";",
    "decimal": ",",
    "encoding": "latin-1",
}


# ── Produtos MVP ─────────────────────────────────────────────
MVP_PRODUCTS: List[str] = ["MILHO", "SOJA", "ARROZ", "CAFE", "FEIJAO"]

# Mapeamento de ID do banco para nome do produto
PRODUCT_ID_MAP: Dict[int, str] = {
    1: "Milho",
    2: "Soja",
    3: "Arroz",
    4: "Café",
    5: "Feijão",
}


# ── Classificação ────────────────────────────────────────────
CLASSIFICATION_THRESHOLDS: Dict[str, float] = {
    # Limiar superior: variacao_pct > bom  → classificação "bom"
    "bom": 3.0,
    # Limiar inferior: variacao_pct < ruim → classificação "ruim"
    # Atenção: valor negativo. Comparar com: variacao < THRESHOLDS["ruim"]
    "ruim": -3.0,
}

CLASSIFICATION_LABELS: List[str] = ["ruim", "regular", "bom"]
CLASSIFICATION_LABEL_MAP: Dict[str, int] = {
    "ruim": 0,
    "regular": 1,
    "bom": 2,
}


# ── Modelo ───────────────────────────────────────────────────
MODEL_PATH: str = os.getenv("MODEL_PATH", str(ARTIFACTS_DIR))

REGRESSION_MODEL_FILE = "regression_model.joblib"
CLASSIFICATION_MODEL_FILE = "classification_model.joblib"
SCALER_FILE = "scaler.joblib"
FEATURE_COLUMNS_FILE = "feature_columns.json"


# ── Feature Engineering ──────────────────────────────────────
LAG_PERIODS: List[int] = [1, 2, 3, 6]
ROLLING_WINDOWS: List[int] = [3, 6]
TRAIN_TEST_SPLIT_RATIO: float = 0.8


# ── API ──────────────────────────────────────────────────────
API_VERSION = "1.0.0"
API_TITLE = "Commodities Analytics API"
API_DESCRIPTION = (
    "API de previsão de preços e classificação "
    "de compras de matérias-primas agrícolas"
)
