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
export const content = (id, type) =>
  api.get('/content', { params: { id, type } }).then((r) => r.data);

// --- Watchlist ---
export const getWatchlist = (params) =>
  api.get('/watchlist', { params }).then((r) => r.data);
export const addToWatchlist = (data) =>
  api.post('/watchlist', data).then((r) => r.data);
export const removeFromWatchlist = (id, userId = 'guest') =>
  api.delete(`/watchlist/${id}`, { params: { userId } }).then((r) => r.data);
export const clearWatchlist = (userId = 'guest') =>
  api.delete('/watchlist', { params: { userId } }).then((r) => r.data);
export const watchlistStatus = (movieId, userId = 'guest') =>
  api.get('/watchlist/status', { params: { movieId, userId } }).then((r) => r.data);

// --- History ---
export const saveHistory = (data) =>
  api.post('/history', data).then((r) => r.data);

export default api;