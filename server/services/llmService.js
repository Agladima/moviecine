const OpenAI = require('openai');

const PROVIDERS = {
  local: {
    apiKeyEnv: null,
    baseURL: null,
    analyzeModel: 'heuristic-mood-engine',
    explainModel: 'heuristic-explainer',
  },
  openai: {
    apiKeyEnv: 'OPENAI_API_KEY',
    baseURL: process.env.OPENAI_BASE_URL,
    analyzeModel: process.env.OPENAI_ANALYZE_MODEL || 'gpt-4o-mini',
    explainModel: process.env.OPENAI_EXPLAIN_MODEL || 'gpt-4o-mini',
  },
  deepseek: {
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    analyzeModel: process.env.DEEPSEEK_ANALYZE_MODEL || 'deepseek-chat',
    explainModel: process.env.DEEPSEEK_EXPLAIN_MODEL || 'deepseek-chat',
  },
};

const EMOTION_KEYWORDS = {
  sad: ['sad', 'down', 'blue', 'cry', 'grief', 'hurt', 'sorrow', 'heavy'],
  lonely: ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned'],
  happy: ['happy', 'joy', 'joyful', 'glad', 'cheerful', 'delighted'],
  anxious: ['anxious', 'nervous', 'worried', 'restless', 'overthinking', 'overwhelmed', 'panic'],
  angry: ['angry', 'mad', 'furious', 'rage', 'irritated', 'frustrated'],
  hopeful: ['hopeful', 'optimistic', 'better', 'healing', 'forward', 'tomorrow'],
  nostalgic: ['nostalgic', 'remember', 'miss', 'past', 'childhood', 'old times'],
  excited: ['excited', 'thrilled', 'energized', 'hyped', 'adventurous'],
  bored: ['bored', 'stuck', 'dull', 'nothing', 'uninspired'],
  heartbroken: ['heartbroken', 'breakup', 'broken', 'devastated', 'shattered'],
  reflective: ['reflective', 'thoughtful', 'thinking', 'meaningful', 'introspective', 'quiet'],
  fearful: ['afraid', 'fearful', 'scared', 'terrified', 'uneasy'],
  content: ['content', 'calm', 'peaceful', 'settled', 'cozy', 'gentle'],
  inspired: ['inspired', 'motivated', 'dreaming', 'creative', 'aspiring'],
  empty: ['empty', 'numb', 'hollow', 'blank', 'drained'],
};

const EMOTION_PHRASES = {
  sad: ['not okay', 'feel low', 'feeling low'],
  lonely: ['on my own', 'by myself'],
  happy: ['in a good mood', 'feel good'],
  anxious: ['on edge', 'all over the place', 'can t switch off', 'cannot switch off'],
  angry: ['fed up', 'worked up'],
  hopeful: ['looking up', 'getting better'],
  nostalgic: ['miss how things were', 'thinking about the past'],
  excited: ['can t wait', 'cannot wait'],
  bored: ['need something', 'nothing excites me'],
  heartbroken: ['broken heart', 'can t move on', 'cannot move on'],
  reflective: ['something meaningful', 'want to think', 'sit with'],
  fearful: ['on edge and scared', 'need something safe'],
  content: ['at peace', 'feel settled'],
  inspired: ['fire me up', 'make me dream'],
  empty: ['feel empty', 'feel numb', 'emotionally drained'],
};

const TONE_KEYWORDS = {
  uplifting: ['uplifting', 'hopeful', 'inspiring', 'healing', 'redemption', 'light at the end'],
  dark: ['dark', 'bleak', 'grim', 'brooding', 'disturbing'],
  funny: ['funny', 'humor', 'laugh', 'lighthearted', 'playful'],
  romantic: ['romantic', 'love', 'tender', 'intimate', 'chemistry'],
  action: ['action', 'fast', 'adrenaline', 'intense', 'epic'],
  thoughtful: ['thoughtful', 'meaningful', 'introspective', 'quiet', 'philosophical'],
  light: ['light', 'easy', 'comforting', 'feel-good', 'gentle'],
  intense: ['intense', 'raw', 'devastating', 'overwhelming', 'powerful'],
};

