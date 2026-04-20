# Technical Spec: Building an App with Code Agents — Beyond the SQL Mental Model

## Application Context

**App:** A customer support ticketing system called **SupportDesk**.

**Core entities:**
- `users` — customers and support agents
- `tickets` — support requests with status, priority, and category
- `comments` — threaded replies on tickets
- `products` — product catalog that tickets reference
- `knowledge_articles` — internal KB articles used for agent assistance

**Primary access patterns:**
- Fetch a ticket with its comments and assigned agent in one read
- List open tickets by priority for a given user or product
- Full-text and semantic search over knowledge articles
- Write a new comment and update ticket status atomically

**SQL schema (starting state):**
```
users(id, name, email, role)
tickets(id, user_id, product_id, status, priority, category, created_at)
comments(id, ticket_id, author_id, body, created_at)
products(id, name, description)
knowledge_articles(id, title, body, tags, created_at)
```

---

## Environment Setup

Before starting Stage 1, run the **Environment Check** to confirm everything is working:

1. Open the agent panel and run: **Test Suite Runner** → `run baseline`
2. Confirm the SQL baseline passes: **Baseline Flow Checker** → `check sql baseline`
3. Confirm MongoDB is reachable: **Mongo Explorer** → `list collections`
4. Confirm all agent skills are available in the panel: Schema Design, Query Optimizer, AI Integrator, Test Suite Runner, Baseline Flow Checker, Mongo Explorer

**Expected output:**
```
✓ SQL baseline: PASS
✓ MongoDB connection: PASS
✓ Collections found: users, tickets, comments, products, knowledge_articles
✓ Agent skills: all available
```

If any check fails, do not proceed. Record the error and contact lab support.

---

## MongoDB Concepts Covered

| Concept | Introduced in |
|---|---|
| Documents and collections | Stage 1 |
| Embedding vs referencing | Stage 1 |
| Schema design tradeoffs | Stage 1 |
| Indexes (single field, compound) | Stage 1 |
| MQL queries and filters | Stage 2 |
| Aggregation pipelines | Stage 2 |
| `$lookup` for normalized joins | Stage 2 |
| Write amplification tradeoffs | Stage 2 |
| Vector indexes | Stage 3 |
| Auto-embeddings | Stage 3 |
| Semantic search (`$vectorSearch`) | Stage 3 |
| Explain plans and query logging | Stage 4 |
| MongoDB MCP Server | All stages |
| MongoDB Agent Skills | All stages |

---

## Stage 1: Design and Refine the MongoDB Data Model

### Goal
Produce a MongoDB schema that better fits SupportDesk's access patterns than the migrated SQL structure.

### Starting state
MongoDB already contains the migrated SQL data as flat documents (one collection per SQL table, no embedding). This is intentional — learners refine from here.

### Agent skill interactions

**Step 1 — Inspect the current state**

Prompt **Mongo Explorer**:
```
Show me the first 3 documents in the tickets collection and list all field names present.
```
Expected output: flat ticket documents with foreign key fields (`user_id`, `product_id`) but no embedded user or product data.

**Step 2 — Compare SQL vs MongoDB representation**

Prompt **MongoDB Schema Design**:
```
I have a SQL schema with these tables: users, tickets, comments, products, knowledge_articles.
The primary read pattern is: fetch a ticket with its comments and the assigned agent's name in one read.
The primary write pattern is: add a comment and update ticket status atomically.
Show me two alternative MongoDB schemas — one more embedded, one more normalized — with pros and cons for each.
```

Expected output: two schema proposals with document shape examples, index recommendations, and a pros/cons summary per option.

**Step 3 — Choose a schema and capture it**

Learner selects a schema (or hybrid) and writes it to `schema/supportdesk-schema.yaml`.

Example of a valid embedded schema for the `tickets` collection:
```yaml
collection: tickets
document_shape:
  _id: ObjectId
  status: string           # open | in_progress | resolved | closed
  priority: string         # low | medium | high | urgent
  category: string
  created_at: date
  user:
    _id: ObjectId
    name: string
    email: string
  product:
    _id: ObjectId
    name: string
  comments:
    - _id: ObjectId
      body: string
      created_at: date
      author:
        _id: ObjectId
        name: string
        role: string        # customer | agent
indexes:
  - { status: 1, priority: -1 }
  - { "user._id": 1, status: 1 }
  - { "product._id": 1 }
  - { created_at: -1 }
```

