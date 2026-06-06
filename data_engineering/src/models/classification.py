"""Módulo do modelo de classificação para recomendação de compra.

Implementa geração de labels, treino e predição do XGBClassifier
para classificar o momento de compra como bom/regular/ruim.
"""

from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier

from src.config import (
    ARTIFACTS_DIR,
    CLASSIFICATION_LABEL_MAP,
    CLASSIFICATION_MODEL_FILE,
    CLASSIFICATION_THRESHOLDS,
)


# Hiperparâmetros padrão do modelo de classificação
DEFAULT_CLASSIFICATION_PARAMS: Dict[str, Any] = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "eval_metric": "mlogloss",
    "random_state": 42,
    "n_jobs": -1,
}


def generate_labels(
    df: pd.DataFrame,
    price_col: str = "valor_produto_kg",
    future_price_col: str = "preco_futuro",
    thresholds: Optional[Dict[str, float]] = None,
) -> pd.Series:
    """Gera labels de classificação baseado na variação percentual futura.

    Regras:
    - 'bom' (2) se variação > +threshold_bom% → preço vai subir, compre agora
    - 'regular' (1) se entre -threshold_ruim% e +threshold_bom%
    - 'ruim' (0) se variação < -threshold_ruim% → preço vai cair, espere

    Args:
        df: DataFrame com preço atual e futuro.
        price_col: Coluna de preço atual.
        future_price_col: Coluna de preço futuro.
        thresholds: Dict com thresholds {'bom': float, 'ruim': float}.

    Returns:
        Series com labels numéricos (0=ruim, 1=regular, 2=bom).
    """
    thresh = thresholds or CLASSIFICATION_THRESHOLDS
    variacao_pct = (
        (df[future_price_col] - df[price_col]) / df[price_col]
    ) * 100

    labels = pd.Series(
        CLASSIFICATION_LABEL_MAP["regular"],
        index=df.index,
        dtype=int,
    )
    labels[variacao_pct > thresh["bom"]] = CLASSIFICATION_LABEL_MAP["bom"]
    labels[variacao_pct < thresh["ruim"]] = CLASSIFICATION_LABEL_MAP["ruim"]

    return labels


def train_classification_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    params: Optional[Dict[str, Any]] = None,
) -> XGBClassifier:
    """Treina um modelo XGBClassifier para classificação de compra.

    Args:
        X_train: Features de treino (n_samples, n_features).
        y_train: Labels de treino (n_samples,) com valores 0, 1, 2.
        params: Hiperparâmetros opcionais.

    Returns:
        Modelo XGBClassifier treinado.
    """
    model_params = params or DEFAULT_CLASSIFICATION_PARAMS
    model = XGBClassifier(**model_params)
    model.fit(X_train, y_train)
    return model


def predict_classification(
    model: XGBClassifier,
    X: np.ndarray,
) -> np.ndarray:
    """Gera previsões de classificação de compra.

    Args:
        model: Modelo XGBClassifier treinado.
        X: Features de entrada (n_samples, n_features).

    Returns:
        Array de classes previstas (0=ruim, 1=regular, 2=bom).
    """
    return model.predict(X)


def save_model(
    model: XGBClassifier,
    path: Optional[Path] = None,
) -> Path:
    """Serializa o modelo de classificação via joblib.

    Args:
        model: Modelo treinado para salvar.
        path: Caminho de destino. Se None, usa padrão.

    Returns:
        Path do arquivo salvo.
    """
    filepath = path or (ARTIFACTS_DIR / CLASSIFICATION_MODEL_FILE)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, filepath)
    return filepath


def load_model(path: Optional[Path] = None) -> XGBClassifier:
    """Carrega um modelo de classificação serializado.

    Args:
        path: Caminho do arquivo .joblib. Se None, usa padrão.

    Returns:
        Modelo XGBClassifier carregado.

    Raises:
        FileNotFoundError: Se o arquivo do modelo não existir.
    """
    filepath = path or (ARTIFACTS_DIR / CLASSIFICATION_MODEL_FILE)

    if not filepath.exists():
        raise FileNotFoundError(
            f"Modelo de classificação não encontrado: {filepath}"
        )

    return joblib.load(filepath)
