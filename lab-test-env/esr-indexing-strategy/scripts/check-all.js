'use strict';

const { execSync } = require('child_process');
const path = require('path');

const CHECKS = [
  { name: 'Environment',   script: 'check-env.js' },
  { name: 'Stage 1: ESR Identification', script: 'check-stage1.js' },
  { name: 'Indexes',       script: 'check-indexes.js' },
  { name: 'Performance',   script: 'check-explain.js' },
  { name: 'Decisions',     script: 'check-decisions.js' },
  { name: 'Reflection',    script: 'check-reflection.js' }
];

console.log('=== ESR Indexing Strategy Lab — Full Check ===\n');

let allPassed = true;

for (const check of CHECKS) {
  console.log(`--- ${check.name} ---`);
  const scriptPath = path.join(__dirname, check.script);
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    console.log(`\n[PASSED] ${check.name}\n`);
  } catch (err) {
    console.log(`\n[FAILED] ${check.name}\n`);
    allPassed = false;
    break;
  }
}

console.log('=== Summary ===');
if (allPassed) {
  console.log('✓ All checks passed! Lab complete.');
  process.exit(0);
} else {
  console.log('✗ One or more checks failed. Fix the issues above and re-run.');
  process.exit(1);
}
