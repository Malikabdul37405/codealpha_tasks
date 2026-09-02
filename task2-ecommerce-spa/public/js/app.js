/**
 * ShopEasy SPA – main application logic
 * Handles routing between sections, auth, cart, orders, contact form.
 */
const API = '';
let state = { user: null, products: [], currentQty: 1 };

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'include',
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, type = 'success') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === id);
  });
  document.getElementById('user-menu')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function productCard(p) {
  return `<div class="product-card" data-id="${p.id}">
    <div class="img-wrap">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <button class="btn btn-primary btn-sm quick-add" data-add="${p.id}">Add to Cart</button>
    </div>
    <div class="product-info">
      <div class="product-cat">${p.category}</div>
      <h3>${p.name}</h3>
      <div class="product-meta">
        <span class="price">$${p.price.toFixed(2)}</span>
        <span class="rating">★ ${p.rating}</span>
      </div>
    </div>
  </div>`;
}

async function loadProducts() {
  state.products = await api('/api/products');
  document.getElementById('featured-grid').innerHTML = state.products.slice(0, 4).map(productCard).join('');
  renderProducts('all');
}

function renderProducts(cat) {
  const list = cat === 'all' ? state.products : state.products.filter(p => p.category === cat);
  document.getElementById('products-grid').innerHTML = list.map(productCard).join('') || '<p class="empty-state">No products</p>';
}

