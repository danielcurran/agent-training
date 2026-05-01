// filepath: checks/check-stage-4.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkStage4(db) {
  let passed = 0;
  let failed = 0;

  function pass(msg) { console.log(`  ✓ ${msg}`); passed++; }
  function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

  // Check 1: File exists
  const queryPath = path.join(ROOT, 'queries', 'stage-4-query.js');
  if (!fs.existsSync(queryPath)) {
    fail('queries/stage-4-query.js not found');
    return { pass: false, error: 'stage-4-query.js not found', passed, failed };
  }
  pass('queries/stage-4-query.js exists');

  const queryContent = fs.readFileSync(queryPath, 'utf-8');

  // Check 2: All required stages present
  const requiredStages = ['$lookup', '$set', '$filter', '$project'];
  const missingStages = requiredStages.filter(s => !queryContent.includes(s));
  if (missingStages.length > 0) {
    fail(`Missing stages/operators: ${missingStages.join(', ')}`);
    return { pass: false, error: `Not all stages present (lookup, set, filter, project)`, passed, failed };
  }
  pass('All required stages present ($lookup, $set, $filter, $project)');

  // Check 3: $lookup references customers collection
  if (!queryContent.includes('"customers"') && !queryContent.includes("'customers'")) {
    fail('$lookup not joining the customers collection');
    return { pass: false, error: '$lookup not joining customers collection', passed, failed };
  }
  pass('$lookup references the customers collection');

  // Check 4: Execute known-good pipeline
  try {
    const pipeline = [
      { $match: { date: { $gte: new Date('2024-01-01'), $lt: new Date('2025-01-01') } } },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer_details'
        }
      },
      { $unwind: '$customer_details' },
      {
        $set: {
          childrensBooks: {
            $filter: {
              input: '$books',
              as: 'book',
              cond: { $eq: ['$$book.genre', "Children's literature"] }
            }
          }
        }
      },
      { $match: { 'childrensBooks.0': { $exists: true } } },
      {
        $project: {
          customerName: {
            $concat: ['$customer_details.first_name', ' ', '$customer_details.last_name']
          },
          email: '$customer_details.email',
          childrensBooks: 1,
          _id: 0
        }
      }
    ];

    const result = await db.collection('sales').aggregate(pipeline).toArray();

    if (result.length === 0) {
      fail("Pipeline returned no customers with children's books — check seed data and pipeline logic");
      return { pass: false, error: "Pipeline returned no customers with children's books", passed, failed };
    }
    pass(`Pipeline executed — ${result.length} customers with children's books found`);

    // Check 5: Output schema
    const schemaValid = result.every(doc =>
      typeof doc.customerName === 'string' &&
      typeof doc.email === 'string' &&
      Array.isArray(doc.childrensBooks) &&
      doc.childrensBooks.length > 0 &&
      doc._id === undefined
    );
    if (!schemaValid) {
      fail('Output schema invalid — each document must have customerName, email, childrensBooks, no _id');
      return { pass: false, error: 'Output schema invalid', passed, failed };
    }
    pass('Output schema correct (customerName, email, childrensBooks, no _id)');

    // Check 6: Only children's literature books in childrensBooks
    const allChildrens = result.every(doc =>
      doc.childrensBooks.every(book => book.genre === "Children's literature")
    );
    if (!allChildrens) {
      fail("childrensBooks array contains books from genres other than \"Children's literature\"");
      return { pass: false, error: 'Non-children\'s books found in childrensBooks array', passed, failed };
    }
    pass("All books in childrensBooks are genre \"Children's literature\"");

    // Check 7: customerName is a non-empty string (concat worked)
    const allNames = result.every(doc => doc.customerName.trim().length > 0);
    if (!allNames) {
      fail('customerName is empty — check $concat expression');
      return { pass: false, error: 'customerName is empty', passed, failed };
    }
    pass('customerName correctly concatenated from first_name + last_name');

  } catch (err) {
    fail(`Pipeline execution failed: ${err.message}`);
    return { pass: false, error: err.message, passed, failed };
  }

  return {
    pass: true,
    message: `Stage 4 passed (${passed} checks)`,
    passed,
    failed
  };
}

module.exports = { checkStage4 };
