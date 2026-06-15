/* ── SCROLL REVEAL ── */
const ScrollReveal = {
  observer: null,
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  },
  observe() {
    if (!this.observer) this.init();
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      this.observer.observe(el);
    });
  }
};

/* ── CURSOR GLOW on hero-right ── */
function initCursorGlow() {
  const heroRight = document.querySelector('.hero-right');
  if (!heroRight) return;
  heroRight.addEventListener('mousemove', e => {
    const rect = heroRight.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
    heroRight.style.setProperty('--mx', x);
    heroRight.style.setProperty('--my', y);
  });
}

/* ── CART ANIMATIONS (replaces hidden class toggle) ── */
const CartAnim = {
  open() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.remove('hidden');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  },
  close() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    setTimeout(() => {
      sidebar.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 400);
  }
};

/* ── CART BADGE BUMP ── */
function bumpCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 400);
}

/* ── ENHANCED TOAST ── */
const Toast = {
  show(msg, type = 'default', duration = 3000) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
};

/* ── PAGE TRANSITION ── */
function animatePageIn() {
  const app = document.getElementById('app');
  app.style.animation = 'none';
  void app.offsetWidth;
  app.style.animation = 'page-in 0.4s ease';
  setTimeout(() => ScrollReveal.observe(), 100);
}

