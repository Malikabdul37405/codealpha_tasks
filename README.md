# CodeAlpha Internship Tasks

This repository contains all tasks completed during the **CodeAlpha** internship.

## Tasks

### Task 1 — Professional Mini Social Media Platform

A full-stack social media application built with clean architecture and production-quality practices.

**Folder:** [`task1-social-media-platform/`](./task1-social-media-platform/)

**Features:**
- User registration & login (JWT + bcrypt)
- User profiles, follow/unfollow system
- Posts (create, edit, delete) with pagination
- Like / Unlike posts
- Comments
- Personalized feed
- Responsive vanilla JS frontend
- Input validation, security (Helmet, CORS, rate limiting)
- PostgreSQL + Prisma

**Tech Stack:** Node.js, Express, Prisma, PostgreSQL, HTML/CSS/Vanilla JS

---

## How to run Task 1

```bash
cd task1-social-media-platform
npm install
cp .env.example .env
# Add your Neon DATABASE_URL and JWT_SECRET in .env
npx prisma migrate dev --schema=server/prisma/schema.prisma --name init
npm run dev
```

Then open http://localhost:5000

---

**Author:** Malik Abdul Hadi Umair  
**GitHub:** [Malikabdul37405](https://github.com/Malikabdul37405)
