import { useEffect, useRef, useState } from 'react';
import MoodInput from './components/MoodInput.jsx';
import MoodSummary from './components/MoodSummary.jsx';
import LoadingState from './components/LoadingState.jsx';
import MovieCard from './components/MovieCard.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import { useMoodRecommendations } from './hooks/useMoodRecommendations.js';
import {
  getFavorites,
  getMovieExplanation,
  removeFavorite,
  saveFavorite,
} from './services/api.js';
import './styles/App.css';
import './styles/MoodInput.css';
import './styles/MovieCard.css';

function App() {
  const {
    stage,
    moodProfile,
    movies,
    error,
    analyze,
    reset,
    isLoading,
    loadingMessage,
  } = useMoodRecommendations();
  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [activeExplanationId, setActiveExplanationId] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [explanationState, setExplanationState] = useState({});
  const resultsRef = useRef(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await getFavorites();
        const items = response.data?.data || [];
        setFavorites(items);
        setFavoriteIds(new Set(items.map((item) => item.tmdbId)));
        setFavoritesError('');
      } catch (loadError) {
        setFavoritesError(
          loadError.response?.data?.error || 'Saved movies will appear here once available.'
        );
      }
    };

    loadFavorites();
  }, []);

  useEffect(() => {
    if ((movies.length > 0 || error) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [movies, error]);

  const handleToggleFavorite = async (movie) => {
    const isFavorite = favoriteIds.has(movie.tmdbId);

    try {
      if (isFavorite) {
        await removeFavorite(movie.tmdbId);
        const nextFavorites = favorites.filter((item) => item.tmdbId !== movie.tmdbId);
        setFavorites(nextFavorites);
        setFavoriteIds(new Set(nextFavorites.map((item) => item.tmdbId)));
      } else {
        const response = await saveFavorite(movie);
        const saved = response.data?.data;
        const nextFavorites = saved
          ? [saved, ...favorites.filter((item) => item.tmdbId !== saved.tmdbId)]
          : favorites;
        setFavorites(nextFavorites);
        setFavoriteIds(new Set(nextFavorites.map((item) => item.tmdbId)));
      }

      setFavoritesError('');
    } catch (saveError) {
      setFavoritesError(
        saveError.response?.data?.error || 'Unable to update saved movies right now.'
      );
    }
  };

  const handleExplanation = async (movie) => {
    if (activeExplanationId === movie.tmdbId) {
      setActiveExplanationId(null);
      return;
    }

    setActiveExplanationId(movie.tmdbId);

    if (explanations[movie.tmdbId] || explanationState[movie.tmdbId] === 'loading') {
      return;
    }

    setExplanationState((current) => ({ ...current, [movie.tmdbId]: 'loading' }));

    try {
      const response = await getMovieExplanation(
        movie.tmdbId,
        moodProfile?.humanSummary,
        moodProfile?.tone
      );
      setExplanations((current) => ({
        ...current,
        [movie.tmdbId]: response.data?.data?.explanation || 'No explanation available yet.',
      }));
      setExplanationState((current) => ({ ...current, [movie.tmdbId]: 'done' }));
    } catch (requestError) {
      setExplanations((current) => ({
        ...current,
        [movie.tmdbId]:
          requestError.response?.data?.error || 'Details are unavailable right now.',
      }));
      setExplanationState((current) => ({ ...current, [movie.tmdbId]: 'error' }));
    }
  };

  return (
    <div className="app-shell">
      <div className="soft-glow soft-glow-one" aria-hidden="true" />
      <div className="soft-glow soft-glow-two" aria-hidden="true" />

      <main className="app-layout">
        <header className="hero-panel">
          <p className="eyebrow">MoodCine</p>
          <h1>Find the right movie for tonight.</h1>
          <p className="hero-copy">
            Keep it simple. Describe your mood, submit once, and we&apos;ll return a cleaner set of
            newer recommendations.
          </p>

          <MoodInput
            onSubmit={analyze}
            onReset={reset}
            disabled={isLoading}
            stage={stage}
          />
        </header>

        <section ref={resultsRef} className="results-panel">
          {isLoading ? (
            <LoadingState stage={stage} message={loadingMessage} />
          ) : null}

          {!isLoading && moodProfile ? (
            <MoodSummary
              moodProfile={moodProfile}
              movieCount={movies.length}
              onReset={reset}
            />
          ) : null}

          {!isLoading && error ? (
            <div className="status-card error-card">
              <p className="status-title">Something went wrong</p>
              <p>{error}</p>
            </div>
          ) : null}

          {!isLoading && !moodProfile && !error ? (
            <div className="status-card empty-card">
              <p className="status-title">Start with your mood</p>
              <p>Type how you feel above and your recommendations will appear here.</p>
            </div>
          ) : null}

          {!isLoading && movies.length > 0 ? (
            <section className="results-stack" aria-label="Movie recommendations">
              <div className="featured-slot">
                <MovieCard
                  movie={movies[0]}
                  index={0}
                  featured
                  isFavorite={favoriteIds.has(movies[0].tmdbId)}
                  explanation={explanations[movies[0].tmdbId]}
                  explanationState={explanationState[movies[0].tmdbId]}
                  isExplanationOpen={activeExplanationId === movies[0].tmdbId}
                  onToggleFavorite={handleToggleFavorite}
                  onExplain={handleExplanation}
                />
              </div>

              {movies.length > 1 ? (
                <div className="results-grid">
                  {movies.slice(1).map((movie, index) => (
                    <MovieCard
                      key={movie.tmdbId}
                      movie={movie}
                      index={index + 1}
                      isFavorite={favoriteIds.has(movie.tmdbId)}
                      explanation={explanations[movie.tmdbId]}
                      explanationState={explanationState[movie.tmdbId]}
                      isExplanationOpen={activeExplanationId === movie.tmdbId}
                      onToggleFavorite={handleToggleFavorite}
                      onExplain={handleExplanation}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </section>

        {(favorites.length > 0 || favoritesError) ? (
          <section className="saved-panel">
            <FavoritesList
              favorites={favorites}
              error={favoritesError}
              onRemove={handleToggleFavorite}
            />
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