**Step 4 — Write SCHEMA_NOTES.md**

Required fields (minimum 150 words):
```
## Schema Decision

**Option chosen:** [embedded / normalized / hybrid]

**Why:** [2-3 sentences on access pattern fit]

**Read patterns this supports:** [list]

**Write patterns and tradeoffs:** [list]

**What I would worry about in 6 months:** [1-2 sentences]
```

### Milestone check
```bash
npm run check:schema
```
Expected output:
```
✓ schema/supportdesk-schema.yaml: valid
✓ SCHEMA_NOTES.md: exists, minimum length met
✓ Tradeoff summary acknowledged
```

### Maximum iterations
If the schema lint fails after 3 attempts, record the error in SCHEMA_NOTES.md and proceed.

---

## Stage 2: Optimize Queries for MongoDB

### Goal
Replace SQL-style data access with MongoDB queries and aggregation pipelines across all core paths.

### Core data access paths

| Path | SQL equivalent | MongoDB target |
|---|---|---|
| Fetch ticket + comments + agent | 2-3 JOINs | Single `find()` on embedded doc |
| List open tickets by priority | `WHERE status='open' ORDER BY priority` | `find()` with compound index |
| Add a comment + update status | 2 separate `INSERT` + `UPDATE` | Single `updateOne` with `$push` + `$set` |
| Search tickets by category and user | `WHERE user_id=X AND category=Y` | `find()` with compound index |

### Agent skill interactions

**Step 1 — Get implementation options per path**

Prompt **MongoDB Query Optimizer** for each path:
```
For SupportDesk's tickets collection (with embedded comments and user), give me two implementations
for [path name]:
Option A: using the embedded document structure
Option B: using $lookup if comments were in a separate collection
Include the MQL code and summarize pros and cons of each in terms of query simplicity,
write complexity, and future schema evolution.
```

**Step 2 — Implement chosen options**

For each path, implement in `src/dal/tickets.js` (or equivalent DAL file).

Example — fetch ticket with embedded comments:
```javascript
// Option A — embedded (recommended for primary read path)
async function getTicketById(ticketId) {
  return db.collection('tickets').findOne(
    { _id: new ObjectId(ticketId) },
    { projection: { comments: 1, user: 1, status: 1, priority: 1 } }
  );
}
```

Example — list open tickets by priority:
```javascript
async function getOpenTicketsByPriority(userId) {
  return db.collection('tickets')
    .find({ "user._id": new ObjectId(userId), status: "open" })
    .sort({ priority: -1, created_at: -1 })
    .toArray();
}
```

**Step 3 — Run tests after each path**

After implementing each path, run **Test Suite Runner** → `run unit tests`.

If tests fail, prompt **MongoDB Query Optimizer**:
```
The test [test name] is failing with [error]. Here is my current implementation: [paste code].
What is wrong and how do I fix it?
```

Maximum 3 fix attempts per path. If still failing, record in DAL_NOTES.md and proceed.

**Step 4 — Write DAL_NOTES.md**

Required fields per path:
```
## [Path Name]
**Option chosen:** [A / B / hybrid]
**Why:** [1-2 sentences]
**Tradeoff accepted:** [e.g., more write amplification when comments are added]
```

### Milestone check
```bash
npm run check:dal
```
Expected output:
```
✓ Unit tests (MongoDB paths): PASS
✓ SQL client usage in core path: NONE DETECTED
✓ DAL_NOTES.md: exists, all 4 paths documented
```

---

## Stage 3: Implement Vector Search and AI Assistance

### Goal
Add semantic search over `knowledge_articles` using MongoDB vector indexes and auto-embeddings.

### What is a vector index?
A vector index stores mathematical representations (embeddings) of text so MongoDB can find documents by semantic similarity rather than exact keyword match. This is stored directly alongside your documents — no separate vector database needed.

### What are auto-embeddings?
Auto-embeddings automatically generate and store an embedding field on a document when it is inserted or updated, using a hosted model. In this lab, a mocked embedding model is provided.

### Agent skill interactions

**Step 1 — Create the vector index**

Prompt **AI Integrator**:
```
I want to add semantic search to the knowledge_articles collection in MongoDB.
Create a vector index on the embedding field using cosine similarity with 1536 dimensions.
Show me the index definition and the MongoDB shell command to create it.
```

