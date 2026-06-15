const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET all events (public)
router.get('/', (req, res) => {
  const db = getDB();
  const { status } = req.query;
  let events;
  if (status) {
    events = db.prepare('SELECT * FROM events WHERE status = ? ORDER BY date ASC, time ASC').all(status);
  } else {
    events = db.prepare("SELECT * FROM events WHERE date >= date('now') ORDER BY date ASC, time ASC").all();
  }
  res.json(events);
});

// GET single event
router.get('/:id', (req, res) => {
  const db = getDB();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const bookings = db.prepare('SELECT COUNT(*) as count FROM event_bookings WHERE event_id = ? AND status != ?').get(event.id, 'cancelled');
  res.json({ ...event, spots_taken: bookings.count, spots_left: event.capacity - bookings.count });
});

// POST book event (public)
router.post('/:id/book', (req, res) => {
  const db = getDB();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const taken = db.prepare("SELECT COUNT(*) as count FROM event_bookings WHERE event_id = ? AND status != 'cancelled'").get(event.id);
  const { name, email, phone, guests, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const guestsNum = parseInt(guests) || 1;
  if (taken.count + guestsNum > event.capacity) return res.status(400).json({ error: `Only ${event.capacity - taken.count} spots left` });
  const result = db.prepare('INSERT INTO event_bookings (event_id, name, email, phone, guests, notes) VALUES (?, ?, ?, ?, ?, ?)').run(event.id, name, email, phone||'', guestsNum, notes||'');
  db.prepare('UPDATE events SET spots_taken = spots_taken + ? WHERE id = ?').run(guestsNum, event.id);
  res.json({ id: result.lastInsertRowid, event_title: event.title, name, email, guests: guestsNum });
});

// POST create event (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const { title, description, date, time, end_time, capacity, price, image_url, type } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Title and date required' });
  const result = db.prepare('INSERT INTO events (title, description, date, time, end_time, capacity, price, image_url, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, description||'', date, time||'', end_time||'', capacity||20, price||0, image_url||'', type||'event');
  res.json({ id: result.lastInsertRowid });
});

// PUT update event (admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const { title, description, date, time, end_time, capacity, price, image_url, type, status } = req.body;
  db.prepare('UPDATE events SET title=?, description=?, date=?, time=?, end_time=?, capacity=?, price=?, image_url=?, type=?, status=? WHERE id=?').run(title, description, date, time, end_time, capacity, price, image_url, type, status, req.params.id);
  res.json({ success: true });
});

// DELETE event (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM event_bookings WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET event bookings (admin)
router.get('/:id/bookings', authMiddleware, (req, res) => {
  const db = getDB();
  const bookings = db.prepare('SELECT * FROM event_bookings WHERE event_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(bookings);
});

module.exports = router;
