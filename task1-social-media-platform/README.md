# Task 1 — Professional Mini Social Media Platform

A clean, production-quality mini social media application built for the CodeAlpha internship.

## Features

- User registration & login (JWT + bcrypt)
- User profiles (bio, avatar, followers/following counts)
- Follow / Unfollow system
- Create, edit, delete posts
- Like / Unlike posts
- Comments
- Personalized feed with pagination
- Responsive UI
- Toast notifications, loading & empty states
- Input validation (frontend + backend)
- Centralized error handling
- Rate limiting, Helmet, CORS

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: PostgreSQL + Prisma
- Auth: JWT + bcryptjs

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your Neon DATABASE_URL + JWT_SECRET
npx prisma migrate dev --schema=server/prisma/schema.prisma --name init
npm run dev
```

Open http://localhost:5000

## Author

Malik Abdul Hadi Umair  
CodeAlpha Internship
