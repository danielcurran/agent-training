#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KNOWLEDGE_FILE = path.join(ROOT, 'KNOWLEDGE.json');

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed++;
}

async function checkKnowledge() {
  try {
    // Check if KNOWLEDGE.json exists
    if (!fs.existsSync(KNOWLEDGE_FILE)) {
      fail('KNOWLEDGE.json: file not found');
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Knowledge Validation: FAIL');
      process.exit(1);
    }

    pass('KNOWLEDGE.json: file exists');

    // Read and parse the file
    let content;
    try {
      content = fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
      var knowledge = JSON.parse(content);
    } catch (error) {
      fail(`KNOWLEDGE.json: invalid JSON format (${error.message})`);
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Knowledge Validation: FAIL');
      process.exit(1);
    }

    pass('KNOWLEDGE.json: valid JSON');

    // Validate structure
    if (!Array.isArray(knowledge)) {
      fail('KNOWLEDGE.json: must be an array of entries');
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Knowledge Validation: FAIL');
      process.exit(1);
    }

    pass(`KNOWLEDGE.json: contains ${knowledge.length} entries`);

    if (knowledge.length === 0) {
      fail('KNOWLEDGE.json: must have at least one entry');
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Knowledge Validation: FAIL');
      process.exit(1);
    }

    pass('KNOWLEDGE.json: has at least one entry');

    // Validate each entry
    const requiredFields = ['concept', 'sql_instinct_overridden', 'rule', 'when_to_apply', 'confidence'];
    const validConfidences = ['verified', 'corrected', 'self-assessed'];

    let entriesValid = true;
    for (let i = 0; i < knowledge.length; i++) {
      const entry = knowledge[i];

      // Check all required fields
      for (const field of requiredFields) {
        if (!entry[field]) {
          fail(`Entry ${i + 1}: missing required field "${field}"`);
          entriesValid = false;
        }
      }

      // Validate confidence value
      if (entry.confidence && !validConfidences.includes(entry.confidence)) {
        fail(`Entry ${i + 1}: confidence must be one of [${validConfidences.join(', ')}], got "${entry.confidence}"`);
        entriesValid = false;
      }

      // Warn if confidence is not set
      if (!entry.confidence) {
        fail(`Entry ${i + 1}: confidence field is required`);
        entriesValid = false;
      }
    }

    if (entriesValid) {
      pass('KNOWLEDGE.json: all entries have required fields and valid confidence values');
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('Knowledge Validation: PASS');
    } else {
      console.log('Knowledge Validation: FAIL');
    }
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkKnowledge();
