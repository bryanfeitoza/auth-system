const { Op } = require('sequelize');
const Item = require('../models/Item');

exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    const where = { user_id: req.userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(limit), 100),
      offset
    });

    res.json({
      data: rows,
      total: count,
      page: Math.max(1, Number(page)),
      totalPages: Math.ceil(count / Math.max(1, Number(limit)))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const item = await Item.create({ user_id: req.userId, title, description, status });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });

    await item.destroy();
    res.json({ message: 'Item removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
