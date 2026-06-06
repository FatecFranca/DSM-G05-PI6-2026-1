"""Testes dos modelos de ML.

Testa carregamento de modelos, formato de predições e artefatos.
Requer que os artefatos tenham sido gerados pelo pipeline de treino.
"""

import json
from pathlib import Path

import numpy as np
import pytest

ARTIFACTS_DIR = Path("artifacts")


def _artifacts_exist() -> bool:
    """Verifica se os artefatos de modelo existem."""
    return (
        (ARTIFACTS_DIR / "regression_model.joblib").exists()
        and (ARTIFACTS_DIR / "classification_model.joblib").exists()
        and (ARTIFACTS_DIR / "scaler.joblib").exists()
        and (ARTIFACTS_DIR / "feature_columns.json").exists()
    )


# Skip todos os testes se artefatos não existirem
pytestmark = pytest.mark.skipif(
    not _artifacts_exist(),
    reason="Artefatos de modelo não encontrados. Execute o pipeline de treino primeiro.",
)


class TestRegressionModel:
    """Testes do modelo de regressão."""

    @pytest.fixture
    def model(self):
        import joblib
        return joblib.load(ARTIFACTS_DIR / "regression_model.joblib")

    @pytest.fixture
    def feature_count(self):
        with open(ARTIFACTS_DIR / "feature_columns.json") as f:
            return len(json.load(f))

    def test_model_loads(self, model):
        """Modelo de regressão deve carregar com método predict."""
        assert hasattr(model, "predict")

    def test_predict_returns_array(self, model, feature_count):
        """Predição deve retornar array numpy com formato correto."""
        X = np.zeros((3, feature_count))
        preds = model.predict(X)
        assert isinstance(preds, np.ndarray)
        assert preds.shape == (3,)

    def test_predict_returns_finite_values(self, model, feature_count):
        """Predição deve retornar valores finitos."""
        X = np.random.rand(10, feature_count)
        preds = model.predict(X)
        assert np.all(np.isfinite(preds))
        assert len(preds) == 10


class TestClassificationModel:
    """Testes do modelo de classificação."""

    @pytest.fixture
    def model(self):
        import joblib
        return joblib.load(ARTIFACTS_DIR / "classification_model.joblib")

    @pytest.fixture
    def feature_count(self):
        with open(ARTIFACTS_DIR / "feature_columns.json") as f:
            return len(json.load(f))

    def test_model_loads(self, model):
        """Modelo de classificação deve carregar com método predict."""
        assert hasattr(model, "predict")

    def test_predict_valid_classes(self, model, feature_count):
        """Classes previstas devem ser 0, 1 ou 2."""
        X = np.zeros((5, feature_count))
        preds = model.predict(X)
        valid_classes = {0, 1, 2}
        assert all(int(p) in valid_classes for p in preds)


class TestScaler:
    """Testes do scaler."""

    def test_scaler_loads(self):
        """Scaler deve carregar com método transform."""
        import joblib
        scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
        assert hasattr(scaler, "transform")

    def test_scaler_transforms(self):
        """Scaler deve transformar dados sem erro."""
        import joblib
        scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
        with open(ARTIFACTS_DIR / "feature_columns.json") as f:
            n_features = len(json.load(f))
        X = np.random.rand(5, n_features)
        result = scaler.transform(X)
        assert result.shape == (5, n_features)


class TestFeatureColumns:
    """Testes do arquivo de feature columns."""

    def test_feature_columns_loads(self):
        """Arquivo de feature columns deve ser JSON válido."""
        with open(ARTIFACTS_DIR / "feature_columns.json") as f:
            cols = json.load(f)
        assert isinstance(cols, list)
        assert len(cols) > 0

    def test_feature_columns_are_strings(self):
        """Todas as feature columns devem ser strings."""
        with open(ARTIFACTS_DIR / "feature_columns.json") as f:
            cols = json.load(f)
        assert all(isinstance(c, str) for c in cols)


class TestEvaluator:
    """Testes das funções de avaliação (não requer artefatos)."""

    def test_evaluate_regression(self):
        """Métricas de regressão devem retornar dict com chaves esperadas."""
        from src.models.evaluator import evaluate_regression

        y_true = np.array([1.0, 2.0, 3.0])
        y_pred = np.array([1.1, 2.2, 2.8])
        metrics = evaluate_regression(y_true, y_pred)
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "mape" in metrics
        assert "r2" in metrics

    def test_evaluate_classification(self):
        """Métricas de classificação devem retornar dict com chaves esperadas."""
        from src.models.evaluator import evaluate_classification

        y_true = np.array([0, 1, 2, 0, 1])
        y_pred = np.array([0, 1, 1, 0, 2])
        metrics = evaluate_classification(y_true, y_pred)
        assert "accuracy" in metrics
        assert "f1_macro" in metrics
        assert "report" in metrics
        assert "confusion_matrix" in metrics


# Remove pytestmark for TestEvaluator (it doesn't need artifacts)
TestEvaluator.pytestmark = []
