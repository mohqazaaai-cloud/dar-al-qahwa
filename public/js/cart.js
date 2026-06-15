const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('daq_cart') || '[]');

  function save() { localStorage.setItem('daq_cart', JSON.stringify(items)); }

  function render() {
    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotal = document.getElementById('cart-total');
    const badge = document.getElementById('cart-badge');

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);

    if (badge) badge.textContent = count;

    if (!items.length) {
      cartItems.innerHTML = '';
      cartEmpty.style.display = 'flex';
      cartFooter.classList.add('hidden');
      return;
    }

    cartEmpty.style.display = 'none';
    cartFooter.classList.remove('hidden');
    cartTotal.textContent = total.toFixed(2) + ' JD';

    cartItems.innerHTML = items.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${(item.price * item.qty).toFixed(2)} JD</p>
        </div>
        <div class="cart-qty">
          <button onclick="Cart.dec(${idx})">−</button>
          <span>${item.qty}</span>
          <button onclick="Cart.inc(${idx})">+</button>
        </div>
      </div>
    `).join('');
  }

  return {
    add(item) {
      const existing = items.find(i => i.id === item.id);
      if (existing) { existing.qty += 1; }
      else { items.push({ ...item, qty: 1 }); }
      save(); render();
      Toast.show(`${item.name} added to order`, 'success');
      bumpCartBadge();
      Cart.open();
    },
    inc(idx) { items[idx].qty += 1; save(); render(); },
    dec(idx) {
      items[idx].qty -= 1;
      if (items[idx].qty <= 0) items.splice(idx, 1);
      save(); render();
    },
    clear() { items = []; save(); render(); },
    get() { return items; },
    total() { return items.reduce((s, i) => s + i.price * i.qty, 0); },
    open() {
      CartAnim.open();
      render();
    },
    close() {
      CartAnim.close();
    },
    init() {
      render();
      document.getElementById('cart-close').addEventListener('click', Cart.close);
      document.getElementById('cart-overlay').addEventListener('click', Cart.close);
      document.getElementById('cart-checkout').addEventListener('click', Cart.checkout);
    },
    async checkout() {
      if (!items.length) return;
      const name = document.getElementById('cart-name').value.trim();
      const table = document.getElementById('cart-table').value.trim();
      const notes = document.getElementById('cart-notes').value.trim();
      const btn = document.getElementById('cart-checkout');
      btn.disabled = true;
      btn.textContent = 'Placing order...';
      try {
        const order = await api.placeOrder({
          customer_name: name || 'Guest',
          table_number: table,
          notes,
          items: items.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
        });
        Cart.clear();
        Cart.close();
        Router.go('/order/' + order.order_number);
      } catch (err) {
        Toast.show(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Place Order';
      }
    }
  };
})();

// Toast is defined in animations.js
