function renderQRPage() {
  const menuUrl = window.location.origin + '/menu';
  document.getElementById('app').innerHTML = `
    <div class="qr-page reveal">
      <p class="section-tag">Contactless ordering</p>
      <h1 class="section-title serif" style="font-size:2.4rem">QR Menu</h1>
      <p style="color:var(--text-sec);font-weight:300;margin-bottom:.5rem">Print this and place it on each table. Guests scan to browse the menu and order.</p>

      <div class="qr-box" id="qr-print-area">
        <div style="text-align:center;margin-bottom:1rem">
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:600;color:#1a1612">Dar <span style="color:#8B5E3C">Al-Qahwa</span></div>
          <p style="font-size:.72rem;color:#777;margin-top:.2rem;text-transform:uppercase;letter-spacing:.15em">Scan to view our menu</p>
        </div>
        <div id="qr-canvas" style="display:flex;align-items:center;justify-content:center;margin:1rem 0"></div>
        <p style="font-size:.7rem;color:#999;text-align:center;margin-top:.75rem;word-break:break-all">${menuUrl}</p>
      </div>

      <div class="qr-print-btn">
        <button class="btn-primary" onclick="window.print()">🖨️ Print QR Code</button>
        <button class="btn-ghost" onclick="downloadQR()">⬇️ Download PNG</button>
        <button class="btn-ghost" onclick="Router.go('/menu')">View Menu</button>
      </div>

      <div style="margin-top:3rem;background:var(--surface2);border:.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;text-align:left;max-width:480px;margin-left:auto;margin-right:auto">
        <h3 style="font-size:.95rem;font-weight:500;margin-bottom:.75rem">How to use</h3>
        <div style="display:flex;flex-direction:column;gap:.6rem">
          <div style="display:flex;gap:.75rem;align-items:flex-start;font-size:.85rem;color:var(--text-sec)"><span style="background:var(--brown);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0">1</span>Print this page or save the QR image</div>
          <div style="display:flex;gap:.75rem;align-items:flex-start;font-size:.85rem;color:var(--text-sec)"><span style="background:var(--brown);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0">2</span>Place one copy on each table</div>
          <div style="display:flex;gap:.75rem;align-items:flex-start;font-size:.85rem;color:var(--text-sec)"><span style="background:var(--brown);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0">3</span>Guests scan with their phone camera — no app needed</div>
          <div style="display:flex;gap:.75rem;align-items:flex-start;font-size:.85rem;color:var(--text-sec)"><span style="background:var(--brown);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0">4</span>They browse the menu and place their order online</div>
        </div>
      </div>
    </div>
    ${renderFooterHTML()}
  `;

  generateQR(menuUrl);
  initPageAnimations();
}

function generateQR(url) {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;

  // Generate QR using Google Charts API (no library needed)
  const size = 200;
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=5a3a22&qzone=1&format=png`;
  img.style.cssText = `width:${size}px;height:${size}px;border-radius:8px`;
  img.alt = 'QR Code for menu';
  img.id = 'qr-img';
  canvas.appendChild(img);
}

function downloadQR() {
  const img = document.getElementById('qr-img');
  if (!img) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = 'dar-al-qahwa-menu-qr.png';
  a.click();
  Toast.show('QR code downloading...', 'success');
}
