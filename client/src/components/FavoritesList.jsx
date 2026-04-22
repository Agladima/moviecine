function FavoritesList({ favorites, error, onRemove }) {
  return (
    <section className="favorites-card">
      <div className="favorites-head">
        <p className="favorites-kicker">Saved</p>
        <h2>Your picks</h2>
      </div>

      {error ? <p className="favorites-error">{error}</p> : null}

      {favorites.length === 0 ? (
        <p className="favorites-empty">Save any recommendation you want to come back to later.</p>
      ) : (
        <div className="favorites-list">
          {favorites.map((movie) => (
            <article key={movie.tmdbId} className="favorite-item">
              <div>
                <h3>{movie.title}</h3>
                <p>{movie.rating ? `${movie.rating}/10` : 'Saved recommendation'}</p>
              </div>
              <button type="button" className="favorite-remove" onClick={() => onRemove(movie)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default FavoritesList;
