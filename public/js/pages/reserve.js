function renderReservePage() {
  document.getElementById('app').innerHTML = `
    <div class="reserve-pg">
      <p class="section-tag">${Lang.t('book_spot')}</p>
      <h1 class="serif" style="font-size:2.4rem;margin-bottom:.5rem">${Lang.t('reserve_title')}</h1>
      <p class="lead">Join us in Weibdeh. We'll have a table waiting for you.</p>

      <form class="reserve-form" id="reserve-form" onsubmit="submitReservation(event)">
        <div class="form-row">
          <div class="form-group"><label>${Lang.t('full_name')} *</label><input type="text" id="r-name" placeholder="Layla Haddad" required/></div>
          <div class="form-group"><label>${Lang.t('email')} *</label><input type="email" id="r-email" placeholder="layla@example.com" required/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${Lang.t('phone')}</label><input type="tel" id="r-phone" placeholder="+962 79 000 0000"/></div>
          <div class="form-group"><label>${Lang.t('guests')} *</label>
            <select id="r-guests" required>
              <option value="">Select...</option>
              ${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}">${n} ${n===1?'guest':'guests'}</option>`).join('')}
              <option value="9">9+ guests (we'll call you)</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${Lang.t('date')} *</label><input type="date" id="r-date" required min="${new Date().toISOString().split('T')[0]}"/></div>
          <div class="form-group"><label>${Lang.t('time')} *</label>
            <select id="r-time" required>
              <option value="">Select a time...</option>
              ${generateTimeSlots()}
            </select>
          </div>
        </div>
        <div class="form-group"><label>${Lang.t('special_req_label')}</label><textarea id="r-notes" placeholder="Allergies, special occasions, accessibility needs..." rows="3"></textarea></div>
        <div class="form-error" id="reserve-error" style="display:none"></div>
        <button type="submit" class="btn-primary" id="reserve-btn" style="align-self:flex-start">${Lang.t('confirm_reservation')}</button>
      </form>
    </div>

    <div class="cta-banner" style="padding:3rem 2.5rem;margin-top:3rem">
      <h2 class="serif" style="font-size:1.6rem">Questions?</h2>
      <p style="margin-bottom:1rem">Call us at ${App._settings.cafe_phone||'+962 6 461 0099'} or email ${App._settings.cafe_email||'hello@daralqahwa.jo'}</p>
      <button class="btn-primary" onclick="openWhatsApp()" style="background:rgba(255,255,255,.2);border:.5px solid rgba(255,255,255,.4)">💬 WhatsApp Us</button>
    </div>
    ${renderFooterHTML()}
  `;
  initPageAnimations();
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 22; h++) {
    for (let m of ['00','30']) {
      if (h === 22 && m === '30') continue;
      const label = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
      const val = `${String(h).padStart(2,'0')}:${m}`;
      slots.push(`<option value="${val}">${label}</option>`);
    }
  }
  return slots.join('');
}

async function submitReservation(e) {
  e.preventDefault();
  const errEl = document.getElementById('reserve-error');
  const btn = document.getElementById('reserve-btn');
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = Lang.t('confirming');
  try {
    const data = {
      name: document.getElementById('r-name').value.trim(),
      email: document.getElementById('r-email').value.trim(),
      phone: document.getElementById('r-phone').value.trim(),
      guests: document.getElementById('r-guests').value,
      date: document.getElementById('r-date').value,
      time: document.getElementById('r-time').value,
      notes: document.getElementById('r-notes').value.trim(),
    };
    const res = await api.makeReservation(data);
    document.getElementById('app').innerHTML = `
      <div class="confirm-pg">
        <div class="confirm-icon">🗓</div>
        <h1 class="serif">You're booked!</h1>
        <p class="order-number">Reservation #${res.id}</p>
        <p style="color:var(--text-sec);margin-bottom:1.5rem;font-weight:300">We'll see <strong>${res.name}</strong> on <strong>${formatDate(res.date)}</strong> at <strong>${formatTime(res.time)}</strong> for <strong>${res.guests} ${res.guests==1?'guest':'guests'}</strong>.</p>
        <div class="confirm-items">
          <div class="confirm-item"><span>📍 Where</span><span>12 Al-Quds Street, Weibdeh</span></div>
          <div class="confirm-item"><span>📅 When</span><span>${formatDate(res.date)} at ${formatTime(res.time)}</span></div>
          <div class="confirm-item"><span>👥 Guests</span><span>${res.guests}</span></div>
          ${res.notes ? `<div class="confirm-item"><span>📝 Notes</span><span>${res.notes}</span></div>` : ''}
        </div>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" onclick="Router.go('/')">Back to Home</button>
          <button class="btn-ghost" onclick="Router.go('/menu')">Browse the Menu</button>
        </div>
      </div>`;
    Toast.show('Reservation confirmed! See you soon 🎉', 'success');
  } catch (err) {
    errEl.textContent = err.message; errEl.style.display = 'block';
    btn.disabled = false; btn.textContent = Lang.t('confirm_reservation');
  }
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function renderFooterHTML() {
  return `<footer><div class="footer-bottom" style="padding:1.5rem 2.5rem;border-top:.5px solid var(--border)"><span>© 2025 Dar Al-Qahwa</span><div style="display:flex;gap:1.25rem"><span onclick="Router.go('/')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Home</span><span onclick="Router.go('/menu')" style="cursor:pointer;font-size:.76rem;color:var(--text-sec)">Menu</span></div></div></footer>`;
}
