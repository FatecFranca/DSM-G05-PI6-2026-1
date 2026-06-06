-- ============================================================
-- DDL — Commodities Analytics
-- Criação de todas as 8 tabelas na ordem de dependências (FKs)
-- ============================================================

-- 1. Usuário
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario       SERIAL PRIMARY KEY,
    nome             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    senha_hash       VARCHAR(255) NOT NULL,
    telefone_opcional VARCHAR(20),
    canal_notificacao_preferido VARCHAR(50) DEFAULT 'email',
    criado_em        TIMESTAMP DEFAULT NOW(),
    atualizado_em    TIMESTAMP DEFAULT NOW()
);

-- 2. Matéria-Prima
CREATE TABLE IF NOT EXISTS materia_prima (
    id_materia_prima SERIAL PRIMARY KEY,
    nome             VARCHAR(255) NOT NULL,
    categoria        VARCHAR(100),
    unidade_medida   VARCHAR(20) NOT NULL DEFAULT 'kg',
    ativo            BOOLEAN DEFAULT TRUE,
    criado_em        TIMESTAMP DEFAULT NOW()
);

-- 3. Histórico de Preço
CREATE TABLE IF NOT EXISTS historico_preco (
    id_historico_preco SERIAL PRIMARY KEY,
    id_materia_prima   INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    data_referencia    DATE NOT NULL,
    preco_medio        NUMERIC(12,2) NOT NULL,
    fonte_dado         VARCHAR(100) DEFAULT 'CONAB',
    regiao_opcional    VARCHAR(100),
    criado_em          TIMESTAMP DEFAULT NOW()
);

-- 4. Previsão de Preço
CREATE TABLE IF NOT EXISTS previsao_preco (
    id_previsao_preco          SERIAL PRIMARY KEY,
    id_materia_prima           INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    data_geracao               TIMESTAMP DEFAULT NOW(),
    periodo_previsto           VARCHAR(20) NOT NULL,
    preco_previsto             NUMERIC(12,2) NOT NULL,
    variacao_percentual_prevista NUMERIC(8,4),
    modelo_utilizado           VARCHAR(100) DEFAULT 'XGBRegressor',
    versao_modelo              VARCHAR(20) DEFAULT '1.0.0',
    criado_em                  TIMESTAMP DEFAULT NOW()
);

-- 5. Recomendação de Compra
CREATE TABLE IF NOT EXISTS recomendacao_compra (
    id_recomendacao_compra  SERIAL PRIMARY KEY,
    id_materia_prima        INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    data_calculo            TIMESTAMP DEFAULT NOW(),
    preco_atual_referencia  NUMERIC(12,2) NOT NULL,
    previsao_media_futura   NUMERIC(12,2) NOT NULL,
    variacao_percentual     NUMERIC(8,4),
    classificacao_compra    VARCHAR(10) NOT NULL CHECK (classificacao_compra IN ('bom', 'regular', 'ruim')),
    justificativa_resumida  TEXT,
    criado_em               TIMESTAMP DEFAULT NOW()
);

-- 6. Compra
CREATE TABLE IF NOT EXISTS compra (
    id_compra              SERIAL PRIMARY KEY,
    id_usuario             INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_materia_prima       INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    data_compra            DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade             NUMERIC(12,4) NOT NULL,
    preco_unitario_pago    NUMERIC(12,2) NOT NULL,
    valor_total            NUMERIC(12,2) NOT NULL,
    fornecedor_opcional    VARCHAR(255),
    observacoes_opcional   TEXT,
    preco_referencia       NUMERIC(12,2),
    economia_estimada      NUMERIC(12,2),
    criado_em              TIMESTAMP DEFAULT NOW(),
    atualizado_em          TIMESTAMP DEFAULT NOW()
);

-- 7. Alerta
CREATE TABLE IF NOT EXISTS alerta (
    id_alerta                        SERIAL PRIMARY KEY,
    id_usuario                       INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_materia_prima                 INTEGER NOT NULL REFERENCES materia_prima(id_materia_prima),
    tipo_alerta                      VARCHAR(50) NOT NULL,
    valor_limite_opcional            NUMERIC(12,2),
    variacao_percentual_limite_opcional NUMERIC(8,4),
    ativo                            BOOLEAN DEFAULT TRUE,
    criado_em                        TIMESTAMP DEFAULT NOW(),
    atualizado_em                    TIMESTAMP DEFAULT NOW()
);

-- 8. Notificação
CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao    SERIAL PRIMARY KEY,
    id_alerta         INTEGER NOT NULL REFERENCES alerta(id_alerta),
    id_usuario        INTEGER NOT NULL REFERENCES usuario(id_usuario),
    canal_envio       VARCHAR(50) NOT NULL DEFAULT 'email',
    titulo            VARCHAR(255) NOT NULL,
    mensagem          TEXT NOT NULL,
    status_envio      VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status_envio IN ('pendente', 'enviado', 'falha')),
    enviado_em        TIMESTAMP,
    erro_envio_opcional TEXT,
    criado_em         TIMESTAMP DEFAULT NOW()
);

-- Índices úteis para performance
CREATE INDEX IF NOT EXISTS idx_historico_preco_materia ON historico_preco(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_historico_preco_data ON historico_preco(data_referencia);
CREATE INDEX IF NOT EXISTS idx_previsao_materia ON previsao_preco(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_compra_usuario ON compra(id_usuario);
CREATE INDEX IF NOT EXISTS idx_compra_materia ON compra(id_materia_prima);
CREATE INDEX IF NOT EXISTS idx_alerta_usuario ON alerta(id_usuario);
CREATE INDEX IF NOT EXISTS idx_notificacao_alerta ON notificacao(id_alerta);
