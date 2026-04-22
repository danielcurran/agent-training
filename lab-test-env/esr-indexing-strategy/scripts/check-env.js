'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab';

const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'stage-env-results.json');

async function checkEnv() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  let client;
  try {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    results.checks.connection = { passed: true, message: `Connected to ${MONGODB_URI}` };
    console.log('✓ MongoDB connection successful');
  } catch (err) {
    results.checks.connection = { passed: false, message: err.message };
    console.error('✗ MongoDB connection failed:', err.message);
    console.error('\nIs MongoDB running? Try: docker-compose up -d');
    saveResults(results);
    process.exit(1);
  }

  try {
    const db = client.db(MONGODB_DATABASE);
    const collections = await db.listCollections({ name: 'products' }).toArray();
    if (collections.length === 0) {
      throw new Error("Collection 'products' does not exist. Run: npm run seed");
    }
    results.checks.collection = { passed: true, message: "Collection 'products' exists" };
    console.log('✓ products collection exists');

    const collection = db.collection('products');
    const count = await collection.countDocuments();
    const countPassed = count === 10000;
    results.checks.count = {
      passed: countPassed,
      message: `Document count: ${count} (expected 10000)`,
      actual: count
    };
    if (countPassed) {
      console.log(`✓ Document count: ${count}`);
    } else {
      console.error(`✗ Document count: ${count} (expected 10000). Run: npm run seed`);
    }

    const indexes = await collection.indexes();
    const customIndexes = indexes.filter(idx => idx.name !== '_id_');
    const noCustomIndexes = customIndexes.length === 0;
    results.checks.noCustomIndexes = {
      passed: noCustomIndexes,
      message: noCustomIndexes
        ? 'No custom indexes (clean baseline)'
        : `Found ${customIndexes.length} custom index(es): ${customIndexes.map(i => i.name).join(', ')}`,
      customIndexes: customIndexes.map(i => i.name)
    };
    if (noCustomIndexes) {
      console.log('✓ No custom indexes (clean baseline)');
    } else {
      console.warn(`⚠ Found custom indexes: ${customIndexes.map(i => i.name).join(', ')}`);
      console.warn('  This may affect check:explain results. Re-seed to reset.');
    }

    const sample = await collection.findOne({});
    const requiredFields = ['name', 'description', 'status', 'category', 'price', 'rating', 'tags', 'stock', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(f => !(f in sample));
    const structureValid = missingFields.length === 0;
    results.checks.structure = {
      passed: structureValid,
      message: structureValid
        ? 'Document structure valid'
        : `Missing fields: ${missingFields.join(', ')}`,
      sampleId: sample._id
    };
    if (structureValid) {
      console.log('✓ Document structure valid');
    } else {
      console.error(`✗ Document missing fields: ${missingFields.join(', ')}. Run: npm run seed`);
    }

    const allPassed = Object.values(results.checks).every(c => c.passed);
    results.passed = allPassed;

    console.log('\n' + (allPassed ? '✓ All environment checks passed.' : '✗ Some checks failed. See above.'));
    saveResults(results);
    await client.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    results.checks.error = { passed: false, message: err.message };
    console.error('✗ Check failed:', err.message);
    saveResults(results);
    await client.close();
    process.exit(1);
  }
}

function saveResults(results) {
  try {
    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  } catch (err) {
    console.warn('Could not save results:', err.message);
  }
}

checkEnv();
