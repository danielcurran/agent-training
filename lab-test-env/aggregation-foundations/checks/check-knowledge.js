// filepath: checks/check-knowledge.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KNOWLEDGE_PATH = path.join(ROOT, 'KNOWLEDGE.json');
const MIN_ENTRIES = 3;
const REQUIRED_FIELDS = ['concept', 'sql_instinct_overridden', 'rule', 'when_to_apply', 'confidence'];
const VALID_CONFIDENCE = ['verified', 'corrected', 'self-assessed'];

// Aggregation-specific coverage checks
const COVERAGE_CHECKS = [
  {
    label: 'aggregation pipeline stages ($match, $group, $unwind, etc.)',
    test: entry => /\$match|\$group|\$unwind|\$project|pipeline|stage/i.test(`${entry.concept} ${entry.rule} ${entry.when_to_apply}`)
  },
  {
    label: 'stage sequencing or data flow',
    test: entry => /sequen|order|flow|before|after/i.test(`${entry.rule} ${entry.when_to_apply}`)
  }
];

async function checkKnowledge() {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // 1. File exists
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    fail('KNOWLEDGE.json not found at lab root. Create this file after completing the lab.');
    return { pass: false, error: 'KNOWLEDGE.json not found', passed, failed };
  }
  pass('KNOWLEDGE.json exists');

  // 2. Valid JSON
  let entries;
  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
    entries = JSON.parse(raw);
  } catch (err) {
    fail(`KNOWLEDGE.json is invalid JSON: ${err.message}`);
    return { pass: false, error: `Invalid JSON: ${err.message}`, passed, failed };
  }

  if (!Array.isArray(entries)) {
    fail('KNOWLEDGE.json must be a JSON array of knowledge entries');
    return { pass: false, error: 'Not a JSON array', passed, failed };
  }
  pass('Valid JSON array');

  // 3. Minimum entries
  if (entries.length < MIN_ENTRIES) {
    fail(`Entry count: ${entries.length} (need ≥ ${MIN_ENTRIES}). Add knowledge entries for each pipeline stage you learned.`);
    return { pass: false, error: `Too few entries: ${entries.length}`, passed, failed };
  }
  pass(`Entry count: ${entries.length} (≥ ${MIN_ENTRIES})`);

  // 4. Required fields
  let fieldsPassed = true;
  entries.forEach((entry, i) => {
    const missing = REQUIRED_FIELDS.filter(f => !entry[f] || String(entry[f]).trim() === '');
    if (missing.length > 0) {
      fail(`Entry ${i + 1} ("${entry.concept || 'unnamed'}"): missing fields — ${missing.join(', ')}`);
      fieldsPassed = false;
    }
    if (entry.confidence && !VALID_CONFIDENCE.includes(entry.confidence)) {
      fail(`Entry ${i + 1}: confidence must be one of: ${VALID_CONFIDENCE.join(', ')} (got "${entry.confidence}")`);
      fieldsPassed = false;
    }
  });
  if (fieldsPassed) {
    pass('All entries have required fields with valid confidence values');
  }

  // 5. Lab-specific coverage
  let coveragePassed = true;
  COVERAGE_CHECKS.forEach(({ label, test }) => {
    const covered = entries.some(test);
    if (covered) {
      pass(`Coverage: ${label}`);
    } else {
      fail(`No entry covers: ${label}`);
      coveragePassed = false;
    }
  });

  const allPassed = fieldsPassed && coveragePassed;
  return {
    pass: allPassed,
    message: allPassed
      ? `Knowledge check passed (${passed} checks).`
      : `Knowledge check failed — update KNOWLEDGE.json.`,
    passed,
    failed
  };
}

module.exports = { checkKnowledge };
