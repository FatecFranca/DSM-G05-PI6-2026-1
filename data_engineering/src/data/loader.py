"""Módulo de carregamento de dados CSV e datasets processados.

Funções responsáveis por ler os CSVs da CONAB e os datasets
processados gerados pelo pipeline de pré-processamento.
"""

from pathlib import Path
from typing import Tuple

import pandas as pd

from src.config import (
    CSV_MUN_FILENAME,
    CSV_PARAMS,
    CSV_UF_FILENAME,
    DATA_DIR,
    PROCESSED_DIR,
)


def load_uf_data(filepath: Path | None = None) -> pd.DataFrame:
    """Carrega o CSV de preços mensais por UF.

    Args:
        filepath: Caminho opcional para o CSV. Se None, usa o padrão.

    Returns:
        DataFrame com os dados de preços por UF.

    Raises:
        FileNotFoundError: Se o arquivo CSV não for encontrado.
    """
    path = filepath or DATA_DIR / CSV_UF_FILENAME

    if not path.exists():
        raise FileNotFoundError(f"Arquivo CSV não encontrado: {path}")

    df = pd.read_csv(str(path), **CSV_PARAMS)
    return df


def load_mun_data(filepath: Path | None = None) -> pd.DataFrame:
    """Carrega o CSV de preços mensais por Município.

    Args:
        filepath: Caminho opcional para o CSV. Se None, usa o padrão.

    Returns:
        DataFrame com os dados de preços por Município.

    Raises:
        FileNotFoundError: Se o arquivo CSV não for encontrado.
    """
    path = filepath or DATA_DIR / CSV_MUN_FILENAME

    if not path.exists():
        raise FileNotFoundError(f"Arquivo CSV não encontrado: {path}")

    df = pd.read_csv(str(path), **CSV_PARAMS)
    return df


def load_processed_data(
    processed_dir: Path | None = None,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Carrega os datasets de treino e teste processados.

    Args:
        processed_dir: Diretório dos dados processados. Se None, usa o padrão.

    Returns:
        Tupla (df_train, df_test).

    Raises:
        FileNotFoundError: Se os arquivos processados não existirem.
    """
    directory = processed_dir or PROCESSED_DIR
    train_path = directory / "train.csv"
    test_path = directory / "test.csv"

    if not train_path.exists():
        raise FileNotFoundError(f"Arquivo de treino não encontrado: {train_path}")
    if not test_path.exists():
        raise FileNotFoundError(f"Arquivo de teste não encontrado: {test_path}")

    df_train = pd.read_csv(str(train_path))
    df_test = pd.read_csv(str(test_path))

    return df_train, df_test
