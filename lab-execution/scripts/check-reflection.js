#!/usr/bin/env node
/**
 * check-reflection.js — Stage 4: Reflection validation
 *
 * Checks:
 *  1. REFLECTION.md exists
 *  2. Minimum word count (200)
 *  3. All 3 required sections are present with meaningful content
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REFLECTION_FILE = path.join(ROOT, 'REFLECTION.md');

const MIN_WORDS = 200;

// Required sections — matched case-insensitively
const REQUIRED_SECTIONS = [
  {
    id: 'agent_acceptance',
    patterns: ['Agent acceptance', 'acceptance vs override', 'accepted and one you overrode'],
    description: 'Agent acceptance vs override',
  },
  {
    id: 'schema_dal',
    patterns: ['Schema and DAL', 'schema.*tradeoff', 'DAL tradeoff', 'biggest tradeoff'],
    description: 'Schema and DAL tradeoffs',
  },
  {
    id: 'production_monitoring',
    patterns: ['Production monitoring', 'monitor', 'production'],
    description: 'Production monitoring',
  },
];

// Per-section minimum word count to guard against placeholder answers
const SECTION_MIN_WORDS = 20;

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`✓ ${msg}`); passed++; }
function fail(msg) { console.error(`✗ ${msg}`); failed++; }

// ── File existence ────────────────────────────────────────────────────────────

if (!fs.existsSync(REFLECTION_FILE)) {
  fail('REFLECTION.md: NOT FOUND');
  console.log('\nCreate REFLECTION.md in the lab root and answer all 3 reflection prompts.');
  console.log(`\n0 passed, 1 failed`);
  process.exit(1);
}

const content = fs.readFileSync(REFLECTION_FILE, 'utf8');

// ── Word count ────────────────────────────────────────────────────────────────

const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
if (wordCount >= MIN_WORDS) {
  pass(`REFLECTION.md: exists, ${wordCount} words (minimum ${MIN_WORDS} met)`);
} else {
  fail(`REFLECTION.md: only ${wordCount} words — minimum is ${MIN_WORDS}`);
}

// ── Required sections ─────────────────────────────────────────────────────────

// Split content into sections by heading (## ...)
const sections = content.split(/\n(?=##\s)/);

for (const req of REQUIRED_SECTIONS) {
  // Find a section whose heading or content matches any of the patterns
  const matchingSection = sections.find(sec =>
    req.patterns.some(p => new RegExp(p, 'i').test(sec))
  );

  if (!matchingSection) {
    fail(`REFLECTION.md: section "${req.description}" not found`);
    continue;
  }

  // Check the section has substantive content (not just the heading)
  const sectionWords = matchingSection.trim().split(/\s+/).filter(Boolean).length;
  if (sectionWords >= SECTION_MIN_WORDS) {
    pass(`REFLECTION.md: "${req.description}" — present with ${sectionWords} words`);
  } else {
    fail(`REFLECTION.md: "${req.description}" — only ${sectionWords} words, needs more substance (minimum ${SECTION_MIN_WORDS})`);
  }
}

// ── Specific content checks ───────────────────────────────────────────────────

// Section 1: Should mention at least 2 accepted suggestions and 1 override
const agentSection = sections.find(s => /agent acceptance|acceptance vs override/i.test(s)) || '';
const hasAccepted = (agentSection.match(/accept/gi) || []).length >= 1;
const hasOverride = /override|overrode|rejected|ignored/i.test(agentSection);

if (hasAccepted && hasOverride) {
  pass('REFLECTION.md: agent acceptance section covers both accepted and overridden suggestions');
} else if (!hasAccepted) {
  fail('REFLECTION.md: agent acceptance section does not mention any accepted suggestions');
} else if (!hasOverride) {
  fail('REFLECTION.md: agent acceptance section does not mention any overrides — required to show critical thinking');
}

// Section 3: Should list at least 3 monitoring items
const monitorSection = sections.find(s => /production monitoring|monitor/i.test(s)) || '';
// Count list items or numbered items in the monitoring section
const monitorItems = (monitorSection.match(/^\s*[-*\d]+[\.\)]/gm) || []).length;
if (monitorItems >= 3) {
  pass(`REFLECTION.md: production monitoring section lists ${monitorItems} items`);
} else if (monitorItems > 0) {
  fail(`REFLECTION.md: production monitoring section lists only ${monitorItems} item(s) — minimum is 3`);
} else {
  // May be written as prose — give benefit of the doubt if word count is sufficient
  if ((monitorSection.trim().split(/\s+/).filter(Boolean).length) >= 30) {
    pass('REFLECTION.md: production monitoring section has prose content');
  } else {
    fail('REFLECTION.md: production monitoring section needs at least 3 monitoring items listed');
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
