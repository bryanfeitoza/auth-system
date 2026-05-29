# AuthSystem

> Sistema completo de autenticação com JWT, bcrypt, PostgreSQL e CRUD — implementado em **Node.js**, **Python (FastAPI)** e **Java (Spring Boot)** no mesmo repositório.

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](node/)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python)](python/)
[![Java](https://img.shields.io/badge/Java-Spring_Boot-6DB33F?logo=spring)](java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](docker-compose.yml)
[![JWT](https://img.shields.io/badge/JWT-auth-000000?logo=jsonwebtoken)](node/src/middleware/auth.js)

### 🎯 Por que este projeto está no meu portfólio?

Este projeto demonstra **versatilidade técnica** — implementei a mesma API completa em 3 stacks diferentes, compartilhando o mesmo banco PostgreSQL. Isso mostra que consigo transitar entre ecossistemas e dominar os padrões de cada um:

| Aspecto | Node.js | Python | Java |
|---------|---------|--------|------|
| **Framework** | Express (leve e flexível) | FastAPI (performático, async) | Spring Boot (maduro, enterprise) |
| **ORM** | Sequelize (promises) | SQLAlchemy (DAO pattern) | JPA/Hibernate (padrão JEE) |
| **Segurança** | bcryptjs + jsonwebtoken | passlib + python-jose | BCryptEncoder + jjwt |
| **Validação** | Manual + middleware | Pydantic (auto) | Bean Validation (@Valid) |
| **Frontend** | Bootstrap 5 SPA incluso | Swagger UI automático | - |
| **Paradigma** | MVC com middlewares | Rotas + dependências | Injeção + Repositories |
| **Mercado** | Startups / Web | IA / Dados / APIs | Bancos / Fintechs / Enterprise |

## Arquitetura

```
Sistema_Autenticação/
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── .env                        # Configurações compartilhadas
├── init.sql                    # Script inicial do banco
│
├── node/                       # Node.js + Express + Sequelize
│   ├── server.js               # Servidor Express
│   ├── src/
│   │   ├── config/database.js  # Conexão PostgreSQL
│   │   ├── models/             # User, Item (Sequelize)
│   │   ├── middleware/auth.js  # JWT middleware
│   │   ├── controllers/        # Lógica das rotas
│   │   └── routes/             # auth.js, items.js
│   └── public/                 # Frontend SPA (Bootstrap 5)
│       ├── index.html
│       ├── css/style.css
│       └── js/api.js, views.js, app.js
│
├── python/                     # Python + FastAPI + SQLAlchemy
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # Servidor FastAPI
│       ├── config.py           # Configurações
│       ├── database.py         # SQLAlchemy engine
│       ├── models.py           # User, Item (SQLAlchemy)
│       ├── schemas.py          # Pydantic schemas
│       ├── middleware.py       # JWT middleware
│       └── routes/auth.py, items.py
│
└── java/                       # Java + Spring Boot + JPA
    ├── pom.xml                 # Maven dependencies
    └── src/main/
        ├── java/com/auth/
        │   ├── AuthApplication.java
        │   ├── config/SecurityConfig.java
        │   ├── controller/     # Auth, Item, Health
        │   ├── dto/            # Request/Response DTOs
        │   ├── model/          # User, Item (JPA)
        │   ├── repository/     # JPA Repositories
        │   └── service/        # Jwt, User, Item services
        └── resources/application.properties
```

## Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| POST | `/api/auth/register` | Cadastro de usuário | - |
| POST | `/api/auth/login` | Login | - |
| GET | `/api/auth/me` | Perfil do usuário | JWT |
| PUT | `/api/auth/me` | Atualizar perfil | JWT |
| GET | `/api/items` | Listar itens | JWT |
| POST | `/api/items` | Criar item | JWT |
| GET | `/api/items/:id` | Obter item | JWT |
| PUT | `/api/items/:id` | Atualizar item | JWT |
| DELETE | `/api/items/:id` | Remover item | JWT |
| GET | `/api/health` | Health check | - |

## Como usar

### 1. Subir o PostgreSQL

```bash
docker compose up -d
```

### 2. Escolha um backend

#### Opção A: Node.js

```bash
cd node
npm install
npm run dev
# Frontend em http://localhost:3000
```

#### Opção B: Python

```bash
cd python
pip install -r requirements.txt
python -m app.main
# API em http://localhost:8000
# Docs em http://localhost:8000/docs
```

#### Opção C: Java

```bash
cd java
mvn spring-boot:run
# API em http://localhost:8080
```

### 3. Acessar

- **Node.js**: http://localhost:3000 (frontend completo)
- **Python API**: http://localhost:8000/docs (Swagger UI)
- **Java API**: http://localhost:8080/api/health
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## Tecnologias

| Componente | Node.js | Python | Java |
|-----------|---------|--------|------|
| Framework | Express | FastAPI | Spring Boot 3 |
| ORM | Sequelize | SQLAlchemy | JPA/Hibernate |
| Hash | bcryptjs | passlib[bcrypt] | BCryptPasswordEncoder |
| JWT | jsonwebtoken | python-jose | jjwt |
| Validação | express | Pydantic | Bean Validation |
| Frontend | Bootstrap 5 | - | - |
| Banco | PostgreSQL | PostgreSQL | PostgreSQL |

## Variáveis de Ambiente (.env)

```env
DB_USER=auth_user
DB_PASS=auth_password
DB_NAME=auth_system
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=seu-segredo-jwt-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=7d
```
