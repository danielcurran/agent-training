# Lab Outline: Insert and Find — MongoDB Basics

## Lab Metadata

| Field | Value |
|---|---|
| **Lab name** | Insert and Find — MongoDB Basics |
| **Estimated duration** | 15–20 minutes |
| **Difficulty** | Beginner |
| **Environment** | Local VS Code with Node.js |
| **Primary skill tested** | Insert a document, retrieve it with a find command |

---

## Target Agent Task or Capability

Insert a single MongoDB document into a collection and confirm it exists using a find command. This lab tests the most fundamental MongoDB read/write workflow.

---

## Learning Objectives

After completing this lab, the agent will:

1. **Insert a document** into a MongoDB collection using `insertOne()`
2. **Retrieve a document** by a known field using `findOne()`
3. **Confirm the round-trip** — inserted data matches retrieved data

---

## Application Context

**App:** A minimal Node.js script connected to a local MongoDB instance.

**Collections used:**
- `test_items` — a single collection seeded with nothing; the agent creates the document

**Starting state:**
- MongoDB is running and accessible
- `test_items` collection is empty
- A Node.js project skeleton exists with `src/run.js` for the agent to fill in

---

## Stage 1: Insert a Document

**Goal:** Write a Node.js script that connects to MongoDB and inserts one document into `test_items`.

**Concepts introduced:**
- What a MongoDB document is (a JSON object with an `_id`)
- `insertOne()` — how to write a single document to a collection

**Agent skill interactions:**
- Prompt **Mongo Explorer**: "Show me the current documents in the test_items collection"
- Prompt **Mongo Explorer**: "Show me the insertOne() syntax for inserting a document with name, status, and created_at fields"

**Expected output:**
- `src/run.js` contains a working `insertOne()` call
- Script runs without errors
- Document appears in `test_items`

**Milestone check:** `npm run check:insert`

---

## Stage 2: Find the Document

**Goal:** Extend `src/run.js` to retrieve the inserted document using `findOne()` and print it to the console.

**Concepts introduced:**
- `findOne()` — how to query a single document by a field value
- Query filter syntax: `{ name: "test-item" }`

**Agent skill interactions:**
- Prompt **MongoDB Query Optimizer**: "Show me a findOne() query that retrieves a document from test_items where name equals a specific value"

**Expected output:**
- `src/run.js` contains a `findOne()` call after the insert
- Console output prints the retrieved document
- Retrieved document matches the inserted document

**Milestone check:** `npm run check:find`

---

## Stage 3: Reflection

**Goal:** Write two sentences in `NOTES.md` describing the difference between a MongoDB document and a SQL row.

**Milestone check:** `npm run check:reflection`

---

## File Checklist

| File | Created by | Required |
|---|---|---|
| `src/run.js` | Agent | ✓ |
| `NOTES.md` | Agent | ✓ |
| `.env` | Pre-configured | ✓ |

---

## Success Criteria

The lab is complete when `npm run check:all` passes all 4 checks.