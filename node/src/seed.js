const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  try {
    const exists = await User.findOne({ where: { email: 'admin@test.com' } });
    if (exists) {
      console.log('[Seed] Admin já existe, pulando...');
      return;
    }

    const hash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin Teste',
      email: 'admin@test.com',
      password: hash,
      phone: '(00) 00000-0000'
    });
    console.log('[Seed] Admin criado: admin@test.com / admin123');
  } catch (err) {
    console.error('[Seed] Erro:', err.message);
  }
}

module.exports = seed;
