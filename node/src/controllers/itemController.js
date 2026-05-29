const Item = require('../models/Item');

exports.list = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']]
    });
    res.json(items);
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
