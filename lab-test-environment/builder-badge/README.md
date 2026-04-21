# Builder Badge — Lab Environment

Complete MongoDB application design, optimization, and extension lab.

## Prerequisites

**⚠️ IMPORTANT: Start MongoDB FIRST before doing anything else.**

MongoDB must be running on `localhost:27017` for this lab to work.

### Step 1: Start MongoDB with Docker Compose (required)

```bash
cd lab-test-environment/builder-badge
docker-compose up -d
```

Wait for health check to pass (10-15 seconds):

```bash
docker-compose ps
# Should show "Up (healthy)"
```

**Do not proceed to Setup until MongoDB shows (healthy).**

### Step 2: Complete Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run check:env
```

Expected output: `Environment: READY`

## Run

```bash
npm start              # Run main application
npm run check:all      # Run all validation checks
```

## Stages

- **Stage 1: Schema Design** — Design the data model (SCHEMA.md)
- **Stage 2: Query Optimization** — Implement MongoDB queries (src/dal.js)
- **Stage 3: Vector Search** — Add semantic search (src/search.js)
- **Stage 4: Reflection** — Document learnings (REFLECTION.md)

## Validation

```bash
npm run check:env          # Verify MongoDB and collections
npm run check:schema       # Stage 1: schema design document
npm run check:dal          # Stage 2: query implementation
npm run check:vector       # Stage 3: vector search
npm run check:final        # Stage 4: happy path execution
npm run check:reflection   # Stage 4: reflection document
npm run check:all          # Run all checks in order
```

## Reset

```bash
# Stop MongoDB
docker-compose down

# Clear data (optional)
docker volume rm builder-badge_mongodb_data

# Restart from seed
docker-compose up -d
npm run seed
```
