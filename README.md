<div align="center">
  <h1>AuthSystem</h1>
  <p><strong>for Bryan Feitoza portifolio</strong></p>
  <p><em>API de autenticação com JWT e CRUD implementada em Node.js, Python (FastAPI) e Java (Spring Boot)</em></p>
</div>

<br>

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Python-FastAPI-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Java-Spring_Boot-6DB33F?style=flat-square&logo=spring&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/JWT-auth-000000?style=flat-square&logo=jsonwebtoken&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/github/license/bryanfeitoza/auth-system?style=flat-square" alt="License">
</div>

---

## Sobre o projeto

API completa de autenticação com registro, login, refresh token JWT e CRUD de itens. O mesmo sistema foi implementado em tres stacks diferentes compartilhando o mesmo banco PostgreSQL, demonstrando versatilidade tecnica e capacidade de adaptacao entre ecossistemas.

**Autor:** Bryan Feitoza  
**Proposito:** Portfolio pessoal

---

## Stacks implementadas

| Aspecto | Node.js | Python | Java |
|---------|---------|--------|------|
| **Framework** | Express | FastAPI | Spring Boot 3 |
| **ORM** | Sequelize | SQLAlchemy | JPA/Hibernate |
| **Seguranca** | bcryptjs + jsonwebtoken | passlib + python-jose | BCryptEncoder + jjwt |
| **Validacao** | Manual + middleware | Pydantic | Bean Validation |
| **Frontend** | Bootstrap 5 SPA | Swagger UI | - |
| **Porta** | 3000 | 8000 | 8080 |

---

## Como executar

**Pre-requisitos:** Docker Desktop, WSL2 atualizado (`wsl --update`)

```bash
docker compose up -d --build
```

Apos a inicializacao, os servicos estarao disponiveis:

| URL | Servico |
|-----|---------|
| http://localhost:3000 | Node.js (frontend completo) |
| http://localhost:8000/docs | Python (Swagger UI) |
| http://localhost:8080/api/health | Java (health check) |
| http://localhost:5050 | pgAdmin (admin@admin.com / admin) |

Para parar:
```bash
docker compose down
```

---

## Testando

**Login admin** (criado automaticamente na inicializacao do Node.js):

| Email | Senha |
|-------|-------|
| admin@test.com | admin123 |

Acesse http://localhost:3000 e faca login, ou use curl:

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq .
```

**Health checks:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:8000/api/health
curl http://localhost:8080/api/health
```

---

## Endpoints

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Cadastro | - |
| POST | `/api/auth/login` | Login | - |
| POST | `/api/auth/refresh` | Renovar token | - |
| POST | `/api/auth/logout` | Sair | JWT |
| GET | `/api/auth/me` | Dados do perfil | JWT |
| PUT | `/api/auth/me` | Atualizar perfil | JWT |
| GET | `/api/items` | Listar itens | JWT |
| POST | `/api/items` | Criar item | JWT |
| GET | `/api/items/:id` | Obter item | JWT |
| PUT | `/api/items/:id` | Atualizar item | JWT |
| DELETE | `/api/items/:id` | Remover item | JWT |
| GET | `/api/health` | Health check | - |

---

## Estrutura

```
Sistema_Autenticacao/
├── docker-compose.yml    # PostgreSQL, 3 backends, Nginx, pgAdmin
├── init.sql              # Schema do banco
├── node/                 # Express + Sequelize
│   ├── server.js
│   ├── src/controllers/  # Logica das rotas
│   ├── src/models/       # User, Item
│   ├── src/middleware/   # JWT
│   ├── src/routes/
│   ├── src/seed.js       # Admin automatico
│   └── public/           # Frontend Bootstrap 5
├── python/               # FastAPI + SQLAlchemy
│   └── app/
│       ├── main.py
│       ├── routes/
│       ├── models.py
│       ├── schemas.py
│       └── middleware.py
└── java/                 # Spring Boot + JPA
    └── src/main/java/com/auth/
        ├── controller/
        ├── service/
        ├── model/
        ├── repository/
        └── config/
```

---

## Seguranca

- Senhas armazenadas com bcrypt (10 rounds)
- Tokens JWT com expiracao e validacao de tipo
- Refresh token rotation (cada uso gera um novo par)
- Validacao de entrada nos controllers e schemas
- Variaveis de ambiente via .env (arquivo ignorado pelo git)
- Tratamento de erros sem vazar detalhes internos

---

## Variáveis de ambiente

```env
DB_USER=auth_user
DB_PASS=auth_password
DB_NAME=auth_system
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=seu-segredo-jwt-super-seguro
JWT_EXPIRES_IN=7d
```

---

<div align="center">
  <p><strong>Bryan Feitoza</strong> — Projeto de portfolio</p>
  <a href="https://github.com/bryanfeitoza">github.com/bryanfeitoza</a>
</div>
