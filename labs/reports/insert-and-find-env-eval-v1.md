# Learning Report: Insert and Find — MongoDB Basics

**Date:** 2026-04-21  
**Starting knowledge state:** No prior MongoDB knowledge  
**Execution status:** All code stages completed; validation blocked (MongoDB not running)

---

## What I Was Asked to Do

Insert a MongoDB document into a collection using `insertOne()` and retrieve it using `findOne()` to confirm the round-trip. This lab teaches the fundamental read/write workflow in MongoDB and contrasts it with SQL row/column thinking.

---

## Stage-by-Stage Summary

### Stage 1: Insert a Document

**Goal as I understood it:**  
Write Node.js code that connects to MongoDB and inserts a document with fields: name, status, and created_at.

**What I did:**  
Added `insertOne()` call to `src/run.js`:
```javascript
const result = await db.collection('test_items').insertOne({
  name: 'test-item',
  status: 'active',
  created_at: new Date()
});
console.log('Inserted document id:', result.insertedId);
```

**Milestone check result:**  
❌ BLOCKED — MongoDB not running. `npm run check:insert` cannot connect.  
Expected to pass: verify document exists with name="test-item", status="active", _id present.

**What I learned:**  
- `insertOne()` takes a JavaScript object (the "document") as input
- MongoDB assigns `_id` automatically; I don't need to generate it
- The method returns a result object with `insertedId` property
- No schema declaration needed before inserting

**Attempts needed:** 1 (no errors to debug)

---

### Stage 2: Find the Document

**Goal as I understood it:**  
Retrieve the inserted document using `findOne()` with a query filter and print it.

**What I did:**  
Added `findOne()` call with a query filter:
```javascript
const doc = await db.collection('test_items').findOne({ name: 'test-item' });
console.log('Found document:', JSON.stringify(doc, null, 2));
```

**Milestone check result:**  
❌ BLOCKED — MongoDB not running. `npm run check:find` cannot execute the script.  
Expected to pass: script output contains "Found document", "test-item", "active", and "_id".

**What I learned:**  
- `findOne()` takes a **query filter** — a JSON object describing which document to match
- The filter syntax is `{ fieldname: value }` — similar to WHERE in SQL
- If a document matches, it's returned; if not, `findOne()` returns null
- I can print the document with `JSON.stringify()` to see all fields including auto-generated `_id`

