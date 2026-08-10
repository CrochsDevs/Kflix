const { tmdbRequest } = require('../services/tmdb');

async function getGenres(req, res, next) {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const data = await tmdbRequest(`/genre/${type}/list`);
    // Slim: [{id, n}] only
    const genres = (data.genres || []).map((g) => ({ id: g.id, n: g.name }));
    res.json({ success: true, genres });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGenres };
