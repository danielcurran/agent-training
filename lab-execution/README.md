# Lab Execution Environment

Node.js harness template for validating learner implementations against MongoDB. Customize this structure for any MongoDB lab by specifying your own check scripts, seed data, and stage definitions.

## Setup

```bash
cp .env.example .env
# Set MONGODB_URI in .env (Atlas cluster URI or local mongod)
npm install
```

## Running a lab

```bash
# 1. Load starting data
npm run seed            # upsert seed documents (safe to re-run)
npm run seed:fresh      # drop all collections first, then seed

# 2. Start the mock embedding server (if your lab requires it)
npm run embed-server    # runs at http://localhost:3001

# 3. Run validation checks (define stages for your specific lab)
npm run check:env       # verify env vars and MongoDB connection
npm run check:all       # run all validation checks in order
```

Each check script should exit 0 on pass, 1 on failure. Output shows `✓` / `✗` per check.

## Reset

```bash
npm run reset           # remove learner-created files, drop modified collections
npm run reset:dry       # preview what would be reset without making changes
```

## Mock embedding server

`mock-embed-server.js` provides a deterministic `/embed` endpoint for labs that require embedding/vector search functionality. It generates 1536-dimensional vectors deterministically from input text without needing a real embedding model.

- Health check: `GET http://localhost:3001/health` → `{"ok":true}`
- Embed: `POST http://localhost:3001/embed` with `{"text": "..."}` → `{"embedding": [...]}`

If your lab requires vector search, start the embedding server with `npm run embed-server` before running validation checks.

## Customizing for your lab

### Scripts

Define your lab's check scripts in `scripts/check-*.js`. Each script should:
- Connect to MongoDB using `MONGODB_URI`
- Validate learner deliverables (files, code patterns, database state)
- Exit with code 0 (pass) or 1 (fail)
- Output validation results with `✓` / `✗` indicators

Add npm scripts to `package.json`:
```json
{
  "scripts": {
    "check:env": "node scripts/check-env.js",
    "check:stage1": "node scripts/check-stage1.js",
    "check:stage2": "node scripts/check-stage2.js",
    "check:all": "npm run check:env && npm run check:stage1 && npm run check:stage2"
  }
}
```

### Seed data

Update `scripts/seed.js` to load your lab's starting data into MongoDB collections. This should be idempotent (safe to run multiple times).

### Environment variables

Customize `.env.example` with variables your lab needs (e.g., `DB_NAME`, `PORT`, `EMBED_SERVICE_PORT`). Document them here or in your tech spec.
