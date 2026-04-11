const express = require('express');
const router = express.Router();
const { analyzeMoodHandler, getMoodHistory } = require('../controllers/moodController');
const {
  getRecommendations,
  getMovieExplanation,
  saveFavorite,
  getFavorites,
  removeFavorite,
} = require('../controllers/recommendationController');

// Mood Analysis
router.post('/analyze-mood', analyzeMoodHandler);
router.get('/mood-history/:sessionId', getMoodHistory);

// Movie Recommendations
router.post('/recommend-movies', getRecommendations);
router.get('/movie-explanation/:tmdbId', getMovieExplanation);

// Favorites
router.post('/favorites', saveFavorite);
router.get('/favorites/:sessionId', getFavorites);
router.delete('/favorites/:sessionId/:tmdbId', removeFavorite);

module.exports = router;
