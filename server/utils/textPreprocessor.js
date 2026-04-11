/**
 * Cleans and normalizes raw mood input before sending to OpenAI.
 * Handles: excess whitespace, special chars, length limiting.
 */
const preprocessText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid input: mood text must be a non-empty string');
  }

  let cleaned = rawText
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s'",.-]/g, ' ')
    .substring(0, 500);

  if (cleaned.length < 2) {
    throw new Error('Input too short. Please describe your mood in more detail.');
  }

  return cleaned;
};

module.exports = { preprocessText };
