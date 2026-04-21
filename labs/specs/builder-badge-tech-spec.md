---
source_outline: builder-badge-outline.md
generator: lab-outline-converter
date: 2026-04-21
target_task: Use code agents to design, optimize, and extend a MongoDB application beyond the SQL mental model
audience: external AI agent, no prior MongoDB knowledge
---

# Technical Spec: Building an App with Code Agents — Beyond the SQL Mental Model

## Target Agent Task or Capability

Design, implement, and optimize a MongoDB-backed application that transitions from SQL to document-oriented patterns. The agent will use code agents (MongoDB Schema Design, Query Optimizer, AI Integrator) to create a schema that passes all validation checks, optimize data access paths, add vector search capabilities, and document all decisions in a production-ready artifact.

## Learning Objectives

After completing this lab, the agent will:

- **Understand MongoDB's advantages** for AI-assisted development compared to SQL (embedding, atomic multi-field updates, flexible schema evolution)
- **Design a MongoDB schema** that aligns with application access patterns, choosing between embedding and referencing with explicit tradeoff documentation
- **Optimize data access paths** by replacing SQL joins with aggregation pipelines or embedded documents, validated by passing unit tests
- **Implement vector search** on MongoDB collections using native vector indexes and semantic similarity queries
- **Use MongoDB Agent Skills** (via MCP Server) to inform design decisions while maintaining critical review and override discipline
- **Document agent interactions** by recording which suggestions were accepted, overridden, and why—building disciplined AI-assisted development habits

---

## Application Context

**App:** SupportDesk — a customer support ticketing system.

**Core entities:**
- `users` — customers and support agents
- `tickets` — support requests with status, priority, category, timestamps
- `comments` — threaded replies on tickets
- `products` — product catalog that tickets reference
- `knowledge_articles` — internal KB articles used for semantic search and agent assistance

**Primary read access patterns:**
1. Fetch a ticket with all its comments and assigned agent's name in one read
2. List open/unresolved tickets by priority for a given user or product
3. Search knowledge articles by semantic similarity (e.g., "password reset" finds relevant articles)
4. Find tickets and comments by category and user with sorting

**Primary write access patterns:**
1. Add a new comment to a ticket and update ticket status atomically
2. Create a new ticket with user and product references
3. Update ticket priority/status with timestamp
4. Bulk ingest knowledge articles with auto-generated embeddings

**Starting state:** MongoDB contains flat, SQL-migrated documents:
- One collection per SQL table (no embedding yet)
- Foreign keys stored as plain fields (user_id, product_id, ticket_id)
- No compound indexes
- No embedding field on knowledge_articles
- No vector indexes

This is intentionally the wrong shape. The agent's job is to improve it.

---

## MongoDB Concepts Covered

| Concept | Introduced in | Stage |
|---|---|---|
| Documents and collections | Stage 1 | "Design and Refine the MongoDB Data Model" |
| Embedding vs. referencing tradeoff | Stage 1 | "Design and Refine the MongoDB Data Model" |
| Schema design for access patterns | Stage 1 | "Design and Refine the MongoDB Data Model" |
| Compound indexes | Stage 1 | "Design and Refine the MongoDB Data Model" |
| MQL queries and filters | Stage 2 | "Optimize Queries for MongoDB" |
| Aggregation pipelines | Stage 2 | "Optimize Queries for MongoDB" |
| $lookup for normalized joins | Stage 2 | "Optimize Queries for MongoDB" |
| Write amplification tradeoff | Stage 2 | "Optimize Queries for MongoDB" |
| Vector indexes | Stage 3 | "Implement Vector Search and AI Assistance" |
| Auto-embeddings (via hosted/mocked model) | Stage 3 | "Implement Vector Search and AI Assistance" |
| Semantic search ($vectorSearch stage) | Stage 3 | "Implement Vector Search and AI Assistance" |
| Explain plans and query logging | Stage 4 | "Observability and Wrap-Up" |
| MongoDB MCP Server | All stages | Exposed as agent skills |
| MongoDB Agent Skills | All stages | Schema Design, Query Optimizer, AI Integrator |

---

## Environment Requirements

- **Platform:** VS Code hosted IDE (Instruqt) or local VS Code with Node.js
- **Pre-installed tools:** Node.js 18+, npm, MongoDB CLI (mongosh), curl
- **Running services:**
  - MongoDB: `mongodb://localhost:27017` (or Atlas connection)
  - Mock embedding server: `http://localhost:3001` (optional, for Stage 3)
  - App server: `http://localhost:3000` (optional, for testing search endpoint)
