"""Testes dos endpoints da API FastAPI.

Usa TestClient para testar todos os endpoints sem precisar
de servidor real. Requer PostgreSQL rodando para testes de DB.
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app

client = TestClient(app)


class TestHealthEndpoint:
    """Testes do endpoint GET /api/v1/health."""

    def test_health_returns_200(self):
        """Health check deve retornar status 200."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self):
        """Health check deve retornar status 'ok'."""
        response = client.get("/api/v1/health")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_has_version(self):
        """Health check deve retornar versão."""
        response = client.get("/api/v1/health")
        data = response.json()
        assert "version" in data
        assert isinstance(data["version"], str)

    def test_health_has_models_loaded(self):
        """Health check deve reportar estado dos modelos."""
        response = client.get("/api/v1/health")
        data = response.json()
        assert "models_loaded" in data
        assert isinstance(data["models_loaded"], bool)


class TestRootEndpoint:
    """Testes do endpoint raiz."""

    def test_root_returns_200(self):
        """Root deve retornar 200."""
        response = client.get("/")
        assert response.status_code == 200

    def test_root_has_app_info(self):
        """Root deve retornar informações da aplicação."""
        response = client.get("/")
        data = response.json()
        assert "app" in data
        assert "version" in data
        assert "docs" in data


class TestCommoditiesEndpoint:
    """Testes do endpoint GET /api/v1/commodities.

    Nota: Requer PostgreSQL rodando com dados seed.
    """

    @pytest.mark.skipif(
        True,  # Mudar para False quando PostgreSQL estiver rodando
        reason="Requer PostgreSQL rodando com dados seed."
    )
    def test_list_commodities(self):
        """Deve retornar lista de matérias-primas."""
        response = client.get("/api/v1/commodities")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.skipif(
        True,
        reason="Requer PostgreSQL rodando com dados seed."
    )
    def test_commodities_count(self):
        """Deve retornar 5 matérias-primas do MVP."""
        response = client.get("/api/v1/commodities")
        data = response.json()
        assert len(data) == 5


class TestPredictEndpoint:
    """Testes do endpoint POST /api/v1/predict."""

    def test_predict_invalid_type(self):
        """Deve rejeitar tipo inválido com 422."""
        response = client.post(
            "/api/v1/predict",
            json={"id_materia_prima": "abc"},
        )
        assert response.status_code == 422

    def test_predict_missing_field(self):
        """Deve rejeitar request sem campo obrigatório com 422."""
        response = client.post(
            "/api/v1/predict",
            json={},
        )
        assert response.status_code == 422

    @pytest.mark.skipif(
        True,
        reason="Requer PostgreSQL e modelos treinados."
    )
    def test_predict_valid_request(self):
        """Deve gerar previsões para matéria-prima válida."""
        response = client.post(
            "/api/v1/predict",
            json={"id_materia_prima": 1, "periodos_futuros": 3},
        )
        assert response.status_code == 200
        data = response.json()
        assert "previsoes" in data
        assert len(data["previsoes"]) == 3


class TestClassifyEndpoint:
    """Testes do endpoint POST /api/v1/classify."""

    def test_classify_invalid_type(self):
        """Deve rejeitar tipo inválido com 422."""
        response = client.post(
            "/api/v1/classify",
            json={"id_materia_prima": "abc"},
        )
        assert response.status_code == 422

    @pytest.mark.skipif(
        True,
        reason="Requer PostgreSQL e modelos treinados."
    )
    def test_classify_valid_request(self):
        """Deve classificar momento de compra."""
        response = client.post(
            "/api/v1/classify",
            json={"id_materia_prima": 1},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["classificacao"] in ["bom", "regular", "ruim"]

    @pytest.mark.skipif(
        True,
        reason="Requer PostgreSQL rodando."
    )
    def test_classify_nonexistent_commodity(self):
        """Deve retornar 404 para matéria-prima inexistente."""
        response = client.post(
            "/api/v1/classify",
            json={"id_materia_prima": 9999},
        )
        assert response.status_code == 404
