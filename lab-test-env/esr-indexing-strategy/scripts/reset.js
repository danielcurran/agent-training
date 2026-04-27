'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab';
const DRY_RUN = process.argv.includes('--dry-run');

const COLLECTIONS = ['products'];

async function reset() {
  if (DRY_RUN) {
    console.log('[dry-run] Would drop the following collections from', MONGODB_DATABASE + ':');
    COLLECTIONS.forEach(c => console.log(`  - ${c}`));
    console.log('[dry-run] Then re-seed with npm run seed');
    return;
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  const db = client.db(MONGODB_DATABASE);

  for (const name of COLLECTIONS) {
    try {
      await db.collection(name).drop();
      console.log(`✓ Dropped collection: ${name}`);
    } catch (err) {
      if (err.codeName === 'NamespaceNotFound') {
        console.log(`  Skipped (does not exist): ${name}`);
      } else {
        console.error(`✗ Failed to drop ${name}:`, err.message);
      }
    }
  }

  await client.close();
  console.log('\nReset complete. Run npm run seed to reload the starting state.');
}

reset().catch(err => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
