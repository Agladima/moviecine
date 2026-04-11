import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

export const getSessionId = () => {
  let id = localStorage.getItem('moodcine_session');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('moodcine_session', id);
  }
  return id;
};

export const analyzeMood = (moodText) =>
  api.post('/analyze-mood', { moodText, sessionId: getSessionId() });

export const getRecommendations = (moodAnalysis) =>
  api.post('/recommend-movies', { moodAnalysis, sessionId: getSessionId() });

export const getMovieExplanation = (tmdbId, moodSummary, genres) =>
  api.get(`/movie-explanation/${tmdbId}`, {
    params: { moodSummary, genres: genres?.join(',') },
  });

export const saveFavorite = (movie) =>
  api.post('/favorites', { ...movie, sessionId: getSessionId() });

export const getFavorites = () =>
  api.get(`/favorites/${getSessionId()}`);

export const removeFavorite = (tmdbId) =>
  api.delete(`/favorites/${getSessionId()}/${tmdbId}`);

export const getMoodHistory = () =>
  api.get(`/mood-history/${getSessionId()}`);
