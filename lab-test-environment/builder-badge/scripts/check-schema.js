const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkSchema() {
  const results = [];
  let passed = true;

  const schemaPath = path.join(__dirname, '..', 'SCHEMA.md');
  if (!fs.existsSync(schemaPath)) {
    console.log('✗ SCHEMA.md: not found');
    console.log('Stage 1: FAIL');
    process.exit(1);
  }

  const content = fs.readFileSync(schemaPath, 'utf8');
  results.push('✓ SCHEMA.md: exists');

  // Check required sections
  if (content.includes('## Current Schema')) {
    results.push('✓ Section "Current Schema": present');
  } else {
    results.push('✗ Section "Current Schema": missing');
    passed = false;
  }

  if (content.includes('## Design Decision')) {
    results.push('✓ Section "Design Decision": present');
  } else {
    results.push('✗ Section "Design Decision": missing');
    passed = false;
  }

  if (content.includes('## Rationale')) {
    results.push('✓ Section "Rationale": present');
  } else {
    results.push('✗ Section "Rationale": missing');
    passed = false;
  }

  // Check word count
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 100) {
    results.push(`✓ Minimum length: ${wordCount} words (≥ 100)`);
  } else {
    results.push(`✗ Minimum length: ${wordCount} words (need ≥ 100)`);
    passed = false;
  }

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 1: PASS' : 'Stage 1: FAIL');
  if (!passed) process.exit(1);
}

checkSchema().catch(err => {
  console.error('check:schema failed:', err.message);
  process.exit(1);
});
