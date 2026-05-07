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

async function checkInsert() {
  try {
    const { connect, close } = require('../lib/db');
    const db = await connect();

    // Check if test_items has at least one document
    const count = await db.collection('test_items').countDocuments();
    if (count >= 1) {
      pass(`test_items: ${count} document(s) found`);
    } else {
      fail('test_items: no documents found (expected at least 1)');
      await close();
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Stage 1: FAIL');
      process.exit(1);
    }

    // Retrieve the inserted document
    const doc = await db.collection('test_items').findOne({ name: 'test-item' });
    if (!doc) {
      fail('Document with name="test-item" not found');
      await close();
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Stage 1: FAIL');
      process.exit(1);
    }

    // Check fields
    if (doc.name === 'test-item') {
      pass('Document has field: name = "test-item"');
    } else {
      fail(`Document name field: got "${doc.name}", expected "test-item"`);
    }

    if (doc.status === 'active') {
      pass('Document has field: status = "active"');
    } else {
      fail(`Document status field: got "${doc.status}", expected "active"`);
    }

    if (doc.created_at && typeof doc.created_at === 'object' && doc.created_at instanceof Date) {
      pass('Document has field: created_at (date)');
    } else if (doc.created_at && typeof doc.created_at === 'string') {
      pass('Document has field: created_at (date)');
    } else {
      fail('Document created_at field: missing or not a date');
    }

    if (doc._id) {
      pass('_id: present (auto-assigned by MongoDB)');
    } else {
      fail('_id: missing');
    }

    await close();

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('Stage 1: PASS');
    } else {
      console.log('Stage 1: FAIL');
    }
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkInsert();
