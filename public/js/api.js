const API_BASE = '/api';

const api = {
  _token: () => localStorage.getItem('daq_token'),
  _headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const t = this._token();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },
  async _req(method, path, body) {
    const opts = { method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },
  // Auth
  login: (email, password) => api._req('POST', '/auth/login', { email, password }),
  register: (name, email, password, role) => api._req('POST', '/auth/register', { name, email, password, role }),
  me: () => api._req('GET', '/auth/me'),
  // Menu
  getMenu: () => api._req('GET', '/menu'),
  getMenuItems: () => api._req('GET', '/menu/items'),
  getCategories: () => api._req('GET', '/menu/categories'),
  createMenuItem: (data) => api._req('POST', '/menu/items', data),
  updateMenuItem: (id, data) => api._req('PUT', `/menu/items/${id}`, data),
  deleteMenuItem: (id) => api._req('DELETE', `/menu/items/${id}`),
  createCategory: (data) => api._req('POST', '/menu/categories', data),
  // Orders
  placeOrder: (data) => api._req('POST', '/orders', data),
  getOrders: (params = {}) => { const q = new URLSearchParams(params).toString(); return api._req('GET', `/orders${q ? '?' + q : ''}`); },
  getOrder: (id) => api._req('GET', `/orders/${id}`),
  updateOrderStatus: (id, status) => api._req('PATCH', `/orders/${id}/status`, { status }),
  deleteOrder: (id) => api._req('DELETE', `/orders/${id}`),
  // Reservations
  makeReservation: (data) => api._req('POST', '/reservations', data),
  getReservations: (params = {}) => { const q = new URLSearchParams(params).toString(); return api._req('GET', `/reservations${q ? '?' + q : ''}`); },
  updateReservationStatus: (id, status) => api._req('PATCH', `/reservations/${id}/status`, { status }),
  deleteReservation: (id) => api._req('DELETE', `/reservations/${id}`),
  // Newsletter
  subscribe: (email) => api._req('POST', '/newsletter', { email }),
  getSubscribers: () => api._req('GET', '/newsletter'),
  // Admin
  getStats: () => api._req('GET', '/admin/stats'),
  getUsers: () => api._req('GET', '/admin/users'),
  updateUserRole: (id, role) => api._req('PATCH', `/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api._req('DELETE', `/admin/users/${id}`),
  // Gallery
  getGallery: (category) => api._req('GET', `/gallery${category ? '?category=' + category : ''}`),
  addGalleryItem: (data) => api._req('POST', '/gallery', data),
  updateGalleryItem: (id, data) => api._req('PUT', `/gallery/${id}`, data),
  deleteGalleryItem: (id) => api._req('DELETE', `/gallery/${id}`),
  // Loyalty
  loyaltyLookup: (email) => api._req('GET', `/loyalty/lookup?email=${encodeURIComponent(email)}`),
  loyaltyJoin: (data) => api._req('POST', '/loyalty/join', data),
  loyaltyStamp: (id, data) => api._req('POST', `/loyalty/${id}/stamp`, data),
  loyaltyRedeem: (id) => api._req('POST', `/loyalty/${id}/redeem`, {}),
  getLoyaltyMembers: () => api._req('GET', '/loyalty'),
  getLoyaltyHistory: (id) => api._req('GET', `/loyalty/${id}/history`),
  // Events
  getEvents: (status) => api._req('GET', `/events${status ? '?status=' + status : ''}`),
  getEvent: (id) => api._req('GET', `/events/${id}`),
  bookEvent: (id, data) => api._req('POST', `/events/${id}/book`, data),
  createEvent: (data) => api._req('POST', '/events', data),
  updateEvent: (id, data) => api._req('PUT', `/events/${id}`, data),
  deleteEvent: (id) => api._req('DELETE', `/events/${id}`),
  getEventBookings: (id) => api._req('GET', `/events/${id}/bookings`),
  // Settings
  getSettings: () => api._req('GET', '/settings'),
  getPublicSettings: () => api._req('GET', '/settings/public'),
  saveSettings: (data) => api._req('POST', '/settings', data),
  // Shifts
  clockIn: () => api._req('POST', '/shifts/clock-in', {}),
  clockOut: (data) => api._req('POST', '/shifts/clock-out', data),
  shiftStatus: () => api._req('GET', '/shifts/status'),
  myShifts: () => api._req('GET', '/shifts/mine'),
  getAllShifts: (params = {}) => { const q = new URLSearchParams(params).toString(); return api._req('GET', `/shifts${q ? '?' + q : ''}`); },
};
