"""Rota de health check da API.

GET /api/v1/health — Retorna status, versão e estado dos modelos.
"""

from fastapi import APIRouter

from src.api.dependencies import check_models_loaded
from src.api.schemas import HealthResponse
from src.config import API_VERSION

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Verifica se a API está operacional e se os modelos ML estão carregados.",
)
def health_check() -> HealthResponse:
    """Retorna o status de saúde da API."""
    return HealthResponse(
        status="ok",
        version=API_VERSION,
        models_loaded=check_models_loaded(),
    )
