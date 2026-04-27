'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27019';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab-v2';
const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'explain-results.json');

// Query 4: status equality, price range, sort by rating
const QUERY_FILTER = { status: 'active', price: { $gte: 50, $lte: 500 } };
const QUERY_SORT = { rating: -1 };

const ESR_INDEX = { status: 1, rating: -1, price: 1 };

async function getExplain(collection, filter, sort, indexHint) {
  const cursor = indexHint
    ? collection.find(filter).sort(sort).hint(indexHint)
    : collection.find(filter).sort(sort);
  return cursor.explain('executionStats');
}

function hasSortStage(explainOutput) {
  const stages = JSON.stringify(explainOutput);
  return stages.includes('"SORT"');
}

function getDocsExamined(explainOutput) {
  try {
    return explainOutput.executionStats.totalDocsExamined;
  } catch {
    return null;
  }
}

function getExecutionTime(explainOutput) {
  try {
    return explainOutput.executionStats.executionTimeMillis;
  } catch {
    return null;
  }
}

async function checkExplain() {
  const results = {
    timestamp: new Date().toISOString(),
    query: { filter: QUERY_FILTER, sort: QUERY_SORT },
    checks: {}
  };

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

  // Drop custom indexes, keep only _id_
  const existing = await collection.indexes();
  for (const idx of existing) {
    if (idx.name !== '_id_') {
      await collection.dropIndex(idx.name).catch(() => {});
    }
  }

  try {
    console.log('Running performance comparison for Query 4...\n');

    // --- Before: No index (collection scan) ---
    console.log('Before (No Index):');
    const noIndexExplain = await getExplain(collection, QUERY_FILTER, QUERY_SORT, null);
    const noIndexHasSort = hasSortStage(noIndexExplain);
    const noIndexDocs = getDocsExamined(noIndexExplain);
    const noIndexTime = getExecutionTime(noIndexExplain);
    console.log(`- Documents Examined: ${noIndexDocs}`);
    console.log(`- Execution Time: ${noIndexTime}ms`);
    console.log(`- Sort Stage: ${noIndexHasSort ? 'YES' : 'NO'}`);
    results.checks.noIndex = {
      docsExamined: noIndexDocs,
      executionTimeMillis: noIndexTime,
      hasSortStage: noIndexHasSort
    };

    // --- After: ESR index ---
    console.log('\nAfter (ESR Index):');
    await collection.createIndex(ESR_INDEX, { name: 'check-ESR' });
    const esrExplain = await getExplain(collection, QUERY_FILTER, QUERY_SORT, ESR_INDEX);
    const esrHasSort = hasSortStage(esrExplain);
    const esrDocs = getDocsExamined(esrExplain);
    const esrTime = getExecutionTime(esrExplain);
    console.log(`- Documents Examined: ${esrDocs}`);
    console.log(`- Execution Time: ${esrTime}ms`);
    console.log(`- Sort Stage: ${esrHasSort ? 'YES' : 'NO'}`);
    results.checks.esr = {
      index: ESR_INDEX,
      docsExamined: esrDocs,
      executionTimeMillis: esrTime,
      hasSortStage: esrHasSort
    };
    await collection.dropIndex('check-ESR').catch(() => {});

    // --- Evaluate ---
    console.log('\n--- Results ---');
    const esrNoSortStage = !esrHasSort;
    results.checks.esrNoSortStage = esrNoSortStage;
    console.log(`  ESR has no SORT stage: ${esrNoSortStage ? '✓' : '✗'}`);

    const passed = esrNoSortStage;
    results.passed = passed;

    if (passed) {
      console.log('\n✓ ESR eliminates in-memory sort');
    } else {
      console.log('\n✗ ESR index still has a SORT stage. Check your index field order — ensure Sort fields come before Range fields.');
    }

    console.log('\nNote: Execution time is shown for reference only. The SORT stage is the pass criterion.');

    saveResults(results);
    await client.close();
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error('✗ Check failed:', err.message);
    results.passed = false;
    results.error = err.message;
    await collection.dropIndex('check-ESR').catch(() => {});
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

checkExplain();
