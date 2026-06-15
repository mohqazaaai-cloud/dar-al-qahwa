const router = require('express').Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// POST /api/newsletter — subscribe
router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Valid email required' });
  const db = getDB();
  const exists = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Already subscribed', subscribed: true });
  db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email);
  res.status(201).json({ success: true, message: 'Subscribed successfully!' });
});

// GET /api/newsletter — list all (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(getDB().prepare('SELECT * FROM newsletter ORDER BY subscribed_at DESC').all());
});

// DELETE /api/newsletter/:id (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  getDB().prepare('DELETE FROM newsletter WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
