async function renderEventsPage() {
  document.getElementById('app').innerHTML = `
    <div style="padding:3rem 2.5rem">
      <div class="reveal" style="text-align:center;margin-bottom:3rem">
        <p class="section-tag">What's on</p>
        <h1 class="section-title serif" style="font-size:2.8rem">Events & Workshops</h1>
        <p style="color:var(--text-sec);font-size:.95rem;font-weight:300">Cuppings, latte art classes, cultural evenings and more.</p>
      </div>
      <div id="events-grid" style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem">
        <div class="loading-block"><div class="spinner"></div></div>
      </div>
    </div>
    <div id="event-booking-modal" class="modal hidden"></div>
    ${renderFooterHTML()}
  `;

  try {
    const events = await api.getEvents();
    const grid = document.getElementById('events-grid');
    if (!events.length) {
      grid.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--text-sec)"><p style="font-size:1.1rem">No upcoming events right now.</p><p style="margin-top:.5rem;font-size:.85rem">Check back soon — we're always brewing something new.</p></div>`;
      return;
    }
    grid.innerHTML = events.map((ev, i) => {
      const spotsLeft = ev.capacity - ev.spots_taken;
      const full = spotsLeft <= 0;
      const typeColors = { cupping: '#8B5E3C', workshop: '#4A6FA5', event: '#5A8A42' };
      const color = typeColors[ev.type] || '#8B5E3C';
      return `
        <div class="reveal" style="display:grid;grid-template-columns:280px 1fr;border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface);transition:all .3s cubic-bezier(.16,1,.3,1)" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="height:100%;min-height:200px;overflow:hidden;background:#EDD5B3;position:relative">
            ${ev.image_url ? `<img src="${ev.image_url}" alt="${ev.title}" style="width:100%;height:100%;object-fit:cover"/>` : `<div style="display:flex;align-items:center;justify-content:center;height:200px;font-size:3rem">☕</div>`}
            <div style="position:absolute;top:.75rem;left:.75rem;background:${color};color:#fff;padding:.25rem .75rem;border-radius:20px;font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em">${ev.type}</div>
          </div>
          <div style="padding:1.75rem 2rem;display:flex;flex-direction:column;gap:.75rem">
            <div>
              <h2 style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:400;margin-bottom:.35rem">${ev.title}</h2>
              <p style="font-size:.83rem;color:var(--text-sec);line-height:1.65;font-weight:300">${ev.description}</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1rem;font-size:.8rem;color:var(--text-sec)">
              <span>📅 ${formatEventDate(ev.date)}</span>
              <span>🕐 ${formatTime(ev.time)}${ev.end_time ? ' – ' + formatTime(ev.end_time) : ''}</span>
              <span>👥 ${full ? '<span style="color:var(--red)">Fully booked</span>' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}</span>
              ${ev.price > 0 ? `<span>💰 ${ev.price.toFixed(2)} JD</span>` : `<span style="color:var(--green)">✓ Free</span>`}
            </div>
            <div style="margin-top:auto">
              ${full
                ? `<button class="btn-ghost" disabled style="opacity:.5;cursor:not-allowed">Fully Booked</button>`
                : `<button class="btn-primary" onclick="openEventBooking(${ev.id}, ${JSON.stringify(ev.title).replace(/"/g,"'")})">Book a Spot</button>`}
            </div>
          </div>
        </div>`;
    }).join('');
    initPageAnimations();
  } catch (err) {
    document.getElementById('events-grid').innerHTML = `<p style="color:var(--red)">${err.message}</p>`;
  }
}

function formatEventDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function openEventBooking(eventId, title) {
  const modal = document.getElementById('event-booking-modal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeEventModal()"></div>
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h2 class="serif" style="font-size:1.4rem;font-weight:400">Book: ${title}</h2>
        <button onclick="closeEventModal()" style="background:none;border:none;font-size:1.1rem;color:var(--text-sec);cursor:pointer">✕</button>
      </div>
      <form onsubmit="submitEventBooking(event, ${eventId})" style="display:flex;flex-direction:column;gap:1rem">
        <div class="form-row">
          <div class="form-group"><label>Full Name *</label><input id="eb-name" required placeholder="Layla Haddad"/></div>
          <div class="form-group"><label>Email *</label><input id="eb-email" type="email" required placeholder="layla@example.com"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input id="eb-phone" placeholder="+962 79 000 0000"/></div>
          <div class="form-group"><label>Guests</label>
            <select id="eb-guests"><option value="1">1 person</option><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option></select>
          </div>
        </div>
        <div class="form-group"><label>Notes</label><textarea id="eb-notes" rows="2" placeholder="Any questions or special needs..."></textarea></div>
        <div class="form-error" id="eb-err" style="display:none"></div>
        <button type="submit" class="btn-primary" id="eb-btn">Confirm Booking</button>
      </form>
    </div>`;
  document.body.style.overflow = 'hidden';
}

function closeEventModal() {
  const modal = document.getElementById('event-booking-modal');
  modal.classList.remove('open');
  setTimeout(() => modal.classList.add('hidden'), 300);
  document.body.style.overflow = '';
}

async function submitEventBooking(e, eventId) {
  e.preventDefault();
  const btn = document.getElementById('eb-btn');
  const err = document.getElementById('eb-err');
  btn.disabled = true; btn.textContent = 'Booking...'; err.style.display = 'none';
  try {
    await api.bookEvent(eventId, {
      name: document.getElementById('eb-name').value.trim(),
      email: document.getElementById('eb-email').value.trim(),
      phone: document.getElementById('eb-phone').value.trim(),
      guests: document.getElementById('eb-guests').value,
      notes: document.getElementById('eb-notes').value.trim(),
    });
    closeEventModal();
    Toast.show('Booking confirmed! See you there 🎉', 'success');
    renderEventsPage();
  } catch (err2) {
    err.textContent = err2.message; err.style.display = 'block';
    btn.disabled = false; btn.textContent = 'Confirm Booking';
  }
}