- **File system layout:**
  ```
  lab-execution/
    .env                          # connection strings (copy from .env.example)
    schema/
      supportdesk-schema.yaml     # agent creates this in Stage 1
      vector-index.json           # agent creates this in Stage 3
    src/
      dal/                         # data access layer (agent creates in Stage 2)
        tickets.js
      routes/
        search.js                  # semantic search endpoint (agent creates in Stage 3)
    scripts/
      seed.js                      # pre-run to load flat SQL-migrated data
      check-env.js
      check-schema.js
      check-dal.js
      check-vector.js
      check-final.js
      check-reflection.js
    SCHEMA_NOTES.md               # agent creates in Stage 1
    DAL_NOTES.md                  # agent creates in Stage 2
    REFLECTION.md                 # agent creates in Stage 4
  ```

---

## Seed Data

**Collections to seed** (run before Stage 1 begins):
- `users` — 5 documents (3 customers, 2 support agents)
- `products` — 3 documents (Core, Mobile, API)
- `tickets` — 5 documents (flat structure: user_id, product_id, no embedded user/product)
- `comments` — 5 documents (flat structure: ticket_id, author_id, no embedding)
- `knowledge_articles` — 6 documents (flat: title, body, tags; no embedding field yet)

**Starting state — intentionally wrong:**
- Tickets have foreign key fields (user_id, product_id) but NOT embedded user/product objects
- Comments are in a separate collection, not embedded in tickets
- Knowledge articles have NO embedding field (agent adds in Stage 3)
- NO compound indexes yet (agent creates in Stage 1)

**Sample seed reference:**
```bash
npm run seed          # seed with defaults
npm run seed:fresh    # drop all collections, then seed
```

---

## Stage 1: Design and Refine the MongoDB Data Model

### Goal
Produce a MongoDB schema that aligns with SupportDesk's access patterns and reduces query complexity compared to the flat SQL-migrated starting state.

### Starting State
- MongoDB contains 5 flat collections (users, tickets, comments, products, knowledge_articles)
- Tickets reference users and products by ID only (no embedding)
- Comments are separate (not embedded in tickets)
- No indexes except the default _id index
- Agent skills available: **Mongo Explorer**, **MongoDB Schema Design**

### Agent Skill Interactions

**Interaction 1: Inspect current state**

Prompt **Mongo Explorer**:
```
Show me the first 3 documents in the tickets collection and list all field names.
Also show one comment document. Are user and product data embedded, or only referenced by ID?
```

Expected output: Sample documents confirming flat structure with foreign key fields.

---

**Interaction 2: Propose alternative schemas**

Prompt **MongoDB Schema Design**:
```
I have these collections: users, tickets, comments, products, knowledge_articles.
The primary read pattern is: fetch a ticket with its comments and assigned agent's name in ONE read.
The primary write pattern is: add a comment and update ticket status atomically.

Propose TWO alternative MongoDB schemas:
- Option A: more embedded (comments embedded in tickets, user object embedded)
- Option B: more normalized (tickets reference comments, use aggregation pipeline with $lookup)

For each option, show:
1. Example document shape
2. Key indexes needed
3. Pros and cons for the two access patterns above
```

Expected output: Two detailed schema proposals with document shapes, index definitions, and tradeoff analysis.

---

**Interaction 3: Implement chosen schema**

After the agent reviews both options, learner task:
- Choose Option A, B, or a hybrid
- Create `schema/supportdesk-schema.yaml` with:
  - Collection name
  - Document shape (all fields with types and descriptions)
  - Indexes (at least 3-4 for the core access patterns)

Example valid schema (embedded approach):
```yaml
collections:
  tickets:
    document_shape:
      _id: ObjectId
      status: string                # open | in_progress | resolved | closed
      priority: string              # low | medium | high | urgent
      category: string              # access | billing | bug | feature_request
      created_at: date
      user:
        _id: ObjectId
        name: string
        email: string
        role: string                # customer | agent
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
            role: string
    indexes:
      - { status: 1, priority: -1 }
      - { "user._id": 1, status: 1 }
      - { "product._id": 1 }
      - { created_at: -1 }
```

---

### Output Files

**File 1: `schema/supportdesk-schema.yaml`**
- Required fields: collections, document_shape (for each collection), indexes
- Minimum length: YAML that validates and describes at least the tickets collection with all access patterns covered
- Validated by: `npm run check:schema` (YAML syntax + required key presence)

