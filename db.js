const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'cafe.db');
let db;

function getDB() {
  if (!db) db = new Database(DB_PATH);
  return db;
}

function initDB(callback) {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      table_number TEXT,
      status TEXT DEFAULT 'pending',
      total REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      caption TEXT,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS loyalty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      stamps INTEGER DEFAULT 0,
      free_drinks INTEGER DEFAULT 0,
      total_visits INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS loyalty_stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loyalty_id INTEGER NOT NULL,
      order_number TEXT,
      stamps_added INTEGER DEFAULT 1,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loyalty_id) REFERENCES loyalty(id)
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      end_time TEXT,
      capacity INTEGER DEFAULT 20,
      spots_taken INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      image_url TEXT,
      type TEXT DEFAULT 'event',
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS event_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      guests INTEGER DEFAULT 1,
      notes TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
    CREATE TABLE IF NOT EXISTS staff_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      clock_in DATETIME,
      clock_out DATETIME,
      break_minutes INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin user
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@daralqahwa.jo');
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@daralqahwa.jo', hash, 'admin');
  }

  // Seed categories
  const cats = [
    { name: 'Coffee', sort_order: 1 },
    { name: 'Tea & Botanicals', sort_order: 2 },
    { name: 'Kitchen', sort_order: 3 },
  ];
  cats.forEach(c => {
    const exists = db.prepare('SELECT id FROM categories WHERE name = ?').get(c.name);
    if (!exists) db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run(c.name, c.sort_order);
  });

  // Seed menu items
  const coffeeId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Coffee').id;
  const teaId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Tea & Botanicals').id;
  const kitchenId = db.prepare('SELECT id FROM categories WHERE name = ?').get('Kitchen').id;

  const menuItems = [
    [coffeeId, 'Cardamom Latte', 'Freshly ground hel blended with our house espresso and steamed whole milk.', 4.50, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80'],
    [coffeeId, 'Ethiopian Pour-Over', 'Yirgacheffe natural process, light roast. Notes of blueberry, jasmine, and dark chocolate.', 5.50, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
    [coffeeId, 'Rose Flat White', 'Double ristretto with house-made rose water syrup and silky micro-foam.', 5.00, 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&q=80'],
    [coffeeId, 'Iced Saffron Cortado', 'Cold brew espresso with saffron-infused cream and a grain of Jordanian salt.', 6.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80'],
    [coffeeId, 'Yemeni Qishr', 'Traditional coffee husk brew spiced with ginger and cinnamon.', 4.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80'],
    [coffeeId, 'Pistachio Oat Latte', 'House-toasted pistachios blended with oat milk and double espresso.', 5.50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80'],
    [teaId, 'Jordan Valley Herbal', 'Wild thyme, sage, and chamomile sourced from the Jordan Valley highlands.', 3.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'],
    [teaId, 'Mint & Verbena', 'Fresh-picked spearmint blended with dried lemon verbena.', 3.00, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80'],
    [teaId, 'Karkadé (Hibiscus)', 'Deep ruby-red hibiscus steeped cold, served over ice with honey.', 3.50, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80'],
    [kitchenId, 'Knafeh Croissant', 'Buttery croissant filled with sweet cheese, drizzled with orange blossom syrup.', 4.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'],
    [kitchenId, "Za'atar Manakish Toast", "Sourdough with house za'atar, olive oil, and labneh.", 5.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'],
    [kitchenId, 'Date & Tahini Tart', 'Shortcrust pastry with Medjool date filling and tahini drizzle.', 4.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80'],
    [kitchenId, 'Freekeh Grain Bowl', 'Smoked green wheat with roasted vegetables, pomegranate, and herb dressing.', 8.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'],
    [kitchenId, 'Falafel Plate', 'Crispy herb falafel with pickled vegetables, tahini, and warm flatbread.', 7.00, 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=600&q=80'],
    [kitchenId, 'Semolina Basbousa', 'Moist semolina cake soaked in rose water syrup with a pistachio crown.', 3.50, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80'],
  ];
  menuItems.forEach(([catId, name, desc, price, img]) => {
    const exists = db.prepare('SELECT id FROM menu_items WHERE name = ?').get(name);
    if (!exists) db.prepare('INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)').run(catId, name, desc, price, img);
  });

  // Seed gallery
  const galExists = db.prepare('SELECT id FROM gallery LIMIT 1').get();
  if (!galExists) {
    const galleryItems = [
      ['The Bar', 'Our handcrafted espresso bar', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 'interior', 1],
      ['Morning Light', 'Weibdeh mornings hit different', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', 'interior', 2],
      ['Pour Over Station', 'Precision brewing, every time', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'brewing', 3],
      ['Cardamom Latte Art', 'Every cup is a canvas', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80', 'drinks', 4],
      ['The Knafeh Croissant', 'Our signature pastry', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80', 'food', 5],
      ['Bean Selection', 'Sourced direct from farms', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80', 'brewing', 6],
      ['The Reading Corner', 'Our favourite nook', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', 'interior', 7],
      ['Falafel Plate', 'From the kitchen', 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=800&q=80', 'food', 8],
      ['Roasting Day', 'Small batch, big flavour', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'brewing', 9],
      ['The Courtyard', 'Open seating under the sky', 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80', 'interior', 10],
      ['Pistachio Latte', 'A new classic', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80', 'drinks', 11],
      ['Date Tart', 'Medjool dates, tahini drizzle', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', 'food', 12],
    ];
    galleryItems.forEach(([title, caption, url, cat, sort]) => {
      db.prepare('INSERT INTO gallery (title, caption, image_url, category, sort_order) VALUES (?, ?, ?, ?, ?)').run(title, caption, url, cat, sort);
    });
  }

  // Seed events
  const evExists = db.prepare('SELECT id FROM events LIMIT 1').get();
  if (!evExists) {
    const now = new Date();
    const events = [
      ['Monthly Cupping Session', 'Join our head barista for a guided tasting of 5 single-origin coffees. Learn to identify flavour notes, evaluate roast levels, and explore the world in a cup.', addDays(now, 7), '10:00', '12:00', 16, 5.00, 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'cupping'],
      ['Latte Art Masterclass', 'A hands-on workshop teaching the fundamentals of milk texturing and basic latte art patterns. Suitable for beginners.', addDays(now, 14), '14:00', '16:30', 8, 12.00, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80', 'workshop'],
      ['Jordanian Coffee Heritage Evening', 'An evening celebrating the rich coffee traditions of Jordan and the Arab world — qishr, cardamom brews, and stories.', addDays(now, 21), '18:00', '20:00', 30, 0, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', 'event'],
      ['Filter Coffee Fundamentals', 'Deep dive into pour-over, AeroPress, and cold brew methods. Take home your own brew guide.', addDays(now, 28), '11:00', '13:00', 10, 8.00, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'workshop'],
    ];
    events.forEach(([title, desc, date, time, endTime, capacity, price, img, type]) => {
      db.prepare('INSERT INTO events (title, description, date, time, end_time, capacity, price, image_url, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, desc, date, time, endTime, capacity, price, img, type);
    });
  }

  // Seed site settings
  const defaultSettings = [
    ['cafe_name', 'Dar Al-Qahwa'],
    ['cafe_tagline', 'Specialty Coffee · Amman, Jordan'],
    ['cafe_address', '12 Al-Quds Street, Jabal Al-Weibdeh, Amman 11183'],
    ['cafe_phone', '+962 6 461 0099'],
    ['cafe_email', 'hello@daralqahwa.jo'],
    ['cafe_hours_weekday', '7:30 am – 11:00 pm'],
    ['cafe_hours_weekend', '8:00 am – midnight'],
    ['loyalty_stamps_required', '9'],
    ['primary_color', '#8B5E3C'],
    ['instagram_url', 'https://instagram.com'],
    ['facebook_url', 'https://facebook.com'],
    ['whatsapp_number', '+96264610099'],
    ['lang', 'en'],
  ];
  defaultSettings.forEach(([key, value]) => {
    const exists = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
    if (!exists) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
  });

  console.log('✅ Database initialized');
  if (callback) callback();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

module.exports = { getDB, initDB };
