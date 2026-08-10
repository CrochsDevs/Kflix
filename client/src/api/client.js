import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// --- Discover ---
export const discover = (params) => api.get('/discover', { params }).then((r) => r.data);
export const newPopular = (params) =>
  api.get('/discover/new-popular', { params }).then((r) => r.data);
export const genres = (type) => api.get('/genres', { params: { type } }).then((r) => r.data);

// Content (movie/TV detail) can take 5-10s due to archive.org lookups
// Use a longer timeout and don't retry — server-side already tries fast paths first
export const content = (id, type) =>
  axios
    .get(`${import.meta.env.VITE_API_URL || '/api'}/content`, {
      params: { id, type },
      timeout: 30000,
    })
    .then((r) => r.data);

// --- Watchlist ---
export const getWatchlist = (params) =>
  api.get('/watchlist', { params, timeout: 25000 }).then((r) => r.data);
export const addToWatchlist = (data) =>
  api.post('/watchlist', data, { timeout: 25000 }).then((r) => r.data);
export const removeFromWatchlist = (id, userId = 'guest') =>
  api.delete(`/watchlist/${id}`, { params: { userId }, timeout: 25000 }).then((r) => r.data);
export const clearWatchlist = (userId = 'guest') =>
  api.delete('/watchlist', { params: { userId }, timeout: 25000 }).then((r) => r.data);
export const watchlistStatus = (movieId, userId = 'guest') =>
  api.get('/watchlist/status', { params: { movieId, userId }, timeout: 25000 }).then((r) => r.data);

// --- History ---
export const saveHistory = (data) =>
  api.post('/history', data, { timeout: 20000 }).then((r) => r.data);

export default api;