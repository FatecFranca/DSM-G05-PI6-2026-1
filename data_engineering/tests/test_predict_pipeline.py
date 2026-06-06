"""Testes de regressão para build_inference_features e classify_purchase_moment.

Garante que a lógica de construção de features e o sanity-check de classificação
se comportem corretamente para casos-limite e para o cenário do bug report.
"""

import math
from datetime import datetime
from unittest.mock import MagicMock

import numpy as np
import pytest

from src.pipeline.predict_pipeline import build_inference_features


class TestBuildInferenceFeatures:
    """Testes unitários de build_inference_features."""

    REFERENCE_DATE = datetime(2024, 5, 1)  # Maio: mes=5, trimestre=2

    def test_output_shape(self):
        """Deve retornar array com 13 features."""
        prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        result = build_inference_features(prices, self.REFERENCE_DATE)
        assert result.shape == (13,)

    def test_output_dtype(self):
        """Deve retornar array de floats."""
        prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        result = build_inference_features(prices, self.REFERENCE_DATE)
        assert result.dtype == float

    def test_lag1_is_most_recent_price(self):
        """preco_t-1 deve ser o preço mais recente (prices[0])."""
        prices = [100.0, 90.0, 80.0, 70.0, 60.0, 50.0]
        result = build_inference_features(prices, self.REFERENCE_DATE)
        assert result[0] == 100.0  # lag1

    def test_mes_sin_cos_sazonalidade(self):
        """mes_sin e mes_cos devem refletir a sazonalidade correta."""
        date = datetime(2024, 5, 1)  # Maio
        prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        result = build_inference_features(prices, date)

        expected_sin = math.sin(2 * math.pi * 5 / 12)
        expected_cos = math.cos(2 * math.pi * 5 / 12)

        assert result[9]  == pytest.approx(expected_sin, abs=1e-9)   # mes_sin
        assert result[10] == pytest.approx(expected_cos, abs=1e-9)   # mes_cos

    def test_variacao_negativa_extrema(self):
        """Variação fortemente negativa deve ser calculada corretamente."""
        # preco atual = 45.9, preco anterior = 44.1
        prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        result = build_inference_features(prices, self.REFERENCE_DATE)
        var1m = (prices[0] - prices[1]) / prices[1] * 100
        assert result[11] == pytest.approx(var1m, abs=1e-6)  # variacao_pct_1m

    def test_empty_prices_raises_value_error(self):
        """Lista vazia deve lançar ValueError."""
        with pytest.raises(ValueError, match="não pode ser vazia"):
            build_inference_features([], self.REFERENCE_DATE)

    def test_padding_com_poucos_precos(self):
        """Com menos de 7 preços, deve fazer padding sem erro."""
        prices = [45.9, 44.1]  # apenas 2 preços
        result = build_inference_features(prices, self.REFERENCE_DATE)
        assert result.shape == (13,)
        assert result[3] == 0.0  # lag6 deve ser 0 (padding)

    def test_nao_retorna_zeros_com_dados_validos(self):
        """Com 6 preços válidos, nenhuma feature crítica deve ser zero."""
        prices = [45.9, 44.1, 43.2, 42.0, 41.5, 40.8]
        result = build_inference_features(prices, self.REFERENCE_DATE)
        # lag1, lag2, lag3 não devem ser zero
        assert result[0] != 0.0
        assert result[1] != 0.0
        assert result[2] != 0.0
