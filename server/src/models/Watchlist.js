const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema(
  {
    movieId: { type: Number, required: true, index: true },
    userId: { type: String, default: 'guest', index: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    voteAverage: { type: Number, default: 0 },
    releaseDate: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'addedDate', updatedAt: 'updatedDate' } }
);

WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
WatchlistSchema.index({ userId: 1, addedDate: -1 });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
