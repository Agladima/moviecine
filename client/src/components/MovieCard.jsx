function MovieCard({
  movie,
  index,
  featured,
  isFavorite,
  explanation,
  explanationState,
  isExplanationOpen,
  onToggleFavorite,
  onExplain,
}) {
  return (
    <article
      className={`movie-card ${featured ? 'movie-card-featured' : ''}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="movie-poster-wrap">
        {movie.posterUrl ? (
          <img className="movie-poster" src={movie.posterUrl} alt={`${movie.title} poster`} />
        ) : (
          <div className="movie-poster placeholder-poster">
            <span>{movie.title}</span>
          </div>
        )}
        <span className="confidence-pill">{movie.confidenceScore}% fit</span>
      </div>

      <div className="movie-body">
        <div className="movie-head">
          <div>
            <p className="movie-index">
              {featured ? 'Lead Selection' : `Selection ${String(index + 1).padStart(2, '0')}`}
            </p>
            <h3>{movie.title}</h3>
            <p className="movie-meta">
              {movie.releaseYear || 'Unknown year'} • {movie.rating}/10
            </p>
          </div>
          <button
            type="button"
            className={`favorite-toggle ${isFavorite ? 'is-active' : ''}`}
            onClick={() => onToggleFavorite(movie)}
          >
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>

        <p className="movie-overview">{movie.overview || 'No overview available yet.'}</p>

        <div className="movie-actions">
          <button type="button" className="explain-button" onClick={() => onExplain(movie)}>
            {isExplanationOpen ? 'Close notes' : 'Read curator note'}
          </button>
        </div>

        {isExplanationOpen ? (
          <div className="explanation-panel">
            {explanationState === 'loading' ? (
              <p>Generating a tailored explanation...</p>
            ) : (
              <p>{explanation || 'No explanation available yet.'}</p>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default MovieCard;
