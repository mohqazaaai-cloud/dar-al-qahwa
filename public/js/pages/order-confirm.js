const STATUS_STEPS = ['pending','confirmed','preparing','ready','completed'];
const STATUS_META = {
  pending:   { icon:'⏳', label:'Order received',   desc:'Sit tight — your order is in the queue.' },
  confirmed: { icon:'✅', label:'Confirmed',         desc:'Your order is confirmed and up next.' },
  preparing: { icon:'👨‍🍳', label:'Being prepared',  desc:'Your barista is working on it now.' },
  ready:     { icon:'🔔', label:'Ready to collect',  desc:'Your order is ready! Come pick it up.' },
  completed: { icon:'☕', label:'Enjoy!',             desc:'Thanks for visiting Dar Al-Qahwa.' },
  cancelled: { icon:'❌', label:'Cancelled',          desc:'This order was cancelled.' },
};

async function renderOrderConfirm({ id }) {
  document.getElementById('app').innerHTML = `
    <div class="order-tracker">
      <div class="loading-block"><div class="spinner"></div></div>
    </div>`;

  try {
    const order = await api.getOrder(id);
    renderTracker(order);
    if (!['completed','cancelled'].includes(order.status)) {
      startPolling(id);
    }
  } catch (err) {
    document.getElementById('app').innerHTML = `
      <div class="confirm-pg">
        <div class="confirm-icon">❌</div>
        <h1 class="serif">Order not found</h1>
        <p style="color:var(--text-sec);margin:1rem 0">${err.message}</p>
        <button class="btn-primary" onclick="Router.go('/')">Go Home</button>
      </div>`;
  }
}

function renderTracker(order) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const stepIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const linePct = isCancelled ? 0 : Math.max(0, (stepIdx / (STATUS_STEPS.length - 1)) * 100);

  document.getElementById('app').innerHTML = `
    <div class="order-tracker">
      <div class="reveal" style="text-align:center;margin-bottom:2.5rem">
        <div style="font-size:3.5rem;margin-bottom:.75rem;animation:confirm-bounce .6s cubic-bezier(.34,1.56,.64,1) both">${meta.icon}</div>
        <h1 class="serif" style="font-size:2.2rem;font-weight:400;margin-bottom:.25rem">${meta.label}</h1>
        <p class="order-number">${order.order_number}</p>
        <p style="color:var(--text-sec);font-weight:300;font-size:.95rem">${meta.desc}</p>
      </div>

      ${!isCancelled ? `
      <!-- TRACKER -->
      <div class="tracker-steps reveal">
        <div class="tracker-line" id="tracker-line" style="width:${linePct}%"></div>
        ${STATUS_STEPS.map((s, i) => {
          const sm = STATUS_META[s];
          const done = i < stepIdx || order.status === 'completed';
          const active = i === stepIdx && order.status !== 'completed';
          return `<div class="tracker-step">
            <div class="step-dot ${done||order.status==='completed'?'done':''} ${active?'active':''}">${sm.icon}</div>
            <span class="step-label ${done||order.status==='completed'?'done':''}">${sm.label}</span>
          </div>`;
        }).join('')}
      </div>
      <p id="last-updated" style="text-align:center;font-size:.75rem;color:var(--text-ter);margin-top:-.5rem;margin-bottom:2rem">
        Updated ${timeAgoLocal(order.updated_at || order.created_at)}
      </p>
      ` : ''}

      <!-- ORDER SUMMARY -->
      <div class="confirm-items reveal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
          <h3 style="font-size:.9rem;font-weight:500">Order Summary</h3>
          ${order.table_number ? `<span style="font-size:.8rem;color:var(--text-sec)">Table ${order.table_number}</span>` : ''}
        </div>
        ${order.items.map(i => `
          <div class="confirm-item">
            <span>${i.name} × ${i.quantity}</span>
            <span>${(i.price * i.quantity).toFixed(2)} JD</span>
          </div>`).join('')}
        <div class="confirm-item">
          <span style="font-weight:600">Total</span>
          <span style="font-weight:600;font-family:'Playfair Display',serif;color:var(--brown)">${order.total.toFixed(2)} JD</span>
        </div>
        ${order.notes ? `<p style="font-size:.78rem;color:var(--text-sec);margin-top:.75rem;padding-top:.75rem;border-top:.5px solid var(--border)">📝 ${order.notes}</p>` : ''}
      </div>

      <!-- RECEIPT BUTTON -->
      <div class="reveal" style="text-align:center;margin-top:1.5rem">
        <button class="btn-ghost" onclick="showReceipt(${JSON.stringify(order).replace(/"/g,'&quot;')})">🧾 View Receipt</button>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem" class="reveal">
        <button class="btn-primary" onclick="Router.go('/menu')">Order More</button>
        <button class="btn-ghost" onclick="Router.go('/')">Go Home</button>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receipt-modal" class="modal hidden"></div>
  `;

  initPageAnimations();
}

