/**
 * ShopEasy JSON Database Module
 * Lightweight file-based storage. Persists to data/store.json.
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'store.json');

const defaultData = {
  users: [],
  products: [
    { id: 'p1', name: 'Aurora Wireless Headphones', description: 'Immersive noise-cancelling headphones with 40-hour battery, premium leather earcups and crystal-clear audio.', price: 129.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'Audio', stock: 45, rating: 4.8 },
    { id: 'p2', name: 'Nova Smart Watch Pro', description: 'Advanced health tracking, always-on AMOLED display, GPS and 5-day battery life.', price: 249.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', category: 'Wearables', stock: 28, rating: 4.7 },
    { id: 'p3', name: 'Eclipse Laptop Backpack', description: 'Weatherproof ballistic nylon backpack with TSA-friendly laptop sleeve and USB charging port.', price: 89.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', category: 'Accessories', stock: 80, rating: 4.6 },
    { id: 'p4', name: 'Pulse Portable Speaker', description: '360° sound, IPX7 waterproof, 20-hour playtime and deep bass.', price: 69.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', category: 'Audio', stock: 60, rating: 4.5 },
    { id: 'p5', name: 'Horizon USB-C Dock', description: '12-in-1 docking station with dual 4K HDMI, 100W power delivery, Ethernet and SD reader.', price: 119.99, image: 'https://images.unsplash.com/photo-1625948515291-69613efd2563?w=600&q=80', category: 'Accessories', stock: 35, rating: 4.9 },
    { id: 'p6', name: 'Velocity Mechanical Keyboard', description: 'Hot-swappable RGB mechanical keyboard with aluminum frame and magnetic wrist rest.', price: 159.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80', category: 'Peripherals', stock: 22, rating: 4.8 },
    { id: 'p7', name: 'Lumina Desk Lamp', description: 'Smart LED desk lamp with adjustable color temperature and wireless charging base.', price: 79.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', category: 'Home', stock: 50, rating: 4.4 },
    { id: 'p8', name: 'Aero Running Shoes', description: 'Ultra-lightweight performance running shoes with responsive cushioning.', price: 139.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'Footwear', stock: 40, rating: 4.7 }
  ],
  orders: [],
  carts: {},
  contacts: []
};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) { console.error('[DB] load error', e.message); }
  save(defaultData);
  return JSON.parse(JSON.stringify(defaultData));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let db = load();

module.exports = {
  getUserById: (id) => db.users.find(u => u.id === id),
  getUserByEmail: (email) => db.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user) => {
    user.id = uuidv4();
    user.createdAt = new Date().toISOString();
    db.users.push(user);
    save(db);
    return user;
  },
  getProducts: () => db.products,
  getProduct: (id) => db.products.find(p => p.id === id),
  updateProductStock: (id, qty) => {
    const p = db.products.find(pr => pr.id === id);
    if (p) { p.stock = Math.max(0, p.stock - qty); save(db); }
  },
  getCart: (userId) => {
    if (!db.carts[userId]) db.carts[userId] = [];
    return db.carts[userId];
  },
  setCart: (userId, items) => { db.carts[userId] = items; save(db); },
  clearCart: (userId) => { db.carts[userId] = []; save(db); },
  createOrder: (order) => {
    order.id = 'ORD-' + Date.now().toString(36).toUpperCase();
    order.createdAt = new Date().toISOString();
    db.orders.push(order);
    save(db);
    return order;
  },
  getOrdersByUser: (userId) =>
    db.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  getOrder: (id) => db.orders.find(o => o.id === id),
  addContact: (msg) => {
    msg.id = uuidv4();
    msg.createdAt = new Date().toISOString();
    db.contacts.push(msg);
    save(db);
    return msg;
  }
};