const AVOID_TONE_BY_EMOTION = {
  sad: ['dark', 'intense'],
  lonely: ['dark'],
  anxious: ['intense', 'dark'],
  angry: ['dark'],
  heartbroken: ['dark', 'intense'],
  empty: ['dark', 'intense'],
  fearful: ['dark', 'intense'],
};

const CONTEXT_BY_EMOTION = {
  sad: 'User needs comfort, emotional resonance, and a gentle sense of movement.',
  lonely: 'User needs connection, warmth, and a feeling of being understood.',
  happy: 'User wants to stay in a bright, buoyant, and emotionally open space.',
  anxious: 'User needs grounding, clarity, and something absorbing without chaos.',
  angry: 'User needs release, momentum, and a story that channels intensity well.',
  hopeful: 'User needs reinforcement that growth and light are still available.',
  nostalgic: 'User needs tenderness, memory, and emotionally textured reflection.',
  excited: 'User wants momentum, spectacle, and emotional payoff.',
  bored: 'User needs stimulation, movement, and rediscovery.',
  heartbroken: 'User needs catharsis without being crushed further.',
  reflective: 'User needs emotional depth and space to think.',
  fearful: 'User needs safety, control, and carefully matched tension.',
  content: 'User wants something warm, steady, and affirming.',
  inspired: 'User needs momentum, wonder, and renewed creative energy.',
  empty: 'User needs emotional resonance without heaviness.',
};

const SUMMARY_BY_EMOTION = {
  sad: 'You sound weighed down and in need of something tender that still leaves room for light.',
  lonely: 'You seem to be reaching for a story that feels companionable, human, and close.',
  happy: 'You are in a bright emotional space and looking for something that keeps that glow alive.',
  anxious: 'You sound overstimulated and in need of something steady, absorbing, and emotionally clear.',
  angry: 'You have a lot of charge in the system and need a story that gives that energy a shape.',
  hopeful: 'You are looking for a film that protects your optimism and helps it grow.',
  nostalgic: 'You are reaching for something that honors memory, feeling, and the ache of looking back.',
  excited: 'You want a film that meets your energy and turns it into a satisfying rush.',
  bored: 'You need a watch that wakes you up and pulls you back into curiosity.',
  heartbroken: 'You are looking for something with emotional weight, but not something that punishes you for feeling deeply.',
  reflective: 'You seem to want something thoughtful enough to sit with, not just consume.',
  fearful: 'You want emotional intensity handled with care, not chaos for its own sake.',
  content: 'You are in a calm place and looking for something warm enough to stay there.',
  inspired: 'You want a story that rekindles possibility and makes motion feel real again.',
  empty: 'You are searching for something that fills the quiet with meaning, not noise.',
};

const INTENSIFIERS = ['very', 'really', 'extremely', 'deeply', 'so', 'too', 'overwhelmingly'];
const SOFTENERS = ['slightly', 'kind of', 'a bit', 'somewhat', 'maybe'];
const NEGATIONS = ['not', 'never', 'no', 'hardly', 'without'];

const normalizeProviderName = (value) => (value || '').trim().toLowerCase();

const getProviderName = () => normalizeProviderName(process.env.LLM_PROVIDER || 'local');

const getProviderConfig = (providerName = getProviderName()) => {
  const provider = PROVIDERS[providerName];

  if (!provider) {
    throw new Error(`Unsupported LLM provider: ${providerName}`);
  }

  if (!provider.apiKeyEnv) {
    return { providerName, ...provider };
  }

  const apiKey = process.env[provider.apiKeyEnv];

  if (!apiKey) {
    throw new Error(`Missing API key for provider "${providerName}". Expected ${provider.apiKeyEnv}.`);
  }

  return {
    providerName,
    apiKey,
    ...provider,
  };
};

