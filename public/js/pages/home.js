async function renderHome() {
  document.getElementById('app').innerHTML = `
    <!-- HERO -->
    <div class="hero">
      <div class="hero-left">
        <p class="hero-tag">${Lang.t('hero_tag')}</p>
        <h1 class="hero-title serif">${Lang.t('hero_title')}</h1>
        <p class="hero-subtitle">${Lang.t('hero_sub')}</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="Router.go('/menu')">${Lang.t('explore_menu')}</button>
          <button class="btn-ghost" onclick="Router.go('/reserve')">${Lang.t('reserve_table')}</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num serif" id="sn1">0</span><span class="stat-label">${Lang.t('origins')}</span></div>
          <div class="stat"><span class="stat-num serif" id="sn2">0</span><span class="stat-label">${Lang.t('rating')}</span></div>
          <div class="stat"><span class="stat-num serif" id="sn3">0</span><span class="stat-label">${Lang.t('est')}</span></div>
        </div>
      </div>
      <div class="hero-right">
        <svg viewBox="0 0 560 720" xmlns="http://www.w3.org/2000/svg" aria-label="Cafe interior illustration">
          <rect width="560" height="720" fill="#EDD5B3"/>
          <rect x="0" y="0" width="560" height="500" fill="#D4A574" opacity="0.55"/>
          <ellipse cx="290" cy="210" rx="200" ry="240" fill="#F5D69A" opacity="0.22"/>
          <rect x="55" y="75" width="210" height="255" rx="4" fill="#8BC4D4" opacity="0.5"/>
          <rect x="55" y="75" width="210" height="255" rx="4" fill="none" stroke="#B8876A" stroke-width="6"/>
          <line x1="160" y1="75" x2="160" y2="330" stroke="#B8876A" stroke-width="4"/>
          <line x1="55" y1="202" x2="265" y2="202" stroke="#B8876A" stroke-width="4"/>
          <rect x="315" y="95" width="210" height="8" rx="2" fill="#8B5E3C"/>
          <rect x="315" y="90" width="8" height="72" rx="1" fill="#7a5231"/>
          <rect x="517" y="90" width="8" height="72" rx="1" fill="#7a5231"/>
          <rect x="330" y="55" width="20" height="42" rx="3" fill="#5A3825"/>
          <rect x="358" y="65" width="18" height="32" rx="3" fill="#7B4F31"/>
          <rect x="384" y="50" width="22" height="47" rx="3" fill="#4A2E1A"/>
          <ellipse cx="340" cy="55" rx="11" ry="5" fill="#3D2010"/>
          <ellipse cx="367" cy="65" rx="10" ry="4" fill="#5A3020"/>
          <ellipse cx="395" cy="50" rx="12" ry="5" fill="#3D2010"/>
          <rect x="436" y="83" width="10" height="12" rx="1" fill="#8B5E3C"/>
          <ellipse cx="441" cy="77" rx="18" ry="18" fill="#5A8A42"/>
          <ellipse cx="431" cy="70" rx="12" ry="14" fill="#4A7A35"/>
          <ellipse cx="452" cy="67" rx="14" ry="16" fill="#6A9A50"/>
          <rect x="255" y="475" width="210" height="16" rx="8" fill="#7B4F31"/>
          <rect x="338" y="491" width="12" height="96" rx="4" fill="#6A4228"/>
          <rect x="368" y="491" width="12" height="96" rx="4" fill="#6A4228"/>
          <rect x="315" y="430" width="82" height="52" rx="8" fill="#F5EDE3"/>
          <ellipse cx="356" cy="430" rx="41" ry="10" fill="#EDD5B3"/>
          <ellipse cx="356" cy="428" rx="36" ry="8" fill="#3D2010"/>
          <path d="M397 452 Q414 452 414 462 Q414 474 397 474" fill="none" stroke="#D4A574" stroke-width="3" stroke-linecap="round"/>
          <path d="M340 418 Q343 407 339 396" fill="none" stroke="#C8956A" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
          <path d="M356 412 Q360 399 356 386" fill="none" stroke="#C8956A" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
          <path d="M372 416 Q377 403 373 392" fill="none" stroke="#C8956A" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
        </svg>
        <div class="hero-badge">
          <div class="badge-icon">☕</div>
          <div class="badge-text">
            <p>Specialty grade</p>
            <div class="stars">★★★★★</div>
            <p>Amman's top-rated café</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ABOUT -->
    <section class="about-section">
      <div class="about-grid">
        <div class="about-image-stack reveal-left">
          <div class="about-img-main" style="background:#C8895A">
            <svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="380" fill="#C8895A"/><rect x="80" y="58" width="140" height="185" rx="70" fill="#D4A574"/><rect x="98" y="200" width="104" height="165" rx="20" fill="#5A3825"/><rect x="78" y="222" width="62" height="125" rx="20" fill="#4A2E1A"/><rect x="162" y="222" width="62" height="125" rx="20" fill="#4A2E1A"/><rect x="108" y="232" width="84" height="105" rx="8" fill="#E8D5C0"/></svg>
          </div>
          <div class="about-img-accent" style="background:#8B5E3C">
            <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"><rect width="260" height="260" fill="#8B5E3C"/><ellipse cx="60" cy="70" rx="20" ry="12" fill="#4A2E1A" transform="rotate(20 60 70)"/><ellipse cx="110" cy="50" rx="20" ry="12" fill="#3D2010" transform="rotate(-15 110 50)"/><ellipse cx="90" cy="120" rx="20" ry="12" fill="#5A3825" transform="rotate(40 90 120)"/><ellipse cx="170" cy="80" rx="20" ry="12" fill="#4A2E1A" transform="rotate(-30 170 80)"/><ellipse cx="150" cy="150" rx="20" ry="12" fill="#3D2010" transform="rotate(10 150 150)"/></svg>
          </div>
          <div class="about-floaty"><div class="num serif">8</div><div class="lbl">${Lang.t('years_craft')}</div></div>
        </div>
        <div class="about-text reveal-right">
          <div>
            <p class="section-tag">${Lang.t('our_story')}</p>
            <h2 class="section-title serif">${Lang.t('born_title')}</h2>
            <div class="divider"></div>
            <p class="section-lead">Founded in 2017 in the artistic neighbourhood of Jabal Al-Weibdeh, Dar Al-Qahwa was built on a simple belief: that great coffee is an act of love.</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:.75rem">
            <div class="feature-item"><div class="feature-dot"></div><div><p>${Lang.t('direct_trade')}</p><p>${Lang.t('direct_trade_desc')}</p></div></div>
            <div class="feature-item"><div class="feature-dot"></div><div><p>${Lang.t('micro_roastery')}</p><p>${Lang.t('micro_roastery_desc')}</p></div></div>
            <div class="feature-item"><div class="feature-dot"></div><div><p>${Lang.t('pastry_kitchen')}</p><p>${Lang.t('pastry_kitchen_desc')}</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- MENU PREVIEW -->
    <section style="padding:0 2.5rem 5rem">
      <div class="reveal" style="text-align:center;margin-bottom:2rem">
        <p class="section-tag">${Lang.t('taste_waiting')}</p>
        <h2 class="section-title serif" style="font-size:2rem">${Lang.t('from_menu')}</h2>
      </div>
      <div id="home-menu-preview" class="menu-grid stagger"><div class="loading-block"><div class="spinner"></div></div></div>
      <div class="reveal" style="text-align:center;margin-top:2rem">
        <button class="btn-ghost" onclick="Router.go('/menu')">${Lang.t('view_full_menu')}</button>
      </div>
    </section>

    <!-- EVENTS TEASER -->
    <section class="events-teaser">
      <div class="reveal" style="text-align:center;margin-bottom:2rem">
        <p class="section-tag">What's on</p>
        <h2 class="section-title serif" style="font-size:2rem">Upcoming Events</h2>
      </div>
      <div id="home-events-preview" class="events-mini-grid stagger">
        <div class="loading-block"><div class="spinner"></div></div>
      </div>
      <div class="reveal" style="text-align:center;margin-top:2rem">
        <button class="btn-ghost" onclick="Router.go('/events')">All Events →</button>
      </div>
    </section>

    <!-- LOYALTY TEASER -->
    <section style="padding:0 2.5rem 5rem;background:var(--brown-bg)">
      <div style="max-width:700px;margin:0 auto;text-align:center;padding:4rem 0" class="reveal">
        <p class="section-tag">Regulars get rewarded</p>
        <h2 class="section-title serif" style="font-size:2.2rem">☕ × 9 = 🎁 Free</h2>
        <p class="section-lead" style="margin:.75rem auto 2rem;max-width:420px">Every 9 coffees you order, the 10th is on us. No app, no card — just your email.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" onclick="Router.go('/loyalty')">Join the Loyalty Program</button>
          <button class="btn-ghost" onclick="Router.go('/loyalty')">Check My Card</button>
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section class="reviews-section">
      <p class="section-tag">${Lang.t('what_people_say')}</p>
      <h2 class="section-title serif">${Lang.t('loved_by')}</h2>
      <div class="reviews-grid stagger">
        <div class="review-card reveal-scale"><div class="review-stars">★★★★★</div><p class="review-text">"The Ethiopian pour-over changed how I think about coffee. Dar Al-Qahwa is an Amman institution."</p><div class="reviewer"><div class="reviewer-avatar" style="background:#8B5E3C">RM</div><div><p class="reviewer-name">Rima Mansour</p><p class="reviewer-title">Architect, Amman</p></div></div></div>
        <div class="review-card reveal-scale"><div class="review-stars">★★★★★</div><p class="review-text">"The cardamom latte and date tart combo is something I dream about. Perfect afternoon light."</p><div class="reviewer"><div class="reviewer-avatar" style="background:#4A6FA5">KH</div><div><p class="reviewer-name">Khalid Haddad</p><p class="reviewer-title">Writer & Traveller</p></div></div></div>
        <div class="review-card reveal-scale"><div class="review-stars">★★★★★</div><p class="review-text">"I've visited cafes across the Arab world and Dar Al-Qahwa stands apart. The knafeh croissant is genius."</p><div class="reviewer"><div class="reviewer-avatar" style="background:#5A8A42">NA</div><div><p class="reviewer-name">Nadia Al-Amin</p><p class="reviewer-title">Food blogger, Beirut</p></div></div></div>
      </div>
    </section>

    <!-- VISIT -->
    <section class="visit-section">
      <p class="section-tag">${Lang.t('find_us')}</p>
      <h2 class="section-title serif" style="margin-bottom:2.5rem">${Lang.t('come_visit')}</h2>
      <div class="visit-grid">
        <div class="reveal-left">
          <div class="info-blocks">
            <div class="info-block"><div class="info-icon">📍</div><div><p class="info-label">${Lang.t('address')}</p><p class="info-value" id="site-address">12 Al-Quds Street, Jabal Al-Weibdeh<br>Amman 11183, Jordan</p></div></div>
            <div class="info-block"><div class="info-icon">🕐</div><div><p class="info-label">${Lang.t('hours')}</p><p class="info-value" id="site-hours">Mon–Fri: 7:30 am – 11:00 pm<br>Sat–Sun: 8:00 am – midnight</p></div></div>
            <div class="info-block"><div class="info-icon">📞</div><div><p class="info-label">${Lang.t('reservations_contact')}</p><p class="info-value" id="site-phone">+962 6 461 0099<br>hello@daralqahwa.jo</p></div></div>
          </div>
          <div style="display:flex;gap:1rem;margin-top:1.75rem;flex-wrap:wrap">
            <button class="btn-primary" onclick="Router.go('/reserve')">Reserve a Table</button>
            <button id="wa-inline-btn" class="btn-ghost" onclick="openWhatsApp()">💬 WhatsApp</button>
          </div>
        </div>
        <div class="map-card reveal-right">
          <div class="map-header">🗺 Jabal Al-Weibdeh, Amman</div>
          <div class="map-body">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%">
              <rect width="400" height="300" fill="#EDE8DE"/>
              <rect x="10" y="10" width="80" height="62" rx="2" fill="#D4CFC0"/><rect x="100" y="10" width="120" height="62" rx="2" fill="#D4CFC0"/><rect x="230" y="10" width="85" height="62" rx="2" fill="#D4CFC0"/>
              <rect x="10" y="95" width="62" height="82" rx="2" fill="#D4CFC0"/><rect x="80" y="95" width="102" height="82" rx="2" fill="#D4CFC0"/><rect x="280" y="95" width="110" height="82" rx="2" fill="#D4CFC0"/>
              <rect x="10" y="200" width="122" height="90" rx="2" fill="#D4CFC0"/><rect x="140" y="200" width="102" height="90" rx="2" fill="#D4CFC0"/><rect x="250" y="200" width="140" height="90" rx="2" fill="#D4CFC0"/>
              <rect x="0" y="82" width="400" height="13" fill="#FFFBF4"/><rect x="0" y="185" width="400" height="13" fill="#FFFBF4"/>
              <rect x="70" y="0" width="13" height="300" fill="#FFFBF4"/><rect x="182" y="0" width="13" height="300" fill="#FFFBF4"/>
              <rect x="80" y="95" width="102" height="82" rx="2" fill="#F5E8D8" stroke="#8B5E3C" stroke-width="2"/>
              <circle cx="131" cy="136" r="11" fill="#8B5E3C"/><circle cx="131" cy="136" r="5" fill="#fff"/>
              <rect x="90" y="158" width="82" height="22" rx="3" fill="#8B5E3C"/>
              <text x="131" y="173" text-anchor="middle" fill="#fff" font-size="9" font-family="Inter,sans-serif" font-weight="500">Dar Al-Qahwa</text>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <div class="cta-banner">
      <h2 class="serif">${Lang.t('stay_loop')}</h2>
      <p>${Lang.t('newsletter_desc')}</p>
      <form class="newsletter-form" id="newsletter-form" onsubmit="submitNewsletter(event)">
        <input type="email" id="newsletter-email" placeholder="your@email.com" required/>
        <button type="submit" id="nl-btn">${Lang.t('subscribe')}</button>
      </form>
    </div>

    <!-- FOOTER -->
    <footer>
      <div class="footer-grid">
        <div>
          <div class="footer-logo">Dar<span> Al-Qahwa</span></div>
          <p class="footer-about">A specialty coffee house rooted in Amman's Weibdeh neighbourhood. We believe in the story behind every bean, and the community built around every cup.</p>
        </div>
        <div class="footer-col"><h4>Explore</h4><ul>
          <li onclick="Router.go('/menu')">Menu</li>
          <li onclick="Router.go('/gallery')">Gallery</li>
          <li onclick="Router.go('/events')">Events</li>
          <li onclick="Router.go('/reserve')">Reservations</li>
          <li onclick="Router.go('/loyalty')">Loyalty Program</li>
        </ul></div>
        <div class="footer-col"><h4>Connect</h4><ul>
          <li id="footer-ig" onclick="window.open(App._settings.instagram_url||'#')">Instagram</li>
          <li id="footer-fb" onclick="window.open(App._settings.facebook_url||'#')">Facebook</li>
          <li onclick="openWhatsApp()">WhatsApp</li>
          <li onclick="Router.go('/login')">Staff Login</li>
        </ul></div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Dar Al-Qahwa. All rights reserved.</span>
        <div class="social-links">
          <a onclick="Router.go('/loyalty')" style="cursor:pointer">Loyalty</a>
          <a onclick="Router.go('/gallery')" style="cursor:pointer">Gallery</a>
        </div>
      </div>
    </footer>

    <!-- WhatsApp floating button -->
    <button class="whatsapp-btn" onclick="openWhatsApp()" title="Chat on WhatsApp">💬</button>
  `;

  // Load menu preview
  api.getMenu().then(cats => {
    const coffee = cats.find(c => c.name === 'Coffee');
    const preview = document.getElementById('home-menu-preview');
    if (!coffee || !preview) return;
    preview.innerHTML = coffee.items.slice(0, 3).map(item => `
      <div class="menu-card reveal-scale">
        <div class="menu-card-img">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'"/>
        </div>
        <div class="menu-card-body">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-card-footer">
            <span class="price serif">${item.price.toFixed(2)}<span class="currency">JD</span></span>
            <button class="add-btn" onclick='Cart.add({id:${item.id},name:${JSON.stringify(item.name)},price:${item.price}})'>+</button>
          </div>
        </div>
      </div>`).join('');
    setTimeout(() => ScrollReveal.observe(), 80);
  }).catch(() => {
    const p = document.getElementById('home-menu-preview');
    if (p) p.innerHTML = '';
  });

  // Load events preview
  api.getEvents().then(events => {
    const wrap = document.getElementById('home-events-preview');
    if (!wrap) return;
    if (!events.length) { wrap.innerHTML = '<p style="color:var(--text-sec);font-size:.88rem;grid-column:1/-1;text-align:center">No upcoming events — check back soon.</p>'; return; }
    wrap.innerHTML = events.slice(0, 4).map(ev => `
      <div class="event-mini-card reveal-scale" onclick="Router.go('/events')" style="cursor:pointer">
        <div class="event-mini-img">
          ${ev.image_url ? `<img src="${ev.image_url}" alt="${ev.title}" loading="lazy"/>` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.8rem">🎪</div>`}
        </div>
        <div class="event-mini-body">
          <h3>${ev.title}</h3>
          <div class="ev-meta">
            <span>📅 ${new Date(ev.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
            <span>${ev.price > 0 ? ev.price.toFixed(2)+' JD' : 'Free'}</span>
          </div>
          <p>${ev.description ? ev.description.substring(0,70)+'…' : ''}</p>
        </div>
      </div>`).join('');
    setTimeout(() => ScrollReveal.observe(), 80);
  }).catch(() => {
    const w = document.getElementById('home-events-preview');
    if (w) w.innerHTML = '';
  });

  // Update site info from settings
  const s = App._settings;
  if (s.cafe_address) { const el = document.getElementById('site-address'); if (el) el.textContent = s.cafe_address; }
  if (s.cafe_phone) { const el = document.getElementById('site-phone'); if (el) el.innerHTML = s.cafe_phone + '<br>' + (s.cafe_email||''); }
  if (s.cafe_hours_weekday) { const el = document.getElementById('site-hours'); if (el) el.innerHTML = 'Mon–Fri: ' + s.cafe_hours_weekday + '<br>Sat–Sun: ' + (s.cafe_hours_weekend||''); }

  initPageAnimations();

  setTimeout(() => {
    const sn1 = document.getElementById('sn1');
    const sn2 = document.getElementById('sn2');
    const sn3 = document.getElementById('sn3');
    if (sn1) animateCountUp(sn1, 12, '+');
    if (sn2) animateCountUp(sn2, 4.9);
    if (sn3) animateCountUp(sn3, 2017);
  }, 300);
}

function openWhatsApp() {
  const num = (App._settings.whatsapp_number || '+96264610099').replace(/\D/g,'');
  const msg = encodeURIComponent("Hello! I'd like to get in touch with Dar Al-Qahwa.");
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
}

async function submitNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value;
  const btn = document.getElementById('nl-btn');
  btn.disabled = true;
  try {
    await api.subscribe(email);
    btn.textContent = Lang.t('subscribed');
    e.target.querySelector('input').value = '';
    Toast.show('Welcome to our list!', 'success');
  } catch (err) {
    Toast.show(err.message, 'error');
    btn.disabled = false;
  }
}
