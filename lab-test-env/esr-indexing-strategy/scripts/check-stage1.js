'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'stage1-results.json');
const STAGE1_PATH = path.join(__dirname, '..', 'src', 'stage1-esr-identification.js');

// Expected answers for each query
const EXPECTED = {
  query1: { E: 'status', S: 'none', R: 'none' },
  query2: { E: 'category', S: 'createdAt', R: 'none' },
  query3: { E: 'none', S: 'none', R: 'price' },
  query4: { E: 'status', S: 'rating', R: 'price' },
  query5: { E: 'tags', S: 'createdAt', R: 'none' }
};

function normalize(val) {
  if (val === null || val === undefined) return 'none';
  return String(val).trim().toLowerCase();
}

function checkStage1() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Load learner file
  let learnerAnswers;
  try {
    // Clear require cache so edits are picked up
    delete require.cache[require.resolve(STAGE1_PATH)];
    learnerAnswers = require(STAGE1_PATH);
  } catch (err) {
    console.error('✗ Could not load src/stage1-esr-identification.js:', err.message);
    results.passed = false;
    results.error = err.message;
    saveResults(results);
    process.exit(1);
  }

  let correct = 0;
  const total = Object.keys(EXPECTED).length;

  for (const [queryId, expected] of Object.entries(EXPECTED)) {
    const learner = learnerAnswers[queryId] || {};
    const eCorrect = normalize(learner.E) === normalize(expected.E);
    const sCorrect = normalize(learner.S) === normalize(expected.S);
    const rCorrect = normalize(learner.R) === normalize(expected.R);
    const allCorrect = eCorrect && sCorrect && rCorrect;

    results.checks[queryId] = {
      passed: allCorrect,
      expected,
      actual: { E: learner.E, S: learner.S, R: learner.R },
      details: {
        E: eCorrect ? '✓' : `✗ (expected: ${expected.E}, got: ${learner.E})`,
        S: sCorrect ? '✓' : `✗ (expected: ${expected.S}, got: ${learner.S})`,
        R: rCorrect ? '✓' : `✗ (expected: ${expected.R}, got: ${learner.R})`
      }
    };

    if (allCorrect) {
      correct++;
      console.log(`✓ ${queryId}: E=${expected.E}, S=${expected.S}, R=${expected.R}`);
    } else {
      console.log(`✗ ${queryId}:`);
      if (!eCorrect) console.log(`    E: expected "${expected.E}", got "${learner.E}"`);
      if (!sCorrect) console.log(`    S: expected "${expected.S}", got "${learner.S}"`);
      if (!rCorrect) console.log(`    R: expected "${expected.R}", got "${learner.R}"`);
    }
  }

  // Pass threshold: 4 out of 5 correct
  const passed = correct >= 4;
  results.passed = passed;
  results.score = `${correct}/${total}`;

  console.log(`\nScore: ${correct}/${total}`);
  if (passed) {
    console.log('✓ Stage 1 passed!');
  } else {
    console.log(`✗ Stage 1 failed. Need at least 4/${total} correct. Review ESR identification rules.`);
  }

  saveResults(results);
  process.exit(passed ? 0 : 1);
}

function saveResults(results) {
  try {
    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  } catch (err) {
    console.warn('Could not save results:', err.message);
  }
}

checkStage1();
