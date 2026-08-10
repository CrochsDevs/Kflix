const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ARCHIVE_SEARCH = 'https://archive.org/advancedsearch.php';
const ARCHIVE_META = 'https://archive.org/metadata';

const MIN_FEATURE_SIZE = 100 * 1024 * 1024; // 100 MB minimum (filters out clips)

// Local persistent cache for archive.org results (24h)
const CACHE_DIR = path.resolve(__dirname, '..', '..', '.cache', 'archive');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cacheKey(title, year) {
  return `${(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${year || 'na'}.json`;
}

function readCache(key) {
  try {
    const file = path.join(CACHE_DIR, key);
    if (!fs.existsSync(file)) return null;
    if (Date.now() - fs.statSync(file).mtimeMs > 24 * 60 * 60 * 1000) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeCache(key, data) {
  try {
    fs.writeFileSync(path.join(CACHE_DIR, key), JSON.stringify(data));
  } catch (e) {
    /* swallow */
  }
}

/**
 * Search Internet Archive for a feature-length playable copy of a movie.
 * Returns up to `limit` playable streams with metadata.
 * Results are cached locally for 24h to avoid slow archive.org calls.
 */
async function searchPlayableMovie(title, year = '', limit = 3) {
  if (!title) return [];

  const key = cacheKey(title, year);
  const cached = readCache(key);
  if (cached) return cached;

  const stopWords = new Set([
    'the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for',
    'is', 'it', 'with', 'by', 'from', 'as', 'be', 'this', 'that',
  ]);

  const tokens = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w.toLowerCase()))
    .slice(0, 2);

  const queryParts = [
    tokens.length
      ? `(${tokens.map((t) => `title:${t}`).join(' OR ')})`
      : `title:"${title.replace(/"/g, '')}"`,
    'mediatype:movies',
  ];
  if (year) queryParts.push(`year:${year}`);

  const params = new URLSearchParams({
    q: queryParts.join(' AND '),
    fl: [
      'identifier',
      'title',
      'year',
      'description',
      'licenseurl',
      'creator',
      'downloads',
      'item_size',
    ].join(','),
    output: 'json',
    rows: '15',
    sort: 'downloads desc',
  });

  let docs = [];
  try {
    const { data } = await axios.get(`${ARCHIVE_SEARCH}?${params.toString()}`, {
      timeout: 5000,
    });
    docs = (data && data.response && data.response.docs) || [];
  } catch (e) {
    return [];
  }

  // Pre-filter candidates by size (skip short clips without metadata call)
  const candidates = [];
  const seen = new Set();
  const cleanQuery = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  for (const doc of docs) {
    const cleanTitle = (Array.isArray(doc.title) ? doc.title[0] : doc.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '');
    if (!cleanTitle || seen.has(cleanTitle)) continue;
    if (!cleanTitle.includes(cleanQuery) && !cleanQuery.includes(cleanTitle)) continue;

    const size = parseInt(doc.item_size, 10) || 0;
    if (size > 0 && size < MIN_FEATURE_SIZE) continue;

    seen.add(cleanTitle);
    candidates.push(doc);
    if (candidates.length >= 6) break; // hard cap on metadata calls
  }

  // Resolve metadata in parallel
  const metadataResults = await Promise.all(
    candidates.map((doc) =>
      pickBestFile(doc.identifier).then((file) => {
        if (!file) return null;
        return {
          identifier: doc.identifier,
          title: doc.title,
          year: doc.year,
          description: doc.description,
          licenseurl: doc.licenseurl,
          creator: doc.creator,
          ...file,
        };
      })
    )
  );

  const results = metadataResults.filter(Boolean).slice(0, limit);
  writeCache(key, results);
  return results;
}

async function pickBestFile(identifier) {
  try {
    const { data } = await axios.get(`${ARCHIVE_META}/${identifier}`, {
      timeout: 4000,
    });
    const files = (data && data.files) || [];

    const video = files.find(
      (f) => {
        const fmt = (f.format || '').toLowerCase();
        const name = (f.name || '').toLowerCase();
        return (
          fmt === 'mp4' ||
          fmt === 'h.264' ||
          fmt === 'mpeg4' ||
          fmt === 'ogv' ||
          fmt === 'ogg video' ||
          fmt === 'webm' ||
          fmt === 'matroska' ||
          fmt === 'quicktime' ||
          (fmt === 'm4v' || name.endsWith('.m4v'))
        );
      }
    );
    if (!video) return null;

    const videoUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(video.name)}`;
    const poster = files.find((f) => /poster|thumb|cover|\.jpg$/i.test(f.name || ''));
    const posterUrl = poster
      ? `https://archive.org/download/${identifier}/${encodeURIComponent(poster.name)}`
      : `https://archive.org/services/img/${identifier}`;

    const fmt = (video.format || '').toLowerCase();
    const mime =
      fmt === 'mp4' || fmt === 'h.264' || fmt === 'mpeg4'
        ? 'video/mp4'
        : fmt === 'ogv' || fmt === 'ogg video'
        ? 'video/ogg'
        : `video/${video.format}`;

    return { streamUrl: videoUrl, posterUrl, mime, size: video.size ? parseInt(video.size, 10) : 0 };
  } catch (e) {
    return null;
  }
}

module.exports = { searchPlayableMovie };
