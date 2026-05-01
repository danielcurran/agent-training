// filepath: checks/check-stage-1.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkStage1(db) {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // Check 1: File exists
  const queryPath = path.join(ROOT, 'queries', 'stage-1-query.js');
  if (!fs.existsSync(queryPath)) {
    fail('queries/stage-1-query.js not found');
    return { pass: false, error: 'stage-1-query.js not found', passed, failed };
  }
  pass('queries/stage-1-query.js exists');

  const queryContent = fs.readFileSync(queryPath, 'utf-8');

  // Check 2: $match has both a lower and upper date bound
  if (!queryContent.includes('$gte') || (!queryContent.includes('$lt') && !queryContent.includes('$lte'))) {
    fail('$match stage missing date comparison operators ($gte and $lt/$lte)');
    return { pass: false, error: '$match stage missing date comparison operators ($gte and $lt/$lte)', passed, failed };
  }
  pass('$match stage contains $gte and $lt/$lte operators');

  // Check 3: $unwind is present on $books
  if (!queryContent.includes('$unwind') || !queryContent.includes('"$books"')) {
    fail('$unwind stage not found or not applied to "$books"');
    return { pass: false, error: '$unwind stage not found or incorrect field', passed, failed };
  }
  pass('$unwind stage present on "$books"');

  // Check 4: Run the known-good pipeline and verify output
  try {
    const result = await db.collection('sales').aggregate([
      { $match: { date: { $gte: new Date('2024-01-01'), $lt: new Date('2025-01-01') } } },
      { $unwind: '$books' }
    ]).toArray();

    if (result.length === 0) {
      fail('Pipeline returned no documents — is the database seeded? Run: npm run seed');
      return { pass: false, error: 'Pipeline returned no documents', passed, failed };
    }
    pass(`Pipeline executed — ${result.length} book records returned`);

    // Check 5: books field is unwound (object, not array)
    const allUnwound = result.every(doc => doc.books && !Array.isArray(doc.books));
    if (!allUnwound) {
      fail('books field not properly unwound (should be an object, not an array)');
      return { pass: false, error: 'Books field not properly unwound', passed, failed };
    }
    pass('books field correctly unwound (one document per book)');

  } catch (err) {
    fail(`Pipeline execution failed: ${err.message}`);
    return { pass: false, error: err.message, passed, failed };
  }

  return {
    pass: true,
    message: `Stage 1 passed (${passed} checks)`,
    passed,
    failed
  };
}

module.exports = { checkStage1 };
