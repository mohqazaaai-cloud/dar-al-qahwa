const router = require('express').Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/menu — all categories with items
router.get('/', (req, res) => {
  const db = getDB();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const result = categories.map(cat => ({
    ...cat,
    items: db.prepare('SELECT * FROM menu_items WHERE category_id = ? AND available = 1 ORDER BY name').all(cat.id)
  }));
  res.json(result);
});

// GET /api/menu/items — flat list
router.get('/items', (req, res) => {
  const db = getDB();
  const items = db.prepare(`
    SELECT m.*, c.name as category_name
    FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id
    ORDER BY c.sort_order, m.name
  `).all();
  res.json(items);
});

// GET /api/menu/items/:id
router.get('/items/:id', (req, res) => {
  const db = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// POST /api/menu/items (admin)
router.post('/items', authMiddleware, adminOnly, (req, res) => {
  const { category_id, name, description, price, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
  const db = getDB();
  const info = db.prepare('INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)').run(category_id, name, description, price, image_url);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/menu/items/:id (admin)
router.put('/items/:id', authMiddleware, adminOnly, (req, res) => {
  const { category_id, name, description, price, image_url, available } = req.body;
  const db = getDB();
  const existing = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  db.prepare(`
    UPDATE menu_items SET category_id=?, name=?, description=?, price=?, image_url=?, available=?
    WHERE id=?
  `).run(category_id, name, description, price, image_url, available ?? 1, req.params.id);
  res.json(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id));
});

// DELETE /api/menu/items/:id (admin)
router.delete('/items/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const existing = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/menu/categories
router.get('/categories', (req, res) => {
  res.json(getDB().prepare('SELECT * FROM categories ORDER BY sort_order').all());
});

// POST /api/menu/categories (admin)
router.post('/categories', authMiddleware, adminOnly, (req, res) => {
  const { name, sort_order = 0 } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDB();
  const info = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run(name, sort_order);
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
