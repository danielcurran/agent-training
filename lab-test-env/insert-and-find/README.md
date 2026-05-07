# Insert and Find — MongoDB Basics

A foundational MongoDB lab that teaches the core read/write workflow: insert a document with `insertOne()` and retrieve it with `findOne()`.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ and npm
- mongosh (included with MongoDB Docker image)

## Setup

**⚠️ Important: Start MongoDB first before other setup steps.**

1. **Start MongoDB:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for MongoDB health check:**
   ```bash
   docker-compose ps
   ```
   Wait until the `mongodb` service shows status `Up (healthy)`. This may take 10-15 seconds. Only proceed when you see `(healthy)`.

3. **Copy `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Verify starting state:**
   ```bash
   npm run check:env
   ```
   Expected output:
   ```
   ✓ MongoDB: connected at localhost:27017
   ✓ test_items: exists, 0 documents
   ✓ src/run.js: skeleton file present
   
   Environment: READY
   ```

## Starting State

The lab starts with:
- **MongoDB running** on `mongodb://localhost:27017`
- **`test_items` collection** is **empty** (0 documents)
- **`src/run.js`** contains connection boilerplate only — you fill in the rest
- **`.env`** is pre-configured with `MONGODB_URI` and `DB_NAME`

Your job is to add two operations to `src/run.js`:
1. Insert a document with three fields: `name`, `status`, and `created_at`
2. Find the document you just inserted

## Check Scripts

Run checks after completing each stage:

| Stage | Command | What it validates |
|-------|---------|-------------------|
| Environment | `npm run check:env` | MongoDB connection + empty collection + skeleton file |
| Stage 1 | `npm run check:insert` | Document inserted with correct fields and auto-generated `_id` |
| Stage 2 | `npm run check:find` | Document retrieved and fields match inserted values |
| Stage 3 | `npm run check:reflection` | `NOTES.md` exists with two conceptual explanations |
| All Stages | `npm run check:all` | Runs all checks in order |

## Running Your Script

After implementing the code in `src/run.js`, run it with:
```bash
npm start
```
or
```bash
node src/run.js
```

Expected output:
```
Inserted document id: <ObjectId>
Found document: {
  "_id": "<ObjectId>",
  "name": "test-item",
  "status": "active",
  "created_at": "<ISO date string>"
}
```

## Resetting the Lab

To drop all data and start over:
```bash
npm run reset
```

## Stopping MongoDB

When done, stop the MongoDB container:
```bash
docker-compose down
```

To also remove the data volume:
```bash
docker-compose down -v
```

## Key Concepts

| Term | Definition |
|------|-----------|
| **Document** | A JSON-like object in MongoDB (equivalent to a SQL row, but with flexible fields) |
| **Collection** | A group of documents (equivalent to a SQL table, but no fixed schema) |
| **`insertOne()`** | Insert a single document; MongoDB auto-assigns a unique `_id` |
| **`findOne()`** | Retrieve the first document matching a query filter |
| **Query filter** | A JSON object that specifies which fields to match, e.g., `{ name: "test-item" }` |
| **`_id`** | MongoDB's unique identifier, auto-assigned to every document |

## Learning Objectives

By completing this lab, you will:

1. Insert a document into MongoDB using `insertOne()` without defining a schema first
2. Retrieve the document using `findOne()` with a query filter
3. Understand that MongoDB auto-assigns a unique `_id` field
4. Articulate the conceptual difference between MongoDB documents and SQL rows