**File 2: `SCHEMA_NOTES.md`**
- Required sections:
  - **Option Chosen:** (embedded | normalized | hybrid) — 1 sentence
  - **Why:** 2-3 sentences on access pattern fit
  - **Read Patterns Supported:** bullet list
  - **Write Patterns and Tradeoffs:** bullet list (e.g., "trade write amplification when comments are added for faster reads")
  - **What I Would Worry About in 6 Months:** 1-2 sentences on scalability/evolution risk
- Minimum length: 150 words
- Validated by: `npm run check:schema` (file exists, word count, required sections)

---

### Milestone Check

```bash
npm run check:schema
```

**Expected output:**
```
✓ schema/supportdesk-schema.yaml: valid
✓ Indexes: at least 3 compound indexes present
✓ SCHEMA_NOTES.md: exists, 187 words, all required sections present
✓ Tradeoff summary: acknowledged

Stage 1: PASS
```

---

### Maximum Iterations

If `npm run check:schema` fails:
- **After attempt 1:** Review error message and retry
- **After attempt 2:** Ask **MongoDB Schema Design** for help fixing the specific error
- **After attempt 3:** Record the error in SCHEMA_NOTES.md and proceed to Stage 2

---

## Stage 2: Optimize Queries for MongoDB

### Goal
Replace SQL-style data access patterns with MongoDB-native queries (MQL + aggregation pipelines) that leverage the refined schema from Stage 1.

### Starting State
- MongoDB has the refined schema from Stage 1 (embedded or hybrid)
- `src/` directory does not exist yet (agent creates it)
- Agent skills available: **MongoDB Query Optimizer**, **Test Suite Runner**
- Existing test suite expects MongoDB (SQL client is disabled)

### Core Data Access Paths

| Path Name | SQL Equivalent | MongoDB Target |
|---|---|---|
| Fetch ticket + comments + agent | 2-3 JOINs | Single find() on embedded doc |
| List open tickets by priority | WHERE + ORDER BY | find() + sort() with compound index |
| Add comment + update status | 2 separate INSERT + UPDATE | Single updateOne() with $push + $set |
| Search tickets by category + user | WHERE user_id=X AND category=Y | find() with compound index |

---

### Agent Skill Interactions

**Interaction 1: Get query implementations for first path**

Prompt **MongoDB Query Optimizer**:
```
For SupportDesk's tickets collection (schema from Stage 1), give me TWO implementations of:
"Fetch a ticket by ID, including all comments and the agent's name"

Option A: Leveraging your embedded schema (comments + user embedded in ticket)
Option B: Using $lookup if comments were normalized in a separate collection

For each, show:
1. The MQL query code
2. Pros/cons for query simplicity, write complexity, future evolution
```

Expected output: Two code samples with tradeoff summaries.

---

**Interaction 2: Implement all 4 paths**

For each of the 4 core paths, repeat the pattern:
- Ask **MongoDB Query Optimizer** for 2 options
- Implement the chosen option in `src/dal/tickets.js` (or equivalent DAL file)
- Run tests via **Test Suite Runner** after each implementation
- Record the choice in `DAL_NOTES.md`

Example implementation (fetching ticket with comments):
```javascript
// Option A — embedded (recommended for primary read path)
async function getTicketById(ticketId) {
  const { ObjectId } = require('mongodb');
  return db.collection('tickets').findOne(
    { _id: new ObjectId(ticketId) },
    { projection: { comments: 1, user: 1, status: 1, priority: 1 } }
  );
}
```

---

**Interaction 3: Run tests after each path**

After implementing each path:
```bash
npm run test
```

If tests fail, prompt **MongoDB Query Optimizer**:
```
The test [test-name] is failing with: [error message]
Here is my current implementation: [paste code]
What is wrong and how do I fix it?
```

---

### Output Files

**File 1: `src/dal/tickets.js`**
- Required: Implementations of all 4 core access paths (functions with names or comments like `getTicketById`, `getOpenTickets`, `addComment`, `searchTickets`)
- Minimum length: At least 100 lines of functional code
- Validated by: `npm run check:dal` (function detection + unit test execution)

**File 2: `DAL_NOTES.md`**
- Required sections per path:
  ```
  ## [Path Name]
  **Option Chosen:** [A | B | hybrid]
  **Why:** [1-2 sentences]
  **Tradeoff Accepted:** [e.g., more write amplification when comments are added]
  ```
- Minimum length: All 4 paths documented, min 100 words total
- Validated by: `npm run check:dal` (file exists, all paths present, word count)

---

### Milestone Check

```bash
npm run check:dal
```

**Expected output:**
```
✓ Unit tests (MongoDB paths): PASS
✓ SQL client usage in core path: NONE DETECTED
✓ src/dal/tickets.js: exists with all 4 access path implementations
✓ DAL_NOTES.md: exists, all 4 paths documented, 145 words

Stage 2: PASS
```

