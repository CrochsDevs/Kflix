const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const WATCHLIST_FILE = path.join(DATA_DIR, 'watchlist.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  try {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  } catch (e) {
    /* swallow */
  }
}

function nextId(list) {
  if (!list.length) return 1;
  return Math.max(...list.map((x) => x._localId || 0)) + 1;
}

const WatchlistStore = {
  list(userId) {
    const all = readJson(WATCHLIST_FILE, []);
    return all
      .filter((x) => x.userId === userId)
      .sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''));
  },
  paginated(userId, page, limit, sortBy = 'date-added') {
    const all = WatchlistStore.list(userId);
    let items = [...all];
    const sortMap = {
      'date-added': (a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''),
      title: (a, b) => (a.title || '').localeCompare(b.title || ''),
      rating: (a, b) => (b.voteAverage || 0) - (a.voteAverage || 0),
      year: (a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''),
    };
    items.sort(sortMap[sortBy] || sortMap['date-added']);
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const slice = items.slice((page - 1) * limit, page * limit);
    return { items: slice, total, pages };
  },
  add(userId, data) {
    const all = readJson(WATCHLIST_FILE, []);
    const exists = all.find(
      (x) => x.userId === userId && x.movieId === data.movieId
    );
    if (exists) return { action: 'exists', data: exists };
    const entry = {
      _localId: nextId(all),
      userId,
      movieId: data.movieId,
      mediaType: data.mediaType || 'movie',
      title: data.title,
      posterPath: data.posterPath || '',
      voteAverage: data.voteAverage || 0,
      releaseDate: data.releaseDate || '',
      addedDate: new Date().toISOString(),
    };
    all.push(entry);
    writeJson(WATCHLIST_FILE, all);
    return { action: 'added', data: entry };
  },
  remove(userId, movieId) {
    const all = readJson(WATCHLIST_FILE, []);
    const next = all.filter(
      (x) => !(x.userId === userId && x.movieId === movieId)
    );
    writeJson(WATCHLIST_FILE, next);
    return { action: 'removed' };
  },
  status(userId, movieId) {
    const all = readJson(WATCHLIST_FILE, []);
    return !!all.find((x) => x.userId === userId && x.movieId === movieId);
  },
  count(userId) {
    return WatchlistStore.list(userId).length;
  },
  clear(userId) {
    const all = readJson(WATCHLIST_FILE, []);
    const next = all.filter((x) => x.userId !== userId);
    writeJson(WATCHLIST_FILE, next);
    return { action: 'cleared' };
  },
};

const HistoryStore = {
  add(userId, data) {
    const all = readJson(HISTORY_FILE, []);
    const entry = {
      _localId: nextId(all),
      userId,
      movieId: data.movieId,
      mediaType: data.mediaType || 'movie',
      title: data.title,
      posterPath: data.posterPath || '',
      watchedAt: new Date().toISOString(),
    };
    all.push(entry);
    writeJson(HISTORY_FILE, all);
    return entry;
  },
  list(userId, limit = 20) {
    const all = readJson(HISTORY_FILE, []);
    return all
      .filter((x) => x.userId === userId)
      .sort((a, b) => (b.watchedAt || '').localeCompare(a.watchedAt || ''))
      .slice(0, limit);
  },
};

module.exports = { WatchlistStore, HistoryStore, DATA_DIR };