# Insert and Find — Lab Environment

Working environment for the **Insert and Find — MongoDB Basics** lab.

## Prerequisites

**⚠️ IMPORTANT: Start MongoDB FIRST before doing anything else.**

MongoDB must be running on `localhost:27017` for this lab to work. All validation checks and the lab script depend on it.

### Step 1: Start MongoDB with Docker Compose (required)

**Before you do anything else, run:**

```bash
docker-compose up -d
```

This starts MongoDB in the background. Wait for the health check to pass. Verify it's running:

```bash
docker-compose ps
```

You should see:
```
NAME                   IMAGE              STATUS
insert-and-find-mongodb mongo:latest      Up (healthy)
```

**Do not proceed to Setup until MongoDB shows (healthy).**

### Step 2: Complete Setup

Once MongoDB is running, proceed to [Setup](#setup) below.

### When done: Stop MongoDB

```bash
docker-compose down
```

### Alternative: MongoDB locally or in the cloud

If you don't have Docker, see alternatives in the [main README](../../README.md).

## Setup

Make sure MongoDB is running (see [Prerequisites](#prerequisites) above), then:

```bash
cp .env.example .env
npm install
```

## Run

```bash
node src/run.js
```

## Validate

Once you've written your code in `src/run.js`, verify your work with these checks (MongoDB must be running):

```bash
npm run check:env         # verify MongoDB is running and collection is empty
npm run check:insert      # Stage 1: document inserted correctly
npm run check:find        # Stage 2: findOne() output is correct
npm run check:reflection  # Stage 3: NOTES.md written correctly
npm run check:all         # run all checks in order
```

## Reset

```bash
mongosh "mongodb://localhost:27017/insert_find_lab" --eval "db.test_items.drop()"
```

Then restore `src/run.js` to the skeleton and delete `NOTES.md`.
