const mongoose = require('mongoose');

const moodHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  rawInput: { type: String, required: true },
  analyzedMood: {
    primaryEmotion: String,
    secondaryEmotion: String,
    intensity: { type: String, enum: ['low', 'medium', 'high'] },
    tone: [String],
    context: String,
  },
  genres: [String],
  recommendedMovies: [
    {
      tmdbId: Number,
      title: String,
      confidenceScore: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

module.exports = mongoose.model('MoodHistory', moodHistorySchema);
