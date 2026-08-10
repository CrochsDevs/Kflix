const { HistoryStore } = require('../services/localStore');
const { isConnected } = require('../db');

let HistoryModel = null;
try {
  HistoryModel = require('../models/History');
} catch (e) {
  /* ignore */
}

async function add(req, res, next) {
  try {
    const userId = req.body.userId || 'guest';
    const { movieId, title, posterPath, mediaType } = req.body;
    if (!movieId || !title) {
      return res.status(400).json({ success: false, message: 'movieId and title required' });
    }

    const payload = {
      movieId,
      title,
      posterPath: posterPath || '',
      mediaType: mediaType === 'tv' ? 'tv' : 'movie',
    };

    if (HistoryModel && isConnected()) {
      try {
        const doc = await HistoryModel.create({ userId, ...payload }).maxTimeMS(3000);
        HistoryStore.add(userId, payload);
        return res.json({ success: true, data: doc, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[history add] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    const entry = HistoryStore.add(userId, payload);
    res.json({ success: true, data: entry, source: 'local' });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = req.query.userId || 'guest';
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    if (HistoryModel && isConnected()) {
      try {
        const items = await HistoryModel.find({ userId })
          .sort({ watchedAt: -1 })
          .limit(limit)
          .maxTimeMS(3000);
        return res.json({ success: true, data: items, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[history list] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    const items = HistoryStore.list(userId, limit);
    res.json({ success: true, data: items, source: 'local' });
  } catch (err) {
    next(err);
  }
}

module.exports = { add, list };