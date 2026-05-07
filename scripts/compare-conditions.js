#!/usr/bin/env node
/**
 * compare-conditions.js
 *
 * Displays a side-by-side summary of all three test condition results for a lab.
 * Reads condition-a (env-eval), condition-b, and condition-c response documents.
 *
 * Usage:
 *   node scripts/compare-conditions.js --lab <name>
 *   node scripts/compare-conditions.js --lab esr-indexing-strategy
 *   node scripts/compare-conditions.js --all
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT              = path.join(__dirname, '..');
const REPORTS_ROOT      = path.join(ROOT, 'labs', 'reports');
const COMPARISON_ROOT   = path.join(ROOT, 'ABC-testing');

const LABS = [
  'builder-badge',
  'insert-and-find',
  'esr-indexing-strategy',
  'aggregation-foundations',
  'memory-for-ai',
];

const HAS_TRANSFER_TASK = new Set([
  'esr-indexing-strategy',
  'aggregation-foundations',
  'memory-for-ai',
]);

// ─── Argument parsing ─────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const all     = args.includes('--all');
const labArg  = args.find(a => a.startsWith('--lab=')) || args[args.indexOf('--lab') + 1];
const labName = labArg?.replace('--lab=', '');

if (!all && !labName) {
  console.error('Usage: node scripts/compare-conditions.js --lab <name>');
  console.error('       node scripts/compare-conditions.js --all');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findLatestFile(dir, pattern) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => pattern.test(f))
    .sort()
    .reverse(); // latest version last alphabetically won't work; sort by version number
  if (files.length === 0) return null;

  // Sort by version number descending
  const sorted = files.sort((a, b) => {
    const va = parseInt(a.match(/v(\d+)/)?.[1] || '0');
    const vb = parseInt(b.match(/v(\d+)/)?.[1] || '0');
    return vb - va;
  });
  return path.join(dir, sorted[0]);
}

function findConditionAReport(labName) {
  const labReportDir = path.join(REPORTS_ROOT, labName);
  return findLatestFile(labReportDir, new RegExp(`${labName}-env-eval-v\\d+\\.md`));
}

function findConditionBResponse(labName) {
  const dir = path.join(COMPARISON_ROOT, labName);
  return findLatestFile(dir, /condition-b-v\d+-response\.md/);
}

function findConditionCResponse(labName) {
  const dir = path.join(COMPARISON_ROOT, labName);
  return findLatestFile(dir, /condition-c-v\d+-response\.md/);
}

function findTransferScores(labName) {
  const labReportDir = path.join(REPORTS_ROOT, labName);
  const compDir      = path.join(COMPARISON_ROOT, labName);

  return {
    conditionA: findLatestFile(labReportDir, new RegExp(`${labName}-transfer-v\\d+\\.md`)),
    conditionB: findLatestFile(compDir, /condition-b-v\d+-score\.md/),
    conditionC: findLatestFile(compDir, /condition-c-v\d+-score\.md/),
  };
}

function statusLine(filepath, label) {
  if (!filepath) return `  ${label}: ✗ not found`;
  const rel = path.relative(ROOT, filepath);
  return `  ${label}: ✓ ${rel}`;
}

function reportLab(labName) {
  const hasTransferTask = HAS_TRANSFER_TASK.has(labName);

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  Lab: ${labName}`);
  console.log(`  Transfer Task: ${hasTransferTask ? '✓ yes' : '✗ no (KNOWLEDGE.json quality only)'}`);
  console.log('═'.repeat(70));

  // Condition A
  const condAReport = findConditionAReport(labName);
  console.log('\nCondition A — Full Lab Completion');
  console.log(statusLine(condAReport, 'env-eval report'));

  // Condition B
  const condBResponse = findConditionBResponse(labName);
  console.log('\nCondition B — Knowledge.json Only');
  console.log(statusLine(condBResponse, 'response'));

  // Condition C
  const condCResponse = findConditionCResponse(labName);
  console.log('\nCondition C — Tech Spec Only');
  console.log(statusLine(condCResponse, 'response'));

  if (hasTransferTask) {
    const scores = findTransferScores(labName);
    console.log('\nTransfer Task Scores');
    console.log(statusLine(scores.conditionA, 'Condition A score'));
    console.log(statusLine(scores.conditionB, 'Condition B score'));
    console.log(statusLine(scores.conditionC, 'Condition C score'));
  }

  // Completeness summary
  const missing = [];
  if (!condAReport)    missing.push('Condition A (run /run-learner-agent)');
  if (!condBResponse)  missing.push('Condition B (run /run-condition-b)');
  if (!condCResponse)  missing.push('Condition C (run /run-condition-c)');

  if (missing.length === 0) {
    console.log('\n  Status: ✓ ALL CONDITIONS COMPLETE');
    if (hasTransferTask) {
      const scores = findTransferScores(labName);
      const unscored = [];
      if (!scores.conditionA) unscored.push('A');
      if (!scores.conditionB) unscored.push('B');
      if (!scores.conditionC) unscored.push('C');
      if (unscored.length > 0) {
        console.log(`  Scoring needed for: Conditions ${unscored.join(', ')} — run /score-transfer-task`);
      } else {
        console.log('  Status: ✓ ALL CONDITIONS SCORED');
      }
    }
  } else {
    console.log(`\n  Status: ⚠️  Missing: ${missing.join(' | ')}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('\nKnowledge Transfer Experiment — Condition Comparison');
  console.log(new Date().toISOString().split('T')[0]);

  if (all) {
    for (const lab of LABS) {
      reportLab(lab);
    }
  } else {
    if (!LABS.includes(labName)) {
      console.error(`✗ Unknown lab "${labName}". Valid labs: ${LABS.join(', ')}`);
      process.exit(1);
    }
    reportLab(labName);
  }

  console.log('\n');
}

main();
