# ☕ Dar Al-Qahwa — Full Stack Cafe App

A complete web application for a specialty cafe in Amman, Jordan.

## Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3, zero setup)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Frontend**: Vanilla JS SPA (no framework, no build step)

## Features
- 🍽️ **Menu API** — Full CRUD for categories and items
- 🧾 **Orders** — Place orders, track status in real time
- 📅 **Reservations** — Book tables, conflict detection
- ✉️ **Newsletter** — Subscribe / unsubscribe
- 🔐 **Auth** — JWT login, admin vs staff roles
- 📊 **Admin Dashboard** — Stats, orders, reservations, menu management, user management

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
# or for auto-reload during dev:
npm run dev
```

### 3. Open the app
```
http://localhost:3000
```

The SQLite database (`cafe.db`) is created automatically on first run with seed data.

## Default Admin Login
```
Email:    admin@daralqahwa.jo
Password: admin123
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/auth/me | Current user (auth required) |

### Menu
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/menu | All categories + items |
| GET | /api/menu/items | Flat item list |
| POST | /api/menu/items | Create item (admin) |
| PUT | /api/menu/items/:id | Update item (admin) |
| DELETE | /api/menu/items/:id | Delete item (admin) |
| GET | /api/menu/categories | List categories |
| POST | /api/menu/categories | Create category (admin) |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/orders | Place an order |
| GET | /api/orders | All orders (auth) |
| GET | /api/orders/:id | Single order |
| PATCH | /api/orders/:id/status | Update status (auth) |
| DELETE | /api/orders/:id | Delete order (admin) |

### Reservations
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/reservations | Book a table |
| GET | /api/reservations | All reservations (auth) |
| PATCH | /api/reservations/:id/status | Update status (auth) |

### Newsletter
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/newsletter | Subscribe |
| GET | /api/newsletter | All subscribers (admin) |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard stats (admin) |
| GET | /api/admin/users | All users (admin) |
| PATCH | /api/admin/users/:id/role | Change role (admin) |
| DELETE | /api/admin/users/:id | Remove user (admin) |

## Project Structure
```
dar-al-qahwa/
├── server.js          # Express entry point
├── db.js              # SQLite init + seed data
├── middleware/
│   └── auth.js        # JWT middleware
├── routes/
│   ├── auth.js
│   ├── menu.js
│   ├── orders.js
│   ├── reservations.js
│   ├── newsletter.js
│   └── admin.js
└── public/            # Frontend SPA
    ├── index.html
    ├── css/main.css
    └── js/
        ├── api.js         # API client
        ├── cart.js        # Cart state
        ├── router.js      # Client router + Auth
        ├── app.js         # Bootstrap
        └── pages/
            ├── home.js
            ├── menu.js
            ├── reserve.js
            ├── order-confirm.js
            ├── login.js
            └── admin.js
```
