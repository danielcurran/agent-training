'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'reflection-results.json');
const REFLECTION_PATH = path.join(__dirname, '..', 'REFLECTION.md');

const REQUIRED_SECTIONS = [
  'What I Learned',
  'Decisions I Made',
  'When I Got Stuck',
  'Transfer to Real Applications'
];
const ESR_KEYWORDS = ['equality', 'sort', 'range', 'esr'];
const MIN_WORDS = 150;

function checkReflection() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  if (!fs.existsSync(REFLECTION_PATH)) {
    console.error('✗ REFLECTION.md not found. Create this file in the lab root.');
    results.passed = false;
    results.checks.fileExists = { passed: false, message: 'REFLECTION.md not found' };
    saveResults(results);
    process.exit(1);
  }

  const content = fs.readFileSync(REFLECTION_PATH, 'utf8');
  results.checks.fileExists = { passed: true, message: 'REFLECTION.md found' };
  console.log('✓ REFLECTION.md found');

  // Word count
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
    console.log(`✗ Word count: ${words} (need at least ${MIN_WORDS}). Expand your reflection.`);
  }

  // Required sections
  const missingSections = REQUIRED_SECTIONS.filter(section => !content.includes(section));
  const sectionsPassed = missingSections.length === 0;
  results.checks.sections = {
    passed: sectionsPassed,
    message: sectionsPassed
      ? 'All required sections present'
      : `Missing sections: ${missingSections.join(', ')}`,
    missing: missingSections
  };
  if (sectionsPassed) {
    console.log('✓ All required sections present');
  } else {
    console.log(`✗ Missing sections: ${missingSections.join(', ')}`);
    console.log('  Add these section headers to your REFLECTION.md.');
  }

  // ESR articulation
  const lowerContent = content.toLowerCase();
  const esrPresent = ESR_KEYWORDS.some(kw => lowerContent.includes(kw));
  results.checks.esrArticulation = {
    passed: esrPresent,
    message: esrPresent
      ? 'ESR concept articulated'
      : 'Reflection does not mention ESR, Equality, Sort, or Range'
  };
  if (esrPresent) {
    console.log('✓ ESR concept articulated in reflection');
  } else {
    console.log('✗ Reflection does not mention ESR, Equality, Sort, or Range.');
    console.log('  Explain what you learned about the ESR guideline in your reflection.');
  }

  const passed = wordsPassed && sectionsPassed && esrPresent;
  results.passed = passed;
  console.log('\n' + (passed ? '✓ REFLECTION.md check passed!' : '✗ Update REFLECTION.md to meet all requirements.'));

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

checkReflection();
