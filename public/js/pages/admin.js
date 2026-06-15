function renderAdminPage() {
  const user = Auth.getUser();
  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <p class="admin-sidebar-title">Dashboard</p>
        <div class="admin-nav-item active" onclick="adminTab('overview', this)"><span class="icon">📊</span> Overview</div>
        <p class="admin-sidebar-title">Operations</p>
        <div class="admin-nav-item" onclick="adminTab('orders', this)"><span class="icon">🧾</span> Orders</div>
        <div class="admin-nav-item" onclick="adminTab('reservations', this)"><span class="icon">📅</span> Reservations</div>
        <p class="admin-sidebar-title">Customer</p>
        <div class="admin-nav-item" onclick="adminTab('loyalty', this)"><span class="icon">⭐</span> Loyalty</div>
        <div class="admin-nav-item" onclick="adminTab('events', this)"><span class="icon">🎪</span> Events</div>
        <div class="admin-nav-item" onclick="adminTab('newsletter', this)"><span class="icon">✉️</span> Newsletter</div>
        <p class="admin-sidebar-title">Content</p>
        <div class="admin-nav-item" onclick="adminTab('menu', this)"><span class="icon">☕</span> Menu Items</div>
        <div class="admin-nav-item" onclick="adminTab('gallery', this)"><span class="icon">🖼️</span> Gallery</div>
        ${user?.role === 'admin' ? `
        <p class="admin-sidebar-title">Admin</p>
        <div class="admin-nav-item" onclick="adminTab('users', this)"><span class="icon">👥</span> Staff Users</div>
        <div class="admin-nav-item" onclick="adminTab('shifts', this)"><span class="icon">🕐</span> Shifts</div>
        <div class="admin-nav-item" onclick="adminTab('settings', this)"><span class="icon">⚙️</span> Settings</div>
        <p class="admin-sidebar-title">Tools</p>
        <div class="admin-nav-item" onclick="Router.go('/qr')"><span class="icon">📱</span> QR Menu</div>
        ` : ''}
      </aside>
      <main class="admin-content" id="admin-main">
        <div class="loading-block"><div class="spinner"></div></div>
      </main>
    </div>
  `;
  loadAdminOverview();
}

function adminTab(tab, el) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  const fns = {
    overview: loadAdminOverview, orders: loadAdminOrders,
    reservations: loadAdminReservations, menu: loadAdminMenu,
    newsletter: loadAdminNewsletter, users: loadAdminUsers,
    loyalty: loadAdminLoyalty, events: loadAdminEvents,
    gallery: loadAdminGallery, shifts: loadAdminShifts,
    settings: loadAdminSettings,
  };
  if (fns[tab]) fns[tab]();
}

// ── OVERVIEW ──────────────────────────────────────────
async function loadAdminOverview() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `<h2 class="serif">Overview</h2><div class="loading-block"><div class="spinner"></div></div>`;
  try {
    const s = await api.getStats();
    main.innerHTML = `
      <h2 class="serif">Overview</h2>
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="label">Revenue today</div>
          <div class="value">${s.revenue.today.toFixed(2)} JD</div>
          <div class="sub">Total: ${s.revenue.total.toFixed(2)} JD</div>
        </div>
        <div class="stat-card">
          <div class="label">Orders today</div>
          <div class="value">${s.orders.today}</div>
          <div class="sub">${s.orders.pending} pending · ${s.orders.total} total</div>
        </div>
        <div class="stat-card">
          <div class="label">Reservations today</div>
          <div class="value">${s.reservations.today}</div>
          <div class="sub">${s.reservations.pending} pending · ${s.reservations.total} total</div>
        </div>
        <div class="stat-card">
          <div class="label">Newsletter subs</div>
          <div class="value">${s.newsletter}</div>
          <div class="sub">${s.menuItems} active menu items</div>
        </div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header"><h3>Top Items</h3></div>
        <table><thead><tr><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>
          ${s.topItems.length ? s.topItems.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${parseFloat(i.revenue).toFixed(2)} JD</td></tr>`).join('') : '<tr><td colspan="3" style="color:var(--text-sec);text-align:center;padding:2rem">No orders yet</td></tr>'}
        </tbody></table>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header"><h3>Revenue Last 7 Days</h3></div>
        <table><thead><tr><th>Date</th><th>Revenue</th></tr></thead><tbody>
          ${s.revenueChart.length ? s.revenueChart.map(r => `<tr><td>${r.day}</td><td>${parseFloat(r.total).toFixed(2)} JD</td></tr>`).join('') : '<tr><td colspan="2" style="color:var(--text-sec);text-align:center;padding:2rem">No revenue data yet</td></tr>'}
        </tbody></table>
      </div>`;
  } catch (err) { main.innerHTML = `<p style="color:var(--red)">${err.message}</p>`; }
}

