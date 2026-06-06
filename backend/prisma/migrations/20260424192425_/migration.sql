-- CreateTable
CREATE TABLE "alerta" (
    "id_alerta" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_materia_prima" INTEGER NOT NULL,
    "tipo_alerta" VARCHAR(50) NOT NULL,
    "valor_limite_opcional" DECIMAL(12,2),
    "variacao_percentual_limite_opcional" DECIMAL(8,4),
    "ativo" BOOLEAN DEFAULT true,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_pkey" PRIMARY KEY ("id_alerta")
);

-- CreateTable
CREATE TABLE "compra" (
    "id_compra" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_materia_prima" INTEGER NOT NULL,
    "data_compra" DATE NOT NULL DEFAULT CURRENT_DATE,
    "quantidade" DECIMAL(12,4) NOT NULL,
    "preco_unitario_pago" DECIMAL(12,2) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "fornecedor_opcional" VARCHAR(255),
    "observacoes_opcional" TEXT,
    "preco_referencia" DECIMAL(12,2),
    "economia_estimada" DECIMAL(12,2),
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "historico_preco" (
    "id_historico_preco" SERIAL NOT NULL,
    "id_materia_prima" INTEGER NOT NULL,
    "data_referencia" DATE NOT NULL,
    "preco_medio" DECIMAL(12,2) NOT NULL,
    "fonte_dado" VARCHAR(100) DEFAULT 'CONAB',
    "regiao_opcional" VARCHAR(100),
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_preco_pkey" PRIMARY KEY ("id_historico_preco")
);

-- CreateTable
CREATE TABLE "materia_prima" (
    "id_materia_prima" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(100),
    "unidade_medida" VARCHAR(20) NOT NULL DEFAULT 'kg',
    "ativo" BOOLEAN DEFAULT true,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id_materia_prima")
);

-- CreateTable
CREATE TABLE "notificacao" (
    "id_notificacao" SERIAL NOT NULL,
    "id_alerta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "canal_envio" VARCHAR(50) NOT NULL DEFAULT 'email',
    "titulo" VARCHAR(255) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status_envio" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "enviado_em" TIMESTAMP(6),
    "erro_envio_opcional" TEXT,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id_notificacao")
);

-- CreateTable
CREATE TABLE "previsao_preco" (
    "id_previsao_preco" SERIAL NOT NULL,
    "id_materia_prima" INTEGER NOT NULL,
    "data_geracao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "periodo_previsto" VARCHAR(20) NOT NULL,
    "preco_previsto" DECIMAL(12,2) NOT NULL,
    "variacao_percentual_prevista" DECIMAL(8,4),
    "modelo_utilizado" VARCHAR(100) DEFAULT 'XGBRegressor',
    "versao_modelo" VARCHAR(20) DEFAULT '1.0.0',
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "previsao_preco_pkey" PRIMARY KEY ("id_previsao_preco")
);

-- CreateTable
CREATE TABLE "recomendacao_compra" (
    "id_recomendacao_compra" SERIAL NOT NULL,
    "id_materia_prima" INTEGER NOT NULL,
    "data_calculo" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "preco_atual_referencia" DECIMAL(12,2) NOT NULL,
    "previsao_media_futura" DECIMAL(12,2) NOT NULL,
    "variacao_percentual" DECIMAL(8,4),
    "classificacao_compra" VARCHAR(10) NOT NULL,
    "justificativa_resumida" TEXT,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recomendacao_compra_pkey" PRIMARY KEY ("id_recomendacao_compra")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "telefone_opcional" VARCHAR(20),
    "canal_notificacao_preferido" VARCHAR(50) DEFAULT 'email',
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE INDEX "idx_alerta_usuario" ON "alerta"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_compra_materia" ON "compra"("id_materia_prima");

-- CreateIndex
CREATE INDEX "idx_compra_usuario" ON "compra"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_historico_preco_data" ON "historico_preco"("data_referencia");

-- CreateIndex
CREATE INDEX "idx_historico_preco_materia" ON "historico_preco"("id_materia_prima");

-- CreateIndex
CREATE INDEX "idx_notificacao_alerta" ON "notificacao"("id_alerta");

-- CreateIndex
CREATE INDEX "idx_previsao_materia" ON "previsao_preco"("id_materia_prima");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historico_preco" ADD CONSTRAINT "historico_preco_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta"("id_alerta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "previsao_preco" ADD CONSTRAINT "previsao_preco_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recomendacao_compra" ADD CONSTRAINT "recomendacao_compra_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;
