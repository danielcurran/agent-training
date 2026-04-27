'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'decisions-results.json');
const DECISIONS_PATH = path.join(__dirname, '..', 'INDEX_DECISIONS.md');

const REQUIRED_KEYWORDS = ['index', 'rationale', 'trade-off', 'performance', 'queries'];
const MIN_WORDS = 100;

function checkDecisions() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  if (!fs.existsSync(DECISIONS_PATH)) {
    console.error('✗ INDEX_DECISIONS.md not found. Create this file in the lab root.');
    results.passed = false;
    results.checks.fileExists = { passed: false, message: 'INDEX_DECISIONS.md not found' };
    saveResults(results);
    process.exit(1);
  }

  const content = fs.readFileSync(DECISIONS_PATH, 'utf8');
  results.checks.fileExists = { passed: true, message: 'INDEX_DECISIONS.md found' };
  console.log('✓ INDEX_DECISIONS.md found');

  const words = content.split(/\s+/).filter(w => w.length > 0).length;
  const wordsPassed = words >= MIN_WORDS;
  results.checks.wordCount = {
    passed: wordsPassed,
    message: `Word count: ${words} (minimum: ${MIN_WORDS})`,
    actual: words
  };
  if (wordsPassed) {
    console.log(`✓ Word count: ${words}`);
  } else {
    console.log(`✗ Word count: ${words} (need at least ${MIN_WORDS}). Expand your decisions document.`);
  }

  const lowerContent = content.toLowerCase();
  const missingKeywords = REQUIRED_KEYWORDS.filter(kw => !lowerContent.includes(kw));
  const keywordsPassed = missingKeywords.length === 0;
  results.checks.keywords = {
    passed: keywordsPassed,
    message: keywordsPassed
      ? 'All required keywords present'
      : `Missing keywords: ${missingKeywords.join(', ')}`,
    missing: missingKeywords
  };
  if (keywordsPassed) {
    console.log('✓ All required keywords present (index, rationale, trade-off, performance, queries)');
  } else {
    console.log(`✗ Missing keywords: ${missingKeywords.join(', ')}`);
    console.log('  Ensure your document discusses each index with rationale, trade-offs, and performance.');
  }

  const passed = wordsPassed && keywordsPassed;
  results.passed = passed;
  console.log('\n' + (passed ? '✓ INDEX_DECISIONS.md check passed!' : '✗ Expand INDEX_DECISIONS.md to meet requirements.'));

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

checkDecisions();