Expected index definition:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "title": { "type": "string" },
      "tags": { "type": "string" }
    }
  }
}
```

**Step 2 — Generate embedding code**

Prompt **AI Integrator**:
```
Generate a Node.js function that:
1. Takes a knowledge_articles document body as input
2. Calls the mocked embedding endpoint at http://localhost:3001/embed
3. Returns the embedding array
4. Stores the embedding back on the document in MongoDB using updateOne
```

**Step 3 — Implement the semantic search endpoint**

Add to `src/routes/search.js`:
```javascript
// GET /search/articles?q=password+reset
async function semanticSearch(query) {
  const embedding = await generateEmbedding(query);
  return db.collection('knowledge_articles').aggregate([
    {
      $search: {
        knnBeta: {
          vector: embedding,
          path: "embedding",
          k: 5
        }
      }
    },
    { $project: { title: 1, body: 1, score: { $meta: "searchScore" } } }
  ]).toArray();
}
```

**Step 4 — Run validation script**
```bash
npm run check:vector
```
Expected output:
```
✓ Vector index: exists, cosine, 1536 dimensions
✓ Sample query "password reset": 1 result above similarity threshold (0.85)
✓ Endpoint GET /search/articles: responds 200
```

### Conflict resolution
If **AI Integrator** and **MongoDB Schema Design** give conflicting advice on embedding storage (inline vs separate collection), default to **inline embedding on the document** and record the tradeoff in DAL_NOTES.md.

---

## Stage 4: Observability and Wrap-Up

### Goal
Add minimal observability and validate the full app runs on MongoDB with SQL disabled.

### Logging requirements

Add structured logging to each DAL function:
```javascript
console.log(JSON.stringify({
  event: "db_query",
  collection: "tickets",
  operation: "findOne",
  duration_ms: elapsed,
  success: true
}));
```

### Optional: explain plan snapshot

Prompt **MongoDB Query Optimizer**:
```
Run an explain plan on the getOpenTicketsByPriority query and tell me if the compound index
{ "user._id": 1, status: 1 } is being used.
```

### Final validation
```bash
npm run check:final
```
Expected output:
```
✓ Collections: tickets, users, comments, products, knowledge_articles
✓ Indexes: all expected indexes present
✓ Document counts: tickets > 0, knowledge_articles > 0
✓ Happy path: create ticket → add comment → search articles → PASS
✓ SQL client: DISABLED
```

### Reflection prompt (write to REFLECTION.md, minimum 200 words)

Answer all three:
1. **Agent acceptance vs override** — List two suggestions from an agent skill you accepted and one you overrode. Why did you override it?
2. **Schema and DAL tradeoffs** — What is the biggest tradeoff in your final schema? What would break first under load?
3. **Production monitoring** — List three things you would monitor if SupportDesk ran on MongoDB in production.

### Reflection validation
```bash
npm run check:reflection
```
Expected output:
```
✓ REFLECTION.md: exists, minimum length met, all 3 sections present
```

---

## File Checklist

| File | Created in | Required |
|---|---|---|
| `schema/supportdesk-schema.yaml` | Stage 1 | ✓ |
| `SCHEMA_NOTES.md` | Stage 1 | ✓ |
| `src/dal/tickets.js` | Stage 2 | ✓ |
| `DAL_NOTES.md` | Stage 2 | ✓ |
| `src/routes/search.js` | Stage 3 | ✓ |
| `REFLECTION.md` | Stage 4 | ✓ |

---

## Glossary

| Term | Definition |
|---|---|
| **Document** | A JSON-like record in MongoDB, equivalent to a SQL row but with flexible nested structure |
| **Collection** | A group of documents, loosely equivalent to a SQL table |
| **Embedding** | A numeric array representing the semantic meaning of text, used for similarity search |
| **Vector index** | A special MongoDB index that enables similarity search over embedding fields |
| **Aggregation pipeline** | A sequence of stages that transform documents, equivalent to complex SQL queries with JOINs, GROUP BY, etc. |
| **$lookup** | An aggregation stage that joins documents from another collection, similar to SQL JOIN |
| **Write amplification** | When a single logical write (e.g., add a comment) requires updating multiple fields or documents |
| **MCP Server** | MongoDB Control Plane Server — exposes MongoDB operations as callable tools for AI agents |
| **Agent Skills** | Pre-built, task-specific agent prompts and tools from the MongoDB Agent Skills repo |