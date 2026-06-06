# Modelagem de Dados - commodities-analytics

## 1. Objetivo

Esta modelagem de dados contempla o MVP do software descrito no PRD, cobrindo:

- autenticacao de usuarios;
- catalogo de materias-primas;
- historico de precos;
- previsoes geradas pelo modelo;
- classificacao do momento de compra;
- registro de compras;
- configuracao de alertas;
- envio de notificacoes.

O foco e manter uma estrutura simples, relacional e facil de implementar em banco SQL.

## 2. Entidades Principais

### 2.1 Usuario

Representa quem acessa o sistema via web ou mobile.

Campos sugeridos:

- id_usuario (PK)
- nome
- email
- senha_hash
- telefone_opcional
- canal_notificacao_preferido
- criado_em
- atualizado_em

### 2.2 MateriaPrima

Representa os itens monitorados pelo sistema.

Campos sugeridos:

- id_materia_prima (PK)
- nome
- categoria
- unidade_medida
- ativo
- criado_em

Exemplos:

- milho
- soja
- arroz
- cafe
- feijao

### 2.3 HistoricoPreco

Armazena os precos historicos importados da base da CONAB.

Campos sugeridos:

- id_historico_preco (PK)
- id_materia_prima (FK)
- data_referencia
- preco_medio
- fonte_dado
- regiao_opcional
- criado_em

Relacionamento:

- uma materia-prima possui muitos registros de historico de preco.

### 2.4 PrevisaoPreco

Armazena as previsoes geradas pelo modelo para periodos futuros.

Campos sugeridos:

- id_previsao_preco (PK)
- id_materia_prima (FK)
- data_geracao
- periodo_previsto
- preco_previsto
- variacao_percentual_prevista
- modelo_utilizado
- versao_modelo
- criado_em

Relacionamento:

- uma materia-prima possui muitas previsoes.

### 2.5 RecomendacaoCompra

Guarda a classificacao calculada para apoiar a decisao de compra.

Campos sugeridos:

- id_recomendacao_compra (PK)
- id_materia_prima (FK)
- data_calculo
- preco_atual_referencia
- previsao_media_futura
- variacao_percentual
- classificacao_compra
- justificativa_resumida
- criado_em

Valores esperados para classificacao_compra:

- bom
- regular
- ruim

### 2.6 Compra

Registra compras feitas pelo usuario.

Campos sugeridos:

- id_compra (PK)
- id_usuario (FK)
- id_materia_prima (FK)
- data_compra
- quantidade
- preco_unitario_pago
- valor_total
- fornecedor_opcional
- observacoes_opcional
- preco_referencia
- economia_estimada
- criado_em
- atualizado_em

Relacionamentos:

- um usuario pode registrar muitas compras;
- uma materia-prima pode aparecer em muitas compras.

### 2.7 Alerta

Representa regras configuradas pelo usuario para monitoramento.

Campos sugeridos:

- id_alerta (PK)
- id_usuario (FK)
- id_materia_prima (FK)
- tipo_alerta
- valor_limite_opcional
- variacao_percentual_limite_opcional
- ativo
- criado_em
- atualizado_em

Exemplos de tipo_alerta:

- preco_maximo_compra
- mudanca_para_bom
- variacao_percentual

### 2.8 Notificacao

Armazena o historico de notificacoes enviadas ao usuario.

Campos sugeridos:

- id_notificacao (PK)
- id_alerta (FK)
- id_usuario (FK)
- canal_envio
- titulo
- mensagem
- status_envio
- enviado_em
- erro_envio_opcional
- criado_em

Valores comuns para status_envio:

- pendente
- enviado
- falha

## 3. Relacionamentos

Resumo dos relacionamentos principais:

- Usuario 1:N Compra
- Usuario 1:N Alerta
- Usuario 1:N Notificacao
- MateriaPrima 1:N HistoricoPreco
- MateriaPrima 1:N PrevisaoPreco
- MateriaPrima 1:N RecomendacaoCompra
- MateriaPrima 1:N Compra
- MateriaPrima 1:N Alerta
- Alerta 1:N Notificacao

## 4. Modelo Relacional Simplificado

```text
USUARIO (
  id_usuario PK,
  nome,
  email UNIQUE,
  senha_hash,
  telefone_opcional,
  canal_notificacao_preferido,
  criado_em,
  atualizado_em
)

MATERIA_PRIMA (
  id_materia_prima PK,
  nome,
  categoria,
  unidade_medida,
  ativo,
  criado_em
)

HISTORICO_PRECO (
  id_historico_preco PK,
  id_materia_prima FK,
  data_referencia,
  preco_medio,
  fonte_dado,
  regiao_opcional,
  criado_em
)

PREVISAO_PRECO (
  id_previsao_preco PK,
  id_materia_prima FK,
  data_geracao,
  periodo_previsto,
  preco_previsto,
  variacao_percentual_prevista,
  modelo_utilizado,
  versao_modelo,
  criado_em
)

RECOMENDACAO_COMPRA (
  id_recomendacao_compra PK,
  id_materia_prima FK,
  data_calculo,
  preco_atual_referencia,
  previsao_media_futura,
  variacao_percentual,
  classificacao_compra,
  justificativa_resumida,
  criado_em
)

COMPRA (
  id_compra PK,
  id_usuario FK,
  id_materia_prima FK,
  data_compra,
  quantidade,
  preco_unitario_pago,
  valor_total,
  fornecedor_opcional,
  observacoes_opcional,
  preco_referencia,
  economia_estimada,
  criado_em,
  atualizado_em
)

ALERTA (
  id_alerta PK,
  id_usuario FK,
  id_materia_prima FK,
  tipo_alerta,
  valor_limite_opcional,
  variacao_percentual_limite_opcional,
  ativo,
  criado_em,
  atualizado_em
)

NOTIFICACAO (
  id_notificacao PK,
  id_alerta FK,
  id_usuario FK,
  canal_envio,
  titulo,
  mensagem,
  status_envio,
  enviado_em,
  erro_envio_opcional,
  criado_em
)
```

## 5. Observacoes de Implementacao

- O MVP pode usar PostgreSQL ou MySQL sem necessidade de estrutura complexa.
- O valor_total da compra pode ser persistido para facilitar consultas e relatorios.
- A economia_estimada pode ser calculada no backend no momento do registro da compra.
- A tabela de recomendacao pode ser recalculada em lote junto com as previsoes.
- A tabela de notificacao ajuda na rastreabilidade de envios e falhas.

## 6. Diagrama Conceitual Resumido

```text
Usuario ----< Compra >---- MateriaPrima
   |                           |
   |                           +----< HistoricoPreco
   |                           +----< PrevisaoPreco
   |                           +----< RecomendacaoCompra
   |
   +----< Alerta >---- MateriaPrima
            |
            +----< Notificacao
```

## 7. Conclusao

Esta modelagem cobre os dados essenciais para o MVP do commodities-analytics e permite evolucao futura sem complicar a entrega do mvp. Ela e suficiente para sustentar dashboard, previsoes, classificacao de compra, historico de compras, alertas e notificacoes.