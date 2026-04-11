function FavoritesList({ favorites, error, onRemove }) {
  return (
    <section className="favorites-card">
      <div className="favorites-head">
        <p className="favorites-kicker">Archive</p>
        <h2>Favorites</h2>
      </div>

      {error ? <p className="favorites-error">{error}</p> : null}

      {favorites.length === 0 ? (
        <p className="favorites-empty">
          Save any recommendation you want to come back to later. Your list will appear here.
        </p>
      ) : (
        <div className="favorites-list">
          {favorites.map((movie) => (
            <article key={movie.tmdbId} className="favorite-item">
              <div>
                <h3>{movie.title}</h3>
                <p>{movie.rating ? `${movie.rating}/10` : 'Saved recommendation'}</p>
              </div>
              <button type="button" className="favorite-remove" onClick={() => onRemove(movie)}>
                Drop
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default FavoritesList;
