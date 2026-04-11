function MoodSummary({ moodProfile, movieCount, onReset }) {
  return (
    <section className="summary-card">
      <div className="summary-head">
        <div>
          <p className="summary-kicker">Mood Read</p>
          <h2>{moodProfile.humanSummary}</h2>
        </div>
        <div className="summary-actions">
          {moodProfile.confidence ? (
            <span className="confidence-badge">{moodProfile.confidence}% confidence</span>
          ) : null}
          <button type="button" className="summary-reset" onClick={onReset}>
            New mood
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span>Primary emotion</span>
          <strong>{moodProfile.primaryEmotion}</strong>
        </div>
        <div className="summary-item">
          <span>Secondary emotion</span>
          <strong>{moodProfile.secondaryEmotion || 'None detected'}</strong>
        </div>
        <div className="summary-item">
          <span>Intensity</span>
          <strong>{moodProfile.intensity}</strong>
        </div>
        <div className="summary-item">
          <span>Matches found</span>
          <strong>{movieCount}</strong>
        </div>
      </div>

      <p className="summary-context">{moodProfile.context}</p>

      <div className="tag-row">
        {moodProfile.tone?.map((tone) => (
          <span key={tone} className="tag tone-tag">
            {tone}
          </span>
        ))}
        {moodProfile.avoidTones?.map((tone) => (
          <span key={tone} className="tag avoid-tag">
            avoid {tone}
          </span>
        ))}
      </div>
    </section>
  );
}

export default MoodSummary;
