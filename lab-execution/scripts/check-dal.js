#!/usr/bin/env node
/**
 * check-dal.js — Stage 2: Data Access Layer validation
 *
 * Checks:
 *  1. src/dal/tickets.js exists
 *  2. No SQL client imports in src/dal/ (mysql, pg, sqlite3, knex, sequelize, typeorm)
 *  3. All 4 core access paths are implemented (function names or comments)
 *  4. DAL_NOTES.md exists with all 4 paths documented
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DAL_FILE = path.join(ROOT, 'src', 'dal', 'tickets.js');
const DAL_DIR = path.join(ROOT, 'src', 'dal');
const NOTES_FILE = path.join(ROOT, 'DAL_NOTES.md');

const SQL_CLIENT_PATTERNS = ['require(\'mysql\')', 'require("mysql")', 'require(\'pg\')',
  'require("pg")', 'require(\'sqlite3\')', 'require("sqlite3")',
  'require(\'knex\')', 'require("knex")', 'require(\'sequelize\')',
  'require("sequelize")', 'require(\'typeorm\')', 'require("typeorm")',
  'from \'mysql\'', 'from "mysql"', 'from \'pg\'', 'from "pg"',
];

// The 4 required access paths — checked by looking for function names or descriptive comments
const REQUIRED_PATHS = [
  { name: 'Fetch ticket + comments + agent', patterns: ['getTicketById', 'fetchTicket', 'findTicket', 'getTicket'] },
  { name: 'List open tickets by priority', patterns: ['getOpenTickets', 'listOpenTickets', 'findOpenTickets', 'openTickets'] },
  { name: 'Add comment + update status', patterns: ['addComment', 'createComment', 'pushComment', 'updateTicket'] },
  { name: 'Search tickets by category and user', patterns: ['searchTickets', 'findTickets', 'getTicketsByUser', 'ticketsByCategory'] },
];

const DAL_NOTES_REQUIRED_PATHS = [
  'Fetch ticket',
  'List open tickets',
  'Add comment',
  'Search tickets',
];

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`✓ ${msg}`); passed++; }
function fail(msg) { console.error(`✗ ${msg}`); failed++; }

// ── DAL file existence ────────────────────────────────────────────────────────

if (!fs.existsSync(DAL_FILE)) {
  fail('src/dal/tickets.js: NOT FOUND');
} else {
  pass('src/dal/tickets.js: exists');
  const content = fs.readFileSync(DAL_FILE, 'utf8');

  // Check all 4 access paths are implemented
  for (const { name, patterns } of REQUIRED_PATHS) {
    const found = patterns.some(p => content.includes(p));
    if (found) {
      pass(`DAL path "${name}": implemented`);
    } else {
      fail(`DAL path "${name}": not found — expected one of: ${patterns.join(', ')}`);
    }
  }
}

// ── SQL client scan ───────────────────────────────────────────────────────────

if (!fs.existsSync(DAL_DIR)) {
  fail('src/dal/: directory not found');
} else {
  // Walk all .js files under src/dal/
  const files = walkJs(DAL_DIR);
  let sqlFound = false;
  const sqlHits = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of SQL_CLIENT_PATTERNS) {
      if (content.includes(pattern)) {
        sqlFound = true;
        sqlHits.push(`${path.relative(ROOT, file)}: found "${pattern}"`);
      }
    }
  }

  if (sqlFound) {
    fail(`SQL client usage in core path: DETECTED\n  ${sqlHits.join('\n  ')}`);
  } else {
    pass('SQL client usage in core path: NONE DETECTED');
  }
}

// ── Unit tests ────────────────────────────────────────────────────────────────

// Look for test files and attempt to run them if a test runner is available
const testFiles = findTestFiles(ROOT);
if (testFiles.length === 0) {
  fail('Unit tests (MongoDB paths): no test files found in src/ or tests/ — expected *.test.js or *.spec.js');
} else {
  // Try to run with jest or mocha if available in node_modules
  const jestBin = path.join(ROOT, 'node_modules', '.bin', 'jest');
  const mochaBin = path.join(ROOT, 'node_modules', '.bin', 'mocha');

  if (fs.existsSync(jestBin)) {
    try {
      execSync(`"${jestBin}" --passWithNoTests 2>&1`, { cwd: ROOT, stdio: 'pipe' });
      pass('Unit tests (MongoDB paths): PASS');
    } catch (err) {
      fail(`Unit tests (MongoDB paths): FAIL\n${err.stdout?.toString().slice(0, 500)}`);
    }
  } else if (fs.existsSync(mochaBin)) {
    try {
      execSync(`"${mochaBin}" '${testFiles[0]}' 2>&1`, { cwd: ROOT, stdio: 'pipe' });
      pass('Unit tests (MongoDB paths): PASS');
    } catch (err) {
      fail(`Unit tests (MongoDB paths): FAIL\n${err.stdout?.toString().slice(0, 500)}`);
    }
  } else {
    // No runner installed — report test files found but can't run
    pass(`Unit tests (MongoDB paths): ${testFiles.length} test file(s) found (install jest or mocha to run)`);
  }
}

// ── DAL_NOTES.md ─────────────────────────────────────────────────────────────

if (!fs.existsSync(NOTES_FILE)) {
  fail('DAL_NOTES.md: NOT FOUND');
} else {
  const content = fs.readFileSync(NOTES_FILE, 'utf8');
  let allPathsDocumented = true;

  for (const pathName of DAL_NOTES_REQUIRED_PATHS) {
    // Look for the path name as a heading (## ...) or bold (**...**)
    const regex = new RegExp(pathName, 'i');
    if (regex.test(content)) {
      pass(`DAL_NOTES.md: "${pathName}" documented`);
    } else {
      fail(`DAL_NOTES.md: missing documentation for "${pathName}"`);
      allPathsDocumented = false;
    }
  }

  // Check each documented path has the required fields
  const requiredFields = ['**Option chosen:**', '**Why:**', '**Tradeoff accepted:**'];
  for (const field of requiredFields) {
    if (content.includes(field)) {
      pass(`DAL_NOTES.md: "${field}" present`);
    } else {
      fail(`DAL_NOTES.md: missing required field "${field}"`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

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

function findTestFiles(root) {
  const candidates = [
    path.join(root, 'src'),
    path.join(root, 'tests'),
    path.join(root, 'test'),
    path.join(root, '__tests__'),
  ];
  const results = [];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walkJs(dir)) {
      if (file.includes('.test.') || file.includes('.spec.')) {
        results.push(file);
      }
    }
  }
  return results;
}
