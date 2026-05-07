#!/usr/bin/env node

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

async function reset() {
  try {
    const { connect, close } = require('../lib/db');
    const db = await connect();

    if (dryRun) {
      console.log('DRY RUN: Would drop the following collections:');
      console.log('- test_items');
    } else {
      await db.collection('test_items').deleteMany({});
      console.log('✓ Dropped test_items collection');
    }

    await close();
  } catch (error) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
}

reset();
