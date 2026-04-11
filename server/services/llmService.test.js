const assert = require('node:assert/strict');
const { __testing } = require('./llmService');

const tests = [
  {
    name: 'handles empty but meaningful mood with softened sadness',
    run: async () => {
      const result = await __testing.localAnalyzeMood(
        'I feel empty and need something meaningful but not too sad'
      );

      assert.equal(result.primaryEmotion, 'empty');
      assert.ok(['reflective', 'hopeful'].includes(result.secondaryEmotion));
      assert.ok(result.tone.includes('thoughtful'));
      assert.ok(result.tone.includes('uplifting') || result.tone.includes('light'));
      assert.ok(result.confidence >= 40);
    },
  },
  {
    name: 'negation reduces direct emotion matches',
    run: async () => {
      const result = await __testing.localAnalyzeMood(
        'I am not sad, just calm and content tonight'
      );

      assert.notEqual(result.primaryEmotion, 'sad');
      assert.ok(['content', 'reflective'].includes(result.primaryEmotion));
    },
  },
  {
    name: 'anxious input gets grounded tone and cautionary avoid tones',
    run: async () => {
      const result = await __testing.localAnalyzeMood(
        'I feel anxious, overwhelmed, and on edge. I need something meaningful but safe.'
      );

      assert.equal(result.primaryEmotion, 'anxious');
      assert.ok(result.tone.includes('thoughtful'));
      assert.ok(result.avoidTones.includes('intense'));
    },
  },
  {
    name: 'local explanation mentions title and mood shape',
    run: async () => {
      const explanation = await __testing.localGenerateMovieExplanation(
        'The Green Mile',
        'You are searching for something that fills the quiet with meaning, not noise.',
        ['Drama', 'Fantasy']
      );

      assert.match(explanation, /The Green Mile/);
      assert.match(explanation, /Drama, Fantasy/);
    },
  },
];

const main = async () => {
  let failures = 0;

  for (const test of tests) {
    try {
      await test.run();
      console.log(`PASS ${test.name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${test.name}`);
      console.error(error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`All ${tests.length} llmService tests passed.`);
};

main();
