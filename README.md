# Buyer Intent 🎯

**Twitter/X Buyer-Intent Intelligence** — an AI SaaS that finds people publicly asking to buy something, in a given location and category, and turns those tweets into scored, structured demand signals.

Built with **FastAPI + PostgreSQL** on the backend and **React 19 + Tailwind** on the frontend, with **Groq (Llama 3.3 70B)** for intent analysis.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone the repository](#2-clone-the-repository)
  - [3. Get your API keys](#3-get-your-api-keys)
  - [4. Backend setup](#4-backend-setup)
  - [5. Frontend setup](#5-frontend-setup)
  - [6. Verify it works](#6-verify-it-works)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [How Intent Scoring Works](#how-intent-scoring-works)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Features

- **AI intent detection** — every tweet is analysed by Llama 3.3 70B via Groq and given an intent score (0–1), a label (high / medium / low) and a plain-English reason.
- **Semantic query expansion** — your location + category + keywords are expanded into an optimised Twitter boolean search.
- **Official Twitter API v2** — Recent Search endpoint, public tweets only, no scraping.
- **Dataset generation** — high-intent tweets are stored as labelled training data you can export as JSON.
- **Search history** — every search is saved per user.
- **JWT auth** — email/password signup and login, 24-hour tokens, protected routes.
- **Modern UI** — dark glassmorphism theme, Framer Motion animations, Lenis smooth scroll, fully responsive.

## Architecture

```
┌──────────────┐   HTTPS/JSON   ┌──────────────────┐        ┌────────────────┐
│  React app   │ ─────────────▶ │  FastAPI backend │ ─────▶ │ Twitter API v2 │
│ (port 3000)  │ ◀───────────── │   (port 8001)    │        └────────────────┘
└──────────────┘                │                  │ ─────▶ ┌────────────────┐
                                │  /api/*          │        │  Groq (Llama)  │
                                └────────┬─────────┘        └────────────────┘
                                         │ asyncpg
                                ┌────────▼─────────┐
                                │ PostgreSQL (Neon)│
                                └──────────────────┘
```

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Python 3.11+, FastAPI, Uvicorn, asyncpg, PyJWT, bcrypt, python-dotenv |
| AI        | Groq SDK, model `llama-3.3-70b-versatile` |
| Data      | PostgreSQL (Neon recommended) |
| Frontend  | React 19, React Router 7, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Lenis, Axios, Sonner, Lucide, Recharts |
| Tooling   | CRACO (Create React App), Yarn |

## Project Structure

```
.
├── backend/
│   ├── server.py           # FastAPI app, routes (/api/*)
│   ├── auth.py             # Password hashing + JWT helpers
│   ├── database.py         # asyncpg pool + table creation
│   ├── intent_engine.py    # Groq / Llama prompts for query expansion + intent scoring
│   ├── twitter_client.py   # Twitter API v2 client
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Auth, Dashboard, History, Datasets
│   │   ├── components/     # TweetCard, IntentBadge, ui/ (shadcn)
│   │   ├── contexts/       # AuthContext
│   │   └── App.js          # Routes
│   ├── package.json
│   └── .env.example
├── tests/                  # pytest package
├── backend_test.py         # End-to-end API smoke test
├── RATE_LIMIT_SOLUTION.md  # Notes on Twitter rate limits
└── README.md
```

---

## Installation Guide

### 1. Prerequisites

Make sure the following are installed:

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11 or newer | `python --version` |
| Node.js | 18 or newer | `node --version` |
| Yarn | 1.x (classic) | `yarn --version` (install with `npm i -g yarn`) |
| Git | any | `git --version` |

You also need a **PostgreSQL** database. The easiest option is a free [Neon](https://neon.tech) project, but any Postgres 13+ instance works (local, Docker, Supabase, Render, etc.).

### 2. Clone the repository

```bash
git clone https://github.com/akshayyrathore/buyerintent.git
cd buyerintent
```

### 3. Get your API keys

| Key | Where to get it |
|-----|-----------------|
| **Twitter Bearer Token** | [developer.x.com](https://developer.x.com) → create a project & app → *Keys and tokens* → **Bearer Token**. The free/Basic tier allows ~100 tweet-search requests per month. |
| **Groq API key** | [console.groq.com](https://console.groq.com) → *API Keys* → create key. Free tier is sufficient. |
| **Postgres URL** | Neon dashboard → *Connection string* (choose the pooled `postgresql://…?sslmode=require` URL). |

### 4. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (cmd):
venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env from the template and fill in the values
cp .env.example .env        # Windows: copy .env.example .env
```

Open `backend/.env` and set at minimum:

```env
POSTGRES_URL=postgresql://user:password@host/dbname?sslmode=require
TWITTER_BEARER_TOKEN=...
GROQ_API_KEY=...
JWT_SECRET=some-long-random-string
```

Generate a strong secret with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the API server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Database tables are created automatically on first startup. The API is now at `http://localhost:8001/api` and interactive docs at `http://localhost:8001/docs`.

### 5. Frontend setup

Open a **second terminal**:

```bash
cd frontend

# Install dependencies
yarn install

# Create your .env from the template
cp .env.example .env        # Windows: copy .env.example .env
```

`frontend/.env` should point at the backend:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the dev server:

```bash
yarn start
```

The app opens at **http://localhost:3000**.

### 6. Verify it works

1. Visit `http://localhost:8001/api/` — you should see a JSON welcome message.
2. Visit `http://localhost:3000`, click **Get Started**, and create an account.
3. On the **Dashboard**, enter a location (e.g. `San Francisco`), a category (e.g. `SaaS`), and a few keywords, then search.
4. Results appear as tweet cards with an intent badge. Check **History** and **Datasets** to see stored data.

Or from the command line:

```bash
# Sign up
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Search (paste the token from the response above)
curl -X POST http://localhost:8001/api/search/twitter \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"San Francisco","category":"SaaS","keywords":["CRM","tool"]}'
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_URL` | ✅ | — | PostgreSQL connection string |
| `DB_NAME` | | `neondb` | Database name (informational) |
| `TWITTER_BEARER_TOKEN` | ✅ | — | Twitter API v2 bearer token |
| `GROQ_API_KEY` | ✅ | — | Groq API key |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWTs |
| `JWT_ALGORITHM` | | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_HOURS` | | `24` | Token lifetime |
| `CORS_ORIGINS` | | `*` | Comma-separated allowed origins |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_BACKEND_URL` | ✅ | Base URL of the backend (no trailing slash) |
| `WDS_SOCKET_PORT` | | Dev-server websocket port (default `3000`) |
| `ENABLE_HEALTH_CHECK` | | Enables the dev health-check plugin |

> `.env` files are git-ignored. Never commit real keys — commit `.env.example` only.

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/` | – | Health / welcome message |
| `POST` | `/auth/signup` | – | Create account → `{ token, user }` |
| `POST` | `/auth/login` | – | Log in → `{ token, user }` |
| `POST` | `/search/twitter` | ✅ | Run a buyer-intent search. Body: `{ location, category, keywords[] }` |
| `GET` | `/search/history` | ✅ | Past searches for the current user |
| `GET` | `/datasets` | ✅ | Labelled high-intent tweets (training data) |
| `GET` | `/twitter/rate-limit-info` | – | Twitter tier / rate-limit info |

Full OpenAPI docs: `http://localhost:8001/docs`.

## Database Schema

| Table | Key columns |
|-------|-------------|
| `users` | `id`, `email` (unique), `password_hash`, `created_at` |
| `search_queries` | `id`, `user_id` → users, `location`, `category`, `keywords`, `created_at` |
| `tweets` | `id`, `tweet_id` (unique), `text`, `username`, `created_at`, `engagement_metrics` (JSONB), `location_confidence`, `intent_score`, `category`, `raw_json` (JSONB) |
| `intent_datasets` | `id`, `tweet_id` → tweets, `intent_label`, `reasoning`, `created_at` |

Tables are created on startup by `backend/database.py`.

## How Intent Scoring Works

1. **Input** — location, category and keywords from the dashboard.
2. **Expansion** — Llama 3.3 expands the input into an optimised boolean Twitter query.
3. **Fetch** — the Recent Search endpoint returns matching public tweets.
4. **Analyse** — each tweet is scored for buyer intent, location match and category fit, with a written reason.
5. **Store** — results are saved; high-intent tweets are added to the dataset.

| Label | Score | Signals |
|-------|-------|---------|
| **High** | 0.80 – 1.00 | Explicit "looking to buy / need recommendations", urgency, budget or timeline |
| **Medium** | 0.50 – 0.79 | Exploring options, comparing alternatives |
| **Low** | 0.00 – 0.49 | Casual mention, informational only |

## Testing

```bash
# Unit tests (from repo root, with the backend venv active)
pytest

# End-to-end API smoke test against a running backend
python backend_test.py
```

> `backend_test.py` defaults to a hosted preview URL; edit `base_url` in the file (or the `main()` function) to `http://localhost:8001` to test locally.

## Deployment

### Backend (Render, Railway, Fly, etc.)

- **Build command:** `pip install -r backend/requirements.txt`
- **Start command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
- Set every variable from `backend/.env.example` in the host's environment settings.
- Set `CORS_ORIGINS` to your deployed frontend URL.

### Frontend (Vercel, Netlify, Render static)

- **Root directory:** `frontend`
- **Build command:** `yarn build`
- **Publish directory:** `frontend/build`
- Set `REACT_APP_BACKEND_URL` to the deployed backend URL.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `KeyError: 'GROQ_API_KEY'` / `POSTGRES_URL` on startup | `backend/.env` is missing or not in the `backend/` folder. |
| `429 Rate limit exceeded` on search | Twitter Basic tier is capped at ~100 requests/month. See [RATE_LIMIT_SOLUTION.md](RATE_LIMIT_SOLUTION.md). |
| Frontend shows "Network Error" | Backend not running, or `REACT_APP_BACKEND_URL` is wrong. Restart `yarn start` after editing `.env`. |
| CORS error in browser console | Add the frontend origin to `CORS_ORIGINS` in `backend/.env`. |
| `asyncpg` SSL / connection refused | Ensure the Postgres URL ends with `?sslmode=require` for Neon, or that a local Postgres is running. |
| `yarn: command not found` | `npm install -g yarn` |

## Known Limitations

- Twitter Basic tier: ~100 search requests / month.
- Recent Search only (last 7 days of tweets), no streaming.
- English-language analysis only.

## License

MIT
