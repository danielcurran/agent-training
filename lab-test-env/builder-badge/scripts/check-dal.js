const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkDAL() {
  const results = [];
  let passed = true;

  const dalPath = path.join(__dirname, '..', 'src', 'dal.js');
  if (!fs.existsSync(dalPath)) {
    console.log('✗ src/dal.js: not found');
    console.log('Stage 2: FAIL');
    process.exit(1);
  }

  const content = fs.readFileSync(dalPath, 'utf8');
  results.push('✓ src/dal.js: exists');

  // Check for MongoDB queries (not SQL)
  if (content.includes('find(') || content.includes('findOne(') || content.includes('aggregate(')) {
    results.push('✓ Uses MongoDB query methods (find/findOne/aggregate)');
  } else {
    results.push('✗ No MongoDB query methods found — is this SQL code?');
    passed = false;
  }

  // Check for index usage
  if (content.includes('createIndex(') || content.includes('status') || content.includes('priority')) {
    results.push('✓ References indexes or query fields');
  } else {
    results.push('✗ No index references found');
    passed = false;
  }

  // Check for compound queries
  if (content.includes('$and') || content.includes('$or') || content.includes('sort')) {
    results.push('✓ Uses compound queries or sorting');
  } else {
    results.push('⚠ No compound queries detected');
  }

  // Check for atomic updates
  if (content.includes('$push') || content.includes('$set') || content.includes('$inc')) {
    results.push('✓ Uses atomic update operators');
  } else {
    results.push('⚠ No atomic operators detected');
  }

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 2: PASS' : 'Stage 2: FAIL');
  if (!passed) process.exit(1);
}

checkDAL().catch(err => {
  console.error('check:dal failed:', err.message);
  process.exit(1);
});
