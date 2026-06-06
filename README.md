# 🌾 Commodities Analytics

Plataforma centralizada para análise de mercado de commodities, predição de preços e alertas inteligentes. O ecossistema integra engenharia de dados, inteligência artificial e interfaces multiplataforma.

## 🏗 Arquitetura do Projeto

O projeto é dividido em quatro módulos principais que trabalham de forma integrada:

1.  **Data Engineering:** Pipeline de dados em Python para ingestão, limpeza e modelos de Machine Learning (XGBoost).
2.  **Backend:** Servidor NestJS responsável pela lógica de negócio, autenticação, integração com IA (Gemini) e gestão de filas (BullMQ).
3.  **Frontend:** Dashboard web em Next.js para visualização de dados e gestão empresarial.
4.  **Mobile:** Aplicativo Expo (React Native) para acompanhamento em tempo real e alertas.

Consulte o diagrama detalhado em `documents/diagrama.png`.

## 📂 Estrutura de Diretórios

- `backend/`: API principal e lógica de negócio.
- `frontend/`: Interface administrativa e dashboards.
- `mobile/`: Aplicativo móvel para usuários finais.
- `data_engineering/`: Scripts de ML e processamento de dados.
- `docs/`: Documentação técnica e planos de design.
- `documents/`: Requisitos (PRD) e diagramas.

## 🛠 Tecnologias Globais

- **Linguagens:** TypeScript, Python.
- **Backend:** NestJS, FastAPI.
- **Frontend/Mobile:** Next.js, React Native (Expo).
- **Banco de Dados:** PostgreSQL (Prisma ORM).
- **Infraestrutura:** Docker, Docker Compose.
- **IA:** Google Generative AI (Gemini).

## 🚀 Guia de Instalação Rápida

Para subir o ambiente completo via Docker:

1. Clone o repositório.
2. Configure os arquivos `.env` baseando-se nos arquivos `.env.example` em cada pasta.
3. Na raiz do projeto, execute:
   ```bash
   docker-compose up -d
   ```
4. Acesse o frontend em `http://localhost:3000`.

## 👥 Equipe e Licença

- **Equipe:** Desenvolvedores Commodities Analytics.
- **Licença:** UNLICENSED (Proprietário).
