const { preprocessText } = require('../utils/textPreprocessor');
const { analyzeMood } = require('../services/llmService');
const MoodHistory = require('../models/MoodHistory');

/**
 * POST /api/analyze-mood
 * Accepts raw mood text, preprocesses it, runs AI analysis,
 * saves to history, and returns structured mood profile.
 */
const analyzeMoodHandler = async (req, res, next) => {
  try {
    const { moodText, sessionId } = req.body;

    if (!moodText) {
      return res.status(400).json({ error: 'moodText is required' });
    }

    const cleanedText = preprocessText(moodText);

    const moodAnalysis = await analyzeMood(cleanedText);

    if (sessionId) {
      MoodHistory.create({
        sessionId,
        rawInput: moodText,
        analyzedMood: {
          primaryEmotion: moodAnalysis.primaryEmotion,
          secondaryEmotion: moodAnalysis.secondaryEmotion,
          intensity: moodAnalysis.intensity,
          tone: moodAnalysis.tone,
          context: moodAnalysis.context,
        },
      }).catch((err) => console.error('MoodHistory save error:', err));
    }

    res.json({
      success: true,
      data: {
        moodAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mood-history/:sessionId
 * Returns past mood entries for a session.
 */
const getMoodHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await MoodHistory.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v');

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeMoodHandler, getMoodHistory };
