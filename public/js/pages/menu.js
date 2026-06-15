async function renderMenuPage() {
  document.getElementById('app').innerHTML = `
    <div class="menu-pg">
      <div class="menu-pg-hd">
        <p class="section-tag">${Lang.t('crafted_for_you')}</p>
        <h1 class="section-title serif gradient-text" style="font-size:2.8rem">${Lang.t('the_menu')}</h1>
        <p style="color:var(--text-sec);font-size:.95rem;font-weight:300;margin-top:.5rem">${Lang.t('everything_fresh')}</p>
      </div>

      <!-- SEARCH -->
      <div class="search-bar-wrap reveal">
        <span class="search-icon">🔍</span>
        <input type="text" id="menu-search" placeholder="Search our menu..." oninput="handleMenuSearch(this.value)" onfocus="Search.load()" autocomplete="off"/>
        <div class="search-results" id="search-results"></div>
      </div>

      <!-- BARISTA PICKS -->
      <div class="reveal" style="margin-bottom:2.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <p style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--brown);font-weight:500">✨ Barista picks this week</p>
          <div style="display:flex;gap:.5rem">
            <button class="picks-scroll-btn" onclick="scrollPicks(-1)">‹</button>
            <button class="picks-scroll-btn" onclick="scrollPicks(1)">›</button>
          </div>
        </div>
        <div class="picks-strip" id="picks-strip">
          ${skeletonMenuCards(5).replace(/skeleton-card/g,'skeleton-card').replace(/menu-grid/g,'')}
        </div>
      </div>

      <!-- TABS -->
      <div id="menu-tabs-bar" class="menu-tabs"><div class="loading-block" style="padding:.5rem"><div class="spinner"></div></div></div>
      <div id="menu-items-grid" class="menu-grid stagger">${skeletonMenuCards(6)}</div>
    </div>
    ${renderFooterHTML()}
  `;

  // Load picks and full menu in parallel
  const [cats] = await Promise.all([
    api.getMenu().catch(() => []),
    loadBaristaPicks(),
  ]);

  if (cats.length) {
    const tabsBar = document.getElementById('menu-tabs-bar');
    tabsBar.innerHTML = cats.map((c, i) =>
      `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="switchMenuTab(${c.id}, this)">${c.name}</button>`
    ).join('');
    window._menuCats = cats;
    renderMenuItems(cats[0]);
  }

  initPageAnimations();
  // Close search on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar-wrap')) {
      const r = document.getElementById('search-results');
      if (r) r.classList.remove('open');
    }
  });
}

async function loadBaristaPicks() {
  try {
    const cats = await api.getMenu();
    // Pick 5 items spread across categories as "barista picks"
    const allItems = cats.flatMap(c => c.items);
    const picks = allItems.sort(() => 0.5 - Math.random()).slice(0, 6);
    const strip = document.getElementById('picks-strip');
    if (!strip) return;
    strip.innerHTML = picks.map(item => `
      <div class="pick-card" onclick="QuickView.show(${JSON.stringify(item).replace(/"/g,"'").replace(/'/g,"\\'")})" title="Quick view">
        <div class="pick-img">
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:130px;font-size:2rem\\'>☕</div>'"/>`
            : `<div style="display:flex;align-items:center;justify-content:center;height:130px;font-size:2rem">☕</div>`}
        </div>
        <div class="pick-body">
          <h4>${item.name}</h4>
          <p>${(item.description||'').substring(0, 45)}${item.description?.length > 45 ? '…' : ''}</p>
          <div class="pick-price">${item.price.toFixed(2)} JD</div>
        </div>
      </div>`).join('');
  } catch(e) {
    const strip = document.getElementById('picks-strip');
    if (strip) strip.innerHTML = '';
  }
}

function scrollPicks(dir) {
  const strip = document.getElementById('picks-strip');
  if (!strip) return;
  strip.scrollBy({ left: dir * 220, behavior: 'smooth' });
}

function switchMenuTab(catId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cat = window._menuCats?.find(c => c.id === catId);
  if (cat) { renderMenuItems(cat); setTimeout(() => ScrollReveal.observe(), 50); }
}

function renderMenuItems(cat) {
  const grid = document.getElementById('menu-items-grid');
  if (!cat || !cat.items?.length) {
    grid.innerHTML = `<p style="color:var(--text-sec);padding:2rem;grid-column:1/-1">No items in this category yet.</p>`;
    return;
  }
  grid.innerHTML = cat.items.map(item => {
    const safeItem = JSON.stringify(item).replace(/"/g,"'").replace(/'/g,"\\'");
    const imgHtml = item.image_url
      ? `<div class="mc-img"><img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'"/></div>`
      : `<div class="mc-emoji" style="background:var(--cream)">☕</div>`;
    return `
      <div class="menu-card reveal-scale" onclick="QuickView.show(JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(item))}')))" style="cursor:pointer">
        ${imgHtml}
        <div class="mc-body">
          <h3>${item.name}</h3>
          <p>${item.description || ''}</p>
          <div class="mc-foot">
            <span class="price serif">${item.price.toFixed(2)}<span class="currency">JD</span></span>
            <button class="add-btn" onclick='event.stopPropagation();Cart.add({id:${item.id},name:${JSON.stringify(item.name)},price:${item.price}})' aria-label="Add ${item.name}">+</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── SEARCH ── */
async function handleMenuSearch(val) {
  const results = document.getElementById('search-results');
  if (!results) return;
  if (!val.trim()) { results.classList.remove('open'); return; }
  await Search.load();
  const matches = Search.query(val);
  if (!matches.length) {
    results.innerHTML = `<div class="search-empty">No results for "<strong>${val}</strong>"</div>`;
  } else {
    results.innerHTML = matches.map(item => `
      <div class="search-result-item" onclick="QuickView.show(JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(item))}'))); document.getElementById('search-results').classList.remove('open');">
        ${item.image_url
          ? `<img class="sr-img" src="${item.image_url}" alt="${item.name}" onerror="this.style.display='none'"/>`
          : `<div class="sr-img" style="display:flex;align-items:center;justify-content:center;font-size:1.4rem">☕</div>`}
        <div>
          <div class="sr-name">${item.name}</div>
          <div class="sr-cat">${item.category}</div>
        </div>
        <span class="sr-price">${item.price.toFixed(2)} JD</span>
      </div>`).join('');
  }
  results.classList.add('open');
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function renderFooterHTML() {
  return `<footer><div class="footer-bottom" style="padding:1.5rem 2.5rem;border-top:.5px solid var(--border)"><span>© 2025 Dar Al-Qahwa</span><div style="display:flex;gap:1.25rem"><span onclick="Router.go('/')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Home</span><span onclick="Router.go('/reserve')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Reservations</span></div></div></footer>`;
}
