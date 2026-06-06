# Commodities Analytics — Backend

API central do sistema construída com o framework NestJS, integrando serviços de inteligência artificial, processamento de filas e notificações automatizadas.

## Tecnologias Principais

- **Framework:** NestJS
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **IA:** Google Generative AI (@google/genai)
- **Filas:** BullMQ
- **Notificações:** Nodemailer, Telegram API
- **Autenticação:** Passport JWT

## Funcionalidades

- **Módulo Assistente:** Chatbot inteligente integrado ao Google Gemini para análise de mercado.
- **Sistema de Alertas:** Processamento assíncrono de alertas de preços configurados pelos usuários.
- **Gestão de Commodities:** Controle de dados históricos e atuais de preços.
- **Integrações:** Envio automatizado de notificações via Telegram e E-mail.

## Configuração e Instalação

### 1. Instalação

```bash
cd backend
npm install
```

### 2. Banco de Dados

Configure a variável `DATABASE_URL` no arquivo `.env` e execute as migrações:

```bash
npx prisma migrate dev
```

### 3. Execução

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## Estrutura de Código (src/)

- `auth/`: Lógica de autenticação e guards.
- `assistent/`: Integração com IA.
- `alerts/`: Processamento de filas BullMQ.
- `commodities/`: Endpoints de dados de mercado.
- `integrations/`: Serviços de comunicação externa.
