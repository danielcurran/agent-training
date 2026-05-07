#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

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

async function checkFind() {
  try {
    // Run the script and capture output
    let scriptOutput = '';
    try {
      scriptOutput = execSync('node src/run.js', {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error) {
      // Script may throw if not fully implemented, that's OK - capture output
      if (error.stdout) scriptOutput = error.stdout;
      if (error.stderr && !error.stdout) {
        fail('Script execution failed or threw an error');
        console.error('  Error:', error.stderr);
        console.log(`\n${passed} passed, ${failed} failed`);
        console.log('Stage 2: FAIL');
        process.exit(1);
      }
    }

    // Check if output contains "Found document"
    if (scriptOutput.includes('Found document')) {
      pass('Script output: contains "Found document"');
    } else {
      fail('Script output: missing "Found document" message');
    }

    // Check if output contains the name field
    if (scriptOutput.includes('test-item')) {
      pass('Retrieved name: "test-item" present in output');
    } else {
      fail('Retrieved name: "test-item" not found in output');
    }

    // Check if output contains the status field
    if (scriptOutput.includes('active')) {
      pass('Retrieved status: "active" present in output');
    } else {
      fail('Retrieved status: "active" not found in output');
    }

    // Check if output contains _id
    if (scriptOutput.includes('_id')) {
      pass('Retrieved _id: present in output');
    } else {
      fail('Retrieved _id: not found in output');
    }

    // Check if script ran without uncaught errors
    if (scriptOutput && !scriptOutput.includes('Error') && !scriptOutput.includes('undefined')) {
      pass('No errors thrown');
    } else if (scriptOutput.includes('Not implemented')) {
      fail('Script has unimplemented sections');
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('Stage 2: PASS');
    } else {
      console.log('Stage 2: FAIL');
    }
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkFind();
