-- ============================================================
-- Seed: Matérias-primas do MVP (5 commodities)
-- ============================================================

INSERT INTO materia_prima (nome, categoria, unidade_medida, ativo)
VALUES
    ('Milho',  'Grãos',       'kg', TRUE),
    ('Soja',   'Oleaginosas', 'kg', TRUE),
    ('Arroz',  'Grãos',       'kg', TRUE),
    ('Café',   'Estimulantes','kg', TRUE),
    ('Feijão', 'Leguminosas', 'kg', TRUE);
