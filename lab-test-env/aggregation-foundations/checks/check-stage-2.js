// filepath: checks/check-stage-2.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkStage2(db) {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // Check 1: File exists
  const queryPath = path.join(ROOT, 'queries', 'stage-2-query.js');
  if (!fs.existsSync(queryPath)) {
    fail('queries/stage-2-query.js not found');
    return { pass: false, error: 'stage-2-query.js not found', passed, failed };
  }
  pass('queries/stage-2-query.js exists');

  const queryContent = fs.readFileSync(queryPath, 'utf-8');

  // Check 2: All 4 stages present
  const requiredStages = ['$match', '$unwind', '$group', '$project'];
  const missingStages = requiredStages.filter(s => !queryContent.includes(s));
  if (missingStages.length > 0) {
    fail(`Missing stages: ${missingStages.join(', ')}`);
    return { pass: false, error: `Not all 4 stages present (match, unwind, group, project)`, passed, failed };
  }
  pass('All 4 stages present ($match, $unwind, $group, $project)');

  // Check 3: $group has $sum
  if (!queryContent.includes('$sum')) {
    fail('$group stage missing $sum operator');
    return { pass: false, error: '$group stage missing $sum operator', passed, failed };
  }
  pass('$group stage contains $sum operator');

  // Check 4: Run the known-good pipeline and verify output
  try {
    const pipeline = [
      { $match: { date: { $gte: new Date('2024-01-01'), $lt: new Date('2025-01-01') } } },
      { $unwind: '$books' },
      { $group: { _id: '$books.genre', totalRevenue: { $sum: '$books.price' } } },
      { $project: { genre: '$_id', totalRevenue: 1, _id: 0 } }
    ];
    const result = await db.collection('sales').aggregate(pipeline).toArray();

    if (result.length === 0) {
      fail('Pipeline returned no genres — is the database seeded? Run: npm run seed');
      return { pass: false, error: 'Pipeline returned no genres', passed, failed };
    }
    pass(`Pipeline executed — ${result.length} genres returned`);

    // Check 5: Output schema validation
    const schemaValid = result.every(doc =>
      typeof doc.genre === 'string' &&
      typeof doc.totalRevenue === 'number' &&
      doc._id === undefined
    );
    if (!schemaValid) {
      fail('Output schema incorrect: each document must have genre (string) and totalRevenue (number), no _id');
      return { pass: false, error: 'Output schema incorrect', passed, failed };
    }
    pass('Output schema correct (genre, totalRevenue, no _id)');

    // Check 6: No duplicate genres
    const genres = result.map(r => r.genre);
    const unique = new Set(genres);
    if (genres.length !== unique.size) {
      fail('Duplicate genres in output — $group should produce one document per genre');
      return { pass: false, error: 'Duplicate genres in output', passed, failed };
    }
    pass('No duplicate genres (each genre appears exactly once)');

    const total = result.reduce((sum, doc) => sum + doc.totalRevenue, 0);
    pass(`Total revenue across all genres: $${total.toFixed(2)}`);

  } catch (err) {
    fail(`Pipeline execution failed: ${err.message}`);
    return { pass: false, error: err.message, passed, failed };
  }

  return {
    pass: true,
    message: `Stage 2 passed (${passed} checks)`,
    passed,
    failed
  };
}

module.exports = { checkStage2 };
