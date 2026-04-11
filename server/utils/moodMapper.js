/**
 * Maps analyzed emotions/tones -> TMDB genre IDs and search keywords.
 * This acts as the "translation layer" between AI output and TMDB queries.
 *
 * TMDB Genre IDs reference:
 * 28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime,
 * 99=Documentary, 18=Drama, 10751=Family, 14=Fantasy, 36=History,
 * 27=Horror, 10402=Music, 9648=Mystery, 10749=Romance, 878=Sci-Fi,
 * 53=Thriller, 10752=War, 37=Western
 */

const EMOTION_TO_GENRES = {
  sad: [18, 10749, 10402],
  lonely: [18, 14, 10749],
  happy: [35, 12, 16],
  anxious: [53, 878, 9648],
  angry: [28, 80, 53],
  hopeful: [18, 12, 878],
  nostalgic: [18, 36, 10749],
  excited: [28, 12, 878],
  bored: [12, 35, 28],
  heartbroken: [18, 10749, 10402],
  reflective: [18, 99, 36],
  fearful: [27, 53, 9648],
  content: [35, 10751, 16],
  inspired: [18, 12, 99],
  empty: [18, 9648, 14],
};

const TONE_TO_KEYWORDS = {
  uplifting: ['inspiring', 'hope', 'redemption', 'triumph'],
  dark: ['dark', 'noir', 'psychological', 'gritty'],
  funny: ['comedy', 'humor', 'satire', 'witty'],
  romantic: ['love', 'romance', 'relationship', 'passion'],
  action: ['action', 'adventure', 'hero', 'epic'],
  thoughtful: ['philosophical', 'introspective', 'coming-of-age'],
  light: ['feel-good', 'heartwarming', 'family'],
  intense: ['suspense', 'tension', 'drama'],
};

/**
 * Converts AI-analyzed mood object into TMDB query parameters
 * @param {Object} moodAnalysis - Output from OpenAI service
 * @returns {Object} { genreIds, keywords, sortPreference }
 */
const mapMoodToQuery = (moodAnalysis) => {
  const { primaryEmotion, secondaryEmotion, tone = [], intensity } = moodAnalysis;

  const primaryGenres = EMOTION_TO_GENRES[primaryEmotion?.toLowerCase()] || [18];
  const secondaryGenres = secondaryEmotion
    ? EMOTION_TO_GENRES[secondaryEmotion?.toLowerCase()] || []
    : [];

  const allGenres = [...new Set([...primaryGenres, ...secondaryGenres])];

  const keywords = tone.flatMap(
    (t) => TONE_TO_KEYWORDS[t?.toLowerCase()] || []
  );

  const sortPreference = intensity === 'high' ? 'vote_average.desc' : 'popularity.desc';

  return {
    genreIds: allGenres.slice(0, 3),
    keywords: [...new Set(keywords)],
    sortPreference,
  };
};

module.exports = { mapMoodToQuery, EMOTION_TO_GENRES, TONE_TO_KEYWORDS };
