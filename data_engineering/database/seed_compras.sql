-- ============================================================
-- Seed: Compras mockadas (10 compras)
-- Distribuídas entre os 3 usuários e 5 matérias-primas
-- ============================================================
-- Referências:
--   Usuários: 1=João, 2=Maria, 3=Carlos
--   Matérias-primas: 1=Milho, 2=Soja, 3=Arroz, 4=Café, 5=Feijão

INSERT INTO compra (id_usuario, id_materia_prima, data_compra, quantidade, preco_unitario_pago, valor_total, fornecedor_opcional, observacoes_opcional, preco_referencia, economia_estimada)
VALUES
    (1, 1, '2025-03-15', 500.00,   1.08, 540.00,   'Cooperativa Sul',       'Compra mensal milho',           1.10,  10.00),
    (1, 3, '2025-04-10', 200.00,   4.50, 900.00,   'Distribuidora Arroz SP', 'Arroz para estoque',            4.55,  10.00),
    (1, 5, '2025-06-20', 100.00,   7.15, 715.00,   NULL,                     'Feijão para revenda',           7.20,   5.00),
    (2, 2, '2025-02-05', 1000.00,  2.28, 2280.00,  'Agro Soja MT',          'Compra grande de soja',         2.30,  20.00),
    (2, 4, '2025-05-18', 50.00,   38.50, 1925.00,  'Cafezal MG',            'Café especial arábica',        38.90,  20.00),
    (2, 1, '2025-07-22', 300.00,   1.22, 366.00,   'Cooperativa Sul',       'Milho segunda compra',          1.25,   9.00),
    (3, 3, '2025-08-10', 150.00,   4.30, 645.00,   'Distribuidora Arroz SP', NULL,                           4.35,   7.50),
    (3, 5, '2025-09-05', 200.00,   6.45, 1290.00,  'Atacadão Feijão',       'Feijão carioca',                6.50,  10.00),
    (3, 2, '2025-10-15', 800.00,   2.58, 2064.00,  'Agro Soja MT',          'Soja para processamento',       2.60,  16.00),
    (1, 4, '2025-11-01', 30.00,   45.50, 1365.00,  NULL,                     'Café para estoque dezembro',   45.90,  12.00);
