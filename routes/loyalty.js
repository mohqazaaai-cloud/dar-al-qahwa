const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET loyalty member by email
router.get('/lookup', (req, res) => {
  const db = getDB();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const member = db.prepare('SELECT * FROM loyalty WHERE email = ?').get(email.toLowerCase());
  if (!member) return res.status(404).json({ error: 'Not a member yet' });
  const stampsRequired = parseInt(db.prepare("SELECT value FROM settings WHERE key='loyalty_stamps_required'").get()?.value || '9');
  res.json({ ...member, stamps_required: stampsRequired, progress: member.stamps % stampsRequired });
});

// POST join loyalty program (public)
router.post('/join', (req, res) => {
  const db = getDB();
  const { email, name, phone } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Name and email required' });
  const existing = db.prepare('SELECT * FROM loyalty WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Already a member', member: existing });
  const result = db.prepare('INSERT INTO loyalty (email, name, phone) VALUES (?, ?, ?)').run(email.toLowerCase(), name, phone || '');
  const member = db.prepare('SELECT * FROM loyalty WHERE id = ?').get(result.lastInsertRowid);
  res.json(member);
});

// POST add stamp (staff/admin)
router.post('/:id/stamp', authMiddleware, (req, res) => {
  const db = getDB();
  const { order_number, stamps_added, note } = req.body;
  const member = db.prepare('SELECT * FROM loyalty WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  const stampsRequired = parseInt(db.prepare("SELECT value FROM settings WHERE key='loyalty_stamps_required'").get()?.value || '9');
  const add = stamps_added || 1;
  const newStamps = member.stamps + add;
  const newFree = member.free_drinks + Math.floor(newStamps / stampsRequired) - Math.floor(member.stamps / stampsRequired);
  const remainingStamps = newStamps % stampsRequired === 0 && newStamps > 0 ? 0 : newStamps % stampsRequired;
  db.prepare('UPDATE loyalty SET stamps=?, free_drinks=?, total_visits=total_visits+1 WHERE id=?').run(remainingStamps, member.free_drinks + Math.floor((member.stamps + add) / stampsRequired) - Math.floor(member.stamps / stampsRequired), member.id);
  db.prepare('INSERT INTO loyalty_stamps (loyalty_id, order_number, stamps_added, note) VALUES (?, ?, ?, ?)').run(member.id, order_number || '', add, note || '');
  const updated = db.prepare('SELECT * FROM loyalty WHERE id = ?').get(member.id);
  res.json({ ...updated, new_free_drink: newFree > member.free_drinks, stamps_required: stampsRequired });
});

// POST redeem free drink (staff/admin)
router.post('/:id/redeem', authMiddleware, (req, res) => {
  const db = getDB();
  const member = db.prepare('SELECT * FROM loyalty WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (member.free_drinks < 1) return res.status(400).json({ error: 'No free drinks available' });
  db.prepare('UPDATE loyalty SET free_drinks = free_drinks - 1 WHERE id = ?').run(member.id);
  const updated = db.prepare('SELECT * FROM loyalty WHERE id = ?').get(member.id);
  res.json(updated);
});

// GET all members (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const members = db.prepare('SELECT * FROM loyalty ORDER BY total_visits DESC').all();
  const stampsRequired = parseInt(db.prepare("SELECT value FROM settings WHERE key='loyalty_stamps_required'").get()?.value || '9');
  res.json({ members, stamps_required: stampsRequired });
});

// GET stamp history for member (admin)
router.get('/:id/history', authMiddleware, (req, res) => {
  const db = getDB();
  const history = db.prepare('SELECT * FROM loyalty_stamps WHERE loyalty_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(history);
});

module.exports = router;
