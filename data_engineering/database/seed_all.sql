-- ============================================================
-- Seed All — Executa todos os seeds na ordem correta de FKs
-- ============================================================
-- Uso:
--   docker compose exec db psql -U commodities_user -d commodities_analytics -f /docker-entrypoint-initdb.d/02_seed_all.sql
--
-- Ou auto-executado pelo Docker no primeiro boot via /docker-entrypoint-initdb.d/

\i /docker-entrypoint-initdb.d/seeds/seed_materias_primas.sql
\i /docker-entrypoint-initdb.d/seeds/seed_usuarios.sql
\i /docker-entrypoint-initdb.d/seeds/seed_historico_precos.sql
\i /docker-entrypoint-initdb.d/seeds/seed_compras.sql
\i /docker-entrypoint-initdb.d/seeds/seed_alertas.sql
