'use strict';

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, '..', 'KNOWLEDGE.json');
const MIN_ENTRIES = 4;
const REQUIRED_FIELDS = ['concept', 'sql_instinct_overridden', 'rule', 'when_to_apply', 'confidence'];
const VALID_CONFIDENCE = ['verified', 'corrected', 'self-assessed'];

// Lab-specific coverage: at least one entry must touch each theme
const COVERAGE_CHECKS = [
  {
    label: 'schema design (embedding or referencing)',
    test: entry => /embed|reference|schema/i.test(`${entry.concept} ${entry.rule} ${entry.when_to_apply}`)
  },
  {
    label: 'vector search or indexing',
    test: entry => /vector|index/i.test(`${entry.concept} ${entry.rule} ${entry.when_to_apply}`)
  }
];

function checkKnowledge() {
  const results = [];
  let passed = true;

  // 1. File exists
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.log('✗ KNOWLEDGE.json: not found');
    console.log('  Create KNOWLEDGE.json in the lab root. See README for schema.');
    console.log('\nKnowledge Check: FAIL');
    process.exit(1);
  }
  results.push('✓ KNOWLEDGE.json: exists');

  // 2. Valid JSON
  let entries;
  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
    entries = JSON.parse(raw);
  } catch (err) {
    results.push(`✗ KNOWLEDGE.json: invalid JSON — ${err.message}`);
    results.forEach(r => console.log(r));
    console.log('\nKnowledge Check: FAIL');
    process.exit(1);
  }
  results.push('✓ KNOWLEDGE.json: valid JSON');

  // 3. Is an array
  if (!Array.isArray(entries)) {
    results.push('✗ KNOWLEDGE.json: must be a JSON array of knowledge entries');
    results.forEach(r => console.log(r));
    console.log('\nKnowledge Check: FAIL');
    process.exit(1);
  }

  // 4. Minimum entry count
  if (entries.length < MIN_ENTRIES) {
    results.push(`✗ Entry count: ${entries.length} (need ≥ ${MIN_ENTRIES}). Add more knowledge entries.`);
    passed = false;
  } else {
    results.push(`✓ Entry count: ${entries.length} (≥ ${MIN_ENTRIES})`);
  }

  // 5. Required fields on each entry
  entries.forEach((entry, i) => {
    const missing = REQUIRED_FIELDS.filter(f => !entry[f] || String(entry[f]).trim() === '');
    if (missing.length > 0) {
      results.push(`✗ Entry ${i + 1} ("${entry.concept || 'unnamed'}"): missing fields — ${missing.join(', ')}`);
      passed = false;
    }
    if (entry.confidence && !VALID_CONFIDENCE.includes(entry.confidence)) {
      results.push(`✗ Entry ${i + 1}: confidence must be one of: ${VALID_CONFIDENCE.join(', ')} (got "${entry.confidence}")`);
      passed = false;
    }
  });

  if (passed) {
    results.push('✓ All entries have required fields with valid confidence values');
  }

  // 6. Lab-specific coverage
  COVERAGE_CHECKS.forEach(({ label, test }) => {
    const covered = entries.some(test);
    if (covered) {
      results.push(`✓ Coverage: ${label}`);
    } else {
      results.push(`✗ Coverage: no entry covers ${label}`);
      passed = false;
    }
  });

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Knowledge Check: PASS' : 'Knowledge Check: FAIL');
  if (!passed) process.exit(1);
}

checkKnowledge();
