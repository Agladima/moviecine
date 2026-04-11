import { useState } from 'react';

const prompts = [
  'I feel empty and need something meaningful but not too sad',
  'I am anxious and overstimulated, but I still want something clever',
  'I feel light, romantic, and ready for something charming',
];

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
          Describe tonight&apos;s emotional brief
        </label>
        <textarea
          id="moodText"
          className="mood-textarea"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Try nuance, contradiction, or context. Example: I want something hopeful, intimate, and quietly healing."
          rows="5"
          maxLength="500"
          disabled={disabled}
        />

        <div className="mood-toolbar">
          <div className="mood-meta">
            <span className="mood-count">{value.trim().length}/500</span>
            <span className="mood-helper">Think feeling, tone, and what you want to avoid.</span>
          </div>
          <div className="mood-actions">
            <button type="button" className="secondary-button" onClick={onReset} disabled={disabled}>
              Reset
            </button>
            <button type="submit" className="primary-button" disabled={disabled || !value.trim()}>
              {stage === 'idle' || stage === 'error' || stage === 'done'
                ? 'Curate the list'
                : 'Working...'}
            </button>
          </div>
        </div>
      </form>

      <div className="prompt-row">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="prompt-chip"
            onClick={() => setValue(prompt)}
            disabled={disabled}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodInput;