---

### Maximum Iterations

If tests fail:
- **After attempt 1:** Review test output and retry
- **After attempt 2:** Ask **MongoDB Query Optimizer** for debugging help
- **After attempt 3:** Record the failure in DAL_NOTES.md and proceed to Stage 3

---

## Stage 3: Implement Vector Search and AI Assistance

### Goal
Add semantic search to SupportDesk by implementing MongoDB vector indexes and auto-embeddings on the knowledge_articles collection.

### Starting State
- MongoDB has the optimized schema from Stage 2
- `src/routes/` directory does not exist yet (agent creates it)
- Agent skills available: **AI Integrator**
- Mock embedding server available on `http://localhost:3001` (or can be started)

### What is a Vector Index?

A **vector index** stores mathematical representations of text (embeddings) so MongoDB can find documents by semantic similarity. Example: a query like "password reset" will find articles about account recovery even if those exact words don't appear.

### What are Auto-Embeddings?

**Auto-embeddings** automatically generate and store an embedding when a document is inserted/updated, using a hosted or mocked model. In this lab, a deterministic mock is provided.

---

### Agent Skill Interactions

**Interaction 1: Create the vector index**

Prompt **AI Integrator**:
```
I want to add semantic search to the knowledge_articles collection in MongoDB.
Create a vector index definition for cosine similarity with 1536 dimensions on the embedding field.
Show me:
1. The index definition (JSON)
2. The MongoDB shell command to create it
```

Expected output: Vector index JSON definition and mongosh command.

---

**Interaction 2: Generate embedding code**

Prompt **AI Integrator**:
```
Generate a Node.js function that:
1. Takes a string (article title + body) as input
2. Calls the mocked embedding endpoint at http://localhost:3001/embed
3. Returns the embedding array (should be 1536 dimensions)
4. Stores it on the knowledge_articles document via updateOne
```

Expected output: JavaScript function that integrates with MongoDB.

---

**Interaction 3: Implement semantic search endpoint**

Create `src/routes/search.js` with a semantic search endpoint:

```javascript
// GET /search/articles?q=password+reset
async function semanticSearch(query) {
  const embedding = await generateEmbedding(query);  // from Interaction 2
  return db.collection('knowledge_articles').aggregate([
    {
      $search: {
        cosmineSearch: {   // or knnBeta for older Atlas
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

---

### Output Files

**File 1: `schema/vector-index.json`**
- Required: Valid MongoDB vector index definition with mappings.fields.embedding (dimensions: 1536, similarity: cosine)
- Minimum length: Complete index definition
- Validated by: `npm run check:vector` (JSON syntax + field validation)

**File 2: `src/routes/search.js`**
- Required: GET /search/articles endpoint that calls semantic search using $search/$vectorSearch aggregation stage
- Minimum length: At least 50 lines of functional code
- Validated by: `npm run check:vector` (file exists, endpoint returns 200)

---

### Milestone Check

```bash
npm run check:vector
```

**Expected output:**
```
✓ Vector index: exists, cosine, 1536 dimensions
✓ knowledge_articles documents: embedding field present on 6/6 samples
✓ Sample query "password reset": embedding returned (1536 dims)
✓ Mock embed server: reachable at http://localhost:3001
✓ Endpoint GET /search/articles: responds 200

Stage 3: PASS
```

---

### Maximum Iterations

If the check fails:
- **After attempt 1:** Review error and retry
- **After attempt 2:** Ask **AI Integrator** for help with the specific error
- **After attempt 3:** Record the failure in REFLECTION.md and proceed to Stage 4

---

## Stage 4: Observability and Wrap-Up

### Goal
Add minimal observability, validate the full app runs on MongoDB with SQL disabled, and reflect on agent interaction patterns and design tradeoffs.

### Starting State
- MongoDB has the full optimized schema, queries, and vector search from Stages 1-3
- Agent skills available: **Test Suite Runner**

### Logging Requirements

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

---

### Optional: Explain Plan Snapshot

Prompt **MongoDB Query Optimizer**:
```
Run an explain plan on the getOpenTicketsByPriority query.
Is the compound index { "user._id": 1, status: 1 } being used?
```

---

### Output Files

**File 1: Logging in `src/dal/tickets.js`**
- Required: At least one console.log with event: "db_query" in any DAL function
- Validated by: `npm run check:logging` (grep for "db_query")

**File 2: `REFLECTION.md`**
- Required sections:
  1. **Agent Acceptance vs Override:** List 2+ suggestions you accepted and 1 you overrode, with reasoning
  2. **Schema and DAL Tradeoffs:** What is the biggest tradeoff in your final design? What would break first under load?
  3. **Production Monitoring:** List 3+ things you would monitor if SupportDesk ran on MongoDB in production
- Minimum length: 200 words total, all 3 sections substantive
- Validated by: `npm run check:reflection` (file exists, word count, sections present)

---

### Final Validation

```bash
npm run check:final
```

**Expected output:**
```
✓ Collections: users, tickets, comments, products, knowledge_articles
✓ Indexes: all expected compound indexes present
✓ Document counts: tickets > 0, knowledge_articles > 0, comments > 0
✓ Happy path: create ticket → add comment → fetch → search articles → PASS
✓ SQL client: DISABLED
✓ Logging: "db_query" events present in DAL

