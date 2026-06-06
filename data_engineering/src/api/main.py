"""FastAPI Application — Commodities Analytics API.

Entrypoint da aplicação. Registra routers, configura CORS
e gerencia o ciclo de vida (carregamento de modelos no startup).
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import classify, commodities, health, predict
from src.config import API_DESCRIPTION, API_TITLE, API_VERSION

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Gerencia o ciclo de vida da aplicação.

    No startup, pré-carrega os modelos ML em cache.
    Isso garante que a primeira request seja rápida.
    """
    logger.info("Iniciando Commodities Analytics API...")

    # Pré-carregar modelos (opcional — falha silenciosa se não existirem)
    try:
        from src.api.dependencies import check_models_loaded
        if check_models_loaded():
            logger.info("Modelos ML carregados com sucesso!")
        else:
            logger.warning(
                "Modelos ML não encontrados. "
                "Execute 'python -m src.pipeline.train_pipeline' primeiro."
            )
    except Exception as e:
        logger.warning(f"Erro ao carregar modelos: {e}")

    yield  # App roda aqui

    logger.info("Encerrando Commodities Analytics API...")


# ── Criar aplicação FastAPI ──────────────────────────────────

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ── CORS Middleware ──────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restringir em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Registrar Routers ───────────────────────────────────────

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(commodities.router, prefix="/api/v1", tags=["Commodities"])
app.include_router(predict.router, prefix="/api/v1", tags=["Predict"])
app.include_router(classify.router, prefix="/api/v1", tags=["Classify"])


# ── Root Endpoint ────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    """Rota raiz — redireciona informações básicas."""
    return {
        "app": API_TITLE,
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
