const axios = require('axios');

const ARCHIVE_SEARCH = 'https://archive.org/advancedsearch.php';
const ARCHIVE_META = 'https://archive.org/metadata';

const MIN_FEATURE_SIZE = 100 * 1024 * 1024; // 100 MB minimum (filters out clips)

/**
 * Search Internet Archive for a feature-length playable copy of a movie.
 * Returns up to `limit` playable streams with metadata.
 */
async function searchPlayableMovie(title, year = '', limit = 3) {
  if (!title) return [];

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
      'subject',
      'avg_rating',
      'downloads',
      'item_size',
    ].join(','),
    output: 'json',
    rows: '50',
    sort: 'downloads desc',
  });

  try {
    const { data } = await axios.get(`${ARCHIVE_SEARCH}?${params.toString()}`, {
      timeout: 8000,
    });
    const docs = (data && data.response && data.response.docs) || [];
    const results = [];
    const seen = new Set();

    for (const doc of docs) {
      if (results.length >= limit) break;

      const size = parseInt(doc.item_size, 10) || 0;
      if (size > 0 && size < MIN_FEATURE_SIZE) continue; // skip short clips

      const cleanTitle = (Array.isArray(doc.title) ? doc.title[0] : doc.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '');
      const cleanQuery = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (seen.has(cleanTitle)) continue;

      // Title match: prefer exact match, accept partial if size is large (feature film)
      const exactMatch = cleanTitle === cleanQuery;
      const containsMatch = cleanTitle.includes(cleanQuery) || cleanQuery.includes(cleanTitle);
      if (!exactMatch && !containsMatch) continue;
      if (!exactMatch && size < MIN_FEATURE_SIZE) continue;

      seen.add(cleanTitle);

      const file = await pickBestFile(doc.identifier);
      if (!file) continue;
      results.push({
        identifier: doc.identifier,
        title: doc.title,
        year: doc.year,
        description: doc.description,
        licenseurl: doc.licenseurl,
        creator: doc.creator,
        ...file,
      });
    }
    return results;
  } catch (e) {
    return [];
  }
}

async function pickBestFile(identifier) {
  try {
    const { data } = await axios.get(`${ARCHIVE_META}/${identifier}`, {
      timeout: 8000,
    });
    const files = (data && data.files) || [];

    const video = files.find(
      (f) => {
        const fmt = (f.format || '').toLowerCase();
        const name = (f.name || '').toLowerCase();
        const isVideoFormat =
          fmt === 'mp4' ||
          fmt === 'h.264' ||
          fmt === 'mpeg4' ||
          fmt === 'ogv' ||
          fmt === 'ogg video' ||
          fmt === 'webm' ||
          fmt === 'matroska' ||
          fmt === 'quicktime' ||
          (fmt === 'm4v' || name.endsWith('.m4v'));
        return isVideoFormat;
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

    return {
      streamUrl: videoUrl,
      posterUrl,
      mime,
      size: video.size ? parseInt(video.size, 10) : 0,
    };
  } catch (e) {
    return null;
  }
}

module.exports = { searchPlayableMovie };