Stage 4: PASS
```

Then run all checks:
```bash
npm run check:all
```

---

### Maximum Iterations

If final checks fail:
- **After attempt 1:** Review errors and fix
- **After attempt 2:** Ask for debugging help (no agent interaction required; reference agent notes from earlier stages)
- **After attempt 3:** Record errors in REFLECTION.md and submit

---

## File Checklist

| File | Created in | Required |
|---|---|---|
| `schema/supportdesk-schema.yaml` | Stage 1 | ✓ |
| `SCHEMA_NOTES.md` | Stage 1 | ✓ |
| `src/dal/tickets.js` | Stage 2 | ✓ |
| `DAL_NOTES.md` | Stage 2 | ✓ |
| `schema/vector-index.json` | Stage 3 | ✓ |
| `src/routes/search.js` | Stage 3 | ✓ |
| `REFLECTION.md` | Stage 4 | ✓ |
| `.env` | Before Stage 1 | ✓ (copy from .env.example) |

---

## Glossary

| Term | MongoDB Definition | SQL Equivalent |
|---|---|---|
| **Document** | A JSON-like record with flexible fields; the fundamental unit of data in MongoDB | SQL row (but with nested structure support) |
| **Collection** | A group of documents; roughly equivalent to a table but with flexible schemas | SQL table |
| **Embedding** | A numeric array (e.g., 1536 dimensions) representing the semantic meaning of text; used for similarity search | Not directly supported; would require a separate vector database |
| **Vector Index** | A special MongoDB index that enables fast similarity search over embedding fields | Not available in SQL; requires external vector DB |
| **Compound Index** | An index on 2+ fields, speeding up queries that filter/sort on those fields together | Multi-column index |
| **MQL** | MongoDB Query Language — the syntax for querying documents (e.g., `{status: "open"}`) | SQL SELECT WHERE |
| **Aggregation Pipeline** | A sequence of stages that transform documents (e.g., $match, $group, $sort) | Complex SQL query with GROUP BY, JOIN, ORDER BY |
| **$lookup** | An aggregation stage that joins documents from another collection | SQL JOIN |
| **$match** | An aggregation stage that filters documents by criteria | SQL WHERE |
| **$project** | An aggregation stage that selects/reshapes fields | SQL SELECT |
| **$vectorSearch** | An aggregation stage that finds documents by embedding similarity | Not available in SQL |
| **Atomic Update** | A single operation (e.g., $push + $set) that updates multiple fields without intermediate states | SQL transaction (more complex in SQL) |
| **Write Amplification** | When a single logical write (e.g., add comment) requires updating multiple document fields or documents | Normalized schema with many JOINs on write |
| **Embedding vs Referencing** | Design choice: embed sub-documents vs store references (IDs) to separate documents | Normalization vs denormalization in SQL |

---

## What You Learned

By completing this lab, you gained hands-on experience with:

1. **Schema Design for Access Patterns** — choosing between embedding and referencing based on read/write frequency
2. **MongoDB's Document Model** — how to represent relationships within a single document vs across collections
3. **Atomic Multi-Field Updates** — using `$push` and `$set` together to modify documents consistently
4. **Aggregation Pipelines** — building complex queries without joins, using `$match`, `$lookup`, `$group`, `$sort`
5. **Compound Indexes** — optimizing queries that filter/sort on multiple fields
6. **Vector Search** — semantic similarity search using embeddings and cosine distance
7. **MongoDB MCP Server and Agent Skills** — integrating MongoDB capabilities into an agent-assisted workflow
8. **Design Tradeoff Documentation** — recording why you made specific choices so future developers understand constraints and can evolve the schema

These concepts apply to any MongoDB application and form the foundation for evolving apps with AI agents that understand data modeling and query optimization.
| **Agent Skills** | Pre-built, task-specific agent prompts and tools from the MongoDB Agent Skills repo |