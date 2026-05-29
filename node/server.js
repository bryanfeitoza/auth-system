require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
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
    console.error('[DB] Erro:', err.message);
  }
}

start();
