<div align="center">
  <img src="https://img.shields.io/badge/Status-Completed-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/github/stars/bryanfeitoza/auth-system?style=for-the-badge&logo=github" alt="Stars">
  <img src="https://img.shields.io/github/languages/count/bryanfeitoza/auth-system?style=for-the-badge" alt="Languages">
  <img src="https://img.shields.io/github/last-commit/bryanfeitoza/auth-system?style=for-the-badge" alt="Last Commit">
</div>

<br>

<div align="center">
  <h1>🔐 AuthSystem</h1>
  <p><strong>for Bryan Feitoza portifolio</strong></p>
  <p><em>Sistema completo de autenticação com JWT, bcrypt, PostgreSQL e CRUD — implementado em 3 stacks diferentes no mesmo repositório</em></p>
</div>

<br>

<div align="center">
  <a href="node/">
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  </a>
  <a href="python/">
    <img src="https://img.shields.io/badge/Python-FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  </a>
  <a href="java/">
    <img src="https://img.shields.io/badge/Java-Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Java">
  </a>
  <a href="docker-compose.yml">
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  </a>
  <a href="node/src/middleware/auth.js">
    <img src="https://img.shields.io/badge/JWT-auth-000000?style=for-the-badge&logo=jsonwebtoken&logoColor=white" alt="JWT">
  </a>
</div>

---

## ✨ Features

| | Funcionalidade | Node.js | Python | Java |
|---|---|---|---|---|
| 🔐 | **Registro de usuário** | ✅ | ✅ | ✅ |
| 🔑 | **Login com JWT** | ✅ | ✅ | ✅ |
| 🔄 | **Refresh Token** | ✅ | ✅ | ✅ |
| 👤 | **Perfil (CRUD)** | ✅ | ✅ | ✅ |
| 📦 | **Itens (CRUD completo)** | ✅ | ✅ | ✅ |
| 🛡️ | **Senhas com bcrypt** | ✅ | ✅ | ✅ |
| 🎨 | **Frontend Bootstrap 5** | ✅ | ❌ (Swagger) | ❌ |
| 📊 | **Paginação e busca** | ✅ | ✅ | ✅ |
| 🩺 | **Health check** | ✅ | ✅ | ✅ |

---

## 🚀 Como iniciar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- WSL2 atualizado (Windows): `wsl --update`

### Subir tudo com um comando

```bash
docker compose up -d --build
```

### Acessar os serviços

| Serviço | URL | Descrição |
|---------|-----|-----------|
| 🌐 **Node.js** | http://localhost:3000 | Frontend completo + API REST |
| 🐍 **Python** | http://localhost:8000/docs | Swagger UI interativo |
| ☕ **Java** | http://localhost:8080/api/health | Health check |
| 🗄️ **pgAdmin** | http://localhost:5050 | `admin@admin.com` / `admin` |
| 🔁 **Nginx** | http://localhost | Proxy reverso |

### Parar

```bash
docker compose down
```

---

## 🧪 Como testar

### Login admin automático

Na inicialização do Node.js, um usuário admin é criado automaticamente:

| Campo | Valor |
|-------|-------|
| **Email** | `admin@test.com` |
| **Senha** | `admin123` |

Acesse http://localhost:3000 e faça login. Você verá a dica do admin direto na tela de login.

### Endpoints da API

```
┌────────┬──────────────────────┬─────────────────────┬───────────────┐
│ Método │ Rota                 │ Descrição           │ Autenticação  │
├────────┼──────────────────────┼─────────────────────┼───────────────┤
│ POST   │ /api/auth/register   │ Criar conta         │ ❌           │
│ POST   │ /api/auth/login      │ Fazer login         │ ❌           │
│ POST   │ /api/auth/refresh    │ Renovar token       │ ❌           │
│ POST   │ /api/auth/logout     │ Sair                │ ✅ JWT       │
│ GET    │ /api/auth/me         │ Ver perfil          │ ✅ JWT       │
│ PUT    │ /api/auth/me         │ Editar perfil       │ ✅ JWT       │
│ GET    │ /api/items           │ Listar itens        │ ✅ JWT       │
│ POST   │ /api/items           │ Criar item          │ ✅ JWT       │
│ GET    │ /api/items/:id       │ Ver item            │ ✅ JWT       │
│ PUT    │ /api/items/:id       │ Atualizar item      │ ✅ JWT       │
│ DELETE │ /api/items/:id       │ Remover item        │ ✅ JWT       │
│ GET    │ /api/health          │ Health check        │ ❌           │
└────────┴──────────────────────┴─────────────────────┴───────────────┘
```

### Testar via Swagger

Acesse http://localhost:8000/docs e teste todos os endpoints pelo navegador.

### Testar via cURL

