#!/usr/bin/env node
/**
 * check-final.js — Stage 4: Full system validation
 *
 * Checks:
 *  1. All 5 required collections exist
 *  2. All expected indexes are present on the tickets collection
 *  3. Document counts > 0 for tickets and knowledge_articles
 *  4. Happy path: create ticket → add comment → find ticket (directly via MongoDB)
 *  5. SQL client is disabled (no SQL require() in src/)
 *  6. Structured logging (db_query events) present in DAL files
 */

const fs = require('fs');
const path = require('path');
const { connect } = require('../lib/db');
const { ObjectId } = require('mongodb');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');

const REQUIRED_COLLECTIONS = ['users', 'tickets', 'comments', 'products', 'knowledge_articles'];
const SQL_CLIENT_PATTERNS = [
  /require\(['"]mysql['"]\)/,
  /require\(['"]pg['"]\)/,
  /require\(['"]sqlite3['"]\)/,
  /require\(['"]knex['"]\)/,
  /require\(['"]sequelize['"]\)/,
  /require\(['"]typeorm['"]\)/,
  /from ['"]mysql['"]/,
  /from ['"]pg['"]/,
];

// Expected indexes on the tickets collection (checked by key pattern)
const EXPECTED_INDEX_PATTERNS = [
  { desc: '{ status: 1, priority: -1 }', keys: ['status', 'priority'] },
  { desc: '{ user._id: 1, status: 1 } or { "user._id": 1, status: 1 }', keys: ['user._id', 'status'] },
  { desc: '{ created_at: -1 }', keys: ['created_at'] },
];

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`✓ ${msg}`); passed++; }
function fail(msg) { console.error(`✗ ${msg}`); failed++; }

async function main() {
  let db;
  try {
    db = await connect();
  } catch (err) {
    fail(`MongoDB connection: ${err.message}`);
    printSummary();
    return;
  }

  // ── Collections ───────────────────────────────────────────────────────────

  const cols = await db.listCollections().toArray();
  const colNames = cols.map(c => c.name);

  const missingCols = REQUIRED_COLLECTIONS.filter(c => !colNames.includes(c));
  if (missingCols.length === 0) {
    pass(`Collections: ${REQUIRED_COLLECTIONS.join(', ')}`);
  } else {
    fail(`Collections: missing ${missingCols.join(', ')}`);
    // Still report which ones exist
    const found = REQUIRED_COLLECTIONS.filter(c => colNames.includes(c));
    if (found.length > 0) console.log(`  Found: ${found.join(', ')}`);
  }

  // ── Document counts ───────────────────────────────────────────────────────

  for (const col of ['tickets', 'knowledge_articles']) {
    const count = await db.collection(col).countDocuments({});
    if (count > 0) {
      pass(`Document counts: ${col} = ${count}`);
    } else {
      fail(`Document counts: ${col} = 0 — collection is empty, seed data required`);
    }
  }

  // ── Indexes on tickets ────────────────────────────────────────────────────

  const indexes = await db.collection('tickets').indexes();
  const indexKeyStrings = indexes.map(idx => Object.keys(idx.key).join(','));

  for (const expected of EXPECTED_INDEX_PATTERNS) {
    const found = indexes.some(idx => {
      const keys = Object.keys(idx.key);
      return expected.keys.every(k => keys.includes(k));
    });
    if (found) {
      pass(`Indexes: ${expected.desc} present`);
    } else {
      fail(`Indexes: ${expected.desc} NOT FOUND`);
    }
  }

  // ── Happy path ────────────────────────────────────────────────────────────
  // Directly exercises MongoDB operations to verify the data model works:
  //   1. Insert a test ticket
  //   2. Push a comment + update status atomically
  //   3. Fetch the ticket with its comments in one read
  //   4. Search knowledge_articles
  //   5. Clean up

  console.log('\n  Running happy path...');
  const testTicketId = new ObjectId();

  try {
    // Step 1: Create ticket
    await db.collection('tickets').insertOne({
      _id: testTicketId,
      status: 'open',
      priority: 'high',
      category: 'access',
      created_at: new Date(),
      user: { _id: new ObjectId(), name: 'Test User', email: 'test@example.com' },
      product: { _id: new ObjectId(), name: 'SupportDesk' },
      comments: [],
      _checkFinal: true,
    });

    // Step 2: Add comment + update status atomically
    const updateResult = await db.collection('tickets').updateOne(
      { _id: testTicketId },
      {
        $push: { comments: { _id: new ObjectId(), body: 'Test comment', created_at: new Date(), author: { _id: new ObjectId(), name: 'Agent', role: 'agent' } } },
        $set: { status: 'in_progress' },
      }
    );
    if (updateResult.modifiedCount !== 1) throw new Error('updateOne did not modify ticket');

    // Step 3: Fetch ticket with embedded comment
    const fetched = await db.collection('tickets').findOne({ _id: testTicketId });
    if (!fetched || !Array.isArray(fetched.comments) || fetched.comments.length !== 1) {
      throw new Error('Fetched ticket missing embedded comment');
    }
    if (fetched.status !== 'in_progress') {
      throw new Error('Ticket status not updated atomically');
    }

    // Step 4: Search knowledge_articles (basic find)
    const articles = await db.collection('knowledge_articles').find({}).limit(1).toArray();
    if (articles.length === 0) throw new Error('knowledge_articles is empty');

    pass('Happy path: create ticket → add comment → search articles → PASS');
  } catch (err) {
    fail(`Happy path: FAIL — ${err.message}`);
  } finally {
    // Clean up test data regardless of outcome
    await db.collection('tickets').deleteOne({ _id: testTicketId });
  }

  // ── SQL client disabled ───────────────────────────────────────────────────

  if (!fs.existsSync(SRC_DIR)) {
    fail('SQL client check: src/ directory not found');
  } else {
    const jsFiles = walkJs(SRC_DIR);
    const hits = [];

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of SQL_CLIENT_PATTERNS) {
        if (pattern.test(content)) {
          hits.push(`${path.relative(ROOT, file)}: matched ${pattern}`);
        }
      }
    }

    if (hits.length === 0) {
      pass('SQL client: DISABLED');
    } else {
      fail(`SQL client: still present in src/\n  ${hits.join('\n  ')}`);
    }
  }

  // ── Logging ───────────────────────────────────────────────────────────────

  const dalDir = path.join(SRC_DIR, 'dal');
  if (fs.existsSync(dalDir)) {
    const dalFiles = walkJs(dalDir);
    const loggingFiles = dalFiles.filter(f => fs.readFileSync(f, 'utf8').includes('"db_query"') || fs.readFileSync(f, 'utf8').includes("'db_query'"));

    if (loggingFiles.length > 0) {
      pass(`Logging: "db_query" structured logs found in ${loggingFiles.length} DAL file(s)`);
    } else {
      fail('Logging: no "db_query" structured log events found in src/dal/ — add console.log(JSON.stringify({ event: "db_query", ... }))');
    }
  }

  printSummary();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkJs(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkJs(full));
    } else if (entry.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function printSummary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
