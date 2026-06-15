function renderContactPage() {
  document.getElementById('app').innerHTML = `
    <div style="padding:3rem 2.5rem;max-width:1100px;margin:0 auto">
      <div class="reveal" style="margin-bottom:3rem">
        <p class="section-tag">Get in touch</p>
        <h1 class="section-title serif" style="font-size:2.8rem">Contact Us</h1>
        <p style="color:var(--text-sec);font-size:.95rem;font-weight:300">We'd love to hear from you. Whether it's a question, a collaboration, or just saying hi.</p>
      </div>

      <div class="contact-grid">
        <!-- FORM -->
        <div class="reveal-left">
          <form class="contact-form" onsubmit="submitContact(event)">
            <div class="float-group">
              <input type="text" id="ct-name" placeholder=" " required/>
              <label>Your Name</label>
            </div>
            <div class="float-group">
              <input type="email" id="ct-email" placeholder=" " required/>
              <label>Email Address</label>
            </div>
            <div class="float-group">
              <input type="text" id="ct-subject" placeholder=" "/>
              <label>Subject</label>
            </div>
            <div class="float-group">
              <textarea id="ct-message" rows="5" placeholder=" " required></textarea>
              <label>Message</label>
            </div>
            <div class="form-error" id="ct-err" style="display:none"></div>
            <button type="submit" class="btn-primary" id="ct-btn" style="align-self:flex-start">Send Message</button>
          </form>
        </div>

        <!-- INFO -->
        <div class="reveal-right" style="display:flex;flex-direction:column;gap:1.5rem">
          <div>
            <h2 class="serif" style="font-size:1.6rem;font-weight:400;margin-bottom:1.25rem">Find us</h2>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <div style="display:flex;gap:.85rem;align-items:flex-start">
                <div style="width:38px;height:38px;background:var(--brown-bg);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">📍</div>
                <div>
                  <p style="font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-sec);margin-bottom:.2rem">Address</p>
                  <p style="font-size:.9rem;line-height:1.6" id="ct-address">12 Al-Quds Street, Jabal Al-Weibdeh<br>Amman 11183, Jordan</p>
                </div>
              </div>
              <div style="display:flex;gap:.85rem;align-items:flex-start">
                <div style="width:38px;height:38px;background:var(--brown-bg);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">📞</div>
                <div>
                  <p style="font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-sec);margin-bottom:.2rem">Phone</p>
                  <p style="font-size:.9rem" id="ct-phone">+962 6 461 0099</p>
                </div>
              </div>
              <div style="display:flex;gap:.85rem;align-items:flex-start">
                <div style="width:38px;height:38px;background:var(--brown-bg);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">✉️</div>
                <div>
                  <p style="font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-sec);margin-bottom:.2rem">Email</p>
                  <p style="font-size:.9rem" id="ct-email-addr">hello@daralqahwa.jo</p>
                </div>
              </div>
              <div style="display:flex;gap:.85rem;align-items:flex-start">
                <div style="width:38px;height:38px;background:var(--brown-bg);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">🕐</div>
                <div>
                  <p style="font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-sec);margin-bottom:.2rem">Hours</p>
                  <p style="font-size:.9rem;line-height:1.6" id="ct-hours">Mon–Fri: 7:30 am – 11:00 pm<br>Sat–Sun: 8:00 am – midnight</p>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:.75rem;flex-wrap:wrap">
            <button class="btn-ghost" onclick="openWhatsApp()">💬 WhatsApp</button>
            <button class="btn-ghost" onclick="window.open(App._settings.instagram_url||'#')">📸 Instagram</button>
            <button class="btn-ghost" onclick="window.open(App._settings.facebook_url||'#')">👤 Facebook</button>
          </div>

          <div style="background:var(--surface2);border:.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem">
            <h3 style="font-size:.95rem;font-weight:500;margin-bottom:.5rem">Live Time in Amman</h3>
            <div id="live-clock" style="font-family:'Playfair Display',serif;font-size:2rem;color:var(--brown)"></div>
            <p style="font-size:.75rem;color:var(--text-sec);margin-top:.35rem">Arabia Standard Time (UTC+3)</p>
          </div>
        </div>
      </div>
    </div>
    ${renderFooterHTML()}
  `;

  // Fill settings
  const s = App._settings;
  if (s.cafe_address) document.getElementById('ct-address').textContent = s.cafe_address;
  if (s.cafe_phone)   document.getElementById('ct-phone').textContent = s.cafe_phone;
  if (s.cafe_email)   document.getElementById('ct-email-addr').textContent = s.cafe_email;
  if (s.cafe_hours_weekday) document.getElementById('ct-hours').innerHTML = 'Mon–Fri: '+s.cafe_hours_weekday+'<br>Sat–Sun: '+(s.cafe_hours_weekend||'');

  initPageAnimations();
  initLiveClock(document.getElementById('live-clock'));
}

async function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('ct-btn');
  const err = document.getElementById('ct-err');
  btn.disabled = true; btn.textContent = 'Sending...'; err.style.display = 'none';
  // Simulate sending (in real app would POST to /api/contact)
  await new Promise(r => setTimeout(r, 1000));
  document.querySelector('.contact-form').innerHTML = `
    <div style="text-align:center;padding:2rem 0;animation:page-in .4s ease">
      <div style="font-size:3rem;margin-bottom:1rem">✅</div>
      <h2 class="serif" style="font-size:1.6rem;font-weight:400;margin-bottom:.5rem">Message sent!</h2>
      <p style="color:var(--text-sec);font-weight:300">We'll get back to you within 24 hours.</p>
    </div>`;
  Toast.show('Message sent! We\'ll be in touch.', 'success');
}
