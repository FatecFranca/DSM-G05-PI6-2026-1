"""Rotas de matérias-primas (commodities).

GET /api/v1/commodities — Lista todas as matérias-primas.
GET /api/v1/commodities/{id}/history — Histórico de preços de uma matéria-prima.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.api.dependencies import get_db
from src.api.schemas import (
    CommodityResponse,
    HistoricoPrecoItem,
    HistoricoPrecoResponse,
)

router = APIRouter()


@router.get(
    "/commodities",
    response_model=List[CommodityResponse],
    summary="Listar matérias-primas",
    description="Retorna todas as matérias-primas cadastradas no sistema.",
)
def list_commodities(db: Session = Depends(get_db)) -> List[CommodityResponse]:
    """Lista todas as matérias-primas ativas."""
    result = db.execute(
        text(
            "SELECT id_materia_prima, nome, categoria, unidade_medida, ativo "
            "FROM materia_prima ORDER BY id_materia_prima"
        )
    )
    rows = result.fetchall()

    return [
        CommodityResponse(
            id_materia_prima=row[0],
            nome=row[1],
            categoria=row[2] or "",
            unidade_medida=row[3],
            ativo=row[4],
        )
        for row in rows
    ]


@router.get(
    "/commodities/{id_materia_prima}/history",
    response_model=HistoricoPrecoResponse,
    summary="Histórico de preços",
    description="Retorna o histórico de preços de uma matéria-prima específica.",
)
def get_price_history(
    id_materia_prima: int,
    db: Session = Depends(get_db),
) -> HistoricoPrecoResponse:
    """Retorna o histórico de preços de uma matéria-prima."""
    # Verificar se a matéria-prima existe
    commodity = db.execute(
        text("SELECT nome FROM materia_prima WHERE id_materia_prima = :id"),
        {"id": id_materia_prima},
    ).fetchone()

    if not commodity:
        raise HTTPException(
            status_code=404,
            detail=f"Matéria-prima com ID {id_materia_prima} não encontrada.",
        )

    # Buscar histórico
    result = db.execute(
        text(
            "SELECT data_referencia, preco_medio, fonte_dado, regiao_opcional "
            "FROM historico_preco "
            "WHERE id_materia_prima = :id "
            "ORDER BY data_referencia"
        ),
        {"id": id_materia_prima},
    )
    rows = result.fetchall()

    return HistoricoPrecoResponse(
        id_materia_prima=id_materia_prima,
        nome=commodity[0],
        historico=[
            HistoricoPrecoItem(
                data_referencia=str(row[0]),
                preco_medio=float(row[1]),
                fonte_dado=row[2],
                regiao=row[3],
            )
            for row in rows
        ],
    )
