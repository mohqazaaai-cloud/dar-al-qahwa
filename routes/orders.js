const router = require('express').Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

function genOrderNumber() {
  return 'DAQ-' + Date.now().toString(36).toUpperCase().slice(-6);
}

// POST /api/orders — place a new order
router.post('/', (req, res) => {
  const { customer_name, customer_email, table_number, items, notes } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Order must have at least one item' });
  const db = getDB();

  // Validate items and compute total
  let total = 0;
  const resolved = [];
  for (const item of items) {
    const mi = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.menu_item_id);
    if (!mi) return res.status(400).json({ error: `Item ${item.menu_item_id} not found or unavailable` });
    const qty = parseInt(item.quantity) || 1;
    total += mi.price * qty;
    resolved.push({ menu_item_id: mi.id, name: mi.name, price: mi.price, quantity: qty });
  }

  const order_number = genOrderNumber();
  const info = db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_email, table_number, total, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(order_number, customer_name || 'Guest', customer_email || '', table_number || '', total, notes || '');

  const orderId = info.lastInsertRowid;
  const insertItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)');
  resolved.forEach(i => insertItem.run(orderId, i.menu_item_id, i.name, i.price, i.quantity));

  res.status(201).json(getOrderWithItems(db, orderId));
});

// GET /api/orders — all orders (staff/admin)
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const { status, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM orders';
  const params = [];
  if (status) { query += ' WHERE status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  const orders = db.prepare(query).all(...params);
  res.json(orders.map(o => getOrderWithItems(db, o.id)));
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(getOrderWithItems(db, order.id));
});

// PATCH /api/orders/:id/status (staff)
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const db = getDB();
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  res.json(getOrderWithItems(db, req.params.id));
});

// DELETE /api/orders/:id (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

function getOrderWithItems(db, orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  return order;
}

module.exports = router;
