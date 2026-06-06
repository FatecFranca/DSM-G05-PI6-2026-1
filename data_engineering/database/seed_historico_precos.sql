-- ============================================================
-- Seed: Histórico de preços (~100 registros)
-- Dados baseados nos CSVs reais da CONAB (2024-12 a 2025-11)
-- Preços médios nacionais por matéria-prima/mês
-- ============================================================
-- Referências de IDs:
--   1 = Milho, 2 = Soja, 3 = Arroz, 4 = Café, 5 = Feijão

-- Milho (R$/kg típico: 1.00 - 1.80)
INSERT INTO historico_preco (id_materia_prima, data_referencia, preco_medio, fonte_dado, regiao_opcional)
VALUES
    (1, '2024-12-01',  1.22, 'CONAB', NULL),
    (1, '2025-01-01',  1.18, 'CONAB', NULL),
    (1, '2025-02-01',  1.15, 'CONAB', NULL),
    (1, '2025-03-01',  1.10, 'CONAB', NULL),
    (1, '2025-04-01',  1.05, 'CONAB', NULL),
    (1, '2025-05-01',  1.08, 'CONAB', NULL),
    (1, '2025-06-01',  1.12, 'CONAB', NULL),
    (1, '2025-07-01',  1.25, 'CONAB', NULL),
    (1, '2025-08-01',  1.35, 'CONAB', NULL),
    (1, '2025-09-01',  1.42, 'CONAB', NULL),
    (1, '2025-10-01',  1.48, 'CONAB', NULL),
    (1, '2025-11-01',  1.55, 'CONAB', NULL),
    (1, '2024-12-01',  1.30, 'CONAB', 'SUL'),
    (1, '2025-01-01',  1.25, 'CONAB', 'SUL'),
    (1, '2025-06-01',  1.20, 'CONAB', 'CENTRO-OESTE'),
    (1, '2025-07-01',  1.32, 'CONAB', 'CENTRO-OESTE'),
    (1, '2025-08-01',  1.40, 'CONAB', 'SUDESTE'),
    (1, '2025-09-01',  1.50, 'CONAB', 'SUDESTE'),
    (1, '2025-10-01',  1.55, 'CONAB', 'NORDESTE'),
    (1, '2025-11-01',  1.60, 'CONAB', 'NORDESTE');

-- Soja (R$/kg típico: 2.00 - 2.80)
INSERT INTO historico_preco (id_materia_prima, data_referencia, preco_medio, fonte_dado, regiao_opcional)
VALUES
    (2, '2024-12-01',  2.45, 'CONAB', NULL),
    (2, '2025-01-01',  2.38, 'CONAB', NULL),
    (2, '2025-02-01',  2.30, 'CONAB', NULL),
    (2, '2025-03-01',  2.22, 'CONAB', NULL),
    (2, '2025-04-01',  2.18, 'CONAB', NULL),
    (2, '2025-05-01',  2.25, 'CONAB', NULL),
    (2, '2025-06-01',  2.35, 'CONAB', NULL),
    (2, '2025-07-01',  2.42, 'CONAB', NULL),
    (2, '2025-08-01',  2.50, 'CONAB', NULL),
    (2, '2025-09-01',  2.55, 'CONAB', NULL),
    (2, '2025-10-01',  2.60, 'CONAB', NULL),
    (2, '2025-11-01',  2.68, 'CONAB', NULL),
    (2, '2024-12-01',  2.50, 'CONAB', 'CENTRO-OESTE'),
    (2, '2025-01-01',  2.42, 'CONAB', 'CENTRO-OESTE'),
    (2, '2025-06-01',  2.40, 'CONAB', 'SUL'),
    (2, '2025-07-01',  2.48, 'CONAB', 'SUL'),
    (2, '2025-08-01',  2.55, 'CONAB', 'SUDESTE'),
    (2, '2025-09-01',  2.62, 'CONAB', 'SUDESTE'),
    (2, '2025-10-01',  2.65, 'CONAB', 'NORDESTE'),
    (2, '2025-11-01',  2.72, 'CONAB', 'NORDESTE');

