# ============================================================
# Stage 1: Builder — instala dependências e compila TypeScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifests primeiro para aproveitar cache de camadas
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila
COPY . .
RUN npm run build

# ============================================================
# Stage 2: Runtime — imagem final enxuta
# ============================================================
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Artefatos compilados do builder
COPY --from=builder /app/dist ./dist

# Schema Prisma (necessário para o client em runtime)
COPY prisma ./prisma
RUN npx prisma generate

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:9000/api/v1 || exit 1

CMD ["node", "dist/main"]
