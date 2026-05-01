// filepath: checks/index.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { checkStage1 } = require('./check-stage-1');
const { checkStage2 } = require('./check-stage-2');
const { checkStage3 } = require('./check-stage-3');
const { checkStage4 } = require('./check-stage-4');
const { checkReflection } = require('./check-reflection');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'online_bookstore';

async function checkEnv() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    const required = ['sales', 'reviews', 'customers'];
    const missing = required.filter(name => !names.includes(name));
    if (missing.length > 0) {
      return { pass: false, error: `Missing collections: ${missing.join(', ')}. Run: npm run seed` };
    }
    return { pass: true, message: '✓ Environment check passed. MongoDB connected, all collections present.' };
  } catch (err) {
    return { pass: false, error: `Cannot connect to MongoDB: ${err.message}` };
  } finally {
    await client.close();
  }
}

async function runChecks(stage) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const checks = {
      '1': checkStage1,
      '2': checkStage2,
      '3': checkStage3,
      '4': checkStage4,
      reflection: checkReflection
    };

    const stagesToRun = stage === 'all' ? ['1', '2', '3', '4', 'reflection'] : [stage];

    let totalPassed = 0;
    let totalFailed = 0;

    for (const s of stagesToRun) {
      console.log(`\n--- Stage ${s} ---`);
      const result = s === 'reflection'
        ? await checks[s]()
        : await checks[s](db);

      const status = result.pass ? '✓ PASS' : '✗ FAIL';
      console.log(`\nStage ${s}: ${status}`);
      if (result.message) console.log(result.message);
      if (result.error && !result.pass) console.error(`Error: ${result.error}`);

      totalPassed += result.passed || 0;
      totalFailed += result.failed || 0;
    }

    if (stage === 'all') {
      console.log(`\n=============================`);
      console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
      if (totalFailed > 0) process.exit(1);
    }

  } finally {
    await client.close();
  }
}

const args = process.argv.slice(2);

if (args.includes('--env')) {
  checkEnv().then(result => {
    console.log(result.pass ? '✓ PASS' : '✗ FAIL');
    console.log(result.message || result.error);
    if (!result.pass) process.exit(1);
  }).catch(console.error);

} else if (args.includes('--reflection')) {
  runChecks('reflection').catch(console.error);

} else if (args.includes('--all')) {
  runChecks('all').catch(console.error);

} else {
  const stageArg = args.find(a => a.startsWith('--stage='))?.split('=')[1];
  if (stageArg) {
    runChecks(stageArg).catch(console.error);
  } else {
    console.error('Usage: node checks/index.js [--env | --stage=N | --reflection | --all]');
    process.exit(1);
  }
}
