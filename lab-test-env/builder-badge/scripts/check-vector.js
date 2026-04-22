const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkVector() {
  const results = [];
  let passed = true;

  const vectorPath = path.join(__dirname, '..', 'src', 'search.js');
  if (!fs.existsSync(vectorPath)) {
    console.log('✗ src/search.js: not found');
    console.log('Stage 3: FAIL');
    process.exit(1);
  }

  const content = fs.readFileSync(vectorPath, 'utf8');
  results.push('✓ src/search.js: exists');

  // Check for vector search
  if (content.includes('$vectorSearch') || content.includes('embedding')) {
    results.push('✓ References vector search or embeddings');
  } else {
    results.push('✗ No vector search found');
    passed = false;
  }

  // Check for embedding generation
  if (content.includes('generateEmbedding') || content.includes('embed')) {
    results.push('✓ References embedding generation');
  } else {
    results.push('⚠ No embedding generation found');
  }

  // Check for semantic search pattern
  if (content.includes('cosine') || content.includes('similarity') || content.includes('vector')) {
    results.push('✓ Implements semantic search pattern');
  } else {
    results.push('⚠ No semantic search pattern detected');
  }

  results.forEach(r => console.log(r));
  console.log('');
  console.log(passed ? 'Stage 3: PASS' : 'Stage 3: FAIL');
  if (!passed) process.exit(1);
}

checkVector().catch(err => {
  console.error('check:vector failed:', err.message);
  process.exit(1);
});
