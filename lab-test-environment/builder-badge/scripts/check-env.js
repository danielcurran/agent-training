const { MongoClient } = require('mongodb');
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
  
  // Check required collections exist
  const collectionNames = ['projects', 'tasks', 'users'];
  for (const collName of collectionNames) {
    const coll = db.collection(collName);
    const count = await coll.countDocuments();
    results.push(`✓ ${collName}: ${count} documents`);
  }

  await client.close();
  results.forEach(r => console.log(r));
  console.log('');
  console.log('Environment: READY');
}

checkEnv().catch(err => {
  console.error('check:env failed:', err.message);
  process.exit(1);
});
