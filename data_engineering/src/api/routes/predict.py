"""Rota de previsão de preço.

POST /api/v1/predict — Gera previsões de preço futuro para uma matéria-prima.
"""

from datetime import datetime

import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.api.dependencies import get_artifacts, get_db
from src.api.schemas import (
    PredictRequest,
    PredictResponse,
    PrevisaoItem,
)
from src.config import PRODUCT_ID_MAP
from src.pipeline.predict_pipeline import predict_future_price

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Previsão de preço",
    description="Gera previsões de preço futuro para uma matéria-prima usando o modelo XGBRegressor.",
)
def predict(
    request: PredictRequest,
    db: Session = Depends(get_db),
) -> PredictResponse:
    """Executa previsão de preço para a matéria-prima solicitada."""

    # Verificar se a matéria-prima existe
    commodity = db.execute(
        text("SELECT nome FROM materia_prima WHERE id_materia_prima = :id"),
        {"id": request.id_materia_prima},
    ).fetchone()

    if not commodity:
        raise HTTPException(
            status_code=404,
            detail=f"Matéria-prima com ID {request.id_materia_prima} não encontrada.",
        )

    # Carregar artefatos
    try:
        artifacts = get_artifacts()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Modelos não disponíveis: {e}",
        )

    # Buscar último preço e dados recentes para construir features
    recent_prices = db.execute(
        text(
            "SELECT preco_medio FROM historico_preco "
            "WHERE id_materia_prima = :id AND regiao_opcional IS NULL "
            "ORDER BY data_referencia DESC "
            "LIMIT 7"
        ),
        {"id": request.id_materia_prima},
    ).fetchall()

    if not recent_prices:
        raise HTTPException(
            status_code=404,
            detail="Sem histórico de preços suficiente para previsão.",
        )

    # Construir features a partir dos preços recentes
    n_features = len(artifacts["feature_columns"])
    features = np.zeros(n_features)

    # Preencher com preços recentes onde possível
    prices = [float(row[0]) for row in recent_prices]
    for i, price in enumerate(prices[:n_features]):
        features[i] = price

    # Gerar previsões
    try:
        previsoes_raw = predict_future_price(
            artifacts=artifacts,
            features=features,
            id_materia_prima=request.id_materia_prima,
            periodos=request.periodos_futuros,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar previsões: {e}",
        )

    # Salvar previsões no banco
    for prev in previsoes_raw:
        db.execute(
            text(
                "INSERT INTO previsao_preco "
                "(id_materia_prima, periodo_previsto, preco_previsto, "
                "variacao_percentual_prevista, modelo_utilizado, versao_modelo) "
                "VALUES (:id, :periodo, :preco, :variacao, 'XGBRegressor', '1.0.0')"
            ),
            {
                "id": request.id_materia_prima,
                "periodo": prev["periodo"],
                "preco": float(prev["preco_previsto"]),
                "variacao": float(prev["variacao_pct"]),
            },
        )
    db.commit()

    return PredictResponse(
        id_materia_prima=request.id_materia_prima,
        nome=commodity[0],
        previsoes=[PrevisaoItem(**p) for p in previsoes_raw],
        modelo_utilizado="XGBRegressor",
        data_geracao=datetime.now(),
    )