```bash
# Login
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq .

# Health checks
curl -s http://localhost:3000/api/health | jq .
curl -s http://localhost:8000/api/health | jq .
curl -s http://localhost:8080/api/health | jq .
```

---

## 🏗️ Arquitetura do projeto

```
📁 Sistema_Autenticação/
├── 📄 docker-compose.yml          # Orquestração (PostgreSQL + 3 backends + Nginx + pgAdmin)
├── 📄 .env                        # Variáveis de ambiente (ignorado pelo git)
├── 📄 init.sql                    # Schema inicial do banco
├── 📄 nginx.conf                  # Proxy reverso
│
├── 📁 node/                       # 🟢 Node.js + Express + Sequelize
│   ├── 📄 server.js               # Servidor (porta 3000)
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📁 config/             # Conexão com PostgreSQL
│   │   ├── 📁 models/             # User, Item (Sequelize ORM)
│   │   ├── 📁 middleware/         # JWT middleware
│   │   ├── 📁 controllers/        # Lógica das rotas
│   │   ├── 📁 routes/             # auth.js, items.js
│   │   └── 📄 seed.js             # Cria admin automaticamente
│   └── 📁 public/                 # Frontend SPA (Bootstrap 5)
│       ├── 📄 index.html
│       ├── 📁 css/
│       └── 📁 js/
│
├── 📁 python/                     # 🔵 Python + FastAPI + SQLAlchemy
│   ├── 📄 requirements.txt
│   ├── 📄 Dockerfile
│   └── 📁 app/
│       ├── 📄 main.py             # Servidor (porta 8000)
│       ├── 📄 config.py
│       ├── 📄 database.py
│       ├── 📄 models.py
│       ├── 📄 schemas.py
│       ├── 📄 middleware.py
│       └── 📁 routes/             # auth.py, items.py
│
└── 📁 java/                       # 🟠 Java + Spring Boot + JPA
    ├── 📄 pom.xml
    ├── 📄 Dockerfile
    └── 📁 src/main/
        ├── 📁 java/com/auth/
        │   ├── 📄 AuthApplication.java
        │   ├── 📁 config/
        │   ├── 📁 controller/     # Auth, Item, Health
        │   ├── 📁 dto/
        │   ├── 📁 model/          # User, Item (JPA)
        │   ├── 📁 repository/
        │   └── 📁 service/
        └── 📁 resources/
            └── 📄 application.properties
```

---

## 🛠️ Comparativo das stacks

| Aspecto | 🟢 Node.js | 🔵 Python | 🟠 Java |
|---------|-----------|-----------|---------|
| **Framework** | Express (leve e flexível) | FastAPI (performático, async) | Spring Boot 3 (maduro, enterprise) |
| **ORM** | Sequelize (promises) | SQLAlchemy (DAO pattern) | JPA/Hibernate (padrão JEE) |
| **Hash de senha** | bcryptjs | passlib[bcrypt] | BCryptPasswordEncoder |
| **JWT** | jsonwebtoken | python-jose | jjwt 0.12.6 |
| **Validação** | Manual + middleware | Pydantic (automática) | Bean Validation (@Valid) |
| **Frontend** | Bootstrap 5 SPA | Swagger UI automático | — |
| **Porta** | 3000 | 8000 | 8080 |
| **Paradigma** | MVC com middlewares | Rotas + injeção de dependência | Injeção + Repositories |
| **Mercado** | Startups / Web | IA / Dados / APIs | Bancos / Fintechs / Enterprise |

---

## ⚙️ Variáveis de Ambiente (.env)

```env
DB_USER=auth_user
DB_PASS=auth_password
DB_NAME=auth_system
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=seu-segredo-jwt-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=7d
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **não é versionado**. Os valores acima são placeholders.

---

## 🐞 Solução de problemas

### Docker Desktop não conecta

```bash
wsl --update
```
Depois reinicie o Docker Desktop.

### Porta ocupada

Se alguma porta (3000, 8000, 8080, 80, 5050) já estiver em uso, edite o `docker-compose.yml` e altere o mapeamento.

### Java não sobe

Verifique os logs:

```bash
docker compose logs java
```

O Java depende do PostgreSQL estar saudável. O Docker Compose gerencia isso, mas se o banco demorar, o Java pode falhar na primeira tentativa.

### Quer contribuir?

Sinta-se à vontade para abrir issues ou enviar PRs!

---

<div align="center">
  <p>
    <sub>Feito com ❤️ por <strong>Bryan Feitoza</strong></sub>
  </p>
  <p>
    <sub>Projeto de portfólio — 3 stacks, 1 banco, aprendizado infinito</sub>
  </p>
  <br>
  <p>
    <a href="https://github.com/bryanfeitoza">
      <img src="https://img.shields.io/badge/GitHub-bryanfeitoza-181717?style=for-the-badge&logo=github" alt="GitHub">
    </a>
  </p>
</div>
