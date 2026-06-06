# PRD - Plataforma de Analise e Previsao de Materias-Primas

## 1. Visao Geral

### Nome provisório do produto
commodities-analytics

### Protótipo Figma
https://www.figma.com/make/hXcrMvFtmMEEvCYqBE2707/commodities-analytics?p=f&t=iiCffaQVCGoPHZs5-0&fullscreen=1

### Resumo
O commodities-analytics e um software web e mobile para apoiar a decisao de compra de materias-primas agricolas com base em dados historicos da CONAB e previsoes geradas por IA. O sistema analisa a tendencia de preco de materias-primas selecionadas e informa ao comprador se o momento atual de compra e bom, regular ou ruim.

O produto tambem permite registrar compras realizadas para calcular economia obtida ao longo do tempo e configurar notificacoes para monitorar variacoes de preco de materias-primas especificas, com acesso tanto via navegador quanto via aplicativo mobile.

### Base de dados principal
Dataset do Kaggle:
https://www.kaggle.com/datasets/jadsonchagas/agriculture-and-food-security-conab-data

### Contexto do projeto
Este software sera desenvolvido como projeto integrador, portanto o foco do MVP deve ser simplicidade, clareza de valor e viabilidade tecnica. Nao e necessario construir um ecossistema complexo ou altamente escalavel neste primeiro momento.

## 2. Problema

Compradores de materias-primas precisam decidir quando comprar, mas muitas vezes fazem isso sem apoio analitico, apenas com percepcao de mercado ou urgencia operacional. Isso pode gerar:

- compras em momentos de preco desfavoravel;
- dificuldade para justificar decisoes de compra;
- ausencia de historico consolidado para avaliar economia obtida;
- falta de monitoramento automatizado de itens relevantes.

## 3. Objetivo do Produto

Permitir que compradores acompanhem a evolucao dos precos de materias-primas, visualizem previsoes de curto prazo com apoio de IA e recebam uma classificacao simples sobre o momento de compra.

O sistema deve:

- funcionar em plataforma web e mobile;
- mostrar previsoes de preco para materias-primas;
- classificar o momento atual como bom, regular ou ruim para compra;
- permitir registro de compras realizadas;
- calcular economia estimada ou perda evitavel com base no historico/previsao;
- enviar notificacoes quando houver condicoes de preco configuradas pelo usuario.

## 4. Publico-Alvo

- comprador de materias-primas em pequenas e medias operacoes;
- gestor de suprimentos;
- estudantes e avaliadores do projeto integrador, que precisam enxergar valor de negocio com uma demonstracao clara.

## 5. Proposta de Valor

Transformar dados historicos de materias-primas em orientacao pratica de compra, de forma simples e objetiva.

Mensagem central do produto:
"Use dados e IA para entender se vale a pena comprar agora ou esperar."

## 6. Escopo do MVP

### Incluido no MVP

- dashboard com lista de materias-primas monitoradas no web e no mobile;
- grafico historico de preco por materia-prima;
- previsao simples com IA para proximos periodos;
- classificacao do momento de compra: bom, regular ou ruim;
- cadastro e login basicos;
- registro manual de compras;
- calculo de economia por compra registrada;
- criacao de alertas para materias-primas selecionadas;
- interface mobile com foco em consulta rapida, registro de compras e recebimento de alertas;
- envio de notificacoes via mensageria, preferencialmente Telegram ou WhatsApp, com fallback para e-mail.

### Fora do escopo do MVP

- integracao com ERPs;
- compra automatica;
- simulacoes financeiras complexas;
- multiempresa com perfis muito detalhados;
- modelo de IA altamente sofisticado ou com varias tecnicas em producao simultaneamente.

## 7. Funcionalidades Principais

### 7.1 Analise de Materias-Primas

O usuario podera selecionar uma materia-prima e visualizar:

- historico de preco;
- tendencia recente;
- previsao para os proximos periodos;
- indicacao de recomendacao de compra.

Na versao mobile, essa consulta deve priorizar leitura rapida, cards resumidos e acesso simples aos alertas e ao registro de compras.

