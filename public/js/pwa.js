/* ═══════════════════════════════════════
   DAR AL-QAHWA — PWA LAYER
   ═══════════════════════════════════════ */

const PWA = {
  swRegistration: null,
  deferredInstallPrompt: null,
  isInstalled: false,

  // ── SERVICE WORKER ──
  async registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      PWA.swRegistration = reg;
      console.log('✅ SW registered');

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            PWA.showUpdateBanner();
          }
        });
      });
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  },

  // ── INSTALL PROMPT ──
  initInstallPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      PWA.isInstalled = true;
      return;
    }

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      PWA.deferredInstallPrompt = e;
      // Show install banner after 30 seconds or on second page view
      const views = parseInt(sessionStorage.getItem('daq_views') || '0') + 1;
      sessionStorage.setItem('daq_views', views);
      if (views >= 2 && !localStorage.getItem('daq_install_dismissed')) {
        setTimeout(() => PWA.showInstallBanner(), 3000);
      }
    });

    window.addEventListener('appinstalled', () => {
      PWA.isInstalled = true;
      PWA.hideInstallBanner();
      Toast.show('App installed! Find it on your home screen 🎉', 'success', 5000);
      localStorage.setItem('daq_installed', '1');
    });
  },

  showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-banner';
    banner.innerHTML = `
      <div class="pwa-banner-left">
        <img src="/icons/icon-72.png" alt="App icon" class="pwa-banner-icon"/>
        <div>
          <p class="pwa-banner-title">Add to Home Screen</p>
          <p class="pwa-banner-sub">Install for the full app experience</p>
        </div>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-install-btn" onclick="PWA.triggerInstall()">Install</button>
        <button class="pwa-dismiss-btn" onclick="PWA.dismissInstall()">✕</button>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));
  },

  hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  },

  async triggerInstall() {
    if (!PWA.deferredInstallPrompt) return;
    PWA.deferredInstallPrompt.prompt();
    const { outcome } = await PWA.deferredInstallPrompt.userChoice;
    PWA.deferredInstallPrompt = null;
    PWA.hideInstallBanner();
    if (outcome === 'accepted') {
      Toast.show('Installing app...', 'success');
    }
  },

  dismissInstall() {
    PWA.hideInstallBanner();
    localStorage.setItem('daq_install_dismissed', '1');
  },

  // ── UPDATE BANNER ──
  showUpdateBanner() {
    if (document.getElementById('pwa-update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.className = 'pwa-banner pwa-update';
    banner.innerHTML = `
      <p style="font-size:.85rem">🔄 A new version is available!</p>
      <button class="pwa-install-btn" onclick="PWA.applyUpdate()">Update Now</button>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));
  },

  applyUpdate() {
    if (PWA.swRegistration?.waiting) {
      PWA.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  },

  // ── OFFLINE DETECTION ──
  initOfflineDetection() {
    const show = () => {
      if (document.getElementById('offline-banner')) return;
      const el = document.createElement('div');
      el.id = 'offline-banner';
      el.className = 'offline-banner';
      el.innerHTML = '📡 You\'re offline — showing cached content';
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
    };
    const hide = () => {
      const el = document.getElementById('offline-banner');
      if (!el) return;
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 400);
      Toast.show('Back online ✓', 'success');
    };
    window.addEventListener('online', hide);
    window.addEventListener('offline', show);
    if (!navigator.onLine) show();
  },

  // ── MOBILE BOTTOM NAV ──
  initBottomNav() {
    if (window.innerWidth > 768) return; // desktop: skip
    if (document.getElementById('bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    nav.innerHTML = `
      <button class="bn-item" data-path="/" onclick="Router.go('/')">
        <span class="bn-icon">🏠</span>
        <span class="bn-label">Home</span>
      </button>
      <button class="bn-item" data-path="/menu" onclick="Router.go('/menu')">
        <span class="bn-icon">☕</span>
        <span class="bn-label">Menu</span>
      </button>
      <button class="bn-item bn-center" onclick="Cart.open()">
        <span class="bn-icon">🛒</span>
        <span class="bn-label">Order</span>
        <span class="bn-badge" id="bn-badge" style="display:none">0</span>
      </button>
      <button class="bn-item" data-path="/loyalty" onclick="Router.go('/loyalty')">
        <span class="bn-icon">⭐</span>
        <span class="bn-label">Loyalty</span>
      </button>
      <button class="bn-item" data-path="/reserve" onclick="Router.go('/reserve')">
        <span class="bn-icon">📅</span>
        <span class="bn-label">Reserve</span>
      </button>
    `;
    document.body.appendChild(nav);

    // Add bottom padding to app so content isn't hidden behind nav
    document.getElementById('app').style.paddingBottom = '72px';
  },

  updateBottomNav() {
    const path = location.pathname;
    document.querySelectorAll('.bn-item[data-path]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.path === path);
    });
  },

  updateCartBadge(count) {
    // Update both top nav and bottom nav badges
    const topBadge = document.getElementById('cart-badge');
    const bnBadge = document.getElementById('bn-badge');
    if (topBadge) topBadge.textContent = count;
    if (bnBadge) {
      bnBadge.textContent = count;
      bnBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  // ── TOUCH GESTURES ──
  initTouchGestures() {
    // Swipe down to close cart
    const cart = document.getElementById('cart-sidebar');
    if (!cart) return;

    let startY = 0, startX = 0;
    cart.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    }, { passive: true });

    cart.addEventListener('touchmove', e => {
      const dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      // Right swipe to close (sidebar is on right)
      if (Math.abs(dx) > Math.abs(dy) && dx > 50) {
        Cart.close();
      }
    }, { passive: true });

    // Swipe right from left edge to open cart (mobile gesture)
    document.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Left-edge swipe right = open cart
      if (startX < 20 && dx > 80 && Math.abs(dy) < 60) {
        Cart.open();
      }
    }, { passive: true });
  },

  // ── HAPTIC FEEDBACK ──
  vibrate(pattern = [10]) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  },

  // ── SHARE API ──
  async share(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch(e) { return false; }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      Toast.show('Link copied to clipboard!', 'success');
      return true;
    } catch { return false; }
  },

  // ── INIT ALL ──
  init() {
    PWA.registerSW();
    PWA.initInstallPrompt();
    PWA.initOfflineDetection();

    // Init bottom nav on mobile
    if (window.innerWidth <= 768) {
      PWA.initBottomNav();
      PWA.initTouchGestures();
    }

    // Re-init bottom nav on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && !document.getElementById('bottom-nav')) {
        PWA.initBottomNav();
        PWA.initTouchGestures();
      }
    });

    // Update nav active state on route change
    const origResolve = Router.resolve.bind(Router);
    Router.resolve = function() {
      origResolve();
      PWA.updateBottomNav();
    };
  }
};
