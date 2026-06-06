"""Injeção de dependências para a API FastAPI.

Gerencia conexão com banco de dados (SQLAlchemy),
carregamento de modelos ML com cache, e sessões de DB.
"""

import logging
from functools import lru_cache
from typing import Any, Dict, Generator, Optional

import joblib
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.config import ARTIFACTS_DIR, DATABASE_URL

logger = logging.getLogger(__name__)

# ── SQLAlchemy Engine ────────────────────────────────────────

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency que fornece sessão de DB para as rotas.

    Yields:
        Sessão SQLAlchemy que é automaticamente fechada ao final.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Carregamento de Modelos ML ───────────────────────────────

@lru_cache()
def get_regression_model() -> Any:
    """Carrega e cacheia o modelo de regressão.

    Returns:
        Modelo XGBRegressor treinado.
    """
    path = ARTIFACTS_DIR / "regression_model.joblib"
    logger.info(f"Carregando modelo de regressão de: {path}")
    return joblib.load(path)


@lru_cache()
def get_classification_model() -> Any:
    """Carrega e cacheia o modelo de classificação.

    Returns:
        Modelo XGBClassifier treinado.
    """
    path = ARTIFACTS_DIR / "classification_model.joblib"
    logger.info(f"Carregando modelo de classificação de: {path}")
    return joblib.load(path)


@lru_cache()
def get_scaler() -> Any:
    """Carrega e cacheia o scaler pré-treinado.

    Returns:
        StandardScaler treinado.
    """
    path = ARTIFACTS_DIR / "scaler.joblib"
    logger.info(f"Carregando scaler de: {path}")
    return joblib.load(path)


@lru_cache()
def get_feature_columns() -> list:
    """Carrega e cacheia a lista de feature columns.

    Returns:
        Lista de nomes de features usadas no treino.
    """
    import json

    path = ARTIFACTS_DIR / "feature_columns.json"
    logger.info(f"Carregando feature columns de: {path}")
    with open(path, "r") as f:
        return json.load(f)


def get_artifacts() -> Dict[str, Any]:
    """Retorna todos os artefatos necessários para predição.

    Returns:
        Dicionário com regression_model, classification_model, scaler, feature_columns.
    """
    return {
        "regression_model": get_regression_model(),
        "classification_model": get_classification_model(),
        "scaler": get_scaler(),
        "feature_columns": get_feature_columns(),
    }


def check_models_loaded() -> bool:
    """Verifica se todos os modelos podem ser carregados.

    Returns:
        True se todos os artefatos existem e carregam corretamente.
    """
    try:
        get_regression_model()
        get_classification_model()
        get_scaler()
        get_feature_columns()
        return True
    except Exception as e:
        logger.warning(f"Modelos não carregados: {e}")
        return False
