function renderLoyaltyPage() {
  document.getElementById('app').innerHTML = `
    <div style="padding:3rem 2.5rem;max-width:800px;margin:0 auto">
      <div class="reveal" style="text-align:center;margin-bottom:3rem">
        <p class="section-tag">Rewards for regulars</p>
        <h1 class="section-title serif" style="font-size:2.8rem">Loyalty Program</h1>
        <p style="color:var(--text-sec);font-size:.95rem;font-weight:300;max-width:500px;margin:0 auto">
          Every 9 coffees, the 10th is on us. No app, no fuss — just your email.
        </p>
      </div>

      <!-- How it works -->
      <div class="reveal" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-bottom:3rem">
        <div style="text-align:center;padding:1.75rem 1.25rem;border:.5px solid var(--border);border-radius:var(--radius-lg)">
          <div style="font-size:2rem;margin-bottom:.75rem">☕</div>
          <h3 style="font-size:.95rem;font-weight:500;margin-bottom:.4rem">Order</h3>
          <p style="font-size:.8rem;color:var(--text-sec);line-height:1.6">Buy any coffee or tea and earn a stamp</p>
        </div>
        <div style="text-align:center;padding:1.75rem 1.25rem;border:.5px solid var(--border);border-radius:var(--radius-lg)">
          <div style="font-size:2rem;margin-bottom:.75rem">🎯</div>
          <h3 style="font-size:.95rem;font-weight:500;margin-bottom:.4rem">Collect</h3>
          <p style="font-size:.8rem;color:var(--text-sec);line-height:1.6">Collect 9 stamps on your loyalty card</p>
        </div>
        <div style="text-align:center;padding:1.75rem 1.25rem;border:.5px solid var(--border);border-radius:var(--radius-lg)">
          <div style="font-size:2rem;margin-bottom:.75rem">🎁</div>
          <h3 style="font-size:.95rem;font-weight:500;margin-bottom:.4rem">Redeem</h3>
          <p style="font-size:.8rem;color:var(--text-sec);line-height:1.6">Your 10th drink is completely free</p>
        </div>
      </div>

      <!-- Tabs: Check card / Join -->
      <div style="display:flex;border-bottom:.5px solid var(--border);margin-bottom:2rem">
        <button class="tab-btn active" id="tab-check" onclick="loyaltyTab('check')">Check My Card</button>
        <button class="tab-btn" id="tab-join" onclick="loyaltyTab('join')">Join the Program</button>
      </div>

      <!-- Check card panel -->
      <div id="panel-check">
        <form onsubmit="lookupLoyalty(event)" style="display:flex;gap:1rem;align-items:flex-end;margin-bottom:2rem">
          <div class="form-group" style="flex:1">
            <label>Your Email</label>
            <input type="email" id="ly-email" placeholder="your@email.com" required/>
          </div>
          <button type="submit" class="btn-primary" id="ly-lookup-btn" style="white-space:nowrap">Check Card</button>
        </form>
        <div id="loyalty-result"></div>
      </div>

      <!-- Join panel -->
      <div id="panel-join" style="display:none">
        <form onsubmit="joinLoyalty(event)" style="display:flex;flex-direction:column;gap:1.25rem;max-width:480px">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" id="ly-name" placeholder="Layla Haddad" required/>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" id="ly-join-email" placeholder="layla@example.com" required/>
            </div>
          </div>
          <div class="form-group">
            <label>Phone (optional)</label>
            <input type="tel" id="ly-phone" placeholder="+962 79 000 0000"/>
          </div>
          <div class="form-error" id="ly-err" style="display:none"></div>
          <button type="submit" class="btn-primary" id="ly-join-btn" style="align-self:flex-start">Join Now — It's Free</button>
        </form>
      </div>
    </div>
    ${renderFooterHTML()}
  `;
  initPageAnimations();
}

function loyaltyTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-check').style.display = tab === 'check' ? 'block' : 'none';
  document.getElementById('panel-join').style.display = tab === 'join' ? 'block' : 'none';
}

