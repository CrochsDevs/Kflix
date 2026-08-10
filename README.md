# KFLIX — MERN Stack

A Netflix-style movie/TV browser, ported from the original PHP codebase to a **MERN** stack (MongoDB + Express + React + Node.js).

## What changed vs the PHP version

- **Backend**: PHP + Guzzle → **Node.js + Express + Mongoose**, with a single TMDB proxy layer that handles trending, search, genres, detail, watchlist, and history.
- **Database**: MySQL (via Docker) → **MongoDB** (local install, no Docker).
- **Frontend**: PHP templates + jQuery-style vanilla JS → **React 18 + Vite + React Router**.
- **Streaming**: Third-party embeds (`moviesapi.club`, `2embed.cc`) → **official YouTube trailers from TMDB** (fully copyright-safe).
- **Docker**: removed. The README below uses plain local installs.

## Features

- Home (trending movies), Movies, TV Shows, New & Popular pages
- Sidebar filters: search, genre, day/week, sort
- Movie modal with full details, cast, genres, watchlist toggle
- Watchlist page with sort, clear, paginated
- Play page with YouTube trailer player + recommendations
- **File-based TMDB cache** (24h TTL, configurable) to reduce API usage
- **Multi-source resilience**: cache → live API; the server uses a single TMDB v3 key but the cache layer survives transient outages
- Watch history persisted in MongoDB
- Responsive design (mobile, tablet, desktop)

## Project structure

```
kflix-mern/
├── server/              # Express + MongoDB
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── config.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/tmdb.js   # cached TMDB client
│   │   └── middleware/
│   ├── cache/                 # file-based JSON cache
│   └── package.json
└── client/              # React + Vite
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   ├── context/
    │   ├── components/
    │   ├── pages/
    │   └── styles/
    └── package.json
```

## Setup (no Docker)

### Prerequisites

- Node.js 18+
- MongoDB 6+ running locally (or a connection URI)
- A free TMDB v3 API key — https://www.themoviedb.org/settings/api

### 1. Install dependencies

```bash
cd kflix-mern/server && npm install
cd ../client && npm install
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kflix
TMDB_API_KEY=YOUR_TMDB_V3_KEY
CACHE_TTL_HOURS=24
```

### 3. Start MongoDB locally

If you don't have MongoDB installed, get it from https://www.mongodb.com/try/download/community.

```bash
mongod
```

(Or `net start MongoDB` on Windows if installed via the service.)

### 4. Run the app

In two terminals:

```bash
# Terminal 1 — backend
cd kflix-mern/server
npm run dev          # nodemon, auto-reload

# Terminal 2 — frontend
cd kflix-mern/client
npm run dev          # Vite dev server on http://localhost:5173
```

Open http://localhost:5173.

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so no CORS config is needed in development.

## API reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/discover?type=movie\|tv&search=&genre=&filter=day\|week&sort=&page=` | GET | Trending / search / discover |
| `/api/discover/new-popular?filter=&page=&search=` | GET | Combined movies + TV for New & Popular |
| `/api/genres?type=movie\|tv` | GET | Genre list |
| `/api/content?id=&type=` | GET | Movie/TV detail with trailer & recs |
| `/api/watchlist?userId=&page=&itemsPerPage=&sortBy=` | GET | List watchlist |
| `/api/watchlist` | POST | Add to watchlist |
| `/api/watchlist/:id?userId=` | DELETE | Remove from watchlist |
| `/api/watchlist?userId=` | DELETE | Clear watchlist |
| `/api/watchlist/status?movieId=&userId=` | GET | In-watchlist status |
| `/api/history` | POST / GET | Save / list watch history |

## TMDB usage & copyright

- TMDB is a free, open data source. You must use a personal API key and follow [TMDB's API terms](https://www.themoviedb.org/documentation/api/terms-of-use).
- The server caches every TMDB response for 24 hours in `server/cache/` to keep API usage low.
- No copyrighted media is hosted or proxied. The Play page only embeds **official YouTube trailers** provided by TMDB.

## License

MIT — bring your own TMDB key.