Exemplos de materias-primas para demonstracao:

- milho;
- soja;
- arroz;
- cafe;
- feijao.

### 7.2 Previsao com IA

O sistema usara os dados historicos do dataset da CONAB para treinar um modelo de previsao.

Abordagem recomendada para o MVP:

- iniciar com modelos simples de serie temporal ou regressao, como Prophet, ARIMA ou XGBoost com features temporais;
- comparar desempenho basico e manter o modelo mais estavel e explicavel;
- atualizar previsoes em lote, sem necessidade de predicao em tempo real.

Saida esperada da IA:

- previsao do preco para os proximos periodos;
- variacao esperada em relacao ao preco atual;
- classificacao do momento de compra.

### 7.3 Regra de Classificacao do Momento de Compra

O sistema exibira uma classificacao simples para o usuario:

- bom: previsao indica alta futura relevante, sugerindo que comprar agora tende a ser vantajoso;
- regular: previsao indica estabilidade ou pequena variacao;
- ruim: previsao indica queda futura relevante, sugerindo que talvez valha esperar.

Regra inicial sugerida para o MVP:

- bom: previsao media futura maior que o preco atual acima de um limite percentual definido;
- regular: variacao dentro de uma faixa neutra;
- ruim: previsao media futura menor que o preco atual abaixo de um limite percentual definido.

Exemplo de thresholds iniciais:

- bom: aumento previsto acima de 3%;
- regular: entre -3% e +3%;
- ruim: queda prevista abaixo de -3%.

Esses valores podem ser ajustados durante validacao do projeto.

### 7.4 Registro de Compras

O usuario podera registrar compras realizadas com os seguintes campos:

- materia-prima;
- data da compra;
- quantidade;
- preco unitario pago;
- fornecedor opcional;
- observacoes opcionais.

O sistema devera calcular:

- valor total da compra;
- comparacao com preco medio previsto ou historico de referencia;
- economia estimada obtida na compra.

Exemplo de calculo de economia:

- economia = (preco de referencia - preco pago) x quantidade, quando o preco pago for menor;
- se o preco pago for maior, o sistema pode mostrar diferenca negativa como oportunidade perdida.

### 7.5 Notificacoes e Monitoramento

O usuario podera criar alertas para materias-primas especificas.

Tipos de alerta no MVP:

- quando o preco atingir um valor maximo desejado para compra;
- quando a classificacao mudar para bom;
- quando houver variacao percentual relevante no periodo.

Canal de notificacao sugerido:

- prioridade 1: Telegram, por ser simples para projeto academico;
- prioridade 2: e-mail;
- opcional: WhatsApp Cloud API, se houver tempo e viabilidade.

Arquitetura recomendada para notificacoes:

- servico principal registra regras de alerta;
- job agendado ou worker verifica precos e previsoes periodicamente;
- fila de mensageria desacopla a geracao do alerta do envio;
- consumidor envia a notificacao ao usuario.

Tecnologias simples possiveis para MVP:

- Redis + BullMQ para fila;
- RabbitMQ, se o grupo quiser demonstrar mensageria mais explicita;
- scheduler diario ou horario, dependendo da frequencia dos dados.

## 8. Requisitos Funcionais

### RF01
O sistema deve permitir cadastro e autenticacao de usuarios.

### RF01A
O sistema deve disponibilizar acesso por interface web e por aplicativo mobile.

### RF02
O sistema deve listar materias-primas disponiveis para analise.

### RF03
O sistema deve exibir historico de precos por materia-prima.

### RF04
O sistema deve gerar previsoes de preco com base nos dados historicos.

### RF05
O sistema deve classificar o momento de compra como bom, regular ou ruim.

### RF06
O sistema deve permitir registrar compras realizadas.

### RF07
O sistema deve calcular economia estimada por compra registrada.

### RF08
O sistema deve permitir ao usuario configurar alertas por materia-prima.

### RF09
O sistema deve enviar notificacoes quando as condicoes do alerta forem atendidas.

