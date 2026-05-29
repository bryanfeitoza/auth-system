const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = 7;
const BCRYPT_ROUNDS = 10;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

async function generateRefreshToken(user) {
  const raw = crypto.randomBytes(40).toString('hex');
  const hash = await bcrypt.hash(raw, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user_id: user.id,
    token_hash: hash,
    expires_at: expiresAt
  });

  return { refresh_token: raw, expires_at: expiresAt };
}

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, password: hashedPassword, phone });

    const access_token = generateAccessToken(user);
    const refresh = await generateRefreshToken(user);

    res.status(201).json({ access_token, ...refresh, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[Auth] Erro no register:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Conta desativada' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const access_token = generateAccessToken(user);
    const refresh = await generateRefreshToken(user);

    res.json({ access_token, ...refresh, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[Auth] Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    await RefreshToken.update(
      { revoked: true },
      { where: { expires_at: { [Op.lt]: new Date() }, revoked: false } }
    );

    const tokens = await RefreshToken.findAll({
      where: { revoked: false },
      order: [['created_at', 'DESC']]
    });

    let matched = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(refresh_token, t.token_hash);
      if (ok) { matched = t; break; }
    }

    if (!matched) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    await matched.update({ revoked: true });

    const user = await User.findByPk(matched.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const access_token = generateAccessToken(user);
    const refresh = await generateRefreshToken(user);

    res.json({ access_token, ...refresh, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[Auth] Erro no refresh:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      const tokens = await RefreshToken.findAll({
        where: { user_id: req.userId, revoked: false }
      });
      for (const t of tokens) {
        const ok = await bcrypt.compare(refresh_token, t.token_hash);
        if (ok) { await t.update({ revoked: true }); break; }
      }
    }
    res.json({ message: 'Logout realizado' });
  } catch (err) {
    console.error('[Auth] Erro no logout:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    console.error('[Auth] Erro no me:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('[Auth] Erro no update:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