/* ── PARALLAX HERO ON SCROLL ── */
function initParallax() {
  const heroSvg = document.querySelector('.hero-right svg');
  if (!heroSvg) return;
  const onScroll = () => {
    const scrollY = window.scrollY;
    heroSvg.style.transform = `translateY(${scrollY * 0.12}px)`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── NUMBER COUNT UP ANIMATION ── */
function animateCountUp(el, target, suffix = '', duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  const isFloat = target % 1 !== 0;
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * ease;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── INIT ALL ANIMATIONS after page renders ── */
function initPageAnimations() {
  animatePageIn();
  initCursorGlow();
  initParallax();

  // Count up stat numbers on home page
  setTimeout(() => {
    document.querySelectorAll('.stat-num').forEach(el => {
      const text = el.textContent.trim();
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      const suffix = text.replace(/[0-9.]/g, '');
      if (!isNaN(num)) animateCountUp(el, num, suffix);
    });
  }, 300);
}

/* ════════════════════════════════════════
   PHASE 2 ANIMATIONS
   ════════════════════════════════════════ */

/* ── DARK MODE ── */
const DarkMode = {
  current: () => document.documentElement.getAttribute('data-theme') === 'dark',
  toggle() {
    const isDark = DarkMode.current();
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('daq_theme', isDark ? 'light' : 'dark');
    document.querySelectorAll('.dark-toggle').forEach(b => b.textContent = isDark ? '🌙' : '☀️');
  },
  init() {
    const saved = localStorage.getItem('daq_theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
  }
};

/* ── SCROLL PROGRESS BAR ── */
function initScrollProgress() {
  let bar = document.getElementById('scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);
  }
  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = pct.toFixed(1) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ── MAGNETIC BUTTONS ── */
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .nav-cart').forEach(btn => {
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── RIPPLE ON CLICK ── */
function initRipple() {
  document.querySelectorAll('.btn-primary, .btn-ghost, .menu-card, .pick-card').forEach(el => {
    el.classList.add('ripple-container');
    el.addEventListener('click', e => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      el.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  });
}

/* ── CARD 3D TILT ── */
function initTiltCards() {
  document.querySelectorAll('.menu-card, .event-mini-card, .pick-card').forEach(card => {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientY - rect.top  - rect.height / 2) / rect.height * 8;
      const y = (e.clientX - rect.left - rect.width  / 2) / rect.width  * -8;
      card.style.transform = `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── TEXT SCRAMBLE EFFECT ── */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوياéèêàùôîABCDEFGHIJK!@#$%';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to   = newText[i] || '';
      const start = Math.floor(Math.random() * 15);
      const end   = start + Math.floor(Math.random() * 15);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let out = '', complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) { complete++; out += to; }
      else if (this.frame >= start) {
        if (!char || Math.random() < .28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        out += `<span style="color:var(--brown);opacity:.6">${char}</span>`;
      } else { out += from; }
    }
    this.el.innerHTML = out;
    if (complete === this.queue.length) { this.resolve(); }
    else { this.frameReq = requestAnimationFrame(this.update); this.frame++; }
  }
}

/* ── SKELETON LOADING ── */
function skeletonMenuCards(count = 6) {
  return Array.from({length: count}).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w-80"></div>
        <div class="skeleton skeleton-line w-60"></div>
        <div class="skeleton skeleton-line w-40"></div>
      </div>
    </div>`).join('');
}

/* ── STAGGER CHILDREN REVEAL ── */
function initStaggerChildren() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.stagger-children').forEach(el => observer.observe(el));
}

/* ── LIVE CLOCK ── */
function initLiveClock(el) {
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  return setInterval(update, 1000);
}

/* ── QUICK VIEW PANEL ── */
const QuickView = {
  panel: null,
  init() {
    if (document.getElementById('quick-view-panel')) return;
    const el = document.createElement('div');
    el.id = 'quick-view-panel';
    el.className = 'quick-view';
    el.innerHTML = `
      <button class="qv-close" onclick="QuickView.close()">✕</button>
      <div class="quick-view-img"><img id="qv-img" src="" alt=""/></div>
      <div class="quick-view-body">
        <h2 id="qv-name"></h2>
        <p id="qv-desc"></p>
        <div style="display:flex;align-items:center;gap:1rem">
          <span id="qv-price" class="price serif" style="font-size:1.5rem"></span>
          <button class="btn-primary" id="qv-add">Add to Order</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    this.panel = el;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') QuickView.close(); });
  },
  show(item) {
    this.init();
    document.getElementById('qv-img').src = item.image_url || '';
    document.getElementById('qv-name').textContent = item.name;
    document.getElementById('qv-desc').textContent = item.description || '';
    document.getElementById('qv-price').textContent = item.price.toFixed(2) + ' JD';
    document.getElementById('qv-add').onclick = () => {
      Cart.add({ id: item.id, name: item.name, price: item.price });
      QuickView.close();
    };
    this.panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  close() {
    if (this.panel) this.panel.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ── SEARCH ── */
const Search = {
  _items: [],
  async load() {
    if (this._items.length) return;
    try {
      const cats = await api.getMenu();
      cats.forEach(c => c.items.forEach(i => this._items.push({ ...i, category: c.name })));
    } catch(e) {}
  },
  query(q) {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return this._items.filter(i =>
      i.name.toLowerCase().includes(lower) ||
      (i.description||'').toLowerCase().includes(lower) ||
      i.category.toLowerCase().includes(lower)
    ).slice(0, 8);
  }
};

/* ── MORPHING BLOB DECORATOR ── */
function addBlob(parent, size = 300, top = '20%', left = '60%') {
  const blob = document.createElement('div');
  blob.className = 'blob';
  blob.style.cssText = `width:${size}px;height:${size}px;top:${top};left:${left};z-index:0;`;
  parent.style.position = 'relative';
  parent.prepend(blob);
}

/* ── UPDATED initPageAnimations ── */
const _origInitPage = typeof initPageAnimations === 'function' ? initPageAnimations : null;
function initPageAnimations() {
  animatePageIn();
  initCursorGlow();
  initParallax();
  initScrollProgress();
  setTimeout(() => {
    initMagneticButtons();
    initRipple();
    initTiltCards();
    initStaggerChildren();
    ScrollReveal.observe();
  }, 150);
  setTimeout(() => {
    document.querySelectorAll('.stat-num').forEach(el => {
      const text = el.textContent.trim();
      const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
      const suf  = text.replace(/[0-9.]/g, '');
      if (!isNaN(num)) animateCountUp(el, num, suf);
    });
  }, 300);
}
