# Lab Execution Environment

Node.js harness for validating student implementations of the agent-training labs against MongoDB.

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

# 2. Start the mock embedding server (required for Stage 3)
npm run embed-server    # runs at http://localhost:3001

# 3. Run validation checks in stage order
npm run check:env       # Stage 0 — verify env vars and MongoDB connection
npm run check:schema    # Stage 1 — validate schema YAML and SCHEMA_NOTES.md
npm run check:dal       # Stage 2 — validate DAL implementation and unit tests
npm run check:vector    # Stage 3 — validate vector index and semantic search endpoint
npm run check:final     # Stage 4 — full system: collections, indexes, happy path, SQL disabled
npm run check:reflection  # Stage 4 — validate REFLECTION.md content and sections

# Or run everything at once
npm run check:all
```

Each check script exits 0 on pass, 1 on failure. Output shows `✓` / `✗` per check.

## Reset

```bash
npm run reset           # remove student-created files, drop modified collections
npm run reset:dry       # preview what would be reset without making changes
```

## Mock embedding server

`mock-embed-server.js` provides a deterministic `/embed` endpoint so Stage 3 works without a real embedding model. It generates 1536-dimensional vectors deterministically from input text.

- Health check: `GET http://localhost:3001/health` → `{"ok":true}`
- Embed: `POST http://localhost:3001/embed` with `{"text": "..."}` → `{"embedding": [...]}`

Start it with `npm run embed-server` before running `npm run check:vector`.

## Files expected by check scripts

| File | Check script | Stage |
|---|---|---|
| `.env` with `MONGODB_URI` | `check:env` | 0 |
| `schema/supportdesk-schema.yaml` | `check:schema` | 1 |
| `SCHEMA_NOTES.md` | `check:schema` | 1 |
| `src/dal/tickets.js` | `check:dal` | 2 |
| `DAL_NOTES.md` | `check:dal` | 2 |
| `src/routes/search.js` | `check:vector` | 3 |
| `REFLECTION.md` | `check:reflection` | 4 |
