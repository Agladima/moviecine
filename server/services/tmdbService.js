const axios = require('axios');

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const MIN_RELEASE_DATE = '2000-01-01';
const MIN_RELEASE_YEAR = 2000;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: TMDB_KEY, language: 'en-US' },
  timeout: 8000,
});

/**
 * Fetches movies from TMDB based on genre IDs and sort preference.
 * Uses /discover/movie for maximum filter control.
 */
const fetchMoviesByGenres = async (genreIds, sortBy = 'popularity.desc', page = 1) => {
  const response = await tmdbClient.get('/discover/movie', {
    params: {
      with_genres: genreIds.join(','),
      sort_by: sortBy,
      'vote_count.gte': 100,
      'vote_average.gte': 6.0,
      'primary_release_date.gte': MIN_RELEASE_DATE,
      include_adult: false,
      page,
    },
  });

  return response.data.results
    .map(normalizeMovie)
    .filter(isModernMovie);
};

/**
 * Fetches movies by keyword search - used for tone-specific results.
 */
const searchMoviesByKeyword = async (keyword) => {
  const response = await tmdbClient.get('/search/movie', {
    params: {
      query: keyword,
      page: 1,
    },
  });

  return response.data.results
    .filter((m) => m.vote_count > 50 && m.poster_path)
    .map(normalizeMovie)
    .filter(isModernMovie)
    .slice(0, 5);
};

/**
 * Fetches full movie details including runtime, tagline, cast snippet.
 */
const getMovieDetails = async (tmdbId) => {
  const response = await tmdbClient.get(`/movie/${tmdbId}`, {
    params: { append_to_response: 'credits,keywords' },
  });

  const data = response.data;
  return {
    ...normalizeMovie(data),
    tagline: data.tagline,
    runtime: data.runtime,
    genres: data.genres?.map((g) => g.name) || [],
    keywords: data.keywords?.keywords?.slice(0, 5).map((k) => k.name) || [],
    director: data.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
    topCast: data.credits?.cast?.slice(0, 3).map((c) => c.name) || [],
  };
};

/**
 * Normalizes TMDB movie objects to a consistent internal schema.
 */
const normalizeMovie = (movie) => ({
  tmdbId: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterUrl: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null,
  backdropUrl: movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null,
  rating: Math.round(movie.vote_average * 10) / 10,
  voteCount: movie.vote_count,
  releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  popularity: movie.popularity,
  genreIds: movie.genre_ids || [],
});

const isModernMovie = (movie) => movie.releaseYear === null || movie.releaseYear >= MIN_RELEASE_YEAR;

module.exports = { fetchMoviesByGenres, searchMoviesByKeyword, getMovieDetails };
