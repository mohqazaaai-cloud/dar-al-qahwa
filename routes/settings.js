const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET all settings (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

// GET public settings (no auth)
router.get('/public', (req, res) => {
  const db = getDB();
  const publicKeys = ['cafe_name','cafe_tagline','cafe_address','cafe_phone','cafe_email','cafe_hours_weekday','cafe_hours_weekend','instagram_url','facebook_url','whatsapp_number','primary_color','lang'];
  const rows = db.prepare(`SELECT * FROM settings WHERE key IN (${publicKeys.map(()=>'?').join(',')})`).all(...publicKeys);
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

// POST update settings (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  const updates = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) stmt.run(key, value);
  });
  updateMany(Object.entries(updates));
  res.json({ success: true });
});

module.exports = router;