async function lookupLoyalty(e) {
  e.preventDefault();
  const email = document.getElementById('ly-email').value;
  const btn = document.getElementById('ly-lookup-btn');
  const result = document.getElementById('loyalty-result');
  btn.disabled = true; btn.textContent = 'Looking up...';
  try {
    const member = await api.loyaltyLookup(email);
    const stampsRequired = member.stamps_required || 9;
    const progress = member.stamps || 0;
    const pct = Math.min((progress / stampsRequired) * 100, 100);

    result.innerHTML = `
      <div style="background:var(--surface2);border:.5px solid var(--border);border-radius:var(--radius-lg);padding:2rem;animation:page-in .4s ease">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <div>
            <h2 class="serif" style="font-size:1.6rem;font-weight:400">Hey, ${member.name}! 👋</h2>
            <p style="color:var(--text-sec);font-size:.85rem;margin-top:.25rem">${member.total_visits} visits · Member since ${new Date(member.joined_at).getFullYear()}</p>
          </div>
          ${member.free_drinks > 0 ? `<div style="background:var(--brown);color:#fff;padding:.75rem 1.25rem;border-radius:var(--radius-md);text-align:center"><div style="font-size:1.5rem;font-weight:600">${member.free_drinks}</div><div style="font-size:.7rem;opacity:.8;text-transform:uppercase;letter-spacing:.1em">Free drink${member.free_drinks > 1 ? 's' : ''} ready!</div></div>` : ''}
        </div>

        <div style="margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-sec)">Stamps this round</span>
            <span style="font-size:.85rem;font-weight:500">${progress} / ${stampsRequired}</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--brown);border-radius:4px;transition:width .6s cubic-bezier(.16,1,.3,1)"></div>
          </div>
        </div>

        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
          ${Array.from({length: stampsRequired}).map((_, i) =>
            `<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:.5px solid ${i < progress ? 'var(--brown)' : 'var(--border)'};background:${i < progress ? 'var(--brown)' : 'transparent'};color:${i < progress ? '#fff' : 'var(--text-ter)'}">☕</div>`
          ).join('')}
        </div>

        <p style="font-size:.8rem;color:var(--text-sec);margin-top:1.25rem">
          ${progress === 0 && member.free_drinks === 0 ? 'Start ordering to earn your first stamp!' :
            progress > 0 ? `${stampsRequired - progress} more stamp${stampsRequired - progress !== 1 ? 's' : ''} until your next free drink!` :
            'You have a free drink waiting — show this to your barista!'}
        </p>
      </div>
    `;
  } catch (err) {
    if (err.message.includes('Not a member')) {
      result.innerHTML = `
        <div style="background:var(--surface2);border:.5px solid var(--border);border-radius:var(--radius-lg);padding:2rem;text-align:center">
          <p style="font-size:1rem;margin-bottom:1rem">We couldn't find that email. Want to join?</p>
          <button class="btn-primary" onclick="loyaltyTab('join')">Join the Program</button>
        </div>`;
    } else {
      result.innerHTML = `<p style="color:var(--red)">${err.message}</p>`;
    }
  } finally {
    btn.disabled = false; btn.textContent = 'Check Card';
  }
}

async function joinLoyalty(e) {
  e.preventDefault();
  const btn = document.getElementById('ly-join-btn');
  const err = document.getElementById('ly-err');
  btn.disabled = true; btn.textContent = 'Joining...'; err.style.display = 'none';
  try {
    const member = await api.loyaltyJoin({
      name: document.getElementById('ly-name').value.trim(),
      email: document.getElementById('ly-join-email').value.trim(),
      phone: document.getElementById('ly-phone').value.trim(),
    });
    document.getElementById('app').querySelector('[style*="max-width:800px"]').innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;animation:page-in .4s ease">
        <div style="font-size:3.5rem;margin-bottom:1rem">🎉</div>
        <h2 class="serif" style="font-size:2rem;font-weight:400;margin-bottom:.5rem">Welcome, ${member.name}!</h2>
        <p style="color:var(--text-sec);margin-bottom:2rem;font-weight:300">You're now part of the Dar Al-Qahwa family.<br>Next time you order, ask us to add a stamp to your card.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" data-link="/menu">Explore the Menu</button>
          <button class="btn-ghost" onclick="loyaltyTab('check');document.getElementById('ly-email').value='${member.email}'">View My Card</button>
        </div>
      </div>`;
    Toast.show('Welcome to the loyalty program! ☕', 'success');
  } catch (err2) {
    err.textContent = err2.message; err.style.display = 'block';
    btn.disabled = false; btn.textContent = 'Join Now — It\'s Free';
  }
}
