"""Módulo de limpeza e padronização de dados.

Funções para limpar texto, filtrar produtos MVP,
criar referências temporais e agregar preços nacionais.
"""

from typing import List, Optional

import pandas as pd

from src.config import MVP_PRODUCTS


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Aplica limpeza geral ao DataFrame.

    - Strip de whitespace em colunas de texto
    - Conversão de tipos numéricos quando necessário
    - Padronização de nomes de colunas (lowercase)

    Args:
        df: DataFrame bruto do CSV.

    Returns:
        DataFrame com dados limpos.
    """
    df = df.copy()

    # Strip whitespace de colunas string
    str_cols = df.select_dtypes(include=["object"]).columns
    for col in str_cols:
        df[col] = df[col].str.strip()

    # Garantir que valor_produto_kg é numérico
    if "valor_produto_kg" in df.columns:
        df["valor_produto_kg"] = pd.to_numeric(
            df["valor_produto_kg"], errors="coerce"
        )

    # Converter ano e mês para inteiro
    if "ano" in df.columns:
        df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
    if "mes" in df.columns:
        df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")

    return df


def filter_mvp_products(
    df: pd.DataFrame,
    products: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Filtra o DataFrame para incluir apenas os produtos do MVP.

    Args:
        df: DataFrame com coluna 'produto'.
        products: Lista de nomes de produtos. Se None, usa MVP_PRODUCTS.

    Returns:
        DataFrame filtrado com apenas os produtos selecionados.
    """
    target_products = products or MVP_PRODUCTS
    mask = df["produto"].str.upper().isin(target_products)
    return df[mask].copy()


def create_date_reference(df: pd.DataFrame) -> pd.DataFrame:
    """Cria coluna 'data_referencia' combinando ano e mês.

    Args:
        df: DataFrame com colunas 'ano' e 'mes'.

    Returns:
        DataFrame com coluna 'data_referencia' (datetime).
    """
    df = df.copy()
    df["data_referencia"] = pd.to_datetime(
        df["ano"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
    )
    return df


def aggregate_national_price(df: pd.DataFrame) -> pd.DataFrame:
    """Agrega preço médio nacional por produto e mês.

    Calcula a média de `valor_produto_kg` entre todas as UFs
    para cada combinação de produto e data_referencia.

    Args:
        df: DataFrame com colunas 'produto', 'data_referencia', 'valor_produto_kg'.

    Returns:
        DataFrame agregado com uma linha por produto/mês.
    """
    agg_df = (
        df.groupby(["produto", "data_referencia"], as_index=False)["valor_produto_kg"]
        .mean()
        .sort_values(["produto", "data_referencia"])
        .reset_index(drop=True)
    )
    return agg_df
