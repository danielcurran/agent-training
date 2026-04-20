#!/usr/bin/env node
/**
 * reset.js — Wipe all agent-produced work and restore the lab to its starting state.
 *
 * Removes:
 *   - schema/supportdesk-schema.yaml
 *   - schema/vector-index.json
 *   - src/  (entire directory)
 *   - SCHEMA_NOTES.md
 *   - DAL_NOTES.md
 *   - REFLECTION.md
 *
 * Then re-seeds MongoDB with the flat SQL-style starting state.
 *
 * Use this between agent evaluation runs to get a clean slate.
 *
 * Usage:
 *   node scripts/reset.js
 *   node scripts/reset.js --dry-run   # shows what would be deleted without deleting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const FILES_TO_REMOVE = [
  path.join(ROOT, 'SCHEMA_NOTES.md'),
  path.join(ROOT, 'DAL_NOTES.md'),
  path.join(ROOT, 'REFLECTION.md'),
  path.join(ROOT, 'schema', 'supportdesk-schema.yaml'),
  path.join(ROOT, 'schema', 'vector-index.json'),
];

const DIRS_TO_REMOVE = [
  path.join(ROOT, 'src'),
];

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  skip (not found): ${path.relative(ROOT, filePath)}`);
    return;
  }
  if (DRY_RUN) {
    console.log(`  [dry-run] would delete: ${path.relative(ROOT, filePath)}`);
  } else {
    fs.rmSync(filePath, { force: true });
    console.log(`  deleted: ${path.relative(ROOT, filePath)}`);
  }
}

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`  skip (not found): ${path.relative(ROOT, dirPath)}/`);
    return;
  }
  if (DRY_RUN) {
    console.log(`  [dry-run] would delete: ${path.relative(ROOT, dirPath)}/`);
  } else {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`  deleted: ${path.relative(ROOT, dirPath)}/`);
  }
}

async function main() {
  if (DRY_RUN) {
    console.log('--- DRY RUN — nothing will be deleted ---\n');
  }

  console.log('Removing agent-produced files...');
  for (const f of FILES_TO_REMOVE) removeFile(f);

  console.log('\nRemoving agent-produced directories...');
  for (const d of DIRS_TO_REMOVE) removeDir(d);

  if (DRY_RUN) {
    console.log('\n[dry-run] would re-seed MongoDB with --drop flag');
    console.log('Run without --dry-run to apply changes.');
    return;
  }

  console.log('\nRe-seeding MongoDB...');
  try {
    execSync('node scripts/seed.js --drop', { cwd: ROOT, stdio: 'inherit' });
  } catch (err) {
    console.error('Seed failed — check your .env and MongoDB connection.');
    process.exit(1);
  }

  console.log('\nReset complete. Lab is back to starting state.');
}

main().catch(err => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
