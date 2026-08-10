const { WatchlistStore } = require('../services/localStore');
const { isConnected } = require('../db');

let WatchlistModel = null;
try {
  WatchlistModel = require('../models/Watchlist');
} catch (e) {
  /* ignore */
}

const SORT_MAP = {
  'date-added': { addedDate: -1 },
  title: { title: 1 },
  rating: { voteAverage: -1 },
  year: { releaseDate: -1 },
};

async function list(req, res, next) {
  try {
    const userId = req.query.userId || 'guest';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.itemsPerPage, 10) || 12);
    const sortBy = SORT_MAP[req.query.sortBy] ? req.query.sortBy : 'date-added';

    if (WatchlistModel && isConnected()) {
      try {
        const [items, total] = await Promise.all([
          WatchlistModel.find({ userId })
            .sort(SORT_MAP[sortBy])
            .skip((page - 1) * limit)
            .limit(limit)
            .maxTimeMS(3000),
          WatchlistModel.countDocuments({ userId }).maxTimeMS(3000),
        ]);
        return res.json({
          success: true,
          data: items,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
          currentPage: page,
          source: 'mongo',
        });
      } catch (mongoErr) {
        console.warn('[watchlist] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    const result = WatchlistStore.paginated(userId, page, limit, sortBy);
    res.json({
      success: true,
      data: result.items,
      total: result.total,
      pages: result.pages,
      currentPage: page,
      source: 'local',
    });
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const userId = req.body.userId || 'guest';
    const { id, title, poster_path, posterPath, vote_average, voteAverage, release_date, releaseDate, mediaType } = req.body;

    if (!id || !title) {
      return res.status(400).json({ success: false, message: 'id and title required' });
    }

    const payload = {
      movieId: id,
      mediaType: mediaType === 'tv' ? 'tv' : 'movie',
      title,
      posterPath: posterPath || poster_path || '',
      voteAverage: voteAverage ?? vote_average ?? 0,
      releaseDate: releaseDate || release_date || '',
    };

    if (WatchlistModel && isConnected()) {
      try {
        const doc = await WatchlistModel.findOneAndUpdate(
          { userId, movieId: id },
          { $setOnInsert: { userId, ...payload, addedDate: new Date() } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).maxTimeMS(3000);
        const count = await WatchlistModel.countDocuments({ userId }).maxTimeMS(3000);
        WatchlistStore.add(userId, payload); // keep local in sync
        return res.json({ success: true, action: 'added', data: doc, count, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[watchlist add] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    const result = WatchlistStore.add(userId, payload);
    const count = WatchlistStore.count(userId);
    res.json({ success: true, ...result, count, source: 'local' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.query.userId || 'guest';
    const movieId = parseInt(req.params.id || req.query.movie_id, 10);
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'movie_id required' });
    }

    if (WatchlistModel && isConnected()) {
      try {
        await WatchlistModel.deleteOne({ userId, movieId }).maxTimeMS(3000);
        const count = await WatchlistModel.countDocuments({ userId }).maxTimeMS(3000);
        WatchlistStore.remove(userId, movieId);
        return res.json({ success: true, action: 'removed', count, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[watchlist remove] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    WatchlistStore.remove(userId, movieId);
    const count = WatchlistStore.count(userId);
    res.json({ success: true, action: 'removed', count, source: 'local' });
  } catch (err) {
    next(err);
  }
}

async function status(req, res, next) {
  try {
    const userId = req.query.userId || 'guest';
    const movieId = parseInt(req.query.movieId, 10);
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'movieId required' });
    }

    if (WatchlistModel && isConnected()) {
      try {
        const exists = await WatchlistModel.exists({ userId, movieId }).maxTimeMS(3000);
        const count = await WatchlistModel.countDocuments({ userId }).maxTimeMS(3000);
        return res.json({ success: true, inWatchlist: !!exists, count, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[watchlist status] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    const inWatchlist = WatchlistStore.status(userId, movieId);
    const count = WatchlistStore.count(userId);
    res.json({ success: true, inWatchlist, count, source: 'local' });
  } catch (err) {
    next(err);
  }
}

async function clear(req, res, next) {
  try {
    const userId = req.query.userId || 'guest';

    if (WatchlistModel && isConnected()) {
      try {
        await WatchlistModel.deleteMany({ userId }).maxTimeMS(3000);
        WatchlistStore.clear(userId);
        return res.json({ success: true, action: 'cleared', count: 0, source: 'mongo' });
      } catch (mongoErr) {
        console.warn('[watchlist clear] MongoDB failed, using local store:', mongoErr.message);
      }
    }

    WatchlistStore.clear(userId);
    res.json({ success: true, action: 'cleared', count: 0, source: 'local' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, add, remove, status, clear };