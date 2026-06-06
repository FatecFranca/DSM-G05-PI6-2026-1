"""Testes de regressão para a rota POST /api/v1/classify.

Valida que o sanity-check de classificação funciona corretamente
e que variações extremas resultam na classificação esperada.
"""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from src.pipeline.predict_pipeline import classify_purchase_moment
from src.config import CLASSIFICATION_LABELS


def _make_artifacts(clf_pred: int = 1, reg_pred: float = 8.84) -> dict:
    """Helper para montar artifacts mockados."""
    clf_mock = MagicMock()
    clf_mock.predict.return_value = np.array([clf_pred])

    reg_mock = MagicMock()
    reg_mock.predict.return_value = np.array([reg_pred])

    scaler_mock = MagicMock()
    scaler_mock.transform.side_effect = lambda x: x  # passthrough

    return {
        "classification_model": clf_mock,
        "regression_model": reg_mock,
        "scaler": scaler_mock,
        "feature_columns": [f"f{i}" for i in range(13)],
    }


class TestSanityCheckClassificacao:
    """Testa o fallback rule-based no classify_purchase_moment."""

    FEATURES = np.ones(13, dtype=float)

    def test_variacao_muito_negativa_retorna_ruim(self):
        """Variação de -80% deve resultar em 'ruim' mesmo que modelo retorne 'regular'."""
        # clf retorna 1 (regular), mas reg_pred implica queda de 80%
        artifacts = _make_artifacts(clf_pred=1, reg_pred=8.84)  # preco_atual=45.9 → -80%
        result = classify_purchase_moment(
            artifacts=artifacts,
            features=self.FEATURES,
            preco_atual=45.9,
            id_materia_prima=4,
        )
        assert result["classificacao"] == "ruim"

    def test_variacao_muito_positiva_retorna_bom(self):
        """Variação de +20% deve resultar em 'bom' mesmo que modelo retorne 'regular'."""
        artifacts = _make_artifacts(clf_pred=1, reg_pred=55.0)  # preco_atual=45.9 → +19.8%
        result = classify_purchase_moment(
            artifacts=artifacts,
            features=self.FEATURES,
            preco_atual=45.9,
            id_materia_prima=4,
        )
        assert result["classificacao"] == "bom"

    def test_variacao_estavel_mantem_regular(self):
        """Variação dentro dos limiares mantém a classificação do modelo."""
        artifacts = _make_artifacts(clf_pred=1, reg_pred=46.5)  # ~+1.3% → dentro do range
        result = classify_purchase_moment(
            artifacts=artifacts,
            features=self.FEATURES,
            preco_atual=45.9,
            id_materia_prima=4,
        )
        assert result["classificacao"] == "regular"

    def test_retorno_contem_campos_obrigatorios(self):
        """Resposta deve conter todos os campos do schema."""
        artifacts = _make_artifacts()
        result = classify_purchase_moment(
            artifacts=artifacts,
            features=self.FEATURES,
            preco_atual=45.9,
            id_materia_prima=4,
        )
        expected_keys = {
            "id_materia_prima", "nome", "preco_atual",
            "previsao_media_futura", "variacao_percentual",
            "classificacao", "justificativa",
        }
        assert expected_keys.issubset(result.keys())

    def test_classificacao_sempre_um_dos_labels_validos(self):
        """classificacao deve ser sempre 'bom', 'regular' ou 'ruim'."""
        artifacts = _make_artifacts()
        result = classify_purchase_moment(
            artifacts=artifacts,
            features=self.FEATURES,
            preco_atual=45.9,
            id_materia_prima=4,
        )
        assert result["classificacao"] in CLASSIFICATION_LABELS
