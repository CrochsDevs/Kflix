const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    movieId: { type: Number, required: true, index: true },
    userId: { type: String, default: 'guest', index: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('History', HistorySchema);
