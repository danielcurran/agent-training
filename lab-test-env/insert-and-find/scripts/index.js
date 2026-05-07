#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  { name: 'check:env', label: 'Environment Setup' },
  { name: 'check:insert', label: 'Stage 1: Insert' },
  { name: 'check:find', label: 'Stage 2: Find' },
  { name: 'check:reflection', label: 'Stage 3: Reflection' }
];

async function runAll() {
  console.log('Running all checks...\n');

  let allPassed = true;

  for (const script of scripts) {
    console.log(`\n=== ${script.label} ===`);
    try {
      execSync(`npm run ${script.name}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (error) {
      allPassed = false;
      // Error already printed by the check script
    }
  }

  console.log('\n=== Final Result ===');
  if (allPassed) {
    console.log('✓ All checks passed!');
    process.exit(0);
  } else {
    console.log('✗ Some checks failed. Review output above.');
    process.exit(1);
  }
}

runAll();
