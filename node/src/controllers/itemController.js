const { Op } = require('sequelize');
const Item = require('../models/Item');

exports.list = async (req, res) => {
  try {
    const { page: rawPage, limit: rawLimit, search, status } = req.query;
    const page = Math.max(1, parseInt(rawPage, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(rawLimit, 10) || 10), 100);
    const offset = (page - 1) * limit;

    const where = { user_id: req.userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      const safeSearch = String(search).slice(0, 200);
      where[Op.or] = [
        { title: { [Op.iLike]: `%${safeSearch}%` } },
        { description: { [Op.iLike]: `%${safeSearch}%` } }
      ];
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('[Items] Erro no list:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const item = await Item.create({ user_id: req.userId, title, description, status });
    res.status(201).json(item);
  } catch (err) {
    console.error('[Items] Erro no create:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (err) {
    console.error('[Items] Erro no get:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });

    const { title, description, status } = req.body;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (status) item.status = status;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error('[Items] Erro no update:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });

    await item.destroy();
    res.json({ message: 'Item removido com sucesso' });
  } catch (err) {
    console.error('[Items] Erro no delete:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
