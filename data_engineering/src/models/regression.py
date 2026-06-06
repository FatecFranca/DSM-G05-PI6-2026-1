"""Módulo do modelo de regressão para previsão de preços.

Implementa treino, predição e serialização do XGBRegressor
para prever o preço futuro de matérias-primas.
"""

from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np
from xgboost import XGBRegressor

from src.config import ARTIFACTS_DIR, REGRESSION_MODEL_FILE


# Hiperparâmetros padrão do modelo de regressão
DEFAULT_REGRESSION_PARAMS: Dict[str, Any] = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
    "n_jobs": -1,
}


def train_regression_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    params: Optional[Dict[str, Any]] = None,
) -> XGBRegressor:
    """Treina um modelo XGBRegressor para previsão de preço.

    Args:
        X_train: Features de treino (n_samples, n_features).
        y_train: Target de treino — preço futuro (n_samples,).
        params: Hiperparâmetros opcionais. Se None, usa DEFAULT_REGRESSION_PARAMS.

    Returns:
        Modelo XGBRegressor treinado.
    """
    model_params = params or DEFAULT_REGRESSION_PARAMS
    model = XGBRegressor(**model_params)
    model.fit(X_train, y_train)
    return model


def predict_price(
    model: XGBRegressor,
    X: np.ndarray,
) -> np.ndarray:
    """Gera previsões de preço usando o modelo treinado.

    Args:
        model: Modelo XGBRegressor treinado.
        X: Features de entrada (n_samples, n_features).

    Returns:
        Array de preços previstos (n_samples,).
    """
    return model.predict(X)


def save_model(
    model: XGBRegressor,
    path: Optional[Path] = None,
) -> Path:
    """Serializa o modelo de regressão via joblib.

    Args:
        model: Modelo treinado para salvar.
        path: Caminho de destino. Se None, usa ARTIFACTS_DIR / REGRESSION_MODEL_FILE.

    Returns:
        Path do arquivo salvo.
    """
    filepath = path or (ARTIFACTS_DIR / REGRESSION_MODEL_FILE)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, filepath)
    return filepath


def load_model(path: Optional[Path] = None) -> XGBRegressor:
    """Carrega um modelo de regressão serializado.

    Args:
        path: Caminho do arquivo .joblib. Se None, usa padrão.

    Returns:
        Modelo XGBRegressor carregado.

    Raises:
        FileNotFoundError: Se o arquivo do modelo não existir.
    """
    filepath = path or (ARTIFACTS_DIR / REGRESSION_MODEL_FILE)

    if not filepath.exists():
        raise FileNotFoundError(f"Modelo de regressão não encontrado: {filepath}")

    return joblib.load(filepath)