### RF10
O sistema deve apresentar um historico de compras registradas pelo usuario.

### RF11
O sistema mobile deve permitir consulta de previsoes, registro de compras e gerenciamento de alertas.

### RF12
O sistema deve manter sincronizacao dos dados do usuario entre web e mobile.

## 9. Requisitos Nao Funcionais

- interface simples e objetiva, adequada para demonstracao academica, tanto no web quanto no mobile;
- tempo de resposta aceitavel para consultas comuns no dashboard;
- previsoes podem ser processadas em lote, sem exigencia de tempo real;
- a experiencia mobile deve ser adequada para uso em smartphone, com navegacao e leitura adaptadas;
- backend unico deve atender web e mobile por meio de API compartilhada;
- autenticacao basica com seguranca adequada para MVP;
- logs minimos para rastrear erros de notificacao e processamento.

## 10. Historias de Usuario

- Como comprador, quero visualizar a tendencia de preco de uma materia-prima para entender o comportamento historico.
- Como comprador, quero ver uma previsao de preco para decidir se devo comprar agora ou aguardar.
- Como comprador, quero receber uma classificacao simples de compra para acelerar minha decisao.
- Como comprador, quero registrar minhas compras para acompanhar se economizei.
- Como comprador, quero configurar alertas para ser avisado quando o preco estiver interessante.
- Como comprador, quero acessar essas informacoes pelo celular para acompanhar o mercado fora do escritorio.
- Como gestor, quero apresentar resultados e indicadores de economia para justificar decisoes.

## 11. Regras de Negocio

- a classificacao bom, regular ou ruim deve ser derivada de regra transparente baseada na previsao versus preco atual;
- o sistema deve permitir ajuste dos thresholds percentuais por configuracao administrativa futura, mesmo que no MVP fiquem fixos;
- cada compra registrada deve ficar vinculada a um usuario;
- o calculo de economia deve usar uma referencia claramente exibida ao usuario;
- alertas nao devem ser enviados repetidamente sem controle, devendo existir uma janela minima entre notificacoes iguais.

## 12. Dados e IA

### Fonte de dados
Dataset historico da CONAB disponibilizado via Kaggle.

### Uso dos dados

- limpeza e padronizacao de campos;
- selecao de materias-primas mais relevantes para o MVP;
- agregacao temporal conforme disponibilidade do dataset;
- treinamento de modelo de previsao;
- exibicao de historico e indicadores no dashboard.

### Limitacoes esperadas

- o dataset pode nao representar atualizacao em tempo real;
- pode haver lacunas, granularidades diferentes ou necessidade de tratamento;
- para demonstracao do MVP, previsao com base historica ja e suficiente.

### Recomendacao pratica

Se nao houver atualizacao recente dos dados, o sistema pode operar inicialmente como plataforma demonstrativa de apoio a decisao com base historica, sem prometer cotacao em tempo real.

## 13. Indicadores de Sucesso

- quantidade de materias-primas com previsao disponivel;
- numero de compras registradas;
- economia acumulada exibida ao usuario;
- numero de alertas configurados;
- taxa de envio bem-sucedido de notificacoes;
- percepcao de utilidade do sistema em apresentacao e validacao academica.

## 14. Fluxos Principais

### Fluxo 1 - Consultar recomendacao de compra

1. Usuario faz login.
2. Seleciona uma materia-prima.
3. Visualiza historico, previsao e classificacao no web ou no mobile.
4. Decide se compra agora ou aguarda.

### Fluxo 2 - Registrar compra

1. Usuario acessa a area de compras.
2. Informa materia-prima, data, quantidade e preco pago.
3. Sistema calcula total e economia estimada.
4. Registro fica salvo no historico e disponivel em ambas as plataformas.

### Fluxo 3 - Criar alerta

1. Usuario seleciona materia-prima.
2. Define condicao do alerta.
3. Escolhe canal de notificacao.
4. Sistema monitora e envia mensagem quando a regra for atendida.

## 15. Telas do MVP

