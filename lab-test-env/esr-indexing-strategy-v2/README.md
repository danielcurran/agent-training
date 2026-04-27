# ESR Indexing Strategy Lab v2 (Controlled Test)

Learn how to design MongoDB indexes using the ESR (Equality, Sort, Range) guideline and measure performance improvements.

> **Note:** This is the v2 controlled test variant. Stage 3 shows only a before/after comparison (no index → ESR index). The non-ESR contrast from Stage 3 has been removed to test whether the Stage 1 SQL bridge framing alone is sufficient for transfer.

## Prerequisites

- Docker Desktop installed and running

## Setup

1. Start MongoDB: `docker-compose up -d`
2. Wait for health check: `docker-compose ps` (should show "healthy")
3. Copy `.env.example` to `.env`: `cp .env.example .env`
4. Install dependencies: `npm install`
5. Seed the database: `npm run seed`

⚠️ Do not proceed until MongoDB shows (healthy) in `docker-compose ps`.

## Starting State

The `products` collection contains 10,000 documents with no custom indexes. Your job is to identify the ESR components of each query (Stage 1), design the correct indexes (Stage 2), observe how the ESR index changes explain output (Stage 3), document trade-off decisions (Stage 4), and consolidate your learning in a reflection (Stage 5).

## Files You'll Edit

| File | Stage | What to do |
|---|---|---|
| `src/stage1-esr-identification.js` | Stage 1 | Replace `'???'` with correct field names or `'none'` |
| `src/indexes.js` | Stage 2 | Replace `{}` with correct index fields objects |
| `INDEX_DECISIONS.md` | Stage 4 | Write trade-off analysis |
| `REFLECTION.md` | Stage 5 | Write learning consolidation |

## Check Scripts

Run checks in order after completing each stage:

| Stage | Command | What it validates |
|---|---|---|
| Setup | `npm run check:env` | MongoDB connection, 10,000 documents, no custom indexes |
| Stage 1 | `npm run check:stage1` | E, S, R answers for 5 queries (pass = 4/5 correct) |
| Stage 2 | `npm run check:indexes` | Index definitions follow ESR order |
| Stage 3 | `npm run check:explain` | ESR index eliminates the SORT stage |
| Stage 4 | `npm run check:decisions` | INDEX_DECISIONS.md has rationale and trade-offs |
| Stage 5 | `npm run check:reflection` | REFLECTION.md is complete (150+ words, all 4 sections) |
| All | `npm run check:all` | Runs all checks in order |

## Troubleshooting

**MongoDB connection fails:**
```bash
docker-compose ps
docker-compose logs mongo
docker-compose up -d
```

**Re-seed data:**
```bash
npm run seed:fresh
npm run check:env
```

**Reset to a clean state:**
```bash
npm run reset
npm run seed
```
