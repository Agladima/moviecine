function LoadingState({ stage, message }) {
  return (
    <section className="status-card loading-card">
      <div className="pulse-orb" aria-hidden="true" />
      <p className="status-title">
        {stage === 'analyzing' ? 'Reading your mood' : 'Finding your movies'}
      </p>
      <p>{message}</p>
    </section>
  );
}

export default LoadingState;
