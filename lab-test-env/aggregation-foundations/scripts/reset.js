#!/usr/bin/env node
// scripts/reset.js
// Drops all seeded collections and re-seeds from scratch.
// Run: npm run reset        (drop + reseed)
// Run: npm run reset:dry    (show what would be dropped, no changes)

require('dotenv').config();
const { MongoClient } = require('mongodb');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'online_bookstore';
const COLLECTIONS = ['sales', 'reviews', 'customers'];

async function reset() {
  if (DRY_RUN) {
    console.log('Dry run — the following collections would be dropped:');
    COLLECTIONS.forEach(c => console.log(`  - ${DB_NAME}.${c}`));
    return;
  }

  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    for (const col of COLLECTIONS) {
      await db.collection(col).drop().catch(() => {});
      console.log(`✓ Dropped ${col}`);
    }
  } finally {
    await client.close();
  }

  console.log('\nRe-seeding...');
  execSync('node scripts/seed.js', { stdio: 'inherit' });
}

reset().catch(err => { console.error(err); process.exit(1); });
