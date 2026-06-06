"""Pipeline completo de treino de modelos.

Orquestra o fluxo: load → clean → features → train → save
Pode ser executado como: python -m src.pipeline.train_pipeline
"""

import json
import logging
from typing import List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from src.config import (
    ARTIFACTS_DIR,
    CLASSIFICATION_MODEL_FILE,
    FEATURE_COLUMNS_FILE,
    PROCESSED_DIR,
    REGRESSION_MODEL_FILE,
    SCALER_FILE,
    TRAIN_TEST_SPLIT_RATIO,
)
from src.data.cleaner import (
    aggregate_national_price,
    clean_dataframe,
    create_date_reference,
    filter_mvp_products,
)
from src.data.feature_engineering import create_all_features
from src.data.loader import load_uf_data
from src.models.classification import (
    generate_labels,
    train_classification_model,
)
from src.models.evaluator import evaluate_classification, evaluate_regression
from src.models.regression import train_regression_model

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def _create_targets(df: pd.DataFrame) -> pd.DataFrame:
    """Cria colunas target para regressão e classificação.

    - Regressão: preco_futuro = shift(-1) do preço atual
    - Classificação: baseado na variação percentual futura

    Args:
        df: DataFrame com features e preço por produto/data.

    Returns:
        DataFrame com colunas target adicionadas.
    """
    df = df.copy()

    # Target regressão: preço do próximo período
    df["preco_futuro"] = df.groupby("produto")["valor_produto_kg"].shift(-1)

    # Target classificação: gerado após ter preco_futuro
    valid_mask = df["preco_futuro"].notna()
    df.loc[valid_mask, "classificacao"] = generate_labels(
        df[valid_mask],
        price_col="valor_produto_kg",
        future_price_col="preco_futuro",
    )

    return df


def _temporal_split(
    df: pd.DataFrame,
    ratio: float = TRAIN_TEST_SPLIT_RATIO,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Split temporal dos dados — sem data leakage.

    Os dados mais antigos vão para treino e os mais recentes para teste.

    Args:
        df: DataFrame ordenado por data_referencia.
        ratio: Proporção para treino (default: 0.8).

    Returns:
        Tupla (df_train, df_test).
    """
    dates = sorted(df["data_referencia"].unique())
    split_idx = int(len(dates) * ratio)
    train_dates = dates[:split_idx]

    train = df[df["data_referencia"].isin(train_dates)].copy()
    test = df[~df["data_referencia"].isin(train_dates)].copy()

    return train, test


def _get_feature_columns(df: pd.DataFrame) -> List[str]:
    """Determina quais colunas são features (excluindo targets e metadados).

    Args:
        df: DataFrame completo com features e targets.

    Returns:
        Lista de nomes de colunas de features.
    """
    exclude_cols = {
        "produto",
        "data_referencia",
        "valor_produto_kg",
        "preco_futuro",
        "classificacao",
        "ano",
        "classificao_produto",
        "id_produto",
        "uf",
        "regiao",
        "dsc_nivel_comercializacao",
        "nom_municipio",
        "cod_ibge",
    }
    return [c for c in df.columns if c not in exclude_cols]


def main() -> None:
    """Executa o pipeline completo de treino."""
    logger.info("=" * 60)
    logger.info("PIPELINE DE TREINO — Commodities Analytics")
    logger.info("=" * 60)

    # 1. Carregar dados
    logger.info("1/8 — Carregando dados CSV...")
    df = load_uf_data()
    logger.info(f"     Registros carregados: {len(df):,}")

    # 2. Limpar
    logger.info("2/8 — Limpando dados...")
    df = clean_dataframe(df)
    df = filter_mvp_products(df)
    logger.info(f"     Registros após filtro MVP: {len(df):,}")

    # 3. Criar referência temporal e agregar
    logger.info("3/8 — Criando referência temporal e agregando preços...")
    df = create_date_reference(df)
    df = aggregate_national_price(df)
    logger.info(f"     Registros após agregação: {len(df):,}")

    # 4. Feature Engineering
    logger.info("4/8 — Criando features...")
    df = create_all_features(df)

    # 5. Criar targets
    logger.info("5/8 — Criando targets (regressão e classificação)...")
    df = _create_targets(df)

    # Remover NaNs gerados por lags e targets
    df = df.dropna(subset=["preco_futuro"]).dropna()
    logger.info(f"     Registros válidos para treino: {len(df):,}")

    if len(df) == 0:
        logger.error("Nenhum registro válido após processamento. Abortando.")
        return

    # 6. Split temporal
    logger.info("6/8 — Dividindo dados (treino/teste temporal)...")
    df_train, df_test = _temporal_split(df)
    logger.info(f"     Treino: {len(df_train):,} | Teste: {len(df_test):,}")

    # Salvar datasets processados
    df_train.to_csv(PROCESSED_DIR / "train.csv", index=False)
    df_test.to_csv(PROCESSED_DIR / "test.csv", index=False)
    logger.info(f"     Salvos em: {PROCESSED_DIR}")

    # 7. Preparar features e targets
    feature_cols = _get_feature_columns(df_train)
    logger.info(f"     Features ({len(feature_cols)}): {feature_cols}")

    X_train = df_train[feature_cols].values
    X_test = df_test[feature_cols].values if len(df_test) > 0 else np.array([])

    y_train_reg = df_train["preco_futuro"].values
    y_train_clf = df_train["classificacao"].astype(int).values

    # Normalizar
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test) if len(X_test) > 0 else np.array([])

    # 8. Treinar modelos
    logger.info("7/8 — Treinando modelos...")

    # Regressão
    logger.info("     → Treinando XGBRegressor...")
    reg_model = train_regression_model(X_train_scaled, y_train_reg)

    # Classificação
    logger.info("     → Treinando XGBClassifier...")
    clf_model = train_classification_model(X_train_scaled, y_train_clf)

    # Avaliar
    if len(X_test_scaled) > 0:
        y_test_reg = df_test["preco_futuro"].values
        y_test_clf = df_test["classificacao"].astype(int).values

        reg_preds = reg_model.predict(X_test_scaled)
        clf_preds = clf_model.predict(X_test_scaled)

        reg_metrics = evaluate_regression(y_test_reg, reg_preds)
        clf_metrics = evaluate_classification(y_test_clf, clf_preds)

        logger.info(f"     Regressão  — MAE: {reg_metrics['mae']:.4f} | "
                     f"RMSE: {reg_metrics['rmse']:.4f} | "
                     f"R²: {reg_metrics['r2']:.4f}")
        logger.info(f"     Classificação — Accuracy: {clf_metrics['accuracy']:.4f} | "
                     f"F1 (macro): {clf_metrics['f1_macro']:.4f}")
    else:
        logger.warning("     Conjunto de teste vazio. Métricas de avaliação não calculadas.")

    # 9. Salvar artefatos
    logger.info("8/8 — Salvando artefatos...")
    joblib.dump(reg_model, ARTIFACTS_DIR / REGRESSION_MODEL_FILE)
    joblib.dump(clf_model, ARTIFACTS_DIR / CLASSIFICATION_MODEL_FILE)
    joblib.dump(scaler, ARTIFACTS_DIR / SCALER_FILE)

    with open(ARTIFACTS_DIR / FEATURE_COLUMNS_FILE, "w") as f:
        json.dump(feature_cols, f, indent=2)

    logger.info(f"     Artefatos salvos em: {ARTIFACTS_DIR}")
    logger.info("=" * 60)
    logger.info("PIPELINE CONCLUÍDO COM SUCESSO!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
