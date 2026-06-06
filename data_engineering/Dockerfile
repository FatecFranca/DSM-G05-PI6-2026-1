# ============================================================
# Stage 1: Builder — Instalar dependências
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ============================================================
# Stage 2: Runtime — Imagem final leve
# ============================================================
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copiar dependências instaladas
COPY --from=builder /install /usr/local

# Copiar código-fonte
COPY src/ ./src/

# Copiar artefatos de modelo (gerados pelo pipeline de treino)
COPY artifacts/ ./artifacts/

# Porta da API
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:8000/api/v1/health'); r.raise_for_status()" || exit 1

# Comando de produção: Gunicorn com workers Uvicorn
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "src.api.main:app"]
