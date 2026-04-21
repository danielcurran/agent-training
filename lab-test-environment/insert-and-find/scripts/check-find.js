const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

function checkFind() {
  const results = [];
  let passed = true;

  let output = '';
  try {
    const scriptPath = path.join(__dirname, '..', 'src', 'run.js');
    output = execSync(`node ${scriptPath}`, {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      timeout: 10000
    }).toString();
  } catch (err) {
    console.error('✗ src/run.js threw an error:');
    console.error(' ', err.message);
    console.log('');
    console.log('Stage 2: FAIL');
    process.exit(1);
  }

  output.includes('Found document')
    ? results.push('✓ Script output: contains "Found document"')
    : (results.push('✗ Script output: missing "Found document" — did you add findOne()?'), passed = false);

  output.includes('test-item')
    ? results.push('✓ Retrieved name: "test-item" present in output')
    : (results.push('✗ Retrieved name: "test-item" not found in output'), passed = false);

  output.includes('active')
    ? results.push('✓ Retrieved status: "active" present in output')
    : (results.push('✗ Retrieved status: "active" not found in output'), passed = false);

  output.includes('_id')
    ? results.push('✓ Retrieved _id: present in output')
    : (results.push('✗ Retrieved _id: not found in output'), passed = false);

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 2: PASS' : 'Stage 2: FAIL');
  if (!passed) process.exit(1);
}

checkFind();
