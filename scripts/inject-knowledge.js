#!/usr/bin/env node
/**
 * inject-knowledge.js
 *
 * Scans all KNOWLEDGE.json files under lab-test-env/<lab>/ and returns entries
 * relevant to a given task description. Used by the learner agent at startup to
 * surface prior MongoDB knowledge before beginning a new lab.
 *
 * Usage:
 *   node scripts/inject-knowledge.js "task description"
 *   node scripts/inject-knowledge.js "task description" --top=5
 *   node scripts/inject-knowledge.js --list   (show all stored knowledge)
 *
 * Output:
 *   If relevant entries are found, prints a formatted block the learner agent
 *   can include in its starting context. Exits 0 regardless — missing or empty
 *   knowledge store is not an error (first run).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LAB_ENV_ROOT = path.join(__dirname, '..', 'lab-test-env');
const DEFAULT_TOP = 5;

// ─── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const listMode = args.includes('--list');
const topArg = args.find(a => a.startsWith('--top='));
const topN = topArg ? parseInt(topArg.split('=')[1], 10) : DEFAULT_TOP;
const query = args.filter(a => !a.startsWith('--')).join(' ').trim();

if (!listMode && !query) {
  console.error('Usage: node scripts/inject-knowledge.js "task description" [--top=N]');
  console.error('       node scripts/inject-knowledge.js --list');
  process.exit(1);
}

// ─── Load all KNOWLEDGE.json files ───────────────────────────────────────────

function loadAllKnowledge() {
  const store = [];

  if (!fs.existsSync(LAB_ENV_ROOT)) return store;

  const labs = fs.readdirSync(LAB_ENV_ROOT).filter(name => {
    const full = path.join(LAB_ENV_ROOT, name);
    return fs.statSync(full).isDirectory();
  });

  for (const lab of labs) {
    const knowledgePath = path.join(LAB_ENV_ROOT, lab, 'KNOWLEDGE.json');
    if (!fs.existsSync(knowledgePath)) continue;

    let entries;
    try {
      const raw = fs.readFileSync(knowledgePath, 'utf8');
      entries = JSON.parse(raw);
      if (!Array.isArray(entries)) continue;
    } catch {
      // Skip malformed files silently — don't block a lab run
      continue;
    }

    for (const entry of entries) {
      if (entry && typeof entry === 'object' && entry.concept) {
        store.push({ ...entry, _source_lab: lab });
      }
    }
  }

  return store;
}

// ─── Relevance scoring ────────────────────────────────────────────────────────
// Simple keyword overlap: tokenise the query and score each entry by how many
// tokens appear in its concept/rule/when_to_apply/sql_instinct_overridden text.
// No embeddings required — the check scripts provide ground-truth grounding.

function scoreEntry(entry, queryTokens) {
  const haystack = [
    entry.concept,
    entry.rule,
    entry.when_to_apply,
    entry.sql_instinct_overridden,
    entry._source_lab
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score++;
  }
  return score;
}

function tokenise(text) {
  // Split on non-alphanumeric, lower-case, remove stop words and short tokens
  const STOP = new Set([
    'a','an','the','and','or','of','to','in','is','it','that','this',
    'with','for','on','at','by','from','i','me','my','we','you','how',
    'what','when','where','why','do','use','using'
  ]);
  return text
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .filter(t => t.length > 2 && !STOP.has(t));
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatEntry(entry, index) {
  const conf = entry.confidence ? ` [${entry.confidence}]` : '';
  const source = entry._source_lab ? ` (from: ${entry._source_lab})` : '';
  const check = entry.source_check ? `\n  Validated by: ${entry.source_check}` : '';
  return [
    `${index + 1}. ${entry.concept}${conf}${source}`,
    `   SQL instinct overridden: ${entry.sql_instinct_overridden || '—'}`,
    `   Rule: ${entry.rule || '—'}`,
    `   When to apply: ${entry.when_to_apply || '—'}${check}`
  ].join('\n');
}

function formatBlock(entries, query) {
  const header = query
    ? `Prior MongoDB knowledge relevant to: "${query}"`
    : 'All stored MongoDB knowledge';
  const divider = '─'.repeat(60);
  const body = entries.map((e, i) => formatEntry(e, i)).join('\n\n');
  const footer = entries.length === 0
    ? '  (none — this appears to be a first run)'
    : '';
  return [
    divider,
    `PRIOR KNOWLEDGE CONTEXT`,
    header,
    divider,
    body || footer,
    divider
  ].join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const store = loadAllKnowledge();

if (listMode) {
  console.log(formatBlock(store, null));
  console.log(`\nTotal entries: ${store.length} across ${
    [...new Set(store.map(e => e._source_lab))].length
  } lab(s)`);
  process.exit(0);
}

if (store.length === 0) {
  console.log('─'.repeat(60));
  console.log('PRIOR KNOWLEDGE CONTEXT');
  console.log('No KNOWLEDGE.json files found in lab-test-env/. Starting fresh.');
  console.log('─'.repeat(60));
  process.exit(0);
}

const queryTokens = tokenise(query);
const scored = store
  .map(entry => ({ entry, score: scoreEntry(entry, queryTokens) }))
  .filter(({ score }) => score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, topN)
  .map(({ entry }) => entry);

console.log(formatBlock(scored, query));

if (scored.length > 0) {
  console.log(`\n${scored.length} relevant entr${scored.length === 1 ? 'y' : 'ies'} found (of ${store.length} total stored).`);
} else {
  console.log(`\nNo relevant prior knowledge found for this task (${store.length} entries stored, none matched).`);
}
