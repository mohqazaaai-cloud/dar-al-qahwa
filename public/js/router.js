const Router = (() => {
  const routes = {};

  function match(path) {
    for (const pattern in routes) {
      const keys = [];
      const regex = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
      const m = path.match(regex);
      if (m) {
        const params = {};
        keys.forEach((k, i) => params[k] = m[i + 1]);
        return { handler: routes[pattern], params };
      }
    }
    return null;
  }

  return {
    register(pattern, handler) { routes[pattern] = handler; },

    go(path) {
      history.pushState({}, '', path);
      Router.resolve();
      window.scrollTo(0, 0);
    },

    resolve() {
      const path = location.pathname || '/';
      const app = document.getElementById('app');
      if (!app) return;

      // Auth guard for admin
      if (path.startsWith('/admin') && !Auth.isLoggedIn()) {
        Router.go('/login');
        return;
      }

      const found = match(path);
      if (found) {
        try {
          found.handler(found.params);
        } catch(e) {
          console.error('Route error:', e);
          app.innerHTML = `<div style="padding:3rem;text-align:center;color:#c0392b">
            <h2>Something went wrong</h2><p style="margin-top:1rem">${e.message}</p>
            <button class="btn-primary" style="margin-top:1.5rem" onclick="Router.go('/')">Go Home</button>
          </div>`;
        }
      } else {
        app.innerHTML = `<div style="padding:5rem;text-align:center">
          <h1 class="serif" style="font-size:2rem">Page not found</h1>
          <p style="color:#6b6158;margin-top:1rem">Let's go back home.</p><br>
          <button class="btn-primary" onclick="Router.go('/')">Home</button>
        </div>`;
      }

      // Update nav active state
      if (typeof App !== 'undefined') App.renderNav();
    }
  };
})();

const Auth = {
  isLoggedIn: () => !!localStorage.getItem('daq_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('daq_user') || 'null'); } catch { return null; } },
  isAdmin: () => Auth.getUser()?.role === 'admin',
  login(token, user) {
    localStorage.setItem('daq_token', token);
    localStorage.setItem('daq_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('daq_token');
    localStorage.removeItem('daq_user');
    App.renderNav();
    Router.go('/');
  }
};

/* ── GLOBAL HELPERS ── */
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function renderFooterHTML() {
  return `<footer><div class="footer-bottom" style="padding:1.5rem 2.5rem;border-top:.5px solid var(--border)"><span>© 2025 Dar Al-Qahwa</span><div style="display:flex;gap:1.25rem"><span onclick="Router.go('/')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Home</span><span onclick="Router.go('/menu')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Menu</span></div></div></footer>`;
}

function openWhatsApp() {
  const num = (App._settings?.whatsapp_number || '+96264610099').replace(/\D/g,'');
  const msg = encodeURIComponent("Hello! I'd like to get in touch with Dar Al-Qahwa.");
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
}
