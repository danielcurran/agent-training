'use strict';

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, '..', 'KNOWLEDGE.json');
const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'knowledge-results.json');
const MIN_ENTRIES = 3;
const REQUIRED_FIELDS = ['concept', 'sql_instinct_overridden', 'rule', 'when_to_apply', 'confidence'];
const VALID_CONFIDENCE = ['verified', 'corrected', 'self-assessed'];

// ESR-specific: at least one entry must cover the ESR guideline itself
const COVERAGE_CHECKS = [
  {
    label: 'ESR guideline (equality, sort, range)',
    test: entry => /esr|equality|sort|range/i.test(`${entry.concept} ${entry.rule}`)
  },
  {
    label: 'explain() or query performance',
    test: entry => /explain|executionstats|performance|winning plan/i.test(`${entry.concept} ${entry.rule} ${entry.when_to_apply}`)
  }
];

function checkKnowledge() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // 1. File exists
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.error('✗ KNOWLEDGE.json not found. Create this file in the lab root.');
    results.passed = false;
    results.checks.fileExists = { passed: false, message: 'KNOWLEDGE.json not found' };
    saveResults(results);
    process.exit(1);
  }
  results.checks.fileExists = { passed: true, message: 'KNOWLEDGE.json found' };
  console.log('✓ KNOWLEDGE.json found');

  // 2. Valid JSON array
  let entries;
  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
    entries = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ KNOWLEDGE.json: invalid JSON — ${err.message}`);
    results.passed = false;
    results.checks.validJson = { passed: false, message: `Invalid JSON: ${err.message}` };
    saveResults(results);
    process.exit(1);
  }

  if (!Array.isArray(entries)) {
    console.error('✗ KNOWLEDGE.json must be a JSON array');
    results.passed = false;
    results.checks.isArray = { passed: false, message: 'Not a JSON array' };
    saveResults(results);
    process.exit(1);
  }
  results.checks.validJson = { passed: true, message: 'Valid JSON array' };
  console.log('✓ Valid JSON array');

  // 3. Minimum entry count
  const countPassed = entries.length >= MIN_ENTRIES;
  results.checks.entryCount = {
    passed: countPassed,
    message: `Entry count: ${entries.length} (minimum: ${MIN_ENTRIES})`,
    actual: entries.length
  };
  if (countPassed) {
    console.log(`✓ Entry count: ${entries.length}`);
  } else {
    console.log(`✗ Entry count: ${entries.length} (need at least ${MIN_ENTRIES}). Add more knowledge entries.`);
  }

  // 4. Required fields on every entry
  let fieldsPassed = true;
  entries.forEach((entry, i) => {
    const missing = REQUIRED_FIELDS.filter(f => !entry[f] || String(entry[f]).trim() === '');
    if (missing.length > 0) {
      console.log(`✗ Entry ${i + 1} ("${entry.concept || 'unnamed'}"): missing fields — ${missing.join(', ')}`);
      fieldsPassed = false;
    }
    if (entry.confidence && !VALID_CONFIDENCE.includes(entry.confidence)) {
      console.log(`✗ Entry ${i + 1}: confidence must be one of: ${VALID_CONFIDENCE.join(', ')} (got "${entry.confidence}")`);
      fieldsPassed = false;
    }
  });
  results.checks.requiredFields = { passed: fieldsPassed, message: fieldsPassed ? 'All entries have required fields' : 'Some entries missing required fields' };
  if (fieldsPassed) {
    console.log('✓ All entries have required fields with valid confidence values');
  }

  // 5. Lab-specific coverage
  let coveragePassed = true;
  COVERAGE_CHECKS.forEach(({ label, test }) => {
    const covered = entries.some(test);
    results.checks[`coverage_${label.replace(/\W+/g, '_')}`] = {
      passed: covered,
      message: covered ? `Coverage: ${label}` : `No entry covers: ${label}`
    };
    if (covered) {
      console.log(`✓ Coverage: ${label}`);
    } else {
      console.log(`✗ Coverage: no entry covers ${label}`);
      coveragePassed = false;
    }
  });

  const passed = countPassed && fieldsPassed && coveragePassed;
  results.passed = passed;
  console.log('\n' + (passed ? '✓ KNOWLEDGE.json check passed!' : '✗ Update KNOWLEDGE.json to meet all requirements.'));

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

checkKnowledge();
