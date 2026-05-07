#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dropFlag = args.includes('--drop');

async function seed() {
  try {
    const { connect, close } = require('../lib/db');
    const db = await connect();

    // test_items collection starts empty - no seeding required
    // This is intentional per the spec: "Collections to seed: None"

    console.log('✓ test_items: collection ready (empty)');
    console.log('\nStarting state: READY');
    console.log('- MongoDB: connected');
    console.log('- test_items: empty (0 documents)');
    console.log('- src/run.js: skeleton present');

    await close();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
