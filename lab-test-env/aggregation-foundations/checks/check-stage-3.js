// filepath: checks/check-stage-3.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkStage3(db) {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // Check 1: File exists
  const queryPath = path.join(ROOT, 'queries', 'stage-3-query.js');
  if (!fs.existsSync(queryPath)) {
    fail('queries/stage-3-query.js not found');
    return { pass: false, error: 'stage-3-query.js not found', passed, failed };
  }
  pass('queries/stage-3-query.js exists');

  const queryContent = fs.readFileSync(queryPath, 'utf-8');

  // Check 2: All stages present
  const requiredStages = ['$match', '$group', '$sort', '$limit'];
  const missingStages = requiredStages.filter(s => !queryContent.includes(s));
  if (missingStages.length > 0) {
    fail(`Missing stages: ${missingStages.join(', ')}`);
    return { pass: false, error: 'Not all stages present (match, group, sort, limit)', passed, failed };
  }
  pass('All 4 stages present ($match, $group, $sort, $limit)');

  // Check 3: Descending sort
  if (!queryContent.includes('-1')) {
    fail('$sort stage missing descending order (-1)');
    return { pass: false, error: '$sort stage missing descending order (-1)', passed, failed };
  }
  pass('$sort uses descending order (-1)');

  // Check 4: $limit is 10 (whitespace-tolerant)
  if (!/\$limit\s*:\s*10/.test(queryContent)) {
    fail('$limit not set to 10');
    return { pass: false, error: '$limit not set to 10', passed, failed };
  }
  pass('$limit set to 10');

  // Check 5: Execute known-good pipeline
  try {
    const pipeline = [
      { $match: { timestamp: { $gte: new Date('2018-01-01') } } },
      { $group: { _id: '$book_id', averageRating: { $avg: '$rating' } } },
      { $sort: { averageRating: -1 } },
      { $limit: 10 }
    ];
    const result = await db.collection('reviews').aggregate(pipeline).toArray();

    if (result.length === 0) {
      fail('Pipeline returned no results — is the database seeded? Run: npm run seed');
      return { pass: false, error: 'Pipeline returned no results', passed, failed };
    }
    if (result.length > 10) {
      fail(`$limit not applied: ${result.length} > 10 documents returned`);
      return { pass: false, error: `$limit not applied: ${result.length} > 10`, passed, failed };
    }
    pass(`$limit applied — ${result.length} books returned`);

    // Check 6: Sorted descending
    const ratings = result.map(r => r.averageRating);
    const isSorted = ratings.every((rating, i) => i === 0 || rating <= ratings[i - 1]);
    if (!isSorted) {
      fail('Results not sorted in descending order');
      return { pass: false, error: 'Results not sorted in descending order', passed, failed };
    }
    pass(`Sorted high-to-low (top rating: ${ratings[0].toFixed(2)}, lowest in top-10: ${ratings[ratings.length - 1].toFixed(2)})`);

  } catch (err) {
    fail(`Pipeline execution failed: ${err.message}`);
    return { pass: false, error: err.message, passed, failed };
  }

  return {
    pass: true,
    message: `Stage 3 passed (${passed} checks)`,
    passed,
    failed
  };
}

module.exports = { checkStage3 };
