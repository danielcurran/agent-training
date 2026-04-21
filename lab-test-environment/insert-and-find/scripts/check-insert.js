const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkInsert() {
  const results = [];
  let passed = true;

  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
  } catch (err) {
    console.error(`✗ MongoDB: could not connect — ${err.message}`);
    process.exit(1);
  }

  const db = client.db(process.env.DB_NAME);
  const collection = db.collection('test_items');
  const count = await collection.countDocuments();

  if (count >= 1) {
    results.push(`✓ test_items: ${count} document(s) found`);
  } else {
    results.push('✗ test_items: 0 documents — did you run node src/run.js?');
    passed = false;
  }

  const doc = await collection.findOne({}, { sort: { _id: -1 } });
  if (doc) {
    doc.name === 'test-item'
      ? results.push('✓ Document has field: name = "test-item"')
      : (results.push(`✗ name: expected "test-item", got "${doc.name}"`), passed = false);

    doc.status === 'active'
      ? results.push('✓ Document has field: status = "active"')
      : (results.push(`✗ status: expected "active", got "${doc.status}"`), passed = false);

    doc.created_at instanceof Date
      ? results.push('✓ Document has field: created_at (date)')
      : (results.push('✗ created_at: missing or not a Date'), passed = false);

    doc._id
      ? results.push('✓ _id: present (auto-assigned by MongoDB)')
      : (results.push('✗ _id: missing'), passed = false);
  }

  await client.close();
  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 1: PASS' : 'Stage 1: FAIL');
  if (!passed) process.exit(1);
}

checkInsert().catch(err => {
  console.error('check:insert failed:', err.message);
  process.exit(1);
});
