# Deploy KFLIX to Render + Vercel

## Part 1: Push to GitHub

Your repo is already at `https://github.com/CrochsDevs/Kflix.git`. Push the latest:

```bash
git add -A
git commit -m "chore: prep for deploy"
git push origin main
```

---

## Part 2: Deploy Backend to Render

### 2.1 Sign up / log in
Go to https://dashboard.render.com → Sign in with GitHub.

### 2.2 Create Web Service
- Click **"New +"** → **"Web Service"**
- Find your **`Kflix`** repo → click **"Connect"**

### 2.3 Configure

| Field | Value |
|---|---|
| **Name** | `kflix-server` |
| **Region** | Oregon (free) |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 2.4 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `TMDB_API_KEY` | `6b41a1cc64742876ef62e17108c18cc3` |
| `TMDB_BASE_URL` | `https://api.themoviedb.org/3` |
| `TMDB_IMAGE_BASE` | `https://image.tmdb.org/t/p` |
| `CACHE_DIR` | `./cache` |
| `CACHE_TTL_HOURS` | `24` |

### 2.5 Create
Click **"Create Web Service"**. Wait ~2-3 minutes for build.

You'll get: `https://kflix-server.onrender.com`

Test: https://kflix-server.onrender.com/api/health → `{"success":true,"status":"ok"}`

---

## Part 3: Deploy Frontend to Vercel

### 3.1 Sign up / log in
Go to https://vercel.com → **"Add New → Project"**.

### 3.2 Import repo
- Select **`Kflix`** repo → **"Import"**

### 3.3 Configure

| Field | Value |
|---|---|
| **Project Name** | `kflix` |
| **Framework Preset** | Vite (auto) |
| **Root Directory** | `client` ⚠️ Click "Edit" |
| **Build Command** | `vite build` (auto) |
| **Output Directory** | `dist` (auto) |

### 3.4 Environment Variables
Click **"Environment Variables"**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://kflix-server.onrender.com/api` |

### 3.5 Deploy
Click **"Deploy"**. Wait ~1-2 minutes.

You'll get: `https://kflix.vercel.app`

---

## Part 4: Verify

1. Open `https://kflix.vercel.app`
2. Browse Movies → should load trending films
3. Click a movie → goes to Play page
4. Add to watchlist → check **My List** tab

## Notes

- **Render free tier** sleeps after 15 min idle (first request ~30s wake-up)
- **Watchlist data** is per-instance. Add MongoDB Atlas (whitelist `0.0.0.0/0`) for persistence across deploys.
- **TMDB token** in the env is your existing one. Replace if needed.