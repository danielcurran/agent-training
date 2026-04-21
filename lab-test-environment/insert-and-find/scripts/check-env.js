const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkEnv() {
  const results = [];
  let passed = true;

  if (!process.env.MONGODB_URI) {
    console.error('✗ MONGODB_URI not set in .env');
    process.exit(1);
  }

  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    results.push(`✓ MongoDB: connected at ${process.env.MONGODB_URI}`);
  } catch (err) {
    console.error(`✗ MongoDB: could not connect — ${err.message}`);
    process.exit(1);
  }

  const db = client.db(process.env.DB_NAME);
  const count = await db.collection('test_items').countDocuments();
  if (count === 0) {
    results.push('✓ test_items: exists, 0 documents');
  } else {
    results.push(`⚠ test_items: has ${count} documents (expected 0 — drop collection to reset)`);
  }

  const runPath = path.join(__dirname, '..', 'src', 'run.js');
  if (fs.existsSync(runPath)) {
    results.push('✓ src/run.js: skeleton file present');
  } else {
    results.push('✗ src/run.js: missing');
    passed = false;
  }

  await client.close();
  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Environment: READY' : 'Environment: NOT READY — fix errors above');
  if (!passed) process.exit(1);
}

checkEnv().catch(err => {
  console.error('check:env failed:', err.message);
  process.exit(1);
});