// ── ORDERS ──────────────────────────────────────────
async function loadAdminOrders() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Orders</h2>
      <select id="order-status-filter" onchange="filterOrders()" style="width:auto;padding:.5rem 1rem">
        <option value="">All statuses</option>
        <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option><option value="ready">Ready</option>
        <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
      </select>
    </div>
    <div id="orders-table-wrap" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadOrdersTable();
}

async function loadOrdersTable(status = '') {
  const wrap = document.getElementById('orders-table-wrap');
  try {
    const orders = await api.getOrders(status ? { status } : {});
    if (!orders.length) { wrap.innerHTML = `<p style="padding:2rem;color:var(--text-sec);text-align:center">No orders found.</p>`; return; }
    wrap.innerHTML = `<table>
      <thead><tr><th>Order #</th><th>Customer</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td><strong>${o.order_number}</strong></td><td>${o.customer_name}</td><td>${o.table_number || '—'}</td>
        <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td><td>${o.total.toFixed(2)} JD</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td style="font-size:.75rem;color:var(--text-sec)">${timeAgo(o.created_at)}</td>
        <td><select style="width:auto;padding:.3rem .5rem;font-size:.75rem" onchange="updateOrder(${o.id}, this.value)">
          <option value="">Update...</option><option value="confirmed">Confirm</option>
          <option value="preparing">Preparing</option><option value="ready">Ready</option>
          <option value="completed">Complete</option><option value="cancelled">Cancel</option>
        </select></td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function filterOrders() { loadOrdersTable(document.getElementById('order-status-filter').value); }
async function updateOrder(id, status) {
  if (!status) return;
  try { await api.updateOrderStatus(id, status); Toast.show('Order updated', 'success'); filterOrders(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── RESERVATIONS ──────────────────────────────────────────
async function loadAdminReservations() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Reservations</h2>
      <div style="display:flex;gap:.75rem;align-items:center">
        <input type="date" id="res-date-filter" style="width:auto" onchange="filterReservations()"/>
        <select id="res-status-filter" onchange="filterReservations()" style="width:auto;padding:.5rem 1rem">
          <option value="">All</option><option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
    <div id="res-table-wrap" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadReservationsTable();
}

async function loadReservationsTable() {
  const wrap = document.getElementById('res-table-wrap');
  const date = document.getElementById('res-date-filter')?.value || '';
  const status = document.getElementById('res-status-filter')?.value || '';
  try {
    const params = {};
    if (date) params.date = date;
    if (status) params.status = status;
    const reservations = await api.getReservations(params);
    if (!reservations.length) { wrap.innerHTML = `<p style="padding:2rem;color:var(--text-sec);text-align:center">No reservations found.</p>`; return; }
    wrap.innerHTML = `<table>
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
      <tbody>${reservations.map(r => `<tr>
        <td>${r.id}</td><td><strong>${r.name}</strong></td><td style="font-size:.78rem">${r.email}</td>
        <td>${r.date}</td><td>${formatTime(r.time)}</td><td>${r.guests}</td>
        <td><span class="badge badge-${r.status}">${r.status}</span></td>
        <td style="font-size:.75rem;color:var(--text-sec);max-width:120px;overflow:hidden;text-overflow:ellipsis">${r.notes || '—'}</td>
        <td><select style="width:auto;padding:.3rem .5rem;font-size:.75rem" onchange="updateReservation(${r.id}, this.value)">
          <option value="">Update...</option><option value="confirmed">Confirm</option>
          <option value="completed">Complete</option><option value="cancelled">Cancel</option>
        </select></td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function filterReservations() { loadReservationsTable(); }
async function updateReservation(id, status) {
  if (!status) return;
  try { await api.updateReservationStatus(id, status); Toast.show('Reservation updated', 'success'); loadReservationsTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── MENU MANAGEMENT ──────────────────────────────────────
async function loadAdminMenu() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Menu Items</h2>
      <button class="btn-primary btn-sm" onclick="showMenuItemForm()">+ Add Item</button>
    </div>
    <div id="menu-item-form-wrap"></div>
    <div id="menu-items-table" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadMenuItemsTable();
}

async function loadMenuItemsTable() {
  const wrap = document.getElementById('menu-items-table');
  try {
    const [items, cats] = await Promise.all([api.getMenuItems(), api.getCategories()]);
    wrap.innerHTML = `<table>
      <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
      <tbody>${items.map(item => `<tr>
        <td><strong>${item.name}</strong><br><span style="font-size:.75rem;color:var(--text-sec)">${(item.description||'').substring(0,50)}${item.description?.length > 50 ? '…' : ''}</span></td>
        <td>${item.category_name || '—'}</td><td>${item.price.toFixed(2)} JD</td>
        <td><span class="badge ${item.available ? 'badge-confirmed' : 'badge-cancelled'}">${item.available ? 'Yes' : 'No'}</span></td>
        <td style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn-ghost btn-sm" onclick='editMenuItem(${JSON.stringify(item).replace(/'/g,"&apos;")})'>Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteMenuItem(${item.id}, '${item.name.replace(/'/g,"\\'")}')">Delete</button>
        </td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

async function showMenuItemForm(item = null) {
  const cats = await api.getCategories();
  const isEdit = !!item;
  document.getElementById('menu-item-form-wrap').innerHTML = `
    <div class="admin-form" style="margin-bottom:1.5rem">
      <h3>${isEdit ? 'Edit' : 'Add'} Menu Item</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div class="form-group"><label>Name *</label><input id="mi-name" value="${item?.name || ''}" placeholder="Cardamom Latte"/></div>
        <div class="form-group"><label>Category</label>
          <select id="mi-cat">${cats.map(c => `<option value="${c.id}" ${item?.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Price (JD) *</label><input id="mi-price" type="number" step="0.01" value="${item?.price || ''}" placeholder="4.50"/></div>
        <div class="form-group"><label>Available</label>
          <select id="mi-available"><option value="1" ${!item || item.available ? 'selected' : ''}>Yes</option><option value="0" ${item && !item.available ? 'selected' : ''}>No</option></select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:1rem"><label>Description</label><textarea id="mi-desc" rows="2">${item?.description || ''}</textarea></div>
      <div class="form-group" style="margin-bottom:1rem"><label>Image URL</label><input id="mi-img" value="${item?.image_url || ''}" placeholder="https://..."/></div>
      <div style="display:flex;gap:.75rem">
        <button class="btn-primary btn-sm" onclick="saveMenuItem(${item?.id || 'null'})">Save Item</button>
        <button class="btn-ghost btn-sm" onclick="document.getElementById('menu-item-form-wrap').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

function editMenuItem(item) { showMenuItemForm(item); }
async function saveMenuItem(id) {
  const data = { name: document.getElementById('mi-name').value.trim(), category_id: document.getElementById('mi-cat').value, price: parseFloat(document.getElementById('mi-price').value), description: document.getElementById('mi-desc').value.trim(), image_url: document.getElementById('mi-img').value.trim(), available: parseInt(document.getElementById('mi-available').value) };
  if (!data.name || !data.price) { Toast.show('Name and price required', 'error'); return; }
  try {
    if (id) { await api.updateMenuItem(id, data); Toast.show('Item updated', 'success'); }
    else { await api.createMenuItem(data); Toast.show('Item created', 'success'); }
    document.getElementById('menu-item-form-wrap').innerHTML = '';
    loadMenuItemsTable();
  } catch (err) { Toast.show(err.message, 'error'); }
}
async function deleteMenuItem(id, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  try { await api.deleteMenuItem(id); Toast.show('Item deleted', 'success'); loadMenuItemsTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── LOYALTY ADMIN ──────────────────────────────────────────
async function loadAdminLoyalty() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Loyalty Members</h2>
      <div style="display:flex;gap:.75rem">
        <input id="ly-search-email" placeholder="Search by email..." style="width:auto;padding:.5rem 1rem" oninput="searchLoyalty(this.value)"/>
        <button class="btn-primary btn-sm" onclick="showStampModal()">Add Stamp</button>
      </div>
    </div>
    <div id="loyalty-form-wrap"></div>
    <div id="loyalty-table-wrap" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadLoyaltyTable();
}

let _allLoyaltyMembers = [];
async function loadLoyaltyTable() {
  const wrap = document.getElementById('loyalty-table-wrap');
  try {
    const { members, stamps_required } = await api.getLoyaltyMembers();
    _allLoyaltyMembers = members;
    renderLoyaltyTable(members, stamps_required);
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function renderLoyaltyTable(members, stampsReq) {
  const wrap = document.getElementById('loyalty-table-wrap');
  if (!members.length) { wrap.innerHTML = `<p style="padding:2rem;color:var(--text-sec);text-align:center">No loyalty members yet.</p>`; return; }
  wrap.innerHTML = `<table>
    <thead><tr><th>Name</th><th>Email</th><th>Stamps</th><th>Free Drinks</th><th>Visits</th><th>Joined</th><th>Actions</th></tr></thead>
    <tbody>${members.map(m => `<tr>
      <td><strong>${m.name}</strong></td><td style="font-size:.82rem">${m.email}</td>
      <td><div style="display:flex;align-items:center;gap:.5rem"><span>${m.stamps}/${stampsReq}</span><div style="width:60px;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.min(m.stamps/stampsReq*100,100)}%;background:var(--brown)"></div></div></div></td>
      <td>${m.free_drinks > 0 ? `<span class="badge badge-confirmed">🎁 ${m.free_drinks} free</span>` : '—'}</td>
      <td>${m.total_visits}</td>
      <td style="font-size:.75rem;color:var(--text-sec)">${new Date(m.joined_at).toLocaleDateString()}</td>
      <td style="display:flex;gap:.4rem">
        <button class="btn-primary btn-sm" onclick="addStampTo(${m.id}, '${m.name.replace(/'/g,"\\'")}')">+Stamp</button>
        ${m.free_drinks > 0 ? `<button class="btn-ghost btn-sm" onclick="redeemDrink(${m.id}, '${m.name.replace(/'/g,"\\'")}')">Redeem</button>` : ''}
      </td></tr>`).join('')}
    </tbody></table>`;
}

function searchLoyalty(val) {
  const filtered = _allLoyaltyMembers.filter(m => m.email.includes(val) || m.name.toLowerCase().includes(val.toLowerCase()));
  renderLoyaltyTable(filtered, 9);
}

function showStampModal() {
  document.getElementById('loyalty-form-wrap').innerHTML = `
    <div class="admin-form" style="margin-bottom:1.5rem">
      <h3>Add Stamp by Email</h3>
      <div style="display:flex;gap:1rem;align-items:flex-end">
        <div class="form-group" style="flex:1"><label>Member Email</label><input id="stamp-email" placeholder="member@email.com"/></div>
        <div class="form-group" style="width:100px"><label>Stamps</label><input id="stamp-count" type="number" value="1" min="1" max="9"/></div>
        <button class="btn-primary btn-sm" onclick="stampByEmail()">Add</button>
        <button class="btn-ghost btn-sm" onclick="document.getElementById('loyalty-form-wrap').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

async function stampByEmail() {
  const email = document.getElementById('stamp-email').value.trim();
  const count = parseInt(document.getElementById('stamp-count').value) || 1;
  try {
    const member = await api.loyaltyLookup(email);
    const res = await api.loyaltyStamp(member.id, { stamps_added: count });
    Toast.show(`${count} stamp${count > 1 ? 's' : ''} added for ${member.name}${res.new_free_drink ? ' 🎁 Free drink earned!' : ''}`, 'success');
    document.getElementById('loyalty-form-wrap').innerHTML = '';
    loadLoyaltyTable();
  } catch (err) { Toast.show(err.message, 'error'); }
}

async function addStampTo(id, name) {
  try {
    const res = await api.loyaltyStamp(id, { stamps_added: 1 });
    Toast.show(`Stamp added for ${name}${res.new_free_drink ? ' 🎁 Free drink earned!' : ''}`, 'success');
    loadLoyaltyTable();
  } catch (err) { Toast.show(err.message, 'error'); }
}

async function redeemDrink(id, name) {
  if (!confirm(`Redeem 1 free drink for ${name}?`)) return;
  try { await api.loyaltyRedeem(id); Toast.show(`Free drink redeemed for ${name}`, 'success'); loadLoyaltyTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── EVENTS ADMIN ──────────────────────────────────────────
async function loadAdminEvents() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Events</h2>
      <button class="btn-primary btn-sm" onclick="showEventForm()">+ Add Event</button>
    </div>
    <div id="event-form-wrap"></div>
    <div id="events-admin-table" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadEventsTable();
}

async function loadEventsTable() {
  const wrap = document.getElementById('events-admin-table');
  try {
    const events = await api.getEvents('');
    if (!events.length) { wrap.innerHTML = `<p style="padding:2rem;text-align:center;color:var(--text-sec)">No events yet.</p>`; return; }
    wrap.innerHTML = `<table>
      <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Type</th><th>Capacity</th><th>Booked</th><th>Price</th><th>Actions</th></tr></thead>
      <tbody>${events.map(ev => `<tr>
        <td><strong>${ev.title}</strong></td><td>${ev.date}</td><td>${formatTime(ev.time)}</td>
        <td><span class="badge badge-confirmed">${ev.type}</span></td>
        <td>${ev.capacity}</td><td>${ev.spots_taken}</td>
        <td>${ev.price > 0 ? ev.price.toFixed(2) + ' JD' : 'Free'}</td>
        <td style="display:flex;gap:.4rem">
          <button class="btn-ghost btn-sm" onclick="viewEventBookings(${ev.id},'${ev.title.replace(/'/g,"\\'")}')">Bookings</button>
          <button class="btn-danger btn-sm" onclick="deleteEvent(${ev.id})">Delete</button>
        </td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function showEventForm() {
  document.getElementById('event-form-wrap').innerHTML = `
    <div class="admin-form" style="margin-bottom:1.5rem">
      <h3>Add Event</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div class="form-group"><label>Title *</label><input id="ev-title" placeholder="Monthly Cupping"/></div>
        <div class="form-group"><label>Type</label><select id="ev-type"><option value="event">Event</option><option value="workshop">Workshop</option><option value="cupping">Cupping</option></select></div>
        <div class="form-group"><label>Date *</label><input id="ev-date" type="date"/></div>
        <div class="form-group"><label>Start Time</label><input id="ev-time" type="time" value="10:00"/></div>
        <div class="form-group"><label>End Time</label><input id="ev-end" type="time" value="12:00"/></div>
        <div class="form-group"><label>Capacity</label><input id="ev-cap" type="number" value="20"/></div>
        <div class="form-group"><label>Price (JD, 0 = free)</label><input id="ev-price" type="number" step="0.01" value="0"/></div>
        <div class="form-group"><label>Image URL</label><input id="ev-img" placeholder="https://..."/></div>
      </div>
      <div class="form-group" style="margin-bottom:1rem"><label>Description</label><textarea id="ev-desc" rows="3"></textarea></div>
      <div style="display:flex;gap:.75rem">
        <button class="btn-primary btn-sm" onclick="saveEvent()">Save Event</button>
        <button class="btn-ghost btn-sm" onclick="document.getElementById('event-form-wrap').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

async function saveEvent() {
  const data = { title: document.getElementById('ev-title').value.trim(), type: document.getElementById('ev-type').value, date: document.getElementById('ev-date').value, time: document.getElementById('ev-time').value, end_time: document.getElementById('ev-end').value, capacity: parseInt(document.getElementById('ev-cap').value)||20, price: parseFloat(document.getElementById('ev-price').value)||0, image_url: document.getElementById('ev-img').value.trim(), description: document.getElementById('ev-desc').value.trim() };
  if (!data.title || !data.date) { Toast.show('Title and date required', 'error'); return; }
  try { await api.createEvent(data); Toast.show('Event created', 'success'); document.getElementById('event-form-wrap').innerHTML = ''; loadEventsTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event and all bookings?')) return;
  try { await api.deleteEvent(id); Toast.show('Event deleted', 'success'); loadEventsTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

async function viewEventBookings(id, title) {
  try {
    const bookings = await api.getEventBookings(id);
    const main = document.getElementById('admin-main');
    main.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
        <button class="btn-ghost btn-sm" onclick="loadAdminEvents()">← Back</button>
        <h2 class="serif" style="margin:0">Bookings: ${title}</h2>
      </div>
      <div class="admin-table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Guests</th><th>Notes</th><th>Booked</th></tr></thead>
        <tbody>${bookings.length ? bookings.map(b => `<tr><td>${b.name}</td><td>${b.email}</td><td>${b.guests}</td><td style="font-size:.78rem">${b.notes||'—'}</td><td style="font-size:.75rem;color:var(--text-sec)">${new Date(b.created_at).toLocaleDateString()}</td></tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-sec)">No bookings yet</td></tr>'}
        </tbody></table></div>`;
  } catch (err) { Toast.show(err.message, 'error'); }
}

// ── GALLERY ADMIN ──────────────────────────────────────────
async function loadAdminGallery() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Gallery</h2>
      <button class="btn-primary btn-sm" onclick="showGalleryForm()">+ Add Photo</button>
    </div>
    <div id="gallery-form-wrap"></div>
    <div id="gallery-admin-table" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadGalleryTable();
}

async function loadGalleryTable() {
  const wrap = document.getElementById('gallery-admin-table');
  try {
    const items = await api.getGallery();
    wrap.innerHTML = `<table>
      <thead><tr><th>Preview</th><th>Title</th><th>Caption</th><th>Category</th><th>Actions</th></tr></thead>
      <tbody>${items.map(item => `<tr>
        <td><img src="${item.image_url}" style="width:60px;height:45px;object-fit:cover;border-radius:4px"/></td>
        <td>${item.title||'—'}</td><td style="font-size:.78rem;color:var(--text-sec)">${item.caption||'—'}</td>
        <td><span class="badge badge-confirmed">${item.category}</span></td>
        <td><button class="btn-danger btn-sm" onclick="deleteGalleryItem(${item.id})">Delete</button></td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function showGalleryForm() {
  document.getElementById('gallery-form-wrap').innerHTML = `
    <div class="admin-form" style="margin-bottom:1.5rem">
      <h3>Add Photo</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div class="form-group"><label>Title</label><input id="gi-title" placeholder="Morning Light"/></div>
        <div class="form-group"><label>Category</label>
          <select id="gi-cat"><option value="interior">Interior</option><option value="drinks">Drinks</option><option value="food">Food</option><option value="brewing">Brewing</option><option value="general">General</option></select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:1rem"><label>Image URL *</label><input id="gi-url" placeholder="https://images.unsplash.com/..."/></div>
      <div class="form-group" style="margin-bottom:1rem"><label>Caption</label><input id="gi-cap" placeholder="A short description..."/></div>
      <div style="display:flex;gap:.75rem">
        <button class="btn-primary btn-sm" onclick="saveGalleryItem()">Add Photo</button>
        <button class="btn-ghost btn-sm" onclick="document.getElementById('gallery-form-wrap').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

async function saveGalleryItem() {
  const url = document.getElementById('gi-url').value.trim();
  if (!url) { Toast.show('Image URL required', 'error'); return; }
  try {
    await api.addGalleryItem({ title: document.getElementById('gi-title').value.trim(), caption: document.getElementById('gi-cap').value.trim(), image_url: url, category: document.getElementById('gi-cat').value });
    Toast.show('Photo added', 'success');
    document.getElementById('gallery-form-wrap').innerHTML = '';
    loadGalleryTable();
  } catch (err) { Toast.show(err.message, 'error'); }
}

async function deleteGalleryItem(id) {
  if (!confirm('Delete this photo?')) return;
  try { await api.deleteGalleryItem(id); Toast.show('Photo deleted', 'success'); loadGalleryTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── NEWSLETTER ──────────────────────────────────────────
async function loadAdminNewsletter() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `<h2 class="serif">Newsletter Subscribers</h2><div class="loading-block"><div class="spinner"></div></div>`;
  try {
    const subs = await api.getSubscribers();
    main.innerHTML = `
      <h2 class="serif">Newsletter Subscribers</h2>
      <p style="color:var(--text-sec);margin-bottom:1.5rem;font-size:.88rem">${subs.length} subscriber${subs.length !== 1 ? 's' : ''}</p>
      <div class="admin-table-wrap"><table>
        <thead><tr><th>#</th><th>Email</th><th>Subscribed</th></tr></thead>
        <tbody>${subs.length ? subs.map(s => `<tr><td>${s.id}</td><td>${s.email}</td><td style="font-size:.78rem;color:var(--text-sec)">${new Date(s.subscribed_at).toLocaleDateString()}</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-sec)">No subscribers yet</td></tr>'}
        </tbody></table></div>`;
  } catch (err) { main.innerHTML = `<p style="color:var(--red)">${err.message}</p>`; }
}

// ── STAFF SHIFTS ──────────────────────────────────────────
async function loadAdminShifts() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Staff Shifts</h2>
      <input type="date" id="shift-date-filter" style="width:auto" onchange="filterShifts()"/>
    </div>
    <div id="shifts-table" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadShiftsTable();
}

async function loadShiftsTable() {
  const wrap = document.getElementById('shifts-table');
  const date = document.getElementById('shift-date-filter')?.value || '';
  try {
    const shifts = await api.getAllShifts(date ? { date } : {});
    if (!shifts.length) { wrap.innerHTML = `<p style="padding:2rem;text-align:center;color:var(--text-sec)">No shifts recorded.</p>`; return; }
    wrap.innerHTML = `<table>
      <thead><tr><th>Staff</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Break</th><th>Hours</th><th>Notes</th></tr></thead>
      <tbody>${shifts.map(s => {
        let hours = '—';
        if (s.clock_in && s.clock_out) {
          const mins = Math.floor((new Date(s.clock_out) - new Date(s.clock_in)) / 60000) - (s.break_minutes||0);
          hours = (mins / 60).toFixed(2) + ' hrs';
        }
        return `<tr>
          <td><strong>${s.user_name||s.user_id}</strong></td><td>${s.date}</td>
          <td>${s.clock_in ? new Date(s.clock_in).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—'}</td>
          <td>${s.clock_out ? new Date(s.clock_out).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '<span style="color:var(--brown)">Active</span>'}</td>
          <td>${s.break_minutes||0} min</td><td>${hours}</td>
          <td style="font-size:.78rem;color:var(--text-sec)">${s.notes||'—'}</td></tr>`;
      }).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}
function filterShifts() { loadShiftsTable(); }

// ── SETTINGS ──────────────────────────────────────────
async function loadAdminSettings() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `<h2 class="serif">Settings</h2><div class="loading-block"><div class="spinner"></div></div>`;
  try {
    const s = await api.getSettings();
    main.innerHTML = `
      <h2 class="serif">Settings</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem">
        <div class="admin-form">
          <h3>Cafe Info</h3>
          <div style="display:flex;flex-direction:column;gap:1rem">
            <div class="form-group"><label>Cafe Name</label><input id="s-name" value="${s.cafe_name||''}"/></div>
            <div class="form-group"><label>Tagline</label><input id="s-tag" value="${s.cafe_tagline||''}"/></div>
            <div class="form-group"><label>Address</label><input id="s-addr" value="${s.cafe_address||''}"/></div>
            <div class="form-group"><label>Phone</label><input id="s-phone" value="${s.cafe_phone||''}"/></div>
            <div class="form-group"><label>Email</label><input id="s-email" value="${s.cafe_email||''}"/></div>
            <div class="form-group"><label>Weekday Hours</label><input id="s-wkday" value="${s.cafe_hours_weekday||''}"/></div>
            <div class="form-group"><label>Weekend Hours</label><input id="s-wkend" value="${s.cafe_hours_weekend||''}"/></div>
          </div>
        </div>
        <div>
          <div class="admin-form">
            <h3>Social & Contact</h3>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <div class="form-group"><label>Instagram URL</label><input id="s-ig" value="${s.instagram_url||''}"/></div>
              <div class="form-group"><label>Facebook URL</label><input id="s-fb" value="${s.facebook_url||''}"/></div>
              <div class="form-group"><label>WhatsApp Number</label><input id="s-wa" value="${s.whatsapp_number||''}"/></div>
            </div>
          </div>
          <div class="admin-form" style="margin-top:1rem">
            <h3>Loyalty Program</h3>
            <div class="form-group"><label>Stamps Required for Free Drink</label><input id="s-stamps" type="number" value="${s.loyalty_stamps_required||9}"/></div>
          </div>
          <div class="admin-form" style="margin-top:1rem">
            <h3>Language</h3>
            <div class="form-group"><label>Default Language</label>
              <select id="s-lang"><option value="en" ${s.lang!=='ar'?'selected':''}>English</option><option value="ar" ${s.lang==='ar'?'selected':''}>العربية</option></select>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:1.5rem">
        <button class="btn-primary" onclick="saveSettings()">Save All Settings</button>
      </div>`;
  } catch (err) { main.innerHTML = `<p style="color:var(--red)">${err.message}</p>`; }
}

async function saveSettings() {
  const data = {
    cafe_name: document.getElementById('s-name').value,
    cafe_tagline: document.getElementById('s-tag').value,
    cafe_address: document.getElementById('s-addr').value,
    cafe_phone: document.getElementById('s-phone').value,
    cafe_email: document.getElementById('s-email').value,
    cafe_hours_weekday: document.getElementById('s-wkday').value,
    cafe_hours_weekend: document.getElementById('s-wkend').value,
    instagram_url: document.getElementById('s-ig').value,
    facebook_url: document.getElementById('s-fb').value,
    whatsapp_number: document.getElementById('s-wa').value,
    loyalty_stamps_required: document.getElementById('s-stamps').value,
    lang: document.getElementById('s-lang').value,
  };
  try {
    await api.saveSettings(data);
    Toast.show('Settings saved!', 'success');
    if (data.lang) Lang.set(data.lang);
  } catch (err) { Toast.show(err.message, 'error'); }
}

// ── USERS ──────────────────────────────────────────
async function loadAdminUsers() {
  const main = document.getElementById('admin-main');
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 class="serif" style="margin:0">Staff Users</h2>
      <button class="btn-primary btn-sm" onclick="showAddUserForm()">+ Add User</button>
    </div>
    <div id="user-form-wrap"></div>
    <div id="users-table-wrap" class="admin-table-wrap"><div class="loading-block"><div class="spinner"></div></div></div>`;
  loadUsersTable();
}

async function loadUsersTable() {
  const wrap = document.getElementById('users-table-wrap');
  try {
    const users = await api.getUsers();
    const me = Auth.getUser();
    wrap.innerHTML = `<table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td><strong>${u.name}</strong> ${u.id === me?.id ? '<span style="font-size:.7rem;color:var(--brown)">(you)</span>' : ''}</td>
        <td style="font-size:.82rem">${u.email}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td style="font-size:.75rem;color:var(--text-sec)">${new Date(u.created_at).toLocaleDateString()}</td>
        <td>${u.id !== me?.id ? `<button class="btn-danger btn-sm" onclick="deleteUser(${u.id}, '${u.name.replace(/'/g,"\\'")}')">Remove</button>` : '—'}</td></tr>`).join('')}
      </tbody></table>`;
  } catch (err) { wrap.innerHTML = `<p style="color:var(--red);padding:1rem">${err.message}</p>`; }
}

function showAddUserForm() {
  document.getElementById('user-form-wrap').innerHTML = `
    <div class="admin-form" style="margin-bottom:1.5rem">
      <h3>Add Staff User</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div class="form-group"><label>Name *</label><input id="u-name" placeholder="Layla Haddad"/></div>
        <div class="form-group"><label>Email *</label><input id="u-email" type="email" placeholder="layla@daralqahwa.jo"/></div>
        <div class="form-group"><label>Password *</label><input id="u-pass" type="password" placeholder="••••••••"/></div>
        <div class="form-group"><label>Role</label><select id="u-role"><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
      </div>
      <div style="display:flex;gap:.75rem">
        <button class="btn-primary btn-sm" onclick="addUser()">Create User</button>
        <button class="btn-ghost btn-sm" onclick="document.getElementById('user-form-wrap').innerHTML=''">Cancel</button>
      </div>
    </div>`;
}

async function addUser() {
  const name = document.getElementById('u-name').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const pass = document.getElementById('u-pass').value;
  const role = document.getElementById('u-role').value;
  if (!name || !email || !pass) { Toast.show('All fields required', 'error'); return; }
  try { await api.register(name, email, pass, role); Toast.show('User created', 'success'); document.getElementById('user-form-wrap').innerHTML = ''; loadUsersTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

async function deleteUser(id, name) {
  if (!confirm(`Remove "${name}"?`)) return;
  try { await api.deleteUser(id); Toast.show('User removed', 'success'); loadUsersTable(); }
  catch (err) { Toast.show(err.message, 'error'); }
}

// ── HELPERS ──────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
