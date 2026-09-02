# ShopEasy — Stylish SPA E-Commerce (Express.js)

Single-page application with shared layout (no duplicated HTML).  
Navbar stays horizontal, user dropdown when logged in, Contact Us, professional footer.

## Features
- **SPA** – one index.html, instant section switching (no full reload)
- Horizontal navbar (Home · Shop · Orders · Contact) with hover + active state
- Logged-in: SVG avatar + name → dropdown (My Orders / Logout)
- Contact Us form (saved in JSON DB)
- Product listing, detail, cart, checkout, orders
- Dark premium theme, animations, card hover effects
- Professional multi-column footer

## Run
```bash
npm install
npm start
```
Open http://localhost:3000

## Structure
```
server.js
data/db.js
public/
  index.html      # single layout + all sections
  css/style.css
  js/app.js
```
