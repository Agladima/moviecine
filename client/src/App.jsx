import { useEffect, useState } from 'react';
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
          loadError.response?.data?.error || 'Favorites will appear here once the backend is running.'
        );
      }
    };

    loadFavorites();
  }, []);

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
        saveError.response?.data?.error || 'Unable to update favorites right now.'
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
          requestError.response?.data?.error || 'Explanation unavailable until the backend is fully configured.',
      }));
      setExplanationState((current) => ({ ...current, [movie.tmdbId]: 'error' }));
    }
  };

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden="true" />
      <div className="glow glow-one" aria-hidden="true" />
      <div className="glow glow-two" aria-hidden="true" />

      <main className="app-layout">
        <header className="masthead">
          <div>
            <p className="eyebrow">MoodCine Transmission Deck</p>
            <h1>Build a movie night from the signal, not the scroll.</h1>
          </div>
          <div className="masthead-metrics">
            <div className="metric-tile">
              <span>Engine</span>
              <strong>Local mood inference</strong>
            </div>
            <div className="metric-tile">
              <span>Best input</span>
              <strong>Contradictions, wants, avoids</strong>
            </div>
          </div>
        </header>

        <section className="briefing-panel">
          <div className="briefing-copy">
            <p className="panel-label">Briefing Room</p>
            <h2>Tell the system what the night feels like.</h2>
            <p>
              This version is built like a cinematic control desk: you drop the mood brief, we
              surface a read, then the board promotes a lead title with backup selections below it.
            </p>
          </div>

          <MoodInput
            onSubmit={analyze}
            onReset={reset}
            disabled={isLoading}
            stage={stage}
          />
        </section>

        <aside className="monitor-panel">
          <div className="monitor-header">
            <p className="panel-label">Live Monitor</p>
            <span className={`monitor-dot ${isLoading ? 'is-live' : ''}`} />
          </div>

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
              <p className="status-title">Transmission interrupted</p>
              <p>{error}</p>
            </div>
          ) : null}

          {!isLoading && !moodProfile && !error ? (
            <div className="status-card empty-card">
              <p className="status-title">Awaiting your mood brief</p>
              <p>
                Once you submit a feeling, this monitor will show the emotional read and how the
                board is interpreting it.
              </p>
            </div>
          ) : null}
        </aside>

        <section className="board-panel">
          <div className="board-heading">
            <div>
              <p className="panel-label">Selection Board</p>
              <h2>Tonight&apos;s lineup</h2>
            </div>
            <p className="board-copy">
              The board promotes one featured pick first, then keeps the rest in the deck.
            </p>
          </div>

          {!isLoading && movies.length > 0 ? (
            <>
              <div className="featured-stage">
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
                <section className="results-grid" aria-label="Movie recommendations">
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
                </section>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="archive-panel">
          <FavoritesList
            favorites={favorites}
            error={favoritesError}
            onRemove={handleToggleFavorite}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
