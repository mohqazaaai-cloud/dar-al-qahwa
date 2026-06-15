const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET all gallery items (optionally filtered by category)
router.get('/', (req, res) => {
  const db = getDB();
  const { category } = req.query;
  let items;
  if (category && category !== 'all') {
    items = db.prepare('SELECT * FROM gallery WHERE category = ? ORDER BY sort_order ASC').all(category);
  } else {
    items = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC').all();
  }
  res.json(items);
});

// POST add gallery item (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const { title, caption, image_url, category, sort_order } = req.body;
  if (!image_url) return res.status(400).json({ error: 'Image URL required' });
  const result = db.prepare('INSERT INTO gallery (title, caption, image_url, category, sort_order) VALUES (?, ?, ?, ?, ?)').run(title||'', caption||'', image_url, category||'general', sort_order||0);
  res.json({ id: result.lastInsertRowid, title, caption, image_url, category, sort_order });
});

// PUT update gallery item (admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const { title, caption, image_url, category, sort_order } = req.body;
  db.prepare('UPDATE gallery SET title=?, caption=?, image_url=?, category=?, sort_order=? WHERE id=?').run(title, caption, image_url, category, sort_order, req.params.id);
  res.json({ success: true });
});

// DELETE gallery item (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
