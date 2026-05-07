#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

async function checkEnv() {
  try {
    // Check MongoDB connection
    try {
      const { connect, close } = require('../lib/db');
      const db = await connect();
      pass('MongoDB: connected at localhost:27017');
      await close();
    } catch (error) {
      fail('MongoDB: unable to connect');
      console.error('  Error:', error.message);
    }

    // Check if test_items collection exists and is empty
    try {
      const { connect, close } = require('../lib/db');
      const db = await connect();
      const count = await db.collection('test_items').countDocuments();
      if (count === 0) {
        pass('test_items: exists, 0 documents');
      } else {
        fail(`test_items: has ${count} documents (expected 0)`);
      }
      await close();
    } catch (error) {
      fail('test_items: unable to check collection');
      console.error('  Error:', error.message);
    }

    // Check if src/run.js skeleton exists
    const runFile = path.join(ROOT, 'src', 'run.js');
    if (fs.existsSync(runFile)) {
      pass('src/run.js: skeleton file present');
    } else {
      fail('src/run.js: file not found');
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('Environment: READY');
    }
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkEnv();
