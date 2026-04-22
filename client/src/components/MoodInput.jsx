import { useState } from 'react';

function MoodInput({ onSubmit, onReset, disabled, stage }) {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValue = value.trim();

    if (!nextValue || disabled) {
      return;
    }

    onSubmit(nextValue);
  };

  return (
    <div className="mood-input">
      <form className="mood-form" onSubmit={handleSubmit}>
        <label className="mood-label" htmlFor="moodText">
          What kind of movie do you need tonight?
        </label>
        <textarea
          id="moodText"
          className="mood-textarea"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Example: I feel empty and want something meaningful, warm, and not too heavy."
          rows="4"
          maxLength="500"
          disabled={disabled}
        />

        <div className="mood-toolbar">
          <div className="mood-meta">
            <span className="mood-helper">
              Describe the feeling, the tone you want, or what you want to avoid.
            </span>
          </div>
          <div className="mood-actions">
            {stage === 'done' || stage === 'error' ? (
              <button type="button" className="secondary-button" onClick={onReset} disabled={disabled}>
                Clear
              </button>
            ) : null}
            <button type="submit" className="primary-button" disabled={disabled || !value.trim()}>
              {stage === 'idle' || stage === 'error' || stage === 'done'
                ? 'Find'
                : 'Working...'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default MoodInput;
