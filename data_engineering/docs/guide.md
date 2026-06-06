Guia pessoal para as infos de dados

O que temos hoje:
1 - Tabela com todos os produtos quebrados por ano/mês por UF e município quebrados pelas 
seguintes colunas:

['produto', 'classificao_produto', 'id_produto', 'nom_municipio',
       'cod_ibge', 'uf', 'regiao', 'ano', 'mes', 'dsc_nivel_comercializacao',
       'valor_produto_kg']

O que precisamos: 
1 - Tabela com a classificação com base no preço histórico se o produto está caro ou barato
2 - Tabela de compras do usuário + Tabela de usuários
3 - Tabela comparação de preços gerais + preço pago pelo user
4 - Tendência de preço de um item
5 - Tabela com as infos que o cliente deseja monitorar

--------------------------------------------------------------------------------

Objetivo 1:

Criar DER e MER das seguintes tabelas:

-usuários
-compras

--------------------------------------------------------------------------------

## Documentação do Projeto

- [Especificação Técnica](../spec.md)
- [Plano de Implementação](../implement.md)
- [Referência da API](api_reference.md)
- [Guia de Deploy](deploy_guide.md)
