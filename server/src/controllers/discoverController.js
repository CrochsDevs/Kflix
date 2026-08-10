const { tmdbRequest } = require('../services/tmdb');

const VALID_SORT = {
  movie: ['popularity.desc', 'vote_average.desc', 'release_date.desc', 'title.asc'],
  tv: ['popularity.desc', 'vote_average.desc', 'first_air_date.desc', 'name.asc'],
};

function sanitize({ type, search, genre, filter, sort, page }) {
  // type: 'movie' or 'tv'
  const t = type === 'tv' ? 'tv' : 'movie';
  const s = (search || '').trim();
  const g = parseInt(genre, 10) || 0;
  const f = filter === 'week' ? 'week' : 'day';
  const so = VALID_SORT[t].includes(sort) ? sort : 'popularity.desc';
  const p = Math.max(1, parseInt(page, 10) || 1);
  return { type: t, search: s, genre: g, filter: f, sort: so, page: p };
}

function buildDiscoverUrl({ type, search, genre, filter, sort, page }) {
  if (search) {
    const base = type === 'tv' ? '/search/tv' : '/search/movie';
    const q = { query: search, page, include_adult: false };
    if (genre > 0) q.with_genres = genre;
    return { endpoint: base, params: q };
  }
  if (genre > 0) {
    return {
      endpoint: `/discover/${type}`,
      params: { page, sort_by: sort, with_genres: genre, include_adult: false },
    };
  }
  return {
    endpoint: `/trending/${type}/${filter}`,
    params: { page },
  };
}

// Trim each result to only what the UI renders — 90%+ smaller payload
function slimList(items, type) {
  return items.map((it) => ({
    id: it.id,
    t: type,
    title: type === 'tv' ? it.name : it.title,
    p: it.poster_path,
    b: it.backdrop_path,
    o: it.overview,
    y: (type === 'tv' ? it.first_air_date : it.release_date || '').slice(0, 4),
    r: it.vote_average,
    v: it.vote_count,
    a: it.adult ? 1 : 0,
    g: it.genre_ids,
    pop: it.popularity,
  }));
}

async function list(req, res, next) {
  try {
    const opts = sanitize({
      type: req.query.type,
      search: req.query.search,
      genre: req.query.genre,
      filter: req.query.filter,
      sort: req.query.sort,
      page: req.query.page,
    });
    const { endpoint, params } = buildDiscoverUrl(opts);
    const data = await tmdbRequest(endpoint, params);

    res.json({
      success: true,
      type: opts.type,
      page: data.page || opts.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
      results: slimList(data.results || [], opts.type),
    });
  } catch (err) {
    next(err);
  }
}

async function trendingCombined(req, res, next) {
  try {
    const filter = req.query.filter === 'week' ? 'week' : 'day';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const search = (req.query.search || '').trim();
    const genre = parseInt(req.query.genre, 10) || 0;

    let movies = [];
    let tvshows = [];
    if (search) {
      const m = await tmdbRequest('/search/movie', { query: search, page, include_adult: false });
      const t = await tmdbRequest('/search/tv', { query: search, page, include_adult: false });
      movies = m.results || [];
      tvshows = t.results || [];
      if (genre > 0) {
        movies = movies.filter((x) => (x.genre_ids || []).includes(genre));
        tvshows = tvshows.filter((x) => (x.genre_ids || []).includes(genre));
      }
    } else {
      const m = await tmdbRequest(`/trending/movie/${filter}`, { page });
      const t = await tmdbRequest(`/trending/tv/${filter}`, { page });
      movies = m.results || [];
      tvshows = t.results || [];
    }

    const merged = [...movies, ...tvshows].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0)
    );

    const slimmed = merged.map((it) => {
      const type = it.title ? 'movie' : 'tv';
      return {
        id: it.id,
        t: type,
        title: type === 'tv' ? it.name : it.title,
        p: it.poster_path,
        b: it.backdrop_path,
        o: it.overview,
        y: (type === 'tv' ? it.first_air_date : it.release_date || '').slice(0, 4),
        r: it.vote_average,
        v: it.vote_count,
        a: it.adult ? 1 : 0,
        g: it.genre_ids,
        pop: it.popularity,
      };
    });

    res.json({
      success: true,
      page,
      results: slimmed,
      totalResults: slimmed.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, trendingCombined };
