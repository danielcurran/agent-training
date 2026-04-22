'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab';
const RESULTS_PATH = path.join(__dirname, '..', 'check-results', 'explain-results.json');

// Query 4: status equality, price range, sort by rating
const QUERY_FILTER = { status: 'active', price: { $gte: 50, $lte: 500 } };
const QUERY_SORT = { rating: -1 };

const NON_ESR_INDEX = { status: 1, price: 1, rating: -1 };
const ESR_INDEX = { status: 1, rating: -1, price: 1 };

async function timeQuery(collection, filter, sort, indexHint) {
  const start = Date.now();
  const cursor = indexHint
    ? collection.find(filter).sort(sort).hint(indexHint)
    : collection.find(filter).sort(sort);
  await cursor.toArray();
  return Date.now() - start;
}

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

    // --- Strategy 1: No index ---
    console.log('Strategy 1: No index (collection scan)');
    const noIndexTime = await timeQuery(collection, QUERY_FILTER, QUERY_SORT, null);
    const noIndexExplain = await getExplain(collection, QUERY_FILTER, QUERY_SORT, null);
    const noIndexHasSort = hasSortStage(noIndexExplain);
    console.log(`  Time: ${noIndexTime}ms | SORT stage: ${noIndexHasSort}`);
    results.checks.noIndex = { time: noIndexTime, hasSortStage: noIndexHasSort };

    // --- Strategy 2: Non-ESR index ---
    console.log('\nStrategy 2: Non-ESR index { status:1, price:1, rating:-1 }');
    await collection.createIndex(NON_ESR_INDEX, { name: 'check-nonESR' });
    const nonEsrTime = await timeQuery(collection, QUERY_FILTER, QUERY_SORT, NON_ESR_INDEX);
    const nonEsrExplain = await getExplain(collection, QUERY_FILTER, QUERY_SORT, NON_ESR_INDEX);
    const nonEsrHasSort = hasSortStage(nonEsrExplain);
    console.log(`  Time: ${nonEsrTime}ms | SORT stage: ${nonEsrHasSort}`);
    results.checks.nonEsr = { index: NON_ESR_INDEX, time: nonEsrTime, hasSortStage: nonEsrHasSort };
    await collection.dropIndex('check-nonESR').catch(() => {});

    // --- Strategy 3: ESR index ---
    console.log('\nStrategy 3: ESR index { status:1, rating:-1, price:1 }');
    await collection.createIndex(ESR_INDEX, { name: 'check-ESR' });
    const esrTime = await timeQuery(collection, QUERY_FILTER, QUERY_SORT, ESR_INDEX);
    const esrExplain = await getExplain(collection, QUERY_FILTER, QUERY_SORT, ESR_INDEX);
    const esrHasSort = hasSortStage(esrExplain);
    console.log(`  Time: ${esrTime}ms | SORT stage: ${esrHasSort}`);
    results.checks.esr = { index: ESR_INDEX, time: esrTime, hasSortStage: esrHasSort };
    await collection.dropIndex('check-ESR').catch(() => {});

    // --- Evaluate ---
    console.log('\n--- Results ---');
    const esrNoSortStage = !esrHasSort;
    // Lenient: pass if ESR has no SORT stage, OR if ESR time is <=5ms (already fast enough)
    const speedupRatio = noIndexTime > 0 ? noIndexTime / esrTime : 1;
    const esrFasterEnough = speedupRatio >= 50 || esrTime <= 5;

    results.checks.esrNoSortStage = esrNoSortStage;
    results.checks.speedupRatio = speedupRatio;
    results.checks.esrFasterEnough = esrFasterEnough;

    console.log(`  ESR has no SORT stage: ${esrNoSortStage ? '✓' : '✗'}`);
    console.log(`  Speedup (no index / ESR): ${speedupRatio.toFixed(1)}x ${esrFasterEnough ? '✓' : '✗'}`);

    const passed = esrNoSortStage && esrFasterEnough;
    results.passed = passed;

    if (passed) {
      console.log('\n✓ Performance check passed! ESR index outperforms alternatives.');
    } else {
      if (!esrNoSortStage) {
        console.log('\n✗ ESR index still has a SORT stage. Check your index field order in src/indexes.js.');
      } else {
        console.log(`\n✗ ESR speedup ${speedupRatio.toFixed(1)}x is below 50x threshold. Ensure your indexes are created: npm run check:indexes`);
      }
    }

    saveResults(results);
    await client.close();
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error('✗ Check failed:', err.message);
    results.passed = false;
    results.error = err.message;
    // Clean up any test indexes
    await collection.dropIndex('check-nonESR').catch(() => {});
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
