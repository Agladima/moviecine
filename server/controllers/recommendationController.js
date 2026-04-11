const { mapMoodToQuery } = require('../utils/moodMapper');
const { fetchMoviesByGenres, searchMoviesByKeyword, getMovieDetails } = require('../services/tmdbService');
const { rankMovies } = require('../services/scoringService');
const { generateMovieExplanation } = require('../services/llmService');
const MoodHistory = require('../models/MoodHistory');
const Favorite = require('../models/Favorite');

/**
 * POST /api/recommend-movies
 * Takes analyzed mood profile and returns ranked movie recommendations.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const { moodAnalysis, sessionId } = req.body;

    if (!moodAnalysis || !moodAnalysis.primaryEmotion) {
      return res.status(400).json({ error: 'Valid moodAnalysis object is required' });
    }

    const { genreIds, keywords, sortPreference } = mapMoodToQuery(moodAnalysis);

    const [genreMovies, ...keywordResults] = await Promise.allSettled([
      fetchMoviesByGenres(genreIds, sortPreference, 1),
      fetchMoviesByGenres(genreIds, sortPreference, 2),
      ...keywords.slice(0, 2).map((kw) => searchMoviesByKeyword(kw)),
    ]);

    const allMovies = [
      ...(genreMovies.status === 'fulfilled' ? genreMovies.value : []),
      ...keywordResults
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value),
    ];

    const rankedMovies = rankMovies(allMovies, moodAnalysis, genreIds, 10);

    if (sessionId) {
      MoodHistory.findOneAndUpdate(
        { sessionId, rawInput: { $exists: true } },
        {
          genres: genreIds,
          recommendedMovies: rankedMovies.slice(0, 5).map((m) => ({
            tmdbId: m.tmdbId,
            title: m.title,
            confidenceScore: m.confidenceScore,
          })),
        },
        { sort: { createdAt: -1 } }
      ).catch(console.error);
    }

    res.json({
      success: true,
      data: {
        query: { genreIds, keywords, sortPreference },
        movies: rankedMovies,
        totalFound: allMovies.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/movie-explanation/:tmdbId
 * Generates an on-demand "Why this movie?" explanation.
 */
const getMovieExplanation = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { moodSummary, genres } = req.query;

    const details = await getMovieDetails(Number(tmdbId));
    const explanation = await generateMovieExplanation(
      details.title,
      moodSummary || 'reflective mood',
      genres ? genres.split(',') : details.genres
    );

    res.json({ success: true, data: { explanation, movieDetails: details } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/favorites
 * Saves a movie to favorites for a session.
 */
const saveFavorite = async (req, res, next) => {
  try {
    const { sessionId, tmdbId, title, posterUrl, rating } = req.body;

    const favorite = await Favorite.findOneAndUpdate(
      { sessionId, tmdbId },
      { sessionId, tmdbId, title, posterPath: posterUrl, rating },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: favorite });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Already in favorites' });
    }
    next(error);
  }
};

/**
 * GET /api/favorites/:sessionId
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ sessionId: req.params.sessionId })
      .sort({ addedAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/favorites/:sessionId/:tmdbId
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { sessionId, tmdbId } = req.params;
    await Favorite.deleteOne({ sessionId, tmdbId: Number(tmdbId) });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getMovieExplanation,
  saveFavorite,
  getFavorites,
  removeFavorite,
};
