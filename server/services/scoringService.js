/**
 * Scoring Engine - assigns a confidence score (0-100) to each movie
 * based on how well it matches the analyzed mood profile.
 *
 * Scoring formula:
 * - Genre match:    40 points max
 * - Rating:         25 points max
 * - Popularity:     20 points max
 * - Vote count:     15 points max (reliability signal)
 */

const { EMOTION_TO_GENRES } = require('../utils/moodMapper');

const scoreMovie = (movie, moodAnalysis, targetGenreIds) => {
  let score = 0;

  const movieGenres = movie.genreIds || [];
  const matchCount = movieGenres.filter((g) => targetGenreIds.includes(g)).length;
  const genreScore = Math.min((matchCount / Math.max(targetGenreIds.length, 1)) * 40, 40);
  score += genreScore;

  const ratingScore = movie.rating >= 7.5
    ? 25
    : movie.rating >= 6.5
    ? 18
    : movie.rating >= 6.0
    ? 10
    : 5;
  score += ratingScore;

  const popScore = Math.min((Math.log10(movie.popularity + 1) / Math.log10(500)) * 20, 20);
  score += popScore;

  const voteScore = movie.voteCount >= 5000
    ? 15
    : movie.voteCount >= 1000
    ? 10
    : movie.voteCount >= 100
    ? 5
    : 2;
  score += voteScore;

  if (moodAnalysis.intensity === 'high' && movie.rating >= 8.0) {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
};

/**
 * Ranks and deduplicates a list of candidate movies.
 * Returns top N movies with confidence scores attached.
 */
const rankMovies = (movies, moodAnalysis, targetGenreIds, limit = 10) => {
  const seen = new Set();

  return movies
    .filter((movie) => {
      if (seen.has(movie.tmdbId) || !movie.posterUrl) return false;
      seen.add(movie.tmdbId);
      return true;
    })
    .map((movie) => ({
      ...movie,
      confidenceScore: scoreMovie(movie, moodAnalysis, targetGenreIds),
    }))
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
};

module.exports = { rankMovies, scoreMovie };
