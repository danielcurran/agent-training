#!/usr/bin/env node
/**
 * check-env.js — Stage 0: Environment validation
 * Confirms MongoDB is reachable and all required collections exist.
 */

const { connect } = require('../lib/db');

const REQUIRED_COLLECTIONS = ['users', 'tickets', 'comments', 'products', 'knowledge_articles'];

async function main() {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`✗ ${msg}`); failed++; }

  let db;
  try {
    db = await connect();
    pass('MongoDB connection: PASS');
  } catch (err) {
    fail(`MongoDB connection: FAIL — ${err.message}`);
    console.error('\nCheck that MONGODB_URI is set in your .env file.');
    process.exit(1);
  }

  // List existing collections
  let existingCollections;
  try {
    const cols = await db.listCollections().toArray();
    existingCollections = cols.map(c => c.name);
    pass(`Collections found: ${existingCollections.join(', ')}`);
  } catch (err) {
    fail(`Could not list collections: ${err.message}`);
    process.exit(1);
  }

  // Check each required collection exists
  for (const name of REQUIRED_COLLECTIONS) {
    if (existingCollections.includes(name)) {
      pass(`Collection "${name}": exists`);
    } else {
      fail(`Collection "${name}": NOT FOUND`);
    }
  }

  // Summary
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
