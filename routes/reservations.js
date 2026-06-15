const router = require('express').Router();
const { getDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/reservations — public booking
router.post('/', (req, res) => {
  const { name, email, phone, date, time, guests, notes } = req.body;
  if (!name || !email || !date || !time || !guests)
    return res.status(400).json({ error: 'Name, email, date, time, and guests are required' });
  if (parseInt(guests) < 1 || parseInt(guests) > 20)
    return res.status(400).json({ error: 'Guests must be between 1 and 20' });

  const db = getDB();

  // Basic conflict check: same date+time already has 6+ reservations
  const count = db.prepare(
    "SELECT COUNT(*) as c FROM reservations WHERE date = ? AND time = ? AND status != 'cancelled'"
  ).get(date, time);
  if (count.c >= 6) return res.status(409).json({ error: 'That time slot is fully booked. Please choose another.' });

  const info = db.prepare(
    'INSERT INTO reservations (name, email, phone, date, time, guests, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, email, phone || '', date, time, parseInt(guests), notes || '');

  res.status(201).json(db.prepare('SELECT * FROM reservations WHERE id = ?').get(info.lastInsertRowid));
});

// GET /api/reservations — staff view
router.get('/', authMiddleware, (req, res) => {
  const { date, status } = req.query;
  const db = getDB();
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];
  if (date) { query += ' AND date = ?'; params.push(date); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY date ASC, time ASC';
  res.json(db.prepare(query).all(...params));
});

// PATCH /api/reservations/:id/status (staff)
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const db = getDB();
  const r = db.prepare('SELECT id FROM reservations WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id));
});

// DELETE /api/reservations/:id (staff)
router.delete('/:id', authMiddleware, (req, res) => {
  getDB().prepare('DELETE FROM reservations WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
