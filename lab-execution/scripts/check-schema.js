#!/usr/bin/env node
/**
 * check-schema.js — Stage 1: Schema design validation
 *
 * Checks:
 *  1. schema/supportdesk-schema.yaml exists and contains required fields
 *  2. SCHEMA_NOTES.md exists, meets minimum word count (150), and contains required sections
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMA_FILE = path.join(ROOT, 'schema', 'supportdesk-schema.yaml');
const NOTES_FILE = path.join(ROOT, 'SCHEMA_NOTES.md');

const SCHEMA_REQUIRED_KEYS = ['collection:', 'document_shape:', 'indexes:'];
const NOTES_REQUIRED_SECTIONS = [
  '## Schema Decision',
  '**Option chosen:**',
  '**Why:**',
  '**Read patterns this supports:**',
  '**Write patterns and tradeoffs:**',
  '**What I would worry about in 6 months:**',
];
const NOTES_MIN_WORDS = 150;

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`✓ ${msg}`); passed++; }
function fail(msg) { console.error(`✗ ${msg}`); failed++; }

// ── Schema YAML ──────────────────────────────────────────────────────────────

if (!fs.existsSync(SCHEMA_FILE)) {
  fail('schema/supportdesk-schema.yaml: NOT FOUND');
} else {
  const content = fs.readFileSync(SCHEMA_FILE, 'utf8');

  // Check required top-level keys
  let schemaValid = true;
  for (const key of SCHEMA_REQUIRED_KEYS) {
    if (!content.includes(key)) {
      fail(`schema/supportdesk-schema.yaml: missing required field "${key.replace(':', '')}"`);
      schemaValid = false;
    }
  }

  // Check indexes is non-empty (at least one entry starting with "  -")
  const indexesSection = content.split('indexes:')[1] || '';
  const hasIndexEntries = /\n\s+-\s+/.test(indexesSection);
  if (!hasIndexEntries) {
    fail('schema/supportdesk-schema.yaml: indexes list appears to be empty');
    schemaValid = false;
  }

  // Check document_shape has at least _id
  if (!content.includes('_id:')) {
    fail('schema/supportdesk-schema.yaml: document_shape missing _id field');
    schemaValid = false;
  }

  if (schemaValid) {
    pass('schema/supportdesk-schema.yaml: valid');
  }
}

// ── SCHEMA_NOTES.md ──────────────────────────────────────────────────────────

if (!fs.existsSync(NOTES_FILE)) {
  fail('SCHEMA_NOTES.md: NOT FOUND');
} else {
  const content = fs.readFileSync(NOTES_FILE, 'utf8');

  // Word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= NOTES_MIN_WORDS) {
    pass(`SCHEMA_NOTES.md: exists, ${wordCount} words (minimum ${NOTES_MIN_WORDS} met)`);
  } else {
    fail(`SCHEMA_NOTES.md: only ${wordCount} words — minimum is ${NOTES_MIN_WORDS}`);
  }

  // Required sections
  let sectionsOk = true;
  for (const section of NOTES_REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      fail(`SCHEMA_NOTES.md: missing required section/field "${section}"`);
      sectionsOk = false;
    }
  }
  if (sectionsOk) {
    pass('SCHEMA_NOTES.md: all required sections present');
  }

  // Check "Option chosen" has an actual value (not blank)
  const optionMatch = content.match(/\*\*Option chosen:\*\*\s*(.+)/);
  if (optionMatch && optionMatch[1].trim().length > 0) {
    pass(`SCHEMA_NOTES.md: tradeoff summary acknowledged (option: ${optionMatch[1].trim()})`);
  } else {
    fail('SCHEMA_NOTES.md: "Option chosen" is blank — tradeoff not acknowledged');
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
