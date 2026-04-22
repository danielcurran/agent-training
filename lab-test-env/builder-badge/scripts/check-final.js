const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

function checkFinal() {
  const results = [];
  let passed = true;

  try {
    const indexPath = path.join(__dirname, '..', 'src', 'index.js');
    execSync(`node ${indexPath}`, {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      timeout: 5000,
      stdio: 'pipe'
    });
    results.push('✓ src/index.js: executes without errors');
  } catch (err) {
    results.push('✗ src/index.js: threw error — ' + err.message.split('\n')[0]);
    passed = false;
  }

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 4 (Happy Path): PASS' : 'Stage 4 (Happy Path): FAIL');
  if (!passed) process.exit(1);
}

checkFinal();
