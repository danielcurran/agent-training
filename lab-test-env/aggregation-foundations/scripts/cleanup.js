#!/usr/bin/env node
// scripts/cleanup.js
// Drops all lab collections without re-seeding.

require('dotenv').config();
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'online_bookstore';
const COLLECTIONS = ['sales', 'reviews', 'customers'];

async function cleanup() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    for (const col of COLLECTIONS) {
      await db.collection(col).drop().catch(() => {});
      console.log(`✓ Dropped ${col}`);
    }
    console.log('Cleanup complete.');
  } finally {
    await client.close();
  }
}

cleanup().catch(err => { console.error(err); process.exit(1); });
