const { tmdbRequest } = require('../services/tmdb');

async function getGenres(req, res, next) {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const data = await tmdbRequest(`/genre/${type}/list`);
    res.json({ success: true, genres: data.genres || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGenres };
