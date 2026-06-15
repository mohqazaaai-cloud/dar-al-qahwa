const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const reservationsRoutes = require('./routes/reservations');
const newsletterRoutes = require('./routes/newsletter');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');
const loyaltyRoutes = require('./routes/loyalty');
const eventsRoutes = require('./routes/events');
const settingsRoutes = require('./routes/settings');
const shiftsRoutes = require('./routes/shifts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shifts', shiftsRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB(() => {
  app.listen(PORT, () => {
    console.log(`\n☕ Dar Al-Qahwa server running at http://localhost:${PORT}`);
    console.log(`   Admin login: admin@daralqahwa.jo / admin123\n`);
  });
});
