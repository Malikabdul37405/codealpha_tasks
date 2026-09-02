/**
 * ShopEasy Express Server (SPA)
 * Serves one index.html + JSON API for auth, products, cart, orders, contact.
 */
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'shopeasy-secret-2026-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please login first' });
  next();
}

/* ---------- Auth ---------- */
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 characters' });
    if (db.getUserByEmail(email)) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = db.createUser({ name, email, password: hash });
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: 'Registration failed' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: 'Login failed' }); }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = db.getUserById(req.session.userId);
  if (!user) return res.json({ user: null });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

/* ---------- Products ---------- */
app.get('/api/products', (req, res) => res.json(db.getProducts()));
app.get('/api/products/:id', (req, res) => {
  const p = db.getProduct(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

/* ---------- Cart ---------- */
app.get('/api/cart', requireAuth, (req, res) => {
  const items = db.getCart(req.session.userId);
  const detailed = items.map(item => {
    const product = db.getProduct(item.productId);
    return { productId: item.productId, quantity: item.quantity, product, subtotal: product ? product.price * item.quantity : 0 };
  }).filter(i => i.product);
  res.json({ items: detailed, total: detailed.reduce((s, i) => s + i.subtotal, 0) });
});

app.post('/api/cart/add', requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.getProduct(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ error: 'Out of stock' });
  let cart = db.getCart(req.session.userId);
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    if (existing.quantity + quantity > product.stock)
      return res.status(400).json({ error: `Only ${product.stock} available` });
    existing.quantity += quantity;
  } else cart.push({ productId, quantity });
  db.setCart(req.session.userId, cart);
  res.json({ success: true, message: 'Added to cart' });
});

app.post('/api/cart/update', requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  let cart = db.getCart(req.session.userId);
  if (quantity <= 0) cart = cart.filter(i => i.productId !== productId);
  else {
    const product = db.getProduct(productId);
    if (!product || quantity > product.stock) return res.status(400).json({ error: 'Invalid quantity' });
    const item = cart.find(i => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  db.setCart(req.session.userId, cart);
  res.json({ success: true });
});

app.post('/api/cart/remove', requireAuth, (req, res) => {
  db.setCart(req.session.userId, db.getCart(req.session.userId).filter(i => i.productId !== req.body.productId));
  res.json({ success: true });
});

/* ---------- Checkout / Orders ---------- */
app.post('/api/checkout', requireAuth, (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || shippingAddress.trim().length < 10)
    return res.status(400).json({ error: 'Please provide a complete shipping address' });
  const cart = db.getCart(req.session.userId);
  if (!cart.length) return res.status(400).json({ error: 'Cart is empty' });
  const items = [];
  let total = 0;
  for (const item of cart) {
    const product = db.getProduct(item.productId);
    if (!product || product.stock < item.quantity)
      return res.status(400).json({ error: `Not enough stock for ${product?.name || 'item'}` });
    items.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, subtotal: product.price * item.quantity });
    total += product.price * item.quantity;
  }
  items.forEach(i => db.updateProductStock(i.productId, i.quantity));
  const order = db.createOrder({
    userId: req.session.userId, items, total,
    shippingAddress: shippingAddress.trim(), status: 'pending'
  });
  db.clearCart(req.session.userId);
  res.json({ success: true, order });
});

app.get('/api/orders', requireAuth, (req, res) => res.json(db.getOrdersByUser(req.session.userId)));
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order || order.userId !== req.session.userId) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

/* ---------- Contact Us ---------- */
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'All fields are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Please enter a valid email' });
    db.addContact({
      name: name.trim(), email: email.trim().toLowerCase(),
      subject: subject.trim(), message: message.trim()
    });
    console.log('[Contact]', email, '–', subject);
    res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/* SPA fallback */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 ShopEasy running at http://localhost:${PORT}\n`);
});
