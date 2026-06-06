"""Schemas Pydantic para request/response da API.

Define os modelos de validação para todos os endpoints,
garantindo tipagem e validação automática dos dados.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Previsão (Predict) ───────────────────────────────────────

class PrevisaoItem(BaseModel):
    """Representa uma previsão de preço para um período futuro."""

    periodo: str = Field(..., description="Período previsto no formato YYYY-MM")
    preco_previsto: float = Field(..., description="Preço previsto em R$/kg")
    variacao_pct: float = Field(..., description="Variação percentual em relação ao preço atual")


class PredictRequest(BaseModel):
    """Request body para o endpoint POST /api/v1/predict."""

    id_materia_prima: int = Field(..., description="ID da matéria-prima no banco")
    periodos_futuros: int = Field(
        default=3,
        ge=1,
        le=12,
        description="Quantos meses futuros prever (1-12)",
    )


class PredictResponse(BaseModel):
    """Response body do endpoint POST /api/v1/predict."""

    id_materia_prima: int
    nome: str
    previsoes: List[PrevisaoItem]
    modelo_utilizado: str = "XGBRegressor"
    data_geracao: datetime


# ── Classificação (Classify) ─────────────────────────────────

class ClassifyRequest(BaseModel):
    """Request body para o endpoint POST /api/v1/classify."""

    id_materia_prima: int = Field(..., description="ID da matéria-prima no banco")


class ClassifyResponse(BaseModel):
    """Response body do endpoint POST /api/v1/classify."""

    id_materia_prima: int
    nome: str
    preco_atual: float
    previsao_media_futura: float
    variacao_percentual: float
    classificacao: str = Field(
        ...,
        description="Classificação: 'bom', 'regular' ou 'ruim'",
    )
    justificativa: str


# ── Commodities ──────────────────────────────────────────────

class CommodityResponse(BaseModel):
    """Response body para listagem de matérias-primas."""

    id_materia_prima: int
    nome: str
    categoria: str
    unidade_medida: str
    ativo: bool


class HistoricoPrecoItem(BaseModel):
    """Item de histórico de preço."""

    data_referencia: str
    preco_medio: float
    fonte_dado: Optional[str] = None
    regiao: Optional[str] = None


class HistoricoPrecoResponse(BaseModel):
    """Response body para histórico de preços de uma matéria-prima."""

    id_materia_prima: int
    nome: str
    historico: List[HistoricoPrecoItem]


# ── Health ───────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Response body do endpoint GET /api/v1/health."""

    status: str = "ok"
    version: str
    models_loaded: bool


# ── Erros ────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Response body padrão para erros."""

    detail: str
