const router = require('express').Router();
const { getDB } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];

  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const todayOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = ?").get(today).c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total),0) as r FROM orders WHERE status != 'cancelled'").get().r;
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as r FROM orders WHERE date(created_at) = ? AND status != 'cancelled'").get(today).r;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get().c;
  const totalReservations = db.prepare("SELECT COUNT(*) as c FROM reservations").get().c;
  const todayReservations = db.prepare("SELECT COUNT(*) as c FROM reservations WHERE date = ?").get(today).c;
  const pendingReservations = db.prepare("SELECT COUNT(*) as c FROM reservations WHERE status = 'pending'").get().c;
  const newsletterCount = db.prepare("SELECT COUNT(*) as c FROM newsletter").get().c;
  const menuItemCount = db.prepare("SELECT COUNT(*) as c FROM menu_items WHERE available = 1").get().c;

  // Revenue last 7 days
  const revenueChart = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as total
    FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now','-7 days')
    GROUP BY day ORDER BY day
  `).all();

  // Top items by order frequency
  const topItems = db.prepare(`
    SELECT oi.name, SUM(oi.quantity) as qty, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY oi.name ORDER BY qty DESC LIMIT 5
  `).all();

  res.json({
    orders: { total: totalOrders, today: todayOrders, pending: pendingOrders },
    revenue: { total: parseFloat(revenue.toFixed(2)), today: parseFloat(todayRevenue.toFixed(2)) },
    reservations: { total: totalReservations, today: todayReservations, pending: pendingReservations },
    newsletter: newsletterCount,
    menuItems: menuItemCount,
    revenueChart,
    topItems,
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json(getDB().prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all());
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['admin', 'staff'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  getDB().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  if (req.user.id === parseInt(req.params.id)) return res.status(400).json({ error: 'Cannot delete yourself' });
  getDB().prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
