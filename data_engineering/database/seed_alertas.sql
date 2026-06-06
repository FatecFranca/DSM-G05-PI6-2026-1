-- ============================================================
-- Seed: Alertas mockados (5 alertas)
-- Tipos variados de alertas configurados pelos usuários
-- ============================================================
-- Referências:
--   Usuários: 1=João, 2=Maria, 3=Carlos
--   Matérias-primas: 1=Milho, 2=Soja, 3=Arroz, 4=Café, 5=Feijão
--   Tipos: preco_maximo_compra, mudanca_para_bom, variacao_percentual

INSERT INTO alerta (id_usuario, id_materia_prima, tipo_alerta, valor_limite_opcional, variacao_percentual_limite_opcional, ativo)
VALUES
    (1, 1, 'preco_maximo_compra',   1.30,  NULL,  TRUE),
    (1, 4, 'variacao_percentual',   NULL,  5.00,  TRUE),
    (2, 2, 'mudanca_para_bom',      NULL,  NULL,  TRUE),
    (2, 5, 'preco_maximo_compra',   6.50,  NULL,  TRUE),
    (3, 3, 'variacao_percentual',   NULL, 10.00,  FALSE);
