'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab';
const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'indexes-results.json');
const INDEXES_PATH = path.join(__dirname, '..', 'src', 'indexes.js');

// Expected index definitions
const EXPECTED_INDEXES = [
  { name: 'query1-status', fields: { status: 1 } },
  { name: 'query2-category-createdAt', fields: { category: 1, createdAt: -1 } },
  { name: 'query3-status-price', fields: { status: 1, price: 1 } },
  { name: 'query4-status-rating-price', fields: { status: 1, rating: -1, price: 1 } },
  { name: 'query5-tags-createdAt-rating', fields: { tags: 1, createdAt: -1, rating: 1 } }
];

function indexFieldsMatch(expected, actual) {
  const eKeys = Object.keys(expected);
  const aKeys = Object.keys(actual);
  if (eKeys.length !== aKeys.length) return false;
  for (let i = 0; i < eKeys.length; i++) {
    if (eKeys[i] !== aKeys[i]) return false;
    if (expected[eKeys[i]] !== actual[aKeys[i]]) return false;
  }
  return true;
}

async function checkIndexes() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Load learner file
  let learnerIndexes;
  try {
    delete require.cache[require.resolve(INDEXES_PATH)];
    learnerIndexes = require(INDEXES_PATH);
  } catch (err) {
    console.error('✗ Could not load src/indexes.js:', err.message);
    results.passed = false;
    results.error = err.message;
    saveResults(results);
    process.exit(1);
  }

  if (!Array.isArray(learnerIndexes)) {
    console.error('✗ src/indexes.js must export an array of index objects');
    results.passed = false;
    results.error = 'Not an array';
    saveResults(results);
    process.exit(1);
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    results.passed = false;
    results.error = err.message;
    saveResults(results);
    process.exit(1);
  }

  const db = client.db(MONGODB_DATABASE);
  const collection = db.collection('products');

  // Drop any existing custom indexes
  const existingIndexes = await collection.indexes();
  for (const idx of existingIndexes) {
    if (idx.name !== '_id_') {
      await collection.dropIndex(idx.name).catch(() => {});
    }
  }

  // Create learner indexes
  try {
    for (const indexDef of learnerIndexes) {
      await collection.createIndex(indexDef.fields, { name: indexDef.name });
    }
  } catch (err) {
    console.error('✗ Failed to create indexes:', err.message);
    results.passed = false;
    results.error = err.message;
    saveResults(results);
    await client.close();
    process.exit(1);
  }

  // Validate against expected
  let allPassed = true;
  for (const expected of EXPECTED_INDEXES) {
    const learner = learnerIndexes.find(i => i.name === expected.name);
    if (!learner) {
      results.checks[expected.name] = {
        passed: false,
        message: `Index '${expected.name}' not found in src/indexes.js`
      };
      console.log(`✗ ${expected.name}: not found`);
      allPassed = false;
      continue;
    }

    const fieldsMatch = indexFieldsMatch(expected.fields, learner.fields || {});
    results.checks[expected.name] = {
      passed: fieldsMatch,
      expected: expected.fields,
      actual: learner.fields,
      message: fieldsMatch
        ? 'Fields and order correct'
        : `Expected ${JSON.stringify(expected.fields)}, got ${JSON.stringify(learner.fields)}`
    };

    if (fieldsMatch) {
      console.log(`✓ ${expected.name}: ${JSON.stringify(expected.fields)}`);
    } else {
      console.log(`✗ ${expected.name}:`);
      console.log(`    Expected: ${JSON.stringify(expected.fields)}`);
      console.log(`    Got:      ${JSON.stringify(learner.fields)}`);
      allPassed = false;
    }
  }

  results.passed = allPassed;
  console.log('\n' + (allPassed ? '✓ All indexes correct!' : '✗ Some indexes are incorrect. Check field order (ESR) and names.'));

  saveResults(results);
  await client.close();
  process.exit(allPassed ? 0 : 1);
}

function saveResults(results) {
  try {
    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  } catch (err) {
    console.warn('Could not save results:', err.message);
  }
}

checkIndexes();
