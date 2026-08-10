# KFLIX — MERN Stack

A Netflix-style movie/TV browser. Backend on Express + MongoDB (with local JSON fallback), frontend on React + Vite.

## Features

- Home / Movies / TV Shows / New & Popular pages with sidebar filters
- Movie modal with full details, cast, watchlist toggle
- Watchlist page with sort, clear, paginated (persists via local JSON)
- Play page with **Public Domain streams** (archive.org) + YouTube trailers
- File-based TMDB cache (24h TTL)
- Rate limiting + CORS

## Run locally

### Prerequisites
- Node.js 18+
- MongoDB (optional — falls back to local JSON store)

### Setup

```bash
cd server && npm install
cp .env.example .env   # add your TMDB API key
cd ../client && npm install
cp .env.example .env   # leave blank for dev (uses Vite proxy)
```

### Start

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open http://localhost:5173

## Deploy to Render + Vercel

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

## Project structure

```
kflix-mern/
├── server/        # Express + Mongoose (with local JSON fallback)
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── config.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/        # tmdb.js (cached), archive.js, localStore.js
│   │   └── middleware/
│   └── package.json
├── client/        # React + Vite
│   ├── src/
│   └── package.json
├── render.yaml    # one-click Render deploy config
└── package.json
```