const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const requiredEnv = ['JWT_SECRET', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[FATAL] Variavel de ambiente obrigatoria nao definida: ${key}`);
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');
const seed = require('./src/seed');

const app = express();
const PORT = process.env.NODE_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'node-express', author: 'Bryan Feitoza', portfolio: 'for Bryan Feitoza portifolio' });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Conectado ao PostgreSQL');
    await sequelize.sync({ alter: true });
    console.log('[DB] Tabelas sincronizadas');
    await seed();
    app.listen(PORT, () => {
      console.log(`[Server] Node rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[FATAL] Erro ao iniciar:', err.message);
    process.exit(1);
  }
}

start();
