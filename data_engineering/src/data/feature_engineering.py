"""Módulo de Feature Engineering.

Cria features temporais, lags, rolling stats e variação
percentual para alimentar os modelos de regressão e classificação.
"""

from typing import List, Optional

import numpy as np
import pandas as pd

from src.config import LAG_PERIODS, ROLLING_WINDOWS


def create_lag_features(
    df: pd.DataFrame,
    col: str = "valor_produto_kg",
    lags: Optional[List[int]] = None,
) -> pd.DataFrame:
    """Cria features de lag (valores passados).

    Args:
        df: DataFrame com a coluna alvo. Deve estar ordenado por data.
        col: Nome da coluna numérica para criar lags.
        lags: Lista de períodos de lag. Se None, usa LAG_PERIODS.

    Returns:
        DataFrame com novas colunas de lag (ex: preco_t-1, preco_t-2).
    """
    df = df.copy()
    lag_periods = lags or LAG_PERIODS

    for lag in lag_periods:
        df[f"preco_t-{lag}"] = df.groupby("produto")[col].shift(lag)

    return df


def create_rolling_features(
    df: pd.DataFrame,
    col: str = "valor_produto_kg",
    windows: Optional[List[int]] = None,
) -> pd.DataFrame:
    """Cria features de estatísticas móveis (média e desvio padrão).

    Args:
        df: DataFrame com a coluna alvo. Deve estar ordenado por data.
        col: Nome da coluna numérica.
        windows: Lista de janelas de rolling. Se None, usa ROLLING_WINDOWS.

    Returns:
        DataFrame com novas colunas de média móvel e desvio padrão.
    """
    df = df.copy()
    rolling_windows = windows or ROLLING_WINDOWS

    for window in rolling_windows:
        grouped = df.groupby("produto")[col]
        df[f"media_movel_{window}m"] = grouped.transform(
            lambda x: x.rolling(window, min_periods=1).mean()
        )
        if window <= 3:
            df[f"desvio_{window}m"] = grouped.transform(
                lambda x: x.rolling(window, min_periods=1).std()
            )

    return df


def create_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Cria features temporais a partir da data de referência.

    Features criadas:
    - mes: mês do ano (1-12)
    - trimestre: trimestre do ano (1-4)
    - mes_sin: encoding seno cíclico do mês
    - mes_cos: encoding cosseno cíclico do mês

    Args:
        df: DataFrame com coluna 'data_referencia' (datetime) ou
            coluna 'mes' (int).

    Returns:
        DataFrame com features temporais adicionadas.
    """
    df = df.copy()

    # Extrair mês se data_referencia existe e mes não existe
    if "data_referencia" in df.columns and "mes" not in df.columns:
        df["mes"] = pd.to_datetime(df["data_referencia"]).dt.month

    # Garantir que mês é numérico
    df["mes"] = pd.to_numeric(df["mes"], errors="coerce")

    # Trimestre
    df["trimestre"] = ((df["mes"] - 1) // 3) + 1

    # Encoding cíclico do mês (sin/cos)
    df["mes_sin"] = np.sin(2 * np.pi * df["mes"] / 12)
    df["mes_cos"] = np.cos(2 * np.pi * df["mes"] / 12)

    return df


def create_variation_features(
    df: pd.DataFrame,
    col: str = "valor_produto_kg",
) -> pd.DataFrame:
    """Cria features de variação percentual.

    Args:
        df: DataFrame com a coluna alvo e coluna de lag 'preco_t-1'.
        col: Nome da coluna de preço atual.

    Returns:
        DataFrame com colunas de variação percentual.
    """
    df = df.copy()

    # Variação percentual 1 mês
    if "preco_t-1" in df.columns:
        df["variacao_pct_1m"] = (
            (df[col] - df["preco_t-1"]) / df["preco_t-1"]
        ) * 100

    # Variação percentual 3 meses
    if "preco_t-3" in df.columns:
        df["variacao_pct_3m"] = (
            (df[col] - df["preco_t-3"]) / df["preco_t-3"]
        ) * 100

    return df


def create_all_features(
    df: pd.DataFrame,
    price_col: str = "valor_produto_kg",
) -> pd.DataFrame:
    """Pipeline completo de feature engineering.

    Aplica todas as transformações de features em sequência:
    1. Lag features
    2. Rolling stats
    3. Features temporais
    4. Variação percentual

    Args:
        df: DataFrame limpo e ordenado por data.
        price_col: Nome da coluna de preço.

    Returns:
        DataFrame com todas as features criadas.
    """
    df = create_lag_features(df, col=price_col)
    df = create_rolling_features(df, col=price_col)
    df = create_temporal_features(df)
    df = create_variation_features(df, col=price_col)

    return df
