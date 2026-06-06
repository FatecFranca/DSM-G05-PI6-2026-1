# 🚀 Guia de Deploy — Commodities Analytics

> Deploy na VM Magalu Cloud com Docker Compose.

---

## 1. Pré-requisitos

### Na VM Magalu Cloud:
- Ubuntu 22.04+ ou similar
- Docker Engine 24+
- Docker Compose v2
- Acesso SSH configurado
- Portas abertas: 5432 (PostgreSQL), 8000 (API)

### Localmente:
- Modelos treinados em `artifacts/` (gerados pelo pipeline)
- Repositório atualizado

---

## 2. Instalação do Docker na VM

```bash
# Conectar via SSH
ssh usuario@ip-vm-magalu

# Instalar Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuário ao grupo docker (evitar sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

---

## 3. Setup do Projeto

```bash
# Clonar repositório
git clone <URL_DO_REPOSITORIO> commodities-analytics
cd commodities-analytics/data_engineering

# Criar arquivo .env com credenciais de produção
cp .env.example .env
nano .env
```

### Configuração do `.env` de produção:
```env
# ⚠️ ALTERAR SENHAS PARA PRODUÇÃO!
POSTGRES_USER=commodities_prod
POSTGRES_PASSWORD=SenhaForteProd2024!
POSTGRES_DB=commodities_analytics
POSTGRES_PORT=5432

API_PORT=8000
API_HOST=0.0.0.0
DATABASE_URL=postgresql://commodities_prod:SenhaForteProd2024!@db:5432/commodities_analytics

MODEL_PATH=./artifacts
```

---

## 4. Build e Deploy

```bash
# Build e início dos containers
make deploy
# ou
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

---

## 5. Verificação Pós-Deploy

```bash
# Health check
curl http://localhost:8000/api/v1/health
# Esperado: {"status": "ok", "version": "1.0.0", "models_loaded": true}

# Listar commodities
curl http://localhost:8000/api/v1/commodities
# Esperado: lista com 5 matérias-primas

# Testar previsão
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1, "periodos_futuros": 3}'

# Testar classificação
curl -X POST http://localhost:8000/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"id_materia_prima": 1}'

# Verificar banco
docker compose exec db psql -U commodities_prod -d commodities_analytics -c "\dt"
docker compose exec db psql -U commodities_prod -d commodities_analytics -c "SELECT COUNT(*) FROM materia_prima;"
```

---

## 6. Troubleshooting

### Container db não inicia
```bash
docker compose logs db
# Verificar se porta 5432 está livre
sudo lsof -i :5432
```

### Container api não conecta ao db
```bash
# Verificar DATABASE_URL no .env
# Verificar que o host é "db" (nome do serviço Docker) e não "localhost"
docker compose exec api python -c "from src.config import DATABASE_URL; print(DATABASE_URL)"
```

### Modelos não carregam
```bash
# Verificar se artefatos existem
docker compose exec api ls -la /app/artifacts/
# Se vazios, re-treinar localmente:
python -m src.pipeline.train_pipeline
# E re-deployar:
make deploy
```

### Reset completo do banco
```bash
docker compose down -v  # Remove volumes (apaga dados!)
docker compose up -d --build
```

---

## 7. Backup do PostgreSQL

### Criar backup
```bash
docker compose exec db pg_dump -U commodities_prod -d commodities_analytics > backup_$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
cat backup_20260424.sql | docker compose exec -T db psql -U commodities_prod -d commodities_analytics
```

---

## 8. Atualização de Modelos

Para re-treinar e atualizar os modelos em produção:

```bash
# 1. Localmente, re-treinar
python -m src.pipeline.train_pipeline

# 2. Commitar novos artefatos
git add artifacts/
git commit -m "feat: atualizar modelos treinados"
git push

# 3. Na VM, atualizar e re-deployar
ssh usuario@ip-vm-magalu
cd commodities-analytics/data_engineering
git pull
make deploy
```

---

## 9. Monitoramento

### Logs em tempo real
```bash
docker compose logs -f api
docker compose logs -f db
```

### Status dos containers
```bash
docker compose ps
```

### Uso de recursos
```bash
docker stats
```
