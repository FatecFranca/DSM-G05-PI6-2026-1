"""Pipeline de predição — usado pela API.

Carrega artefatos treinados e fornece funções de predição
de preço futuro e classificação do momento de compra.
"""

import json
import logging
import math
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np

from src.config import (
    ARTIFACTS_DIR,
    CLASSIFICATION_LABELS,
    CLASSIFICATION_MODEL_FILE,
    CLASSIFICATION_THRESHOLDS,
    FEATURE_COLUMNS_FILE,
    PRODUCT_ID_MAP,
    REGRESSION_MODEL_FILE,
    SCALER_FILE,
)

logger = logging.getLogger(__name__)


def build_inference_features(
    prices: List[float],
    reference_date: datetime,
) -> np.ndarray:
    """Constrói o vetor de features para inferência a partir de preços históricos.

    Replica o processo de feature_engineering do treino, garantindo que
    o vetor enviado ao modelo esteja na mesma distribuição dos dados de treino.

    Features geradas (ordem obrigatória, deve coincidir com feature_columns.json):
        ['preco_t-1', 'preco_t-2', 'preco_t-3', 'preco_t-6',
         'media_movel_3m', 'desvio_3m', 'media_movel_6m',
         'mes', 'trimestre', 'mes_sin', 'mes_cos',
         'variacao_pct_1m', 'variacao_pct_3m']

    Args:
        prices: Lista de preços em ordem decrescente de data.
                prices[0] = mês mais recente, prices[1] = mês anterior, etc.
                Mínimo esperado: 6 preços para calcular todas as features.
        reference_date: Data de referência para extrair mes/trimestre/sazonalidade.

    Returns:
        np.ndarray de shape (13,) com dtype float, pronto para scaler.transform().

    Raises:
        ValueError: Se prices for uma lista vazia.

    Example:
        >>> from datetime import datetime
        >>> prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        >>> date = datetime(2024, 5, 1)
        >>> features = build_inference_features(prices, date)
        >>> features.shape
        (13,)
    """
    if not prices:
        raise ValueError("A lista de preços não pode ser vazia.")

    # Padding: garantir ao menos 7 posições
    p = list(prices) + [0.0] * max(0, 7 - len(prices))

    # Lags de preço
    lag1 = p[0]
    lag2 = p[1] if len(p) > 1 else 0.0
    lag3 = p[2] if len(p) > 2 else 0.0
    lag6 = p[5] if len(p) > 5 else 0.0

    # Médias móveis e desvio (excluindo zeros de padding)
    last3 = [v for v in p[:3] if v != 0.0]
    last6 = [v for v in p[:6] if v != 0.0]

    mm3  = float(np.mean(last3)) if last3 else 0.0
    dev3 = float(np.std(last3, ddof=1)) if len(last3) > 1 else 0.0
    mm6  = float(np.mean(last6)) if last6 else 0.0

    # Features temporais / sazonalidade
    mes       = reference_date.month
    trimestre = ((mes - 1) // 3) + 1
    mes_sin   = math.sin(2 * math.pi * mes / 12)
    mes_cos   = math.cos(2 * math.pi * mes / 12)

    # Variações percentuais
    var1m = ((lag1 - lag2) / lag2 * 100) if lag2 != 0.0 else 0.0
    var3m = ((lag1 - lag3) / lag3 * 100) if lag3 != 0.0 else 0.0

    return np.array(
        [lag1, lag2, lag3, lag6,
         mm3, dev3, mm6,
         mes, trimestre, mes_sin, mes_cos,
         var1m, var3m],
        dtype=float,
    )


def load_artifacts(
    artifacts_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Carrega todos os artefatos de modelo necessários para predição.

    Args:
        artifacts_dir: Diretório dos artefatos. Se None, usa ARTIFACTS_DIR.

    Returns:
        Dicionário com chaves:
        - 'regression_model': modelo XGBRegressor
        - 'classification_model': modelo XGBClassifier
        - 'scaler': StandardScaler treinado
        - 'feature_columns': lista de nomes de features

    Raises:
        FileNotFoundError: Se algum artefato não for encontrado.
    """
    directory = artifacts_dir or ARTIFACTS_DIR

    reg_path = directory / REGRESSION_MODEL_FILE
    clf_path = directory / CLASSIFICATION_MODEL_FILE
    scaler_path = directory / SCALER_FILE
    features_path = directory / FEATURE_COLUMNS_FILE

    # Verificar existência
    for path, name in [
        (reg_path, "Modelo de regressão"),
        (clf_path, "Modelo de classificação"),
        (scaler_path, "Scaler"),
        (features_path, "Feature columns"),
    ]:
        if not path.exists():
            raise FileNotFoundError(f"{name} não encontrado: {path}")

    regression_model = joblib.load(reg_path)
    classification_model = joblib.load(clf_path)
    scaler = joblib.load(scaler_path)

    with open(features_path, "r") as f:
        feature_columns = json.load(f)

    return {
        "regression_model": regression_model,
        "classification_model": classification_model,
        "scaler": scaler,
        "feature_columns": feature_columns,
    }


def predict_future_price(
    artifacts: Dict[str, Any],
    features: np.ndarray,
    id_materia_prima: int,
    periodos: int = 3,
) -> List[Dict[str, Any]]:
    """Prevê preços futuros para uma matéria-prima.

    Args:
        artifacts: Dicionário retornado por load_artifacts().
        features: Array de features para o período atual (1, n_features).
        id_materia_prima: ID da matéria-prima no banco.
        periodos: Número de períodos futuros a prever.

    Returns:
        Lista de dicts com previsões:
        [{'periodo': 'YYYY-MM', 'preco_previsto': float, 'variacao_pct': float}]
    """
    model = artifacts["regression_model"]
    scaler = artifacts["scaler"]

    # Normalizar features
    X_scaled = scaler.transform(features.reshape(1, -1))

    # Predição
    preco_previsto = float(model.predict(X_scaled)[0])

    # Gerar previsões para múltiplos períodos
    now = datetime.now()
    previsoes = []

    preco_base = preco_previsto
    preco_atual = float(features[0]) if features[0] != 0 else 1.0

    for i in range(1, periodos + 1):
        mes_futuro = (now.month + i - 1) % 12 + 1
        ano_futuro = now.year + (now.month + i - 1) // 12

        # Variação percentual em relação ao preço atual
        variacao = ((preco_base - preco_atual) / preco_atual * 100)

        previsoes.append({
            "periodo": f"{ano_futuro}-{str(mes_futuro).zfill(2)}",
            "preco_previsto": round(float(preco_base), 2),
            "variacao_pct": round(float(variacao), 2),
        })

        # Ajuste incremental para períodos subsequentes
        preco_base = float(preco_base * (1 + np.random.uniform(-0.02, 0.03)))

    return previsoes


def classify_purchase_moment(
    artifacts: Dict[str, Any],
    features: np.ndarray,
    preco_atual: float,
    id_materia_prima: int,
) -> Dict[str, Any]:
    """Classifica o momento atual de compra para uma matéria-prima.

    Args:
        artifacts: Dicionário retornado por load_artifacts().
        features: Array de features (1, n_features).
        preco_atual: Preço atual da matéria-prima.
        id_materia_prima: ID da matéria-prima.

    Returns:
        Dict com classificação:
        {
            'id_materia_prima': int,
            'nome': str,
            'preco_atual': float,
            'previsao_media_futura': float,
            'variacao_percentual': float,
            'classificacao': str,  # 'bom' | 'regular' | 'ruim'
            'justificativa': str,
        }
    """
    clf_model = artifacts["classification_model"]
    reg_model = artifacts["regression_model"]
    scaler = artifacts["scaler"]

    # Normalizar
    X_scaled = scaler.transform(features.reshape(1, -1))

    # Predição de classificação
    classe_idx = int(clf_model.predict(X_scaled)[0])
    classificacao = CLASSIFICATION_LABELS[classe_idx]

    # Predição de preço futuro (para justificativa)
    preco_futuro = float(reg_model.predict(X_scaled)[0])

    variacao = ((preco_futuro - preco_atual) / preco_atual * 100) if preco_atual != 0 else 0

    # --- Sanity-check: fallback rule-based para consistência ---
    thresh_bom  = CLASSIFICATION_THRESHOLDS["bom"]   # > +3%
    thresh_ruim = CLASSIFICATION_THRESHOLDS["ruim"]  # < -3%

    if variacao > thresh_bom and classificacao != "bom":
        logger.warning(
            "Inconsistência detectada: variação=%.2f%% mas classificação='%s'. "
            "Aplicando fallback rule-based → 'bom'.",
            variacao, classificacao,
        )
        classificacao = "bom"
    elif variacao < thresh_ruim and classificacao != "ruim":
        logger.warning(
            "Inconsistência detectada: variação=%.2f%% mas classificação='%s'. "
            "Aplicando fallback rule-based → 'ruim'.",
            variacao, classificacao,
        )
        classificacao = "ruim"

    # Gerar justificativa
    nome = PRODUCT_ID_MAP.get(id_materia_prima, f"Matéria-prima #{id_materia_prima}")
    justificativas = {
        "bom": f"Preço de {nome} tende a subir {abs(variacao):.1f}%. Momento favorável para compra.",
        "regular": f"Preço de {nome} deve se manter estável (variação de {variacao:.1f}%). Momento neutro.",
        "ruim": f"Preço de {nome} tende a cair {abs(variacao):.1f}%. Recomendado aguardar.",
    }

    return {
        "id_materia_prima": id_materia_prima,
        "nome": nome,
        "preco_atual": round(preco_atual, 2),
        "previsao_media_futura": round(preco_futuro, 2),
        "variacao_percentual": round(variacao, 2),
        "classificacao": classificacao,
        "justificativa": justificativas[classificacao],
    }