- tela de login/cadastro web;
- dashboard web principal com cards de materias-primas;
- tela web de detalhe da materia-prima com grafico e previsao;
- tela web de registro e historico de compras;
- tela web de configuracao de alertas e canais de notificacao;
- tela mobile de login;
- home mobile com resumo das materias-primas monitoradas;
- tela mobile de detalhe da materia-prima com previsao e classificacao;
- tela mobile de registro rapido de compra;
- tela mobile de alertas e notificacoes.

## 16. Arquitetura Sugerida

### Frontend web
- Next.js

### Aplicativo mobile
- React Native com Expo

### Backend
- NestJS (Node.js), expondo uma API unica para web e mobile

### Banco de dados
- PostgreSQL

### IA / analise
- Python com pandas, scikit-learn, statsmodels ou Prophet

### Mensageria
- BullMQ com Redis ou RabbitMQ

### Integracao de notificacao
- Telegram Bot API
- e-mail via SMTP/SendGrid
- opcional: WhatsApp Cloud API

## 17. Roadmap Resumido

### Fase 1 - Preparacao de dados

- entender o dataset;
- limpar e padronizar dados;
- selecionar materias-primas foco.

### Fase 2 - Analise e previsao

- criar pipeline de previsao;
- validar modelo inicial;
- definir regra de classificacao bom/regular/ruim.

### Fase 3 - Aplicacao web

- construir autenticacao;
- criar dashboard e tela de detalhes;
- implementar registro de compras.

### Fase 4 - Aplicacao mobile

- construir app mobile com login;
- criar consulta simplificada de previsoes;
- implementar registro rapido de compras e alertas.

### Fase 5 - Alertas

- criar cadastro de alertas;
- implementar fila/worker;
- enviar notificacoes por Telegram ou e-mail.

### Fase 6 - Demonstracao

- revisar dados apresentados;
- preparar caso de uso demonstravel;
- evidenciar previsao, economia e alertas.

## 18. Riscos e Mitigacoes

- risco: baixa qualidade ou defasagem do dataset.
  mitigacao: posicionar o sistema como MVP analitico com base historica e documentar limitacoes.

- risco: previsao pouco precisa para alguns itens.
  mitigacao: usar modelo simples, explicar margem de erro e focar em tendencia, nao em precisao absoluta.

- risco: integracao com WhatsApp ser complexa para o prazo.
  mitigacao: priorizar Telegram ou e-mail no MVP.

- risco: excesso de escopo para projeto integrador.
  mitigacao: limitar o numero de materias-primas, alertas e regras do sistema.

## 19. Premissas

- o projeto sera avaliado mais pelo valor demonstrado do que por robustez industrial;
- a base da CONAB sera suficiente para construir uma prova de conceito funcional;
- notificacoes podem ser enviadas de forma assicrona por mensageria simples;
- web e mobile compartilharao o mesmo backend e a mesma base de dados;
- o MVP pode operar com atualizacao periodica, sem dados em tempo real.

## 20. Criterios de Aceite do MVP

- usuario consegue fazer login e acessar o dashboard;
- usuario consegue acessar a aplicacao tanto no web quanto no mobile;
- usuario consegue selecionar ao menos 3 a 5 materias-primas para analise;
- sistema exibe historico e previsao para as materias-primas selecionadas;
- sistema exibe classificacao bom, regular ou ruim de forma clara;
- usuario consegue registrar compras e visualizar economia estimada;
- usuario consegue configurar ao menos um alerta;
- sistema envia notificacao funcional por pelo menos um canal;
- demonstracao do fluxo principal pode ser feita sem dependencias complexas.

## 21. Recomendacao Final de Escopo

Para manter o projeto viavel, o melhor MVP e:

- 3 a 5 materias-primas principais;
- previsao para curto prazo;
- classificacao simples e transparente;
- registro manual de compras;
- notificacao via Telegram ou e-mail;
- dashboard web objetivo;
- app mobile enxuto para consulta, alertas e registro rapido.

Esse recorte entrega valor, demonstra uso de IA, inclui mensageria, cobre web e mobile e evita complexidade desnecessaria para um projeto integrador.
