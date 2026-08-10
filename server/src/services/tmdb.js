const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');

const { apiKey, baseUrl } = config.tmdb;
const CACHE_DIR = path.resolve(config.cache.dir);
const TTL_MS = config.cache.ttlHours * 60 * 60 * 1000;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const safeKey = (key) => key.replace(/[^a-z0-9._-]/gi, '_');
const cachePath = (key) => path.join(CACHE_DIR, `${safeKey(key)}.json`);

function readCache(key) {
  try {
    const file = cachePath(key);
    if (!fs.existsSync(file)) return null;
    const stat = fs.statSync(file);
    if (Date.now() - stat.mtimeMs > TTL_MS) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeCache(key, data) {
  try {
    fs.writeFileSync(cachePath(key), JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

async function tmdbRequest(endpoint, params = {}, useCache = true) {
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is missing. Set it in server/.env');
  }

  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;
  if (useCache) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
  }

  const url = `${baseUrl}${endpoint}`;
  const { data } = await axios.get(url, {
    params: { api_key: apiKey, language: 'en-US', ...params },
    timeout: 8000,
  });

  if (useCache) writeCache(cacheKey, data);
  return data;
}

module.exports = { tmdbRequest, clearCache: () => fs.emptyDirSync(CACHE_DIR) };
