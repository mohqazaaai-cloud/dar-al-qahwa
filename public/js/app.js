const App = {
  _settings: {},

  async loadSettings() {
    try {
      const s = await api.getPublicSettings();
      App._settings = s;
      if (s.cafe_name) document.title = s.cafe_name + ' — Specialty Coffee · Amman';
      if (s.lang) Lang.set(s.lang);
    } catch(e) { /* use defaults */ }
  },

  renderNav() {
    const user = Auth.getUser();
    const isLoggedIn = Auth.isLoggedIn();
    const path = location.pathname;
    const s = App._settings;
    const cafeName = s.cafe_name || 'Dar Al-Qahwa';
    const [first, ...rest] = cafeName.split(' ');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const nav = document.createElement('nav');
    nav.id = 'main-nav';
    nav.innerHTML = `
      <div class="nav-logo" onclick="Router.go('/')">${first}<span> ${rest.join(' ') || 'Al-Qahwa'}</span></div>
      <div class="nav-links">
        <a onclick="Router.go('/')" class="${path==='/'?'active':''}">Home</a>
        <a onclick="Router.go('/menu')" class="${path==='/menu'?'active':''}">Menu</a>
        <a onclick="Router.go('/gallery')" class="${path==='/gallery'?'active':''}">Gallery</a>
        <a onclick="Router.go('/events')" class="${path==='/events'?'active':''}">Events</a>
        <a onclick="Router.go('/loyalty')" class="${path==='/loyalty'?'active':''}">Loyalty</a>
        <a onclick="Router.go('/reserve')" class="${path==='/reserve'?'active':''}">Reserve</a>
        <a onclick="Router.go('/contact')" class="${path==='/contact'?'active':''}">Contact</a>
        ${isLoggedIn ? `
          <div class="nav-user">
            <span>${user?.name||'Staff'}</span>
            <button onclick="Router.go('/admin')">Dashboard</button>
            <button onclick="Auth.logout()">Sign out</button>
          </div>
        ` : `<a onclick="Router.go('/login')" class="${path==='/login'?'active':''}">Login</a>`}
        <button class="dark-toggle" onclick="DarkMode.toggle()" title="Toggle dark mode">${isDark ? '☀️' : '🌙'}</button>
        <button class="lang-toggle" onclick="toggleLang()">${Lang.current==='ar'?'EN':'عربي'}</button>
        <button class="nav-cart" id="nav-cart-btn">
          ☕ Cart <span class="cart-badge" id="cart-badge">0</span>
        </button>
      </div>
    `;

    const existing = document.getElementById('main-nav');
    if (existing) existing.replaceWith(nav);
    else document.body.insertBefore(nav, document.getElementById('app'));

    document.getElementById('nav-cart-btn').onclick = () => Cart.open();
  },

  init() {
    DarkMode.init();
    Lang.init();

    Router.register('/', renderHome);
    Router.register('/menu', renderMenuPage);
    Router.register('/reserve', renderReservePage);
    Router.register('/order/:id', renderOrderConfirm);
    Router.register('/login', renderLoginPage);
    Router.register('/admin', renderAdminPage);
    Router.register('/gallery', renderGalleryPage);
    Router.register('/loyalty', renderLoyaltyPage);
    Router.register('/events', renderEventsPage);
    Router.register('/contact', renderContactPage);
    Router.register('/qr', renderQRPage);

    App.renderNav();
    try { Cart.init(); } catch(e) { console.warn('Cart init:', e); }
    window.addEventListener('popstate', () => Router.resolve());

    const loader = document.getElementById('loading-screen');
    const reveal = () => {
      if (loader) {
        loader.style.transition = 'opacity 0.4s';
        loader.style.opacity = '0';
        setTimeout(() => { loader.remove(); Router.resolve(); }, 400);
      } else {
        Router.resolve();
      }
    };

    App.loadSettings().finally(() => {
      if (document.fonts) {
        document.fonts.ready.then(() => setTimeout(reveal, 800));
      } else {
        setTimeout(reveal, 900);
      }
    });
  }
};

function toggleLang() {
  Lang.set(Lang.current === 'ar' ? 'en' : 'ar');
}

async function renderClockWidget() {
  if (!Auth.isLoggedIn()) return;
  try {
    const status = await api.shiftStatus();
    let widget = document.getElementById('clock-widget');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'clock-widget';
      widget.className = 'clock-widget';
      document.body.appendChild(widget);
    }
    widget.innerHTML = status.clocked_in
      ? `<span>🟢 Since ${new Date(status.shift.clock_in).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
         <button onclick="clockOut()">Clock Out</button>`
      : `<span>⭕ Not clocked in</span><button onclick="clockIn()">Clock In</button>`;
  } catch(e) { /* silent */ }
}

async function clockIn() {
  try { await api.clockIn(); Toast.show('Clocked in ✓', 'success'); renderClockWidget(); }
  catch(e) { Toast.show(e.message, 'error'); }
}

async function clockOut() {
  const mins = prompt('Break time in minutes (0 if none):', '0');
  if (mins === null) return;
  try {
    const res = await api.clockOut({ break_minutes: parseInt(mins)||0 });
    Toast.show(`Clocked out — ${res.hours_worked} hrs worked`, 'success');
    renderClockWidget();
  } catch(e) { Toast.show(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', App.init);