async function showDetail(id) {
  const p = await api('/api/products/' + id);
  state.currentQty = 1;
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-image"><img src="${p.image}" alt="${p.name}"></div>
    <div class="detail-info">
      <div class="product-cat">${p.category}</div>
      <h1>${p.name}</h1>
      <div class="detail-price">$${p.price.toFixed(2)}</div>
      <p class="detail-desc">${p.description}</p>
      <div class="detail-meta"><span>★ ${p.rating}</span><span>Stock: ${p.stock}</span></div>
      <div class="qty-control">
        <button type="button" id="qty-minus">−</button>
        <span id="qty-val">1</span>
        <button type="button" id="qty-plus">+</button>
      </div>
      <button class="btn btn-primary btn-lg" id="add-detail" data-id="${p.id}">Add to Cart</button>
      <button class="btn btn-outline btn-lg" data-page="products" style="margin-left:.5rem">Back to Shop</button>
    </div>`;
  showPage('detail');
  document.getElementById('qty-minus').onclick = () => {
    if (state.currentQty > 1) { state.currentQty--; document.getElementById('qty-val').textContent = state.currentQty; }
  };
  document.getElementById('qty-plus').onclick = () => {
    if (state.currentQty < p.stock) { state.currentQty++; document.getElementById('qty-val').textContent = state.currentQty; }
  };
  document.getElementById('add-detail').onclick = () => addToCart(p.id, state.currentQty);
}

async function addToCart(productId, qty = 1) {
  if (!state.user) { openAuth('login'); toast('Please login first', 'error'); return; }
  try {
    await api('/api/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity: qty }) });
    toast('Added to cart!');
    updateCartCount();
  } catch (e) { toast(e.message, 'error'); }
}

async function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (!state.user) { badge.textContent = '0'; return; }
  try {
    const data = await api('/api/cart');
    badge.textContent = data.items.reduce((s, i) => s + i.quantity, 0);
  } catch { badge.textContent = '0'; }
}

async function showCart() {
  if (!state.user) { openAuth('login'); return; }
  try {
    const data = await api('/api/cart');
    const el = document.getElementById('cart-content');
    if (!data.items.length) {
      el.innerHTML = `<div class="empty-state"><h3>Your cart is empty</h3><p>Browse products and add something you love.</p><br><button class="btn btn-primary" data-page="products">Shop Now</button></div>`;
    } else {
      el.innerHTML = `
        <div class="cart-list">
          ${data.items.map(i => `
            <div class="cart-item">
              <img src="${i.product.image}" alt="">
              <div><h4>${i.product.name}</h4><div class="item-price">$${i.product.price.toFixed(2)}</div></div>
              <div class="qty-control">
                <button type="button" data-upd="${i.productId}" data-q="${i.quantity - 1}">−</button>
                <span>${i.quantity}</span>
                <button type="button" data-upd="${i.productId}" data-q="${i.quantity + 1}">+</button>
              </div>
              <div>
                <div style="font-weight:600;margin-bottom:.4rem">$${i.subtotal.toFixed(2)}</div>
                <button class="btn btn-danger btn-sm" data-rm="${i.productId}">Remove</button>
              </div>
            </div>`).join('')}
        </div>
        <div class="cart-summary">
          <div class="total">Total: $${data.total.toFixed(2)}</div>
          <button class="btn btn-primary btn-lg" data-page="checkout">Proceed to Checkout</button>
        </div>`;
    }
    showPage('cart');
  } catch (e) { toast(e.message, 'error'); }
}

async function showCheckout() {
  if (!state.user) { openAuth('login'); return; }
  const data = await api('/api/cart');
  if (!data.items.length) { showPage('cart'); return; }
  document.getElementById('checkout-content').innerHTML = `
    <div class="checkout-card">
      <h3>Shipping Address</h3>
      <form id="checkout-form">
        <div class="form-group">
          <label>Full Address</label>
          <textarea name="address" rows="4" required placeholder="Street, City, State, ZIP, Country"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Place Order</button>
      </form>
    </div>
    <div class="checkout-card">
      <h3>Order Summary</h3>
      ${data.items.map(i => `<div class="summary-line"><span>${i.product.name} × ${i.quantity}</span><span>$${i.subtotal.toFixed(2)}</span></div>`).join('')}
      <div class="summary-line total-line"><span>Total</span><span>$${data.total.toFixed(2)}</span></div>
    </div>`;
  showPage('checkout');
  document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: e.target.address.value })
      });
      toast('Order placed successfully!');
      updateCartCount();
      showOrderDetail(res.order.id);
    } catch (err) { toast(err.message, 'error'); }
  };
}

async function showOrders() {
  if (!state.user) { openAuth('login'); return; }
  const orders = await api('/api/orders');
  const el = document.getElementById('orders-content');
  if (!orders.length) {
    el.innerHTML = `<div class="empty-state"><h3>No orders yet</h3><button class="btn btn-primary" data-page="products">Start Shopping</button></div>`;
  } else {
    el.innerHTML = `<div class="orders-list">${orders.map(o => `
      <div class="order-card" data-order="${o.id}">
        <div><div class="order-id">${o.id}</div><div class="order-date">${new Date(o.createdAt).toLocaleString()}</div></div>
        <div style="text-align:right"><div style="font-weight:700">$${o.total.toFixed(2)}</div>
        <span class="status-badge status-${o.status}">${o.status}</span></div>
      </div>`).join('')}</div>`;
  }
  showPage('orders');
}

async function showOrderDetail(id) {
  const o = await api('/api/orders/' + id);
  document.getElementById('order-detail-content').innerHTML = `
    <div class="page-header">
      <h1>Order ${o.id}</h1>
      <p>${new Date(o.createdAt).toLocaleString()} · <span class="status-badge status-${o.status}">${o.status}</span></p>
    </div>
    <div class="checkout-grid" style="max-width:800px">
      <div class="checkout-card">
        <h3>Items</h3>
        ${o.items.map(i => `<div class="summary-line"><span>${i.name} × ${i.quantity}</span><span>$${i.subtotal.toFixed(2)}</span></div>`).join('')}
        <div class="summary-line total-line"><span>Total</span><span>$${o.total.toFixed(2)}</span></div>
      </div>
      <div class="checkout-card">
        <h3>Shipping Address</h3>
        <p style="white-space:pre-wrap;color:var(--text-muted)">${o.shippingAddress}</p>
        <br><button class="btn btn-outline" data-page="orders">Back to Orders</button>
      </div>
    </div>`;
  showPage('order-detail');
}

function openAuth(tab = 'login') {
  document.getElementById('auth-modal').classList.add('open');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-error').textContent = '';
}

function closeAuth() {
  document.getElementById('auth-modal').classList.remove('open');
}

function renderAuthUI() {
  if (state.user) {
    document.getElementById('auth-guest').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('user-display-name').textContent =
      state.user.name ? state.user.name.split(' ')[0] : state.user.id.slice(0, 8);
    document.getElementById('nav-orders').style.display = 'inline-flex';
  } else {
    document.getElementById('auth-guest').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
    document.getElementById('nav-orders').style.display = 'none';
  }
}

async function checkAuth() {
  try {
    const data = await api('/api/me');
    state.user = data.user;
  } catch { state.user = null; }
  renderAuthUI();
  updateCartCount();
}

document.addEventListener('click', async (e) => {
  const pageBtn = e.target.closest('[data-page]');
  if (pageBtn) {
    e.preventDefault();
    const p = pageBtn.dataset.page;
    if (p === 'cart') showCart();
    else if (p === 'checkout') showCheckout();
    else if (p === 'orders') showOrders();
    else showPage(p);
  }

  if (e.target.closest('#cart-btn')) { e.preventDefault(); showCart(); }
  if (e.target.closest('#login-btn')) openAuth('login');
  if (e.target.closest('#register-btn')) openAuth('register');
  if (e.target.closest('#modal-close') || e.target === document.getElementById('auth-modal')) closeAuth();

  if (e.target.closest('#logout-btn')) {
    await api('/api/logout', { method: 'POST' });
    state.user = null;
    renderAuthUI();
    updateCartCount();
    toast('Logged out');
    showPage('home');
  }

  if (e.target.closest('#user-trigger')) {
    e.stopPropagation();
    document.getElementById('user-menu').classList.toggle('open');
  } else {
    document.getElementById('user-menu')?.classList.remove('open');
  }

  const card = e.target.closest('.product-card');
  if (card && !e.target.closest('[data-add]')) showDetail(card.dataset.id);

  if (e.target.closest('[data-add]')) {
    e.stopPropagation();
    addToCart(e.target.closest('[data-add]').dataset.add);
  }

  if (e.target.closest('[data-upd]')) {
    const btn = e.target.closest('[data-upd]');
    try {
      await api('/api/cart/update', {
        method: 'POST',
        body: JSON.stringify({ productId: btn.dataset.upd, quantity: +btn.dataset.q })
      });
      showCart();
      updateCartCount();
    } catch (err) { toast(err.message, 'error'); }
  }

  if (e.target.closest('[data-rm]')) {
    try {
      await api('/api/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ productId: e.target.closest('[data-rm]').dataset.rm })
      });
      showCart();
      updateCartCount();
    } catch (err) { toast(err.message, 'error'); }
  }

  if (e.target.closest('[data-order]')) {
    showOrderDetail(e.target.closest('[data-order]').dataset.order);
  }

  if (e.target.closest('.filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderProducts(e.target.dataset.cat);
  }

  if (e.target.closest('.tab')) {
    openAuth(e.target.closest('.tab').dataset.tab);
  }
});

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') })
    });
    state.user = data.user;
    renderAuthUI();
    updateCartCount();
    closeAuth();
    toast('Welcome back!');
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
  }
};

document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const data = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: fd.get('name'), email: fd.get('email'), password: fd.get('password')
      })
    });
    state.user = data.user;
    renderAuthUI();
    updateCartCount();
    closeAuth();
    toast('Account created!');
  } catch (err) {
    document.getElementById('auth-error').textContent = err.message;
  }
};

document.getElementById('contact-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const errEl = document.getElementById('contact-error');
  errEl.textContent = '';
  try {
    const res = await api('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        subject: fd.get('subject'),
        message: fd.get('message')
      })
    });
    toast(res.message || 'Message sent!');
    e.target.reset();
  } catch (ex) {
    errEl.textContent = ex.message;
    toast(ex.message, 'error');
  }
};

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 16);
});

checkAuth();
loadProducts();
