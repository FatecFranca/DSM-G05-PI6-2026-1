-- ============================================================
-- Seed: Usuários mockados (3 usuários)
-- Senhas hash geradas com bcrypt para a senha "SenhaSegura123!"
-- ============================================================

INSERT INTO usuario (nome, email, senha_hash, telefone_opcional, canal_notificacao_preferido)
VALUES
    (
        'João Silva',
        'joao.silva@email.com',
        '$2b$12$LJ3m4ys4Lz7nXvQZp0jtOeKv8RQ6Xh5bN3zW8jK9vHgF2dA1mCxOy',
        '11999990001',
        'email'
    ),
    (
        'Maria Oliveira',
        'maria.oliveira@email.com',
        '$2b$12$K9pN2vXcW7mR8tA4qB6jHeYw3fD0sL1iU5oZ7xG9rE4nM2kJ6hT3a',
        '21988880002',
        'push'
    ),
    (
        'Carlos Santos',
        'carlos.santos@email.com',
        '$2b$12$P5qR8vYdZ0nS3uB6tC9kIfXw7eG1hJ4lN2mA9xD0rF5oK3pL8iU2s',
        NULL,
        'email'
    );