const getClient = (providerName) => {
  const { apiKey, baseURL } = getProviderConfig(providerName);
  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
};

const getFallbackProviderName = (providerName) => {
  if (providerName !== 'local') {
    return 'local';
  }

  if (process.env.DEEPSEEK_API_KEY) {
    return 'deepseek';
  }

  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  return null;
};

const shouldFallback = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.status === 402 ||
    error?.status === 429 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('insufficient balance')
  );
};

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasNegationNearWord = (tokens, word) => {
  const positions = tokens
    .map((token, index) => ({ token, index }))
    .filter((entry) => entry.token === word)
    .map((entry) => entry.index);

  return positions.some((position) => {
    const window = tokens.slice(Math.max(0, position - 3), position);
    return window.some((token) => NEGATIONS.includes(token));
  });
};

const scoreMap = (tokens, lexicon) => {
  const joined = tokens.join(' ');
  const scores = Object.entries(lexicon).map(([label, words]) => {
    let score = 0;

    words.forEach((word) => {
      if (word.includes(' ')) {
        if (joined.includes(word)) {
          score += 2;
        }
      } else {
        score += tokens.filter((token) => token === word).length;
      }
    });

    return { label, score };
  });

  return scores.sort((a, b) => b.score - a.score);
};

const scoreEmotionMap = (text, tokens) => {
  const normalized = normalizeText(text);
  const scores = Object.keys(EMOTION_KEYWORDS).map((label) => ({ label, score: 0 }));

  scores.forEach((entry) => {
    EMOTION_KEYWORDS[entry.label].forEach((word) => {
      const exactHits = tokens.filter((token) => token === word).length;
      if (!exactHits) {
        return;
      }

      if (hasNegationNearWord(tokens, word)) {
        entry.score -= exactHits * 0.8;
      } else {
        entry.score += exactHits;
      }
    });

    (EMOTION_PHRASES[entry.label] || []).forEach((phrase) => {
      if (normalized.includes(phrase)) {
        entry.score += 2.5;
      }
    });

    if (normalized.includes(`i feel ${entry.label}`) || normalized.includes(`feeling ${entry.label}`)) {
      entry.score += 3;
    }
  });

  if (normalized.includes('but not too sad')) {
    const sadEntry = scores.find((entry) => entry.label === 'sad');
    if (sadEntry) {
      sadEntry.score -= 1.5;
    }
    const reflectiveEntry = scores.find((entry) => entry.label === 'reflective');
    if (reflectiveEntry) {
      reflectiveEntry.score += 1;
    }
    const hopefulEntry = scores.find((entry) => entry.label === 'hopeful');
    if (hopefulEntry) {
      hopefulEntry.score += 1;
    }
  }

  return scores.sort((a, b) => b.score - a.score);
};

const detectIntensity = (text, tokens, topScore) => {
  const lowered = text.toLowerCase();
  const emphasis = INTENSIFIERS.reduce(
    (count, word) => count + (lowered.includes(word) ? 1 : 0),
    0
  );
  const soften = SOFTENERS.reduce(
    (count, word) => count + (lowered.includes(word) ? 1 : 0),
    0
  );

  if (topScore >= 3 || emphasis >= 2 || tokens.length > 22) {
    return 'high';
  }

  if (topScore <= 1 && soften > 0) {
    return 'low';
  }

  return 'medium';
};

