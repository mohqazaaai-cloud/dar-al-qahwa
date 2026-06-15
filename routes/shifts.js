const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET my shifts
router.get('/mine', authMiddleware, (req, res) => {
  const db = getDB();
  const shifts = db.prepare('SELECT * FROM staff_shifts WHERE user_id = ? ORDER BY date DESC, clock_in DESC LIMIT 30').all(req.user.id);
  res.json(shifts);
});

// GET all shifts (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const { date, user_id } = req.query;
  let query = `SELECT s.*, u.name as user_name FROM staff_shifts s JOIN users u ON s.user_id = u.id WHERE 1=1`;
  const params = [];
  if (date) { query += ' AND s.date = ?'; params.push(date); }
  if (user_id) { query += ' AND s.user_id = ?'; params.push(user_id); }
  query += ' ORDER BY s.date DESC, s.clock_in DESC';
  res.json(db.prepare(query).all(...params));
});

// POST clock in
router.post('/clock-in', authMiddleware, (req, res) => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare("SELECT * FROM staff_shifts WHERE user_id = ? AND date = ? AND clock_out IS NULL").get(req.user.id, today);
  if (existing) return res.status(400).json({ error: 'Already clocked in' });
  const result = db.prepare('INSERT INTO staff_shifts (user_id, date, clock_in) VALUES (?, ?, CURRENT_TIMESTAMP)').run(req.user.id, today);
  res.json({ id: result.lastInsertRowid, clocked_in: true, time: new Date().toISOString() });
});

// POST clock out
router.post('/clock-out', authMiddleware, (req, res) => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const shift = db.prepare("SELECT * FROM staff_shifts WHERE user_id = ? AND date = ? AND clock_out IS NULL").get(req.user.id, today);
  if (!shift) return res.status(400).json({ error: 'Not clocked in' });
  const { break_minutes, notes } = req.body;
  db.prepare('UPDATE staff_shifts SET clock_out = CURRENT_TIMESTAMP, break_minutes = ?, notes = ? WHERE id = ?').run(break_minutes||0, notes||'', shift.id);
  const updated = db.prepare('SELECT * FROM staff_shifts WHERE id = ?').get(shift.id);
  // Calculate hours worked
  const cin = new Date(updated.clock_in);
  const cout = new Date(updated.clock_out);
  const totalMins = Math.floor((cout - cin) / 60000) - (updated.break_minutes || 0);
  res.json({ ...updated, hours_worked: (totalMins / 60).toFixed(2) });
});

// GET current status
router.get('/status', authMiddleware, (req, res) => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const shift = db.prepare("SELECT * FROM staff_shifts WHERE user_id = ? AND date = ? AND clock_out IS NULL").get(req.user.id, today);
  res.json({ clocked_in: !!shift, shift: shift || null });
});

module.exports = router;
