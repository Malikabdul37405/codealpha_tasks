# CodeAlpha Internship Tasks

This repository contains all tasks completed during the **CodeAlpha** internship.

**Author:** Malik Abdul Hadi Umair  
**GitHub:** [Malikabdul37405](https://github.com/Malikabdul37405)

---

## Task 1 — Professional Mini Social Media Platform

**Folder:** [`task1-social-media-platform/`](./task1-social-media-platform/)

Full-stack social media app with clean architecture.

**Features:**
- User registration & login (JWT + bcrypt)
- Profiles, follow/unfollow
- Posts, likes, comments, personalized feed
- Pagination, validation, security
- PostgreSQL + Prisma + Express
- Responsive vanilla JS frontend

**Run:**
```bash
cd task1-social-media-platform
npm install
cp .env.example .env   # add Neon DATABASE_URL + JWT_SECRET
npx prisma migrate dev --schema=server/prisma/schema.prisma --name init
npm run dev
```
Open http://localhost:5000

---

## Task 2 — ShopEasy E-Commerce SPA

**Folder:** [`task2-ecommerce-spa/`](./task2-ecommerce-spa/)

Stylish single-page e-commerce application built with Express.js.

**Features:**
- SPA (one `index.html`, no full page reloads)
- Product listing, detail, cart, checkout, orders
- Auth (register/login with sessions + bcrypt)
- Contact Us form
- User dropdown menu when logged in
- Dark premium theme + animations
- Professional multi-column footer
- JSON file-based database

**Run:**
```bash
cd task2-ecommerce-spa
npm install
npm start
```
Open http://localhost:3000

---

## Repository structure

```
codealpha_tasks/
├── README.md
├── task1-social-media-platform/
│   ├── client/
│   ├── server/
│   ├── package.json
│   └── ...
└── task2-ecommerce-spa/
    ├── public/
    ├── data/
    ├── server.js
    ├── package.json
    └── README.md
```