const detectTones = (text, primaryEmotion) => {
  const tokens = tokenize(text);
  const normalized = normalizeText(text);
  const rankedTones = scoreMap(tokens, TONE_KEYWORDS)
    .filter((entry) => entry.score > 0)
    .map((entry) => entry.label);

  const derivedTones = [];

  if (['empty', 'reflective', 'nostalgic'].includes(primaryEmotion)) {
    derivedTones.push('thoughtful');
  }
  if (['hopeful', 'inspired', 'content', 'happy'].includes(primaryEmotion)) {
    derivedTones.push('uplifting');
  }
  if (['sad', 'heartbroken', 'lonely'].includes(primaryEmotion)) {
    derivedTones.push('light');
  }
  if (['excited', 'angry'].includes(primaryEmotion)) {
    derivedTones.push('action');
  }
  if (['anxious', 'fearful'].includes(primaryEmotion)) {
    derivedTones.push('thoughtful');
  }
  if (normalized.includes('not too sad') || normalized.includes('not too dark')) {
    derivedTones.push('uplifting');
    derivedTones.push('light');
  }

  const combined = [...new Set([...rankedTones, ...derivedTones])];
  return combined.slice(0, 3).length ? combined.slice(0, 3) : ['thoughtful'];
};

const buildHumanSummary = (primaryEmotion, secondaryEmotion, tones) => {
  const base = SUMMARY_BY_EMOTION[primaryEmotion] || 'You are looking for a film that matches your emotional state with care.';
  if (!secondaryEmotion) {
    return base;
  }

  return `${base} There is also a trace of ${secondaryEmotion}, which suggests ${tones[0] || 'thoughtful'} storytelling may land best.`;
};

const localAnalyzeMood = async (cleanedText) => {
  const tokens = tokenize(cleanedText);
  const rankedEmotions = scoreEmotionMap(cleanedText, tokens);
  const best = rankedEmotions[0] || { label: 'reflective', score: 0 };
  const secondary = rankedEmotions.find((entry) => entry.label !== best.label && entry.score > 0);
  const primaryEmotion = best.score > 0 ? best.label : 'reflective';
  const secondaryEmotion = secondary ? secondary.label : null;
  const intensity = detectIntensity(cleanedText, tokens, best.score);
  const tone = detectTones(cleanedText, primaryEmotion);
  const avoidTones = [...new Set(AVOID_TONE_BY_EMOTION[primaryEmotion] || [])].slice(0, 2);
  const context = CONTEXT_BY_EMOTION[primaryEmotion] || 'User needs a film that feels emotionally aligned and easy to enter.';
  const humanSummary = buildHumanSummary(primaryEmotion, secondaryEmotion, tone);
  const secondScore = secondary?.score || 0;
  const confidence = Math.max(
    40,
    Math.min(96, Math.round(55 + best.score * 12 + Math.max(best.score - secondScore, 0) * 6))
  );

  return {
    primaryEmotion,
    secondaryEmotion,
    intensity,
    tone,
    context,
    humanSummary,
    avoidTones,
    confidence,
  };
};

const localGenerateMovieExplanation = async (movieTitle, moodSummary, genres) => {
  const genreText = genres && genres.length ? genres.join(', ') : 'character-driven storytelling';
  return `${movieTitle} fits this mood because it leans into ${genreText} in a way that can meet the emotional shape of what you described. It should feel aligned with ${moodSummary.toLowerCase()}, offering resonance without losing momentum.`;
};

const buildToolDefinition = () => ({
  type: 'function',
  function: {
    name: 'extract_mood_profile',
    description: 'Extracts a structured emotional profile from a mood description',
    parameters: {
      type: 'object',
      properties: {
        primaryEmotion: {
          type: 'string',
          description: 'The dominant emotion. Must be one of: sad, lonely, happy, anxious, angry, hopeful, nostalgic, excited, bored, heartbroken, reflective, fearful, content, inspired, empty',
        },
        secondaryEmotion: {
          type: 'string',
          description: 'A secondary/supporting emotion if present (same options as primary, or null)',
        },
        intensity: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Emotional intensity: low=mild, medium=moderate, high=overwhelming',
        },
        tone: {
          type: 'array',
          items: { type: 'string' },
          description: 'Desired cinematic tones: uplifting, dark, funny, romantic, action, thoughtful, light, intense',
        },
        context: {
          type: 'string',
          description: 'Brief 1-sentence context about what the user seems to need emotionally',
        },
        humanSummary: {
          type: 'string',
          description: 'A warm, empathetic 1-2 sentence summary of the detected mood for display to the user',
        },
        avoidTones: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tones to avoid based on mood (e.g., if sad, avoid "dark")',
        },
      },
      required: ['primaryEmotion', 'intensity', 'tone', 'context', 'humanSummary'],
    },
  },
});

