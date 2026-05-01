# Aggregation Foundations — Test Environment

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+
- mongosh (for running query files interactively)

## Setup

1. Start MongoDB:
   ```bash
   docker-compose up -d
   ```

2. Wait for the health check to pass:
   ```bash
   docker-compose ps
   # MongoDB should show (healthy) before continuing
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

⚠️ Do not proceed until MongoDB shows **(healthy)** in `docker-compose ps`.

---

## Lab Structure

This lab has 4 query stages + 1 reflection. You work in the `queries/` folder and fill in the `// TODO:` blocks in each file.

| Stage | File | Concepts |
|---|---|---|
| Stage 1 | `queries/stage-1-query.js` | $match, $unwind |
| Stage 2 | `queries/stage-2-query.js` | $group, $project |
| Stage 3 | `queries/stage-3-query.js` | $sort, $limit |
| Stage 4 | `queries/stage-4-query.js` | $lookup, $set, $filter |
| Reflection | `REFLECTION.md` | Pipeline design (transfer task) |

---

## Running Query Files

Open **mongosh** connected to your local MongoDB and load a file:

```bash
mongosh mongodb://localhost:27017
```

Then inside mongosh:
```javascript
load("queries/stage-1-query.js")
```

---

## Check Scripts

Run checks after completing each stage. Checks validate your query files and run the pipeline against live data.

| Stage | Command | What it validates |
|---|---|---|
| Environment | `npm run check:env` | MongoDB connected, all collections seeded |
| Stage 1 | `npm run check:stage-1` | $match date filter + $unwind on books array |
| Stage 2 | `npm run check:stage-2` | $group by genre, $project renames _id to genre |
| Stage 3 | `npm run check:stage-3` | $sort descending, $limit 10 |
| Stage 4 | `npm run check:stage-4` | $lookup joins customers, $filter keeps children's books only |
| Reflection | `npm run check:reflection` | REFLECTION.md contains required stages and explanations |
| All | `npm run check:all` | Runs all checks in order |

---

## Starting State

The database is seeded with:
- **500 sales** documents spanning 2024, each containing an embedded `books` array (1–3 books)
- **200 reviews** spanning 2018–2024
- **50 customers**
- **30 book titles** across 6 genres: Fantasy, Science Fiction, Mystery, Children's literature, Romance, Non-fiction

The query files in `queries/` contain scaffolded code with `// TODO:` stubs. Your job is to complete the aggregation pipeline logic in each file. The check scripts validate whether your implementation is correct.

---

## Reset / Cleanup

```bash
npm run reset       # Drop all collections and reseed
npm run reset:dry   # Show what would be dropped (no changes)
npm run cleanup     # Drop all collections only (no reseed)
```
