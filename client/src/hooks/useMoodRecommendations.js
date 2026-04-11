import { useState, useCallback } from 'react';
import { analyzeMood, getRecommendations } from '../services/api';

const STAGES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  FETCHING: 'fetching',
  DONE: 'done',
  ERROR: 'error',
};

export const useMoodRecommendations = () => {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [moodProfile, setMoodProfile] = useState(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (moodText) => {
    setStage(STAGES.ANALYZING);
    setError(null);
    setMovies([]);
    setMoodProfile(null);

    try {
      const moodRes = await analyzeMood(moodText);
      const { moodAnalysis } = moodRes.data.data;
      setMoodProfile(moodAnalysis);

      setStage(STAGES.FETCHING);
      const recsRes = await getRecommendations(moodAnalysis);
      setMovies(recsRes.data.data.movies);
      setStage(STAGES.DONE);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setStage(STAGES.ERROR);
    }
  }, []);

  const reset = useCallback(() => {
    setStage(STAGES.IDLE);
    setMoodProfile(null);
    setMovies([]);
    setError(null);
  }, []);

  return {
    stage,
    moodProfile,
    movies,
    error,
    analyze,
    reset,
    isLoading: stage === STAGES.ANALYZING || stage === STAGES.FETCHING,
    loadingMessage:
      stage === STAGES.ANALYZING
        ? 'Reading your emotional wavelength...'
        : 'Curating your cinematic experience...',
  };
};
