.PHONY: up down logs db-shell train notebooks serve serve-prod test test-cov build deploy clean

# ── Infraestrutura ───────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

down-v:
	docker compose down -v

logs:
	docker compose logs -f

db-shell:
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB

db-tables:
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB -c "\dt"

# ── Data Science ─────────────────────────────────────────────

train:
	python -m src.pipeline.train_pipeline

notebooks:
	jupyter notebook notebooks/

# ── API ──────────────────────────────────────────────────────

serve:
	uvicorn src.api.main:app --reload --port 8000

serve-prod:
	gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 src.api.main:app

# ── Testes ───────────────────────────────────────────────────

test:
	pytest tests/ -v

test-cov:
	pytest tests/ -v --cov=src --cov-report=term-missing

# ── Build & Deploy ───────────────────────────────────────────

build:
	docker compose build

deploy:
	docker compose up -d --build

# ── Utilitários ──────────────────────────────────────────────

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ipynb_checkpoints -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov .coverage .coverage.*

seed:
	docker compose exec db psql -U $$POSTGRES_USER -d $$POSTGRES_DB -f /docker-entrypoint-initdb.d/02_seed_all.sql
