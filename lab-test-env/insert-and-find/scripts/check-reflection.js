#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed++;
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

async function checkReflection() {
  try {
    // Check if NOTES.md exists
    const notesFile = path.join(ROOT, 'NOTES.md');
    if (!fs.existsSync(notesFile)) {
      fail('NOTES.md: file not found');
      console.log(`\n${passed} passed, ${failed} failed`);
      console.log('Stage 3: FAIL');
      process.exit(1);
    }

    pass('NOTES.md: exists');

    // Read the file
    const content = fs.readFileSync(notesFile, 'utf8');

    // Check for "What a MongoDB Document Is" section
    if (content.includes('What a MongoDB Document Is')) {
      const sectionMatch = content.match(/## What a MongoDB Document Is\n\n([\s\S]*?)(?=##|$)/);
      if (sectionMatch && sectionMatch[1].trim().length > 0) {
        pass('Section "What a MongoDB Document Is": present, non-empty');
      } else {
        fail('Section "What a MongoDB Document Is": present but empty');
      }
    } else {
      fail('Section "What a MongoDB Document Is": not found');
    }

    // Check for "What insertOne() Does Differently" section
    if (content.includes('What insertOne() Does Differently') || content.includes('insertOne()')) {
      const sectionMatch = content.match(/## What insertOne\(\) Does Differently[\s\S]*?\n\n([\s\S]*?)(?=##|$)/);
      if (sectionMatch && sectionMatch[1].trim().length > 0) {
        pass('Section "What insertOne() Does Differently": present, non-empty');
      } else {
        fail('Section "What insertOne() Does Differently": present but empty');
      }
    } else {
      fail('Section "What insertOne() Does Differently": not found');
    }

    // Check minimum word count (20 words per spec)
    const wordCount = countWords(content);
    if (wordCount >= 20) {
      pass(`Minimum length: ${wordCount} words (≥ 20 required)`);
    } else {
      fail(`Minimum length: ${wordCount} words (< 20 required)`);
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('Stage 3: PASS');
    } else {
      console.log('Stage 3: FAIL');
    }
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkReflection();
