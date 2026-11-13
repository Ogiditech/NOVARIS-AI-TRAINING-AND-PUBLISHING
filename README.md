# Novaris AI Training & Publishing

An online learning and publishing platform for AI skills. It offers courses with quizzes and verifiable certificates, eBooks with a built-in reader, digital products, live class bookings, and a manuscript submission desk for authors.

**Live site:** https://novaris-ai-training-and-publishing.vercel.app

## Features

- **Courses**: course catalogue, enrolment, lesson player, quizzes and progress tracking
- **Certificates**: issued on course completion, with a public verification page (`/verify/:code`)
- **eBooks**: book pages, an in-app reader with free preview chapters, and a personal library
- **Digital products and bundles**: store, product pages and purchases
- **Live classes**: schedule and seat booking
- **Publish with Novaris**: manuscript submission form for authors
- **Accounts**: sign up and log in, dashboard, profile, and saved library
- **Extras**: search, currency selector, translations, light animations and confetti on milestones

> Checkout is a **demo flow**. It has no payment provider connected and never asks for card details.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, Lucide icons |
| API | Vercel serverless functions (`/api`), Zod validation, JWT cookies (`jose`), `bcryptjs` |
| Database | Neon serverless Postgres |
| Hosting | Vercel |
| CI | GitHub Actions (build, secret scan, `npm audit`) and Dependabot |

## Project structure

```
api/        Serverless API endpoints (auth, courses, learning, ebooks, products, classes, forms, ...)
  _lib/     Shared API helpers: database, auth, rate limiting, schemas
db/         schema.sql, seed.sql and setup/reset scripts
server/     dev-api.mjs, a local stand-in for Vercel's /api runtime
shared/     Schemas shared by the frontend and the API
src/        React app (pages, components, context, hooks, i18n, data)
scripts/    eBook builder and security check
tests/      API, end-to-end and eBook reader tests
public/     Static assets
```

## Getting started

### Requirements

- Node.js **22 or newer**
- A free [Neon](https://neon.tech) Postgres database

### 1. Install

```bash
git clone https://github.com/Ogiditech/NOVARIS-AI-TRAINING-AND-PUBLISHING.git
cd NOVARIS-AI-TRAINING-AND-PUBLISHING
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=   # Neon connection string (Neon dashboard → Connect, with connection pooling on)
JWT_SECRET=     # a long random string used to sign login cookies
```

### 3. Set up the database

```bash
npm run db:setup     # creates the tables and loads sample data (safe to re-run)
```

### 4. Run locally

```bash
npm run dev
```

This starts the Vite frontend and a local API server together. The local API server loads the same `/api` files and `vercel.json` rewrites that Vercel uses, so no Vercel login is needed.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run the frontend and API together |
| `npm run build` | Build the eBooks, then the production site |
| `npm run preview` | Preview the production build |
| `npm run db:setup` | Create the tables and seed sample data |
| `npm run db:reset` | Reset the database |
| `npm run db:refresh-classes` | Refresh live class dates |
| `npm run build:ebooks` | Turn the eBook manuscripts into the JSON the app ships |
| `npm run check:security` | Check that no secrets are in the code or browser bundle |
| `npm run verify` | Build, run the security check and run `npm audit` |
| `npm run test:api` / `test:e2e` / `test:ebook` | Run the test suites |

## eBook content protection

Full manuscripts (`content/ebooks/*.md`) are **git-ignored** because this repository is public. The build turns each manuscript into JSON. Free sections keep their full text, and locked sections keep only their title and a short teaser. The build fails if any locked text would be published.

## Deployment

The site deploys on **Vercel**. Add `DATABASE_URL` and `JWT_SECRET` as environment variables in the Vercel project. The API routes are mapped in `vercel.json`.

## Author

**Omurok Samuel Gideon** ([@Ogiditech](https://github.com/Ogiditech))