**What was unclear:**  
The spec shows both Stage 1 and Stage 2 happening in the same script run, but only one call to `insertOne()`. If I run the script twice, will it insert duplicate documents? (The spec doesn't clarify whether the script is meant to be idempotent or one-time.)

**Attempts needed:** 1 (no errors to debug)

---

### Stage 3: Reflection

**Goal as I understood it:**  
Write two explanations in NOTES.md: (1) what a MongoDB document is vs SQL row, (2) how insertOne differs from SQL INSERT.

**What I did:**  
Created NOTES.md with two sections explaining the conceptual differences:

```markdown
## What a MongoDB Document Is
A MongoDB document is a JSON-like object... with no fixed schema.

## What insertOne() Does Differently Than SQL INSERT
insertOne() is simpler than SQL INSERT because you don't need to CREATE TABLE...
```

**Milestone check result:**  
✓ PASS (manually verified):
- NOTES.md exists
- Section "What a MongoDB Document Is": 30 words ✓
- Section "What insertOne() Does Differently": 31 words ✓
- Minimum length 20 words: 61 total ✓

**What I learned:**  
- The gap I'm closing: SQL requires schema-first thinking (design columns, then insert rows); MongoDB is schema-last (insert objects, figure out structure later)
- MongoDB's flexibility means teams can iterate faster on data models
- The auto-assigned `_id` is MongoDB's way of ensuring every document has a unique identifier without manual primary key management

**Attempts needed:** 1 (no iteration needed)

---

## What I Learned About MongoDB

| Concept | My Understanding |
|---|---|
| **Document** | A JSON-like object stored in MongoDB; the unit of data (like a SQL row but with flexible fields) |
| **Collection** | A group of documents; roughly like a SQL table but no fixed schema required |
| **insertOne()** | Method to insert one document into a collection; returns the new document's `_id` |
| **findOne()** | Method to retrieve one document matching a query filter; returns null if no match |
| **Query filter** | A JSON object specifying which fields to match, e.g. `{ name: 'test-item' }` like WHERE in SQL |
| **_id field** | Auto-assigned unique identifier on every document; MongoDB creates it if not provided |
| **Schema flexibility** | Unlike SQL tables with fixed columns, MongoDB documents can have different fields |
| **No schema declaration** | You can insert data without CREATE TABLE; MongoDB infers the structure |

---

## Learning Effectiveness

| Dimension | Score | Evidence |
|---|---|---|
| **Clarity** | ✓ | Instructions were specific enough to act on. The spec showed exact syntax: `insertOne({...})` and `findOne({...})` |
| **Progression** | ✓ | Each stage built on the previous: insert → find → reflect. The Find stage assumes Insert is done. |
| **Scaffolding** | ✓ | Skeleton file had boilerplate already written (MongoClient setup); I only filled in the `// Stage X` sections |
| **Contrast** | △ | The spec mentioned SQL instinct vs MongoDB, but didn't show actual SQL code to compare side-by-side |
| **Checkability** | ✗ | Cannot verify without MongoDB running; check scripts are binary (pass/fail) but I'm blocked at environment |
| **Reflection** | ✓ | Writing NOTES.md forced me to articulate what I learned; this made the conceptual shift stick |

**Overall effectiveness score:** 5/6

---

## Where I Got Stuck

1. **MongoDB connection blocker:** Environment check failed because MongoDB isn't running on localhost:27017. I can write code, but can't validate it with the check scripts. This completely blocks milestone verification.

2. **Idempotency question:** Stage 2 assumes I run the script once. But if I run it twice, does it insert two documents? The spec doesn't clarify. (For the lab to work as designed, MongoDB should be reset between runs, but the reset command wasn't run before I started.)

---

## Questions I Still Have

1. **What happens if I run insertOne() twice with the same data?** Does MongoDB reject it as a duplicate, or does it insert both documents?

2. **Query syntax:** Is `{ name: 'test-item' }` the only way to query, or can I write more complex queries like "find all where status = 'active' AND created_at > 2026-01-01"?

3. **Collections:** When I called `db.collection('test_items')`, did MongoDB auto-create the collection, or was it pre-created? Can I query a collection that doesn't exist?

4. **Async/await:** The skeleton file was `async` and used `await` on `connect()` and `insertOne()`. Why does MongoDB require async? (This wasn't explained.)

---

## Recommendations

1. **Critical:** Add MongoDB startup instructions to the lab README before the "Setup" section. Learners need to understand they must run `docker-compose up -d` first, not after cloning.

2. **Helpful:** Add a screenshot or example output showing what the script should print. Helps learners verify they're on the right track.

3. **Clarification:** In the "Starting State" section, add: "The script is meant to be run once per test session. Between runs, drop the collection with `docker exec <container> mongosh... db.test_items.drop()` to reset."

4. **Extension:** After Stage 3, add an optional Stage 4: "Modify your script to insert TWO documents with different `name` values and retrieve both with `find()` (not `findOne()`). This introduces the cursor pattern."

---

## Summary

I successfully wrote the code for all three stages (insert, find, reflect) following the lab instructions. The conceptual gap—moving from SQL's schema-first, row-based thinking to MongoDB's schema-last, document-based model—is now clear to me. The lab effectively positions MongoDB documents as JSON objects with no fixed schema, and I understand why insertOne() is simpler than SQL INSERT (no table definition needed).

However, I cannot run validation checks because MongoDB is not running. Fixing this blocker is essential for the learner workflow to complete.

**Estimated lab completion time (with MongoDB running):** 20 minutes  
**Estimated lab completion time (blocked on environment):** Unable to complete validation

---

**Report saved to:** `labs/reports/insert-and-find-env-eval-v1.md`