const remoteAnalyzeMood = async (providerName, cleanedText) => {
  const client = getClient(providerName);
  const { analyzeModel } = getProviderConfig(providerName);

  const response = await client.chat.completions.create({
    model: analyzeModel,
    messages: [
      {
        role: 'system',
        content: `You are an expert emotional intelligence analyst specializing in mapping 
        human mood descriptions to cinematic experiences. Analyze the user's mood with 
        psychological depth, considering subtext and emotional nuance beyond literal words.`,
      },
      {
        role: 'user',
        content: `Analyze this mood description and extract structured emotional data: "${cleanedText}"`,
      },
    ],
    tools: [buildToolDefinition()],
    tool_choice: { type: 'function', function: { name: 'extract_mood_profile' } },
    temperature: 0.3,
  });

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    throw new Error(`No structured mood tool call returned from provider "${providerName}".`);
  }

  return JSON.parse(toolCall.function.arguments);
};

const remoteGenerateMovieExplanation = async (providerName, movieTitle, moodSummary, genres) => {
  const client = getClient(providerName);
  const { explainModel } = getProviderConfig(providerName);

  const response = await client.chat.completions.create({
    model: explainModel,
    messages: [
      {
        role: 'user',
        content: `A user feeling "${moodSummary}" was recommended "${movieTitle}" (genres: ${genres.join(', ')}).
        Write a compelling 2-sentence explanation of why this movie matches their emotional state.
        Be specific, empathetic, and reference the movie's emotional themes. No spoilers.`,
      },
    ],
    max_tokens: 120,
    temperature: 0.7,
  });

  return response.choices?.[0]?.message?.content || 'This movie fits your mood in a way that feels emotionally aligned.';
};

const analyzeMood = async (cleanedText) => {
  const providerName = getProviderName();

  if (providerName === 'local') {
    return localAnalyzeMood(cleanedText);
  }

  try {
    return await remoteAnalyzeMood(providerName, cleanedText);
  } catch (error) {
    const fallbackProvider = getFallbackProviderName(providerName);

    if (!fallbackProvider || !shouldFallback(error)) {
      throw error;
    }

    return fallbackProvider === 'local'
      ? localAnalyzeMood(cleanedText)
      : remoteAnalyzeMood(fallbackProvider, cleanedText);
  }
};

const generateMovieExplanation = async (movieTitle, moodSummary, genres) => {
  const providerName = getProviderName();

  if (providerName === 'local') {
    return localGenerateMovieExplanation(movieTitle, moodSummary, genres);
  }

  try {
    return await remoteGenerateMovieExplanation(providerName, movieTitle, moodSummary, genres);
  } catch (error) {
    const fallbackProvider = getFallbackProviderName(providerName);

    if (!fallbackProvider || !shouldFallback(error)) {
      throw error;
    }

    return fallbackProvider === 'local'
      ? localGenerateMovieExplanation(movieTitle, moodSummary, genres)
      : remoteGenerateMovieExplanation(fallbackProvider, movieTitle, moodSummary, genres);
  }
};

module.exports = {
  analyzeMood,
  generateMovieExplanation,
  __testing: {
    localAnalyzeMood,
    localGenerateMovieExplanation,
    tokenize,
    normalizeText,
    scoreEmotionMap,
    detectTones,
  },
};
