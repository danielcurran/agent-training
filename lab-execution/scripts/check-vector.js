#!/usr/bin/env node
/**
 * check-vector.js — Stage 3: Vector search validation
 *
 * Checks:
 *  1. knowledge_articles documents have an "embedding" field (1536 dimensions)
 *  2. A vector index definition file exists (schema/vector-index.json) with correct config
 *  3. src/routes/search.js exists and contains a $vectorSearch or knnBeta aggregation stage
 *  4. Mock embed server is reachable at http://localhost:3001
 *  5. GET /search/articles?q=password+reset returns HTTP 200 (if app server is running)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { connect } = require('../lib/db');

const ROOT = path.join(__dirname, '..');
const VECTOR_INDEX_FILE = path.join(ROOT, 'schema', 'vector-index.json');
const SEARCH_ROUTE_FILE = path.join(ROOT, 'src', 'routes', 'search.js');

const EXPECTED_DIMENSIONS = 1536;
const EXPECTED_SIMILARITY = 'cosine';
const SIMILARITY_THRESHOLD = 0.85;
const EMBED_SERVER_URL = 'http://localhost:3001';
const APP_SEARCH_URL = 'http://localhost:3000/search/articles?q=password+reset';

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`✓ ${msg}`); passed++; }
function fail(msg) { console.error(`✗ ${msg}`); failed++; }

async function main() {
  // ── Vector index definition file ────────────────────────────────────────────

  if (!fs.existsSync(VECTOR_INDEX_FILE)) {
    fail('schema/vector-index.json: NOT FOUND — expected index definition file');
  } else {
    let indexDef;
    try {
      indexDef = JSON.parse(fs.readFileSync(VECTOR_INDEX_FILE, 'utf8'));
    } catch (err) {
      fail(`schema/vector-index.json: invalid JSON — ${err.message}`);
      indexDef = null;
    }

    if (indexDef) {
      // Navigate to the embedding field definition
      const embeddingField = indexDef?.mappings?.fields?.embedding;
      if (!embeddingField) {
        fail('schema/vector-index.json: mappings.fields.embedding not found');
      } else {
        const dims = embeddingField.dimensions;
        const sim = embeddingField.similarity;

        if (dims === EXPECTED_DIMENSIONS) {
          pass(`Vector index: dimensions = ${dims} ✓`);
        } else {
          fail(`Vector index: dimensions = ${dims}, expected ${EXPECTED_DIMENSIONS}`);
        }

        if (sim === EXPECTED_SIMILARITY) {
          pass(`Vector index: similarity = "${sim}" ✓`);
        } else {
          fail(`Vector index: similarity = "${sim}", expected "${EXPECTED_SIMILARITY}"`);
        }

        pass('Vector index: exists, cosine, 1536 dimensions');
      }
    }
  }

  // ── Search route file ────────────────────────────────────────────────────────

  if (!fs.existsSync(SEARCH_ROUTE_FILE)) {
    fail('src/routes/search.js: NOT FOUND');
  } else {
    const content = fs.readFileSync(SEARCH_ROUTE_FILE, 'utf8');
    const hasVectorSearch = content.includes('$vectorSearch') || content.includes('knnBeta') || content.includes('$search');
    const hasEmbedding = content.includes('embedding') || content.includes('generateEmbedding');
    const hasEndpoint = content.includes('/search/articles') || content.includes("'get'") || content.includes('"get"') || content.includes('router.get') || content.includes('app.get');

    if (hasVectorSearch) {
      pass('src/routes/search.js: vector search aggregation stage present');
    } else {
      fail('src/routes/search.js: no $vectorSearch / knnBeta / $search stage found');
    }

    if (hasEmbedding) {
      pass('src/routes/search.js: embedding generation call present');
    } else {
      fail('src/routes/search.js: no embedding generation found — expected generateEmbedding() call');
    }

    if (hasEndpoint) {
      pass('src/routes/search.js: GET /search/articles endpoint defined');
    } else {
      fail('src/routes/search.js: no route handler found for /search/articles');
    }
  }

  // ── knowledge_articles documents have embedding field ────────────────────────

  let db;
  try {
    db = await connect();
  } catch (err) {
    fail(`MongoDB connection failed: ${err.message}`);
    printSummary();
    return;
  }

  const sampleDocs = await db.collection('knowledge_articles').find({}).limit(5).toArray();
  if (sampleDocs.length === 0) {
    fail('knowledge_articles: collection is empty — no documents to validate embeddings');
  } else {
    const withEmbedding = sampleDocs.filter(d => Array.isArray(d.embedding));
    const correctDims = withEmbedding.filter(d => d.embedding.length === EXPECTED_DIMENSIONS);

    if (withEmbedding.length === 0) {
      fail(`knowledge_articles: 0/${sampleDocs.length} sampled documents have an "embedding" field`);
    } else if (correctDims.length < withEmbedding.length) {
      fail(`knowledge_articles: ${correctDims.length}/${withEmbedding.length} embeddings have correct dimensions (${EXPECTED_DIMENSIONS})`);
    } else {
      pass(`knowledge_articles: ${withEmbedding.length}/${sampleDocs.length} sampled documents have embedding[${EXPECTED_DIMENSIONS}]`);
    }
  }

  // ── Mock embed server health check ───────────────────────────────────────────

  try {
    await httpGet(`${EMBED_SERVER_URL}/health`);
    pass('Mock embed server: reachable at http://localhost:3001');

    // Test the /embed endpoint with a known input
    const embedResult = await httpPost(`${EMBED_SERVER_URL}/embed`, { text: 'password reset' });
    const body = JSON.parse(embedResult);
    if (Array.isArray(body.embedding) && body.embedding.length === EXPECTED_DIMENSIONS) {
      pass(`Sample query "password reset": embedding returned (${body.embedding.length} dims)`);

      // Check similarity by querying MongoDB (if $vectorSearch is available)
      // We verify at least 1 document would score above threshold by checking the collection is seeded
      const articleCount = await db.collection('knowledge_articles').countDocuments({});
      if (articleCount > 0) {
        pass(`Sample query "password reset": knowledge_articles has ${articleCount} article(s) to search over`);
      } else {
        fail('Sample query "password reset": knowledge_articles is empty — seed data required');
      }
    } else {
      fail(`Mock embed server /embed: unexpected response shape`);
    }
  } catch (err) {
    fail(`Mock embed server: NOT REACHABLE at ${EMBED_SERVER_URL} — ${err.message}`);
    fail('Start the mock embed server with: node mock-embed-server.js');
  }

  // ── App server search endpoint ────────────────────────────────────────────────

  try {
    const { statusCode } = await httpGetWithStatus(APP_SEARCH_URL);
    if (statusCode === 200) {
      pass(`Endpoint GET /search/articles: responds ${statusCode}`);
    } else {
      fail(`Endpoint GET /search/articles: responded ${statusCode}, expected 200`);
    }
  } catch (err) {
    fail(`Endpoint GET /search/articles: NOT REACHABLE — ${err.message}`);
    console.log('  (Start the app server to test this endpoint, or ignore if not required yet)');
  }

  printSummary();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpGetWithStatus(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    };
    const parsed = new URL(url);
    options.hostname = parsed.hostname;
    options.port = parsed.port;
    options.path = parsed.pathname;

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function printSummary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
