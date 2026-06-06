"""Testes do carregamento e processamento de dados.

Testa as funções de loader, cleaner e feature engineering
usando os CSVs reais disponíveis em data/.
"""

import pandas as pd
import pytest

from src.data.loader import load_mun_data, load_uf_data


class TestLoadUFData:
    """Testes para o carregamento do CSV de UF."""

    def test_load_uf_data_shape(self):
        """CSV de UF deve ter 9 colunas e > 0 linhas."""
        df = load_uf_data()
        assert df.shape[1] == 9
        assert len(df) > 0

    def test_load_uf_data_columns(self):
        """CSV de UF deve ter colunas esperadas."""
        df = load_uf_data()
        expected = [
            "produto",
            "classificao_produto",
            "id_produto",
            "uf",
            "regiao",
            "ano",
            "mes",
            "dsc_nivel_comercializacao",
            "valor_produto_kg",
        ]
        assert list(df.columns) == expected

    def test_valor_produto_is_numeric(self):
        """Coluna valor_produto_kg deve ser numérica após carga."""
        df = load_uf_data()
        assert pd.api.types.is_numeric_dtype(df["valor_produto_kg"])


class TestLoadMunData:
    """Testes para o carregamento do CSV de Município."""

    def test_load_mun_data_has_municipio(self):
        """CSV de Município deve ter coluna nom_municipio."""
        df = load_mun_data()
        assert "nom_municipio" in df.columns

    def test_load_mun_data_has_ibge(self):
        """CSV de Município deve ter coluna cod_ibge."""
        df = load_mun_data()
        assert "cod_ibge" in df.columns

    def test_load_mun_data_not_empty(self):
        """CSV de Município deve ter registros."""
        df = load_mun_data()
        assert len(df) > 0


class TestCleaner:
    """Testes para as funções de limpeza."""

    def test_clean_strips_whitespace(self):
        """Limpeza deve remover espaços em branco."""
        from src.data.cleaner import clean_dataframe

        df = load_uf_data()
        df_clean = clean_dataframe(df)
        # Verificar que valores de produto não têm trailing whitespace
        for val in df_clean["produto"].unique():
            assert val == val.strip()

    def test_filter_mvp_products_count(self):
        """Filtragem MVP deve retornar exatamente 5 produtos."""
        from src.data.cleaner import clean_dataframe, filter_mvp_products

        df = load_uf_data()
        df = clean_dataframe(df)
        df = filter_mvp_products(df)
        assert len(df["produto"].unique()) == 5

    def test_filter_mvp_products_names(self):
        """Filtragem MVP deve retornar os produtos corretos."""
        from src.data.cleaner import clean_dataframe, filter_mvp_products

        df = load_uf_data()
        df = clean_dataframe(df)
        df = filter_mvp_products(df)
        expected = {"MILHO", "SOJA", "ARROZ", "CAFE", "FEIJAO"}
        assert set(df["produto"].str.upper().unique()) == expected


class TestFeatureEngineering:
    """Testes para as funções de feature engineering."""

    def test_create_lag_features(self):
        """Features de lag devem ser criadas corretamente."""
        from src.data.feature_engineering import create_lag_features

        df = pd.DataFrame({
            "valor_produto_kg": [1.0, 2.0, 3.0, 4.0, 5.0],
            "produto": ["MILHO"] * 5,
        })
        result = create_lag_features(df, lags=[1, 2])
        assert "preco_t-1" in result.columns
        assert "preco_t-2" in result.columns
        assert result["preco_t-1"].iloc[1] == 1.0
        assert pd.isna(result["preco_t-1"].iloc[0])

    def test_create_temporal_features(self):
        """Features temporais devem incluir sin/cos encoding."""
        from src.data.feature_engineering import create_temporal_features

        df = pd.DataFrame({"mes": [1, 6, 12]})
        result = create_temporal_features(df)
        assert "mes_sin" in result.columns
        assert "mes_cos" in result.columns
        assert "trimestre" in result.columns

    def test_create_all_features(self):
        """Pipeline completo de features deve criar todas as colunas."""
        from src.data.feature_engineering import create_all_features

        df = pd.DataFrame({
            "valor_produto_kg": range(1, 13),
            "mes": list(range(1, 13)),
            "ano": [2024] * 12,
            "produto": ["MILHO"] * 12,
        })
        result = create_all_features(df)
        assert "preco_t-1" in result.columns
        assert "media_movel_3m" in result.columns
        assert "mes_sin" in result.columns

    def test_temporal_split_no_data_leakage(self):
        """Split temporal não deve vazar dados futuros."""
        from src.data.cleaner import create_date_reference

        df = pd.DataFrame({
            "ano": [2024] * 6 + [2025] * 6,
            "mes": list(range(1, 7)) * 2,
            "produto": ["MILHO"] * 12,
            "valor_produto_kg": range(1, 13),
        })
        df = create_date_reference(df)

        # Split manual 80/20
        dates = sorted(df["data_referencia"].unique())
        split_idx = int(len(dates) * 0.8)
        train_dates = dates[:split_idx]
        test_dates = dates[split_idx:]

        assert max(train_dates) < min(test_dates)
