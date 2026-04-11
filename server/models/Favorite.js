const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  tmdbId: { type: Number, required: true },
  title: String,
  posterPath: String,
  rating: Number,
  addedAt: { type: Date, default: Date.now },
});

favoriteSchema.index({ sessionId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
