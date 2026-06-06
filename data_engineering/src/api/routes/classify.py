"""Rota de classificação do momento de compra.

POST /api/v1/classify — Classifica o momento de compra como bom/regular/ruim.
"""

from datetime import datetime

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.api.dependencies import get_artifacts, get_db
from src.api.schemas import ClassifyRequest, ClassifyResponse
from src.pipeline.predict_pipeline import (
    build_inference_features,
    classify_purchase_moment,
)
from src.infrastructure.messaging.publisher import publish_price_alert

router = APIRouter()


@router.post(
    "/classify",
    response_model=ClassifyResponse,
    summary="Classificar momento de compra",
    description="Classifica o momento atual de compra como bom, regular ou ruim com base em previsões de preço.",
)
def classify(
    request: ClassifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ClassifyResponse:
    """Classifica o momento de compra para a matéria-prima solicitada."""

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

    # Buscar preço mais recente
    latest_price = db.execute(
        text(
            "SELECT preco_medio FROM historico_preco "
            "WHERE id_materia_prima = :id AND regiao_opcional IS NULL "
            "ORDER BY data_referencia DESC "
            "LIMIT 1"
        ),
        {"id": request.id_materia_prima},
    ).fetchone()

    if not latest_price:
        raise HTTPException(
            status_code=404,
            detail="Sem histórico de preços para classificar.",
        )

    preco_atual = float(latest_price[0])

    # Buscar preços recentes para construir features
    recent_prices = db.execute(
        text(
            "SELECT preco_medio FROM historico_preco "
            "WHERE id_materia_prima = :id AND regiao_opcional IS NULL "
            "ORDER BY data_referencia DESC "
            "LIMIT 7"
        ),
        {"id": request.id_materia_prima},
    ).fetchall()

    # Construir features
    prices = [float(row[0]) for row in recent_prices]
    reference_date = datetime.now()
    features = build_inference_features(prices, reference_date)

    # Classificar
    resultado = classify_purchase_moment(
        artifacts=artifacts,
        features=features,
        preco_atual=preco_atual,
        id_materia_prima=request.id_materia_prima,
    )

    # Salvar na tabela recomendacao_compra
    db.execute(
        text(
            "INSERT INTO recomendacao_compra "
            "(id_materia_prima, preco_atual_referencia, previsao_media_futura, "
            "variacao_percentual, classificacao_compra, justificativa_resumida) "
            "VALUES (:id, :preco_atual, :previsao, :variacao, :classificacao, :justificativa)"
        ),
        {
            "id": request.id_materia_prima,
            "preco_atual": resultado["preco_atual"],
            "previsao": resultado["previsao_media_futura"],
            "variacao": resultado["variacao_percentual"],
            "classificacao": resultado["classificacao"],
            "justificativa": resultado["justificativa"],
        },
    )
    db.commit()

    # Publicar alteração de preço na fila de alertas em segundo plano
    background_tasks.add_task(
        publish_price_alert,
        commodity_id=request.id_materia_prima,
        current_price=resultado["preco_atual"],
        variation=resultado["variacao_percentual"],
    )

    return ClassifyResponse(**resultado)
