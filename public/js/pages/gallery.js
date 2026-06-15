async function renderGalleryPage() {
  document.getElementById('app').innerHTML = `
    <div style="padding:3rem 2.5rem">
      <div class="reveal" style="text-align:center;margin-bottom:3rem">
        <p class="section-tag">A visual story</p>
        <h1 class="section-title serif" style="font-size:2.8rem">The Gallery</h1>
        <p style="color:var(--text-sec);font-size:.95rem;font-weight:300">Moments from our kitchen, our bar, and our community.</p>
      </div>

      <div class="gallery-filters reveal" id="gal-filters">
        <button class="gal-filter active" onclick="filterGallery('all', this)">All</button>
        <button class="gal-filter" onclick="filterGallery('interior', this)">Interior</button>
        <button class="gal-filter" onclick="filterGallery('drinks', this)">Drinks</button>
        <button class="gal-filter" onclick="filterGallery('food', this)">Food</button>
        <button class="gal-filter" onclick="filterGallery('brewing', this)">Brewing</button>
      </div>

      <div id="gallery-grid" class="gallery-grid stagger">
        <div class="loading-block"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Lightbox -->
    <div id="lightbox" class="lightbox hidden" onclick="closeLightbox(event)">
      <button class="lb-close" onclick="closeLightbox()">✕</button>
      <button class="lb-prev" onclick="lbNav(-1)">‹</button>
      <button class="lb-next" onclick="lbNav(1)">›</button>
      <div class="lb-inner">
        <img id="lb-img" src="" alt=""/>
        <div class="lb-caption">
          <h3 id="lb-title"></h3>
          <p id="lb-cap"></p>
        </div>
      </div>
    </div>

    ${renderFooterHTML()}
  `;

  await loadGallery('all');
  initPageAnimations();
}

let _galleryItems = [];
let _lbIndex = 0;

async function loadGallery(category) {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '<div class="loading-block"><div class="spinner"></div></div>';
  try {
    const items = await api.getGallery(category === 'all' ? '' : category);
    _galleryItems = items;
    if (!items.length) {
      grid.innerHTML = '<p style="color:var(--text-sec);padding:3rem;text-align:center;grid-column:1/-1">No photos yet.</p>';
      return;
    }
    grid.innerHTML = items.map((item, i) => `
      <div class="gallery-item reveal-scale" onclick="openLightbox(${i})" style="transition-delay:${(i % 6) * 0.06}s">
        <img src="${item.image_url}" alt="${item.title || ''}" loading="lazy"/>
        <div class="gallery-item-overlay">
          <h3>${item.title || ''}</h3>
          <p>${item.caption || ''}</p>
        </div>
      </div>
    `).join('');
    setTimeout(() => ScrollReveal.observe(), 80);
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--red);padding:2rem;grid-column:1/-1">${err.message}</p>`;
  }
}

function filterGallery(cat, btn) {
  document.querySelectorAll('.gal-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadGallery(cat);
}

function openLightbox(i) {
  _lbIndex = i;
  const item = _galleryItems[i];
  document.getElementById('lb-img').src = item.image_url;
  document.getElementById('lb-title').textContent = item.title || '';
  document.getElementById('lb-cap').textContent = item.caption || '';
  const lb = document.getElementById('lightbox');
  lb.classList.remove('hidden');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('lb-close')) return;
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  setTimeout(() => lb.classList.add('hidden'), 300);
  document.body.style.overflow = '';
}

function lbNav(dir) {
  _lbIndex = (_lbIndex + dir + _galleryItems.length) % _galleryItems.length;
  const item = _galleryItems[_lbIndex];
  const img = document.getElementById('lb-img');
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = item.image_url;
    document.getElementById('lb-title').textContent = item.title || '';
    document.getElementById('lb-cap').textContent = item.caption || '';
    img.style.opacity = '1';
  }, 150);
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});