let _pollInterval = null;
function startPolling(orderNum) {
  if (_pollInterval) clearInterval(_pollInterval);
  let polls = 0;
  _pollInterval = setInterval(async () => {
    polls++;
    if (polls > 72) { clearInterval(_pollInterval); return; }
    try {
      const order = await api.getOrder(orderNum);
      // Update tracker line smoothly
      const stepIdx = STATUS_STEPS.indexOf(order.status);
      const linePct = Math.max(0, (stepIdx / (STATUS_STEPS.length - 1)) * 100);
      const line = document.getElementById('tracker-line');
      if (line) line.style.width = linePct + '%';

      // Update step dots
      document.querySelectorAll('.step-dot').forEach((dot, i) => {
        dot.classList.remove('done','active');
        if (i < stepIdx || order.status === 'completed') dot.classList.add('done');
        else if (i === stepIdx) dot.classList.add('active');
      });
      document.querySelectorAll('.step-label').forEach((lbl, i) => {
        lbl.classList.toggle('done', i < stepIdx || order.status === 'completed');
      });

      const upd = document.getElementById('last-updated');
      if (upd) upd.textContent = 'Updated just now';

      if (['completed','cancelled'].includes(order.status)) {
        clearInterval(_pollInterval);
        Toast.show(STATUS_META[order.status].desc, order.status === 'completed' ? 'success' : 'error');
      }
    } catch { clearInterval(_pollInterval); }
  }, 5000);
}

function showReceipt(order) {
  const modal = document.getElementById('receipt-modal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
  const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeReceipt()"></div>
    <div class="modal-box" style="max-width:400px">
      <div class="receipt" id="receipt-content">
        <h2>Dar Al-Qahwa</h2>
        <p class="r-sub">12 Al-Quds St, Weibdeh, Amman</p>
        <hr class="receipt-divider"/>
        <div class="receipt-row"><span>Order #</span><span>${order.order_number}</span></div>
        <div class="receipt-row"><span>Customer</span><span>${order.customer_name}</span></div>
        ${order.table_number ? `<div class="receipt-row"><span>Table</span><span>${order.table_number}</span></div>` : ''}
        <div class="receipt-row"><span>Date</span><span>${now}</span></div>
        <hr class="receipt-divider"/>
        ${order.items.map(i => `
          <div class="receipt-row"><span>${i.name} ×${i.quantity}</span><span>${(i.price*i.quantity).toFixed(2)} JD</span></div>
        `).join('')}
        <div class="receipt-row total"><span>TOTAL</span><span>${order.total.toFixed(2)} JD</span></div>
        <hr class="receipt-divider"/>
        <div class="receipt-footer">
          شكراً · Thank you for visiting!<br>
          hello@daralqahwa.jo<br>
          +962 6 461 0099
        </div>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1.25rem;justify-content:center">
        <button class="btn-primary" onclick="window.print()">🖨️ Print</button>
        <button class="btn-ghost" onclick="closeReceipt()">Close</button>
      </div>
    </div>`;
  document.body.style.overflow = 'hidden';
}

function closeReceipt() {
  const modal = document.getElementById('receipt-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.classList.add('hidden'), 300);
  document.body.style.overflow = '';
}

function timeAgoLocal(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins/60)}h ago`;
}
