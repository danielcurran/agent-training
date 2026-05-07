#!/usr/bin/env node
/**
 * prepare-condition.js
 *
 * Prepares a context document for a given lab + test condition.
 * Used by the three-condition knowledge transfer experiment.
 *
 * Conditions:
 *   A — Full lab completion (run via /run-learner-agent; this script is not needed)
 *   B — Knowledge.json only (inject KNOWLEDGE.json; answer transfer task without doing the lab)
 *   C — Tech spec only (read tech spec; answer transfer task without doing the lab)
 *
 * Usage:
 *   node scripts/prepare-condition.js --lab <name> --condition <b|c>
 *   node scripts/prepare-condition.js --lab esr-indexing-strategy --condition b
 *   node scripts/prepare-condition.js --lab aggregation-foundations --condition c
 *   node scripts/prepare-condition.js --list-labs
 *
 * Output:
 *   Prints a ready-to-use context block for the agent.
 *   Saves a context document to ABC-testing/<lab>/condition-<X>-context.md
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const LAB_ENV_ROOT  = path.join(ROOT, 'lab-test-env');
const SPECS_DIR     = path.join(ROOT, 'labs', 'specs');
const OUTPUT_ROOT   = path.join(ROOT, 'ABC-testing');

// ─── Lab registry ────────────────────────────────────────────────────────────
// Maps lab-name → spec filename and whether a transfer task exists
const LAB_REGISTRY = {
  'builder-badge':             { spec: 'builder-badge-tech-spec.md',                hasTransferTask: false },
  'insert-and-find':           { spec: 'insert-and-find-tech-spec.md',              hasTransferTask: false },
  'esr-indexing-strategy':     { spec: 'esr-indexing-strategy-tech-spec-v3.md',     hasTransferTask: true  },
  'aggregation-foundations':   { spec: 'aggregation-foundations-tech-spec.md',      hasTransferTask: true  },
  'memory-for-ai':             { spec: 'memory-for-ai-tech-spec.md',                hasTransferTask: true  },
};

// ─── Argument parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--list-labs')) {
  console.log('\nRegistered labs:\n');
  for (const [name, meta] of Object.entries(LAB_REGISTRY)) {
    const transferTag = meta.hasTransferTask ? '✓ transfer task' : '✗ no transfer task';
    console.log(`  ${name.padEnd(28)} ${transferTag}`);
  }
  console.log('');
  process.exit(0);
}

const labArg       = args.find(a => a.startsWith('--lab='))       || args[args.indexOf('--lab') + 1];
const conditionArg = args.find(a => a.startsWith('--condition=')) || args[args.indexOf('--condition') + 1];
const labName      = labArg?.replace('--lab=', '');
const condition    = conditionArg?.replace('--condition=', '').toLowerCase();

if (!labName || !condition) {
  console.error('Usage: node scripts/prepare-condition.js --lab <name> --condition <b|c>');
  console.error('       node scripts/prepare-condition.js --list-labs');
  process.exit(1);
}

if (!['b', 'c'].includes(condition)) {
  console.error(`✗ Invalid condition "${condition}". Use "b" (knowledge-only) or "c" (spec-only).`);
  console.error('  Condition A (lab completion) uses /run-learner-agent — no script needed.');
  process.exit(1);
}

const labMeta = LAB_REGISTRY[labName];
if (!labMeta) {
  console.error(`✗ Unknown lab "${labName}". Run with --list-labs to see registered labs.`);
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractTransferTask(specPath) {
  if (!fs.existsSync(specPath)) return null;
  const text = fs.readFileSync(specPath, 'utf8');

  // Try to extract between Transfer Task header and next ## section
  const match = text.match(/##\s+Transfer Task[\s\S]*?(?=\n##\s|\n---\n##\s|$)/i);
  return match ? match[0].trim() : null;
}

function loadKnowledge(labName) {
  const knowledgePath = path.join(LAB_ENV_ROOT, labName, 'KNOWLEDGE.json');
  if (!fs.existsSync(knowledgePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  } catch {
    return null;
  }
}

function formatKnowledge(entries, labName) {
  const lines = [
    '─'.repeat(70),
    `INJECTED KNOWLEDGE — from ${labName}/KNOWLEDGE.json (${entries.length} entries)`,
    '─'.repeat(70),
    ''
  ];
  entries.forEach((entry, i) => {
    lines.push(`${i + 1}. ${entry.concept} [${entry.confidence}]`);
    lines.push(`   SQL instinct overridden: ${entry.sql_instinct_overridden}`);
    lines.push(`   Rule: ${entry.rule}`);
    lines.push(`   When to apply: ${entry.when_to_apply}`);
    if (entry.source_check) lines.push(`   Validated by: ${entry.source_check}`);
    lines.push('');
  });
  lines.push('─'.repeat(70));
  return lines.join('\n');
}

function getNextVersion(labName, conditionLetter) {
  const dir = path.join(OUTPUT_ROOT, labName);
  if (!fs.existsSync(dir)) return 1;
  const files = fs.readdirSync(dir);
  const existing = files
    .map(f => f.match(new RegExp(`condition-${conditionLetter}-v(\\d+)-context\\.md`)))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  return existing.length === 0 ? 1 : Math.max(...existing) + 1;
}

// ─── Condition B: Knowledge Only ──────────────────────────────────────────────

function prepareConditionB(labName, labMeta) {
  const knowledge = loadKnowledge(labName);

  if (!knowledge) {
    console.error(`\n✗ KNOWLEDGE.json not found at lab-test-env/${labName}/KNOWLEDGE.json`);
    console.error('  Run the full lab first (Condition A) to generate KNOWLEDGE.json,');
    console.error('  then run this script to prepare Condition B.');
    process.exit(1);
  }

  const specPath = path.join(SPECS_DIR, labMeta.spec);
  const transferTask = extractTransferTask(specPath);

  const lines = [
    `# Condition B Context — Knowledge Only`,
    `**Lab:** ${labName}`,
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Condition:** B — Agent receives KNOWLEDGE.json only (no lab completion)`,
    '',
    '---',
    '',
    '## Injected Knowledge',
    '',
    formatKnowledge(knowledge, labName),
    '',
    '---',
    '',
  ];

  if (labMeta.hasTransferTask && transferTask) {
    lines.push('## Transfer Task (to be answered by the agent)');
    lines.push('');
    lines.push(transferTask);
  } else {
    lines.push('## Note: No Transfer Task');
    lines.push('');
    lines.push(`The ${labName} lab does not have a transfer task.`);
    lines.push('Condition B for this lab measures KNOWLEDGE.json quality only.');
    lines.push('Review the entries above and evaluate: are they specific enough to apply to a new problem?');
  }

  return lines.join('\n');
}

// ─── Condition C: Spec Only ───────────────────────────────────────────────────

function prepareConditionC(labName, labMeta) {
  const specPath = path.join(SPECS_DIR, labMeta.spec);

  if (!fs.existsSync(specPath)) {
    console.error(`✗ Spec not found at labs/specs/${labMeta.spec}`);
    process.exit(1);
  }

  const transferTask = extractTransferTask(specPath);

  const lines = [
    `# Condition C Context — Tech Spec Only`,
    `**Lab:** ${labName}`,
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Condition:** C — Agent reads tech spec only (no lab completion, no KNOWLEDGE.json)`,
    '',
    '---',
    '',
    '## Instruction for Agent',
    '',
    `Read the tech spec at: \`labs/specs/${labMeta.spec}\``,
    '',
    'You may read the full spec. You have NOT completed the lab and have NO KNOWLEDGE.json.',
    'After reading the spec, answer the Transfer Task below using only what the spec taught you.',
    '',
    '---',
    '',
  ];

  if (labMeta.hasTransferTask && transferTask) {
    lines.push('## Transfer Task (to be answered after reading the spec)');
    lines.push('');
    lines.push(transferTask);
  } else {
    lines.push('## Note: No Transfer Task');
    lines.push('');
    lines.push(`The ${labName} lab does not have a transfer task.`);
    lines.push('Condition C for this lab: after reading the spec, summarize the key MongoDB');
    lines.push('concepts taught. Evaluate whether the spec alone is sufficient to understand them.');
  }

  return lines.join('\n');
}

// ─── Save and print ───────────────────────────────────────────────────────────

function saveContext(labName, conditionLetter, content) {
  const dir = path.join(OUTPUT_ROOT, labName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const version = getNextVersion(labName, conditionLetter);
  const filename = `condition-${conditionLetter}-v${version}-context.md`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, content, 'utf8');
  return { filepath, version };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\nPreparing Condition ${condition.toUpperCase()} for lab: ${labName}\n`);

  let content;
  if (condition === 'b') {
    content = prepareConditionB(labName, labMeta);
  } else {
    content = prepareConditionC(labName, labMeta);
  }

  const { filepath, version } = saveContext(labName, condition, content);

  console.log(content);
  console.log('\n' + '─'.repeat(70));
  console.log(`✓ Context saved to: ABC-testing/${labName}/condition-${condition}-v${version}-context.md`);
  console.log('');

  if (condition === 'b') {
    console.log('Next steps:');
    console.log('  1. Open the context document above in Copilot Chat');
    console.log('  2. Run /run-condition-b with the lab name');
    console.log('  3. The agent will use only the KNOWLEDGE.json context to answer the transfer task');
    console.log(`  4. Save the response to: ABC-testing/${labName}/condition-b-v${version}-response.md`);
    console.log(`  5. Score with: /score-transfer-task (attach spec + response)`);
  } else {
    console.log('Next steps:');
    console.log('  1. Open the context document above in Copilot Chat');
    console.log('  2. Run /run-condition-c with the lab name');
    console.log(`  3. The agent will read labs/specs/${labMeta.spec} and answer the transfer task`);
    console.log(`  4. Save the response to: ABC-testing/${labName}/condition-c-v${version}-response.md`);
    console.log(`  5. Score with: /score-transfer-task (attach spec + response)`);
  }
  console.log('');
}

main();
