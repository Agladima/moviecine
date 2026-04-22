function MoodSummary({ moodProfile, movieCount, onReset }) {
  return (
    <section className="summary-card">
      <div className="summary-head">
        <div>
          <p className="summary-kicker">Mood read</p>
          <h2>{moodProfile.humanSummary}</h2>
        </div>
        <div className="summary-actions">
          {moodProfile.confidence ? (
            <span className="confidence-badge">{moodProfile.confidence}% sure</span>
          ) : null}
          <button type="button" className="summary-reset" onClick={onReset}>
            Retry
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span>Emotion</span>
          <strong>{moodProfile.primaryEmotion}</strong>
        </div>
        <div className="summary-item">
          <span>Intensity</span>
          <strong>{moodProfile.intensity}</strong>
        </div>
        <div className="summary-item">
          <span>Results</span>
          <strong>{movieCount}</strong>
        </div>
        {moodProfile.secondaryEmotion ? (
          <div className="summary-item">
            <span>Secondary</span>
            <strong>{moodProfile.secondaryEmotion}</strong>
          </div>
        ) : null}
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
            no {tone}
          </span>
        ))}
      </div>
    </section>
  );
}

export default MoodSummary;
