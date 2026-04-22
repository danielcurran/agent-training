# ESR Indexing Strategy Lab

Learn how to design MongoDB indexes using the ESR (Equality, Sort, Range) guideline and measure performance improvements.

## Quick Start

```bash
cp .env.example .env
npm install
docker-compose up -d
npm run seed
npm run check:env
npm run check:all
```

## Stages

1. **Stage 1:** Understand ESR — Identify Equality, Sort, Range components in queries
2. **Stage 2:** Design Indexes — Create indexes following ESR guideline
3. **Stage 3:** Measure Performance — Compare explain() output across index strategies
4. **Stage 4:** Trade-Offs — Document index decisions given constraints
5. **Stage 5:** Reflection — Consolidate learning and transfer to real applications

## Files You'll Edit

- `src/stage1-esr-identification.js` — E, S, R answers for 5 queries
- `src/indexes.js` — Index definitions for 5 queries
- `INDEX_DECISIONS.md` — Trade-off analysis
- `REFLECTION.md` — Learning consolidation

## Check Scripts

```bash
npm run check:env          # Verify MongoDB connection and seed data
npm run check:stage1       # Validate ESR identification answers
npm run check:indexes      # Validate index definitions
npm run check:explain      # Measure performance (automated)
npm run check:decisions    # Validate trade-off decisions document
npm run check:reflection   # Validate reflection document
npm run check:all          # Run all checks in order
```

## Troubleshooting

**MongoDB connection fails:**
```bash
docker-compose ps
docker-compose logs mongo
docker-compose up -d
```

**Re-seed data:**
```bash
npm run seed
npm run check:env
```