-- Arroz (R$/kg típico: 3.50 - 5.50)
INSERT INTO historico_preco (id_materia_prima, data_referencia, preco_medio, fonte_dado, regiao_opcional)
VALUES
    (3, '2024-12-01',  4.20, 'CONAB', NULL),
    (3, '2025-01-01',  4.35, 'CONAB', NULL),
    (3, '2025-02-01',  4.50, 'CONAB', NULL),
    (3, '2025-03-01',  4.60, 'CONAB', NULL),
    (3, '2025-04-01',  4.55, 'CONAB', NULL),
    (3, '2025-05-01',  4.40, 'CONAB', NULL),
    (3, '2025-06-01',  4.30, 'CONAB', NULL),
    (3, '2025-07-01',  4.25, 'CONAB', NULL),
    (3, '2025-08-01',  4.35, 'CONAB', NULL),
    (3, '2025-09-01',  4.45, 'CONAB', NULL),
    (3, '2025-10-01',  4.58, 'CONAB', NULL),
    (3, '2025-11-01',  4.70, 'CONAB', NULL),
    (3, '2024-12-01',  4.10, 'CONAB', 'SUL'),
    (3, '2025-01-01',  4.25, 'CONAB', 'SUL'),
    (3, '2025-06-01',  4.35, 'CONAB', 'NORDESTE'),
    (3, '2025-07-01',  4.30, 'CONAB', 'NORDESTE'),
    (3, '2025-08-01',  4.40, 'CONAB', 'SUDESTE'),
    (3, '2025-09-01',  4.50, 'CONAB', 'SUDESTE'),
    (3, '2025-10-01',  4.62, 'CONAB', 'CENTRO-OESTE'),
    (3, '2025-11-01',  4.75, 'CONAB', 'CENTRO-OESTE');

-- Café (R$/kg típico: 30.00 - 50.00)
INSERT INTO historico_preco (id_materia_prima, data_referencia, preco_medio, fonte_dado, regiao_opcional)
VALUES
    (4, '2024-12-01', 32.50, 'CONAB', NULL),
    (4, '2025-01-01', 33.80, 'CONAB', NULL),
    (4, '2025-02-01', 35.20, 'CONAB', NULL),
    (4, '2025-03-01', 36.00, 'CONAB', NULL),
    (4, '2025-04-01', 37.50, 'CONAB', NULL),
    (4, '2025-05-01', 38.90, 'CONAB', NULL),
    (4, '2025-06-01', 40.20, 'CONAB', NULL),
    (4, '2025-07-01', 41.00, 'CONAB', NULL),
    (4, '2025-08-01', 42.50, 'CONAB', NULL),
    (4, '2025-09-01', 43.80, 'CONAB', NULL),
    (4, '2025-10-01', 44.50, 'CONAB', NULL),
    (4, '2025-11-01', 45.90, 'CONAB', NULL),
    (4, '2024-12-01', 33.00, 'CONAB', 'SUDESTE'),
    (4, '2025-01-01', 34.20, 'CONAB', 'SUDESTE'),
    (4, '2025-06-01', 41.00, 'CONAB', 'SUL'),
    (4, '2025-07-01', 42.00, 'CONAB', 'SUL'),
    (4, '2025-08-01', 43.00, 'CONAB', 'NORDESTE'),
    (4, '2025-09-01', 44.50, 'CONAB', 'NORDESTE'),
    (4, '2025-10-01', 45.00, 'CONAB', 'CENTRO-OESTE'),
    (4, '2025-11-01', 46.50, 'CONAB', 'CENTRO-OESTE');

-- Feijão (R$/kg típico: 5.00 - 9.00)
INSERT INTO historico_preco (id_materia_prima, data_referencia, preco_medio, fonte_dado, regiao_opcional)
VALUES
    (5, '2024-12-01',  6.80, 'CONAB', NULL),
    (5, '2025-01-01',  7.10, 'CONAB', NULL),
    (5, '2025-02-01',  7.35, 'CONAB', NULL),
    (5, '2025-03-01',  7.60, 'CONAB', NULL),
    (5, '2025-04-01',  7.80, 'CONAB', NULL),
    (5, '2025-05-01',  7.50, 'CONAB', NULL),
    (5, '2025-06-01',  7.20, 'CONAB', NULL),
    (5, '2025-07-01',  6.90, 'CONAB', NULL),
    (5, '2025-08-01',  6.60, 'CONAB', NULL),
    (5, '2025-09-01',  6.50, 'CONAB', NULL),
    (5, '2025-10-01',  6.70, 'CONAB', NULL),
    (5, '2025-11-01',  6.95, 'CONAB', NULL),
    (5, '2024-12-01',  6.90, 'CONAB', 'NORDESTE'),
    (5, '2025-01-01',  7.20, 'CONAB', 'NORDESTE'),
    (5, '2025-06-01',  7.30, 'CONAB', 'SUDESTE'),
    (5, '2025-07-01',  7.00, 'CONAB', 'SUDESTE'),
    (5, '2025-08-01',  6.70, 'CONAB', 'SUL'),
    (5, '2025-09-01',  6.55, 'CONAB', 'SUL'),
    (5, '2025-10-01',  6.75, 'CONAB', 'CENTRO-OESTE'),
    (5, '2025-11-01',  7.00, 'CONAB', 'CENTRO-OESTE');
