function LoadingState({ stage, message }) {
  return (
    <section className="status-card loading-card">
      <div className="pulse-orb" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="status-title">
        {stage === 'analyzing' ? 'Analyzing your mood' : 'Building recommendations'}
      </p>
      <p>{message}</p>
    </section>
  );
}

export default LoadingState;
