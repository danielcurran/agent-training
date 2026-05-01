# ESR Indexing Strategy Lab — Technical Specification (v3 — SQL Bridging Transfer Prompt Test)

> **Controlled Test Variant.** This spec is identical to v2 except for one change: the transfer task prompt now explicitly requires the learner to name the SQL instinct, explain why it fails in MongoDB, and then state the ESR alternative. The lab environment and all stage content are unchanged from v2.
>
> **Hypothesis under test:** Is explicit multi-concept SQL bridging in the transfer prompt the active ingredient for Sense-Making ✓, or will learners produce it unprompted given lab materials alone?
>
> **Expected outcome if hypothesis holds:** Sense-Making scores ✓ (learner explicitly names SQL instinct). If Sense-Making remains △, the active ingredient is not scaffolding in the transfer prompt — something else (lab design, domain coverage) is responsible.
>
> See `labs/reports/esr-indexing-strategy/esr-indexing-strategy-transfer-v2.md` Section 14 for the finding that motivated this variant (Sense-Making △ held across both v1 and v2 runs; transfer prompt scaffolding identified as next test variable).

---

## Lab Metadata

| Attribute | Value |
|---|---|
| **Lab Name** | ESR Indexing Strategy |
| **Difficulty** | Intermediate |
| **Duration** | 90–110 minutes |
| **Prerequisites** | Basic MongoDB (collections, documents, queries); familiarity with database indexes |
| **Environment** | Node.js v18+ + MongoDB 5.0+ (Docker) |
| **Primary Skill Gap** | Agents can write queries but don't understand index field ordering or its impact on performance |

---

## Learning Objectives

By completing this lab, learners will:

1. **Understand** the ESR (Equality, Sort, Range) guideline and why field order in indexes optimizes query performance
2. **Apply** ESR ordering to design indexes for multi-field queries
3. **Diagnose** performance issues using MongoDB explain output and fix them with ESR-ordered indexes
4. **Trade off** query performance against write cost and memory usage in realistic scenarios

---

## Endpoint Capability

**After completing this lab, the learner can:**
- Design an index for any MongoDB query using the ESR guideline
- Verify the index improves performance using `explain("executionStats")`
- Articulate why ESR ordering matters and when it's worth the storage/write cost
- Apply ESR principles to their own projects

---

## Application Context

### Domain
Product catalog system with search, filtering, and sorting capabilities.

### Data Model

**Collection: `products`**
```javascript
{
  _id: ObjectId,
  status: String,           // "active", "archived", "draft"
  category: String,         // "electronics", "books", "clothing", etc.
  name: String,
  description: String,
  price: Number,
  rating: Number,           // 0-5, avg customer rating
  tags: [String],           // array of tags, e.g., ["sale", "featured"]
  createdAt: Date,
  updatedAt: Date,
  stock: Number
}
```

**Seed Data:**
- 10,000 products across 15 categories
- Rating distribution: mostly 3-4 stars
- Price range: $10–$5,000
- ~40% with "sale" tag
- Stock levels: 0–500 units

### Queries to Optimize

**Query 1: Equality Only**
```javascript
db.products.find({ status: "active" })
```
Index: `{ status: 1 }`

**Query 2: Equality + Sort**
```javascript
db.products.find({ status: "active" }).sort({ createdAt: -1 })
```
Index: `{ status: 1, createdAt: -1 }`

**Query 3: Equality + Range**
```javascript
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } })
```
Index: `{ status: 1, price: 1 }` (ESR order: E=status, R=price)

**Query 4: ESR (Equality + Sort + Range)**
```javascript
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 })
```
Index: `{ status: 1, rating: -1, price: 1 }` (ESR order: E=status, S=rating, R=price)

**Query 5: ESR with Array Field**
```javascript
db.products.find({ tags: "sale", rating: { $gte: 4 } }).sort({ createdAt: -1 })
```
Index: `{ tags: 1, createdAt: -1, rating: 1 }` (ESR order: E=tags, S=createdAt, R=rating — note: S before R when sorting within range results)

---

## Knowledge Learning Indicators (KLI)

### KLI 1: Fluency — ESR Syntax & Pattern
**What to teach:** Index field order and MongoDB index creation syntax
**How:** Exact commands, worked examples, immediate application
**Mastery Threshold:** Learner correctly writes `db.products.createIndex({ category: 1, rating: -1, price: 1 })` and explains the order

**Assessment:**
- Can write index syntax without errors
- Correctly identifies E, S, R in an index definition
- Explains why order matters (index traversal is left-to-right)

---

### KLI 2: Induction — When to Apply ESR
**What to teach:** Identifying E, S, and R components in queries, then designing indexes
**How:** Show 2+ contrasting query examples, name what changes, apply to new cases
**Mastery Threshold:** Given 3+ queries, learner correctly identifies E, S, R and designs the index

**Assessment:**
- Can parse a query to identify equality, sort, and range components
- Designs index with correct field order (E before S before R)
- Handles edge cases (array fields, multiple sorts, multiple ranges)

---

### KLI 3: Sense-Making — Why ESR Works
**What to teach:** How ESR reduces scans and memory usage; why placing Sort before Range eliminates the in-memory SORT step
**How:** Show explain output; require learner to articulate why the SORT stage appears and disappears
**Mastery Threshold:** Learner articulates why ESR is faster using metrics (`docsExamined`, `executionTimeMillis`, `stage: "SORT"`)

**Assessment:**
- Reads and interprets explain output correctly
- Compares performance across index strategies (no index, ESR)
- Explains why ESR reduces documents examined
- Articulates that in-memory sorts don't happen with ESR

---

## Stage Specifications

### Stage 1: Understand the ESR Guideline
**Duration:** 20–25 minutes
**KLI Types:** Fluency + Sense-Making
**Prerequisite Knowledge:** Basic MongoDB queries, concept of an index

#### Goal
Learn the ESR pattern and why field order matters in indexes.

#### Content & Scaffolding

**Section 1.1: ESR Acronym & MongoDB Index Traversal**
- Define: ESR = Equality, Sort, Range
- Explain: MongoDB indexes are B-tree structures traversed left-to-right
- Example: Index `{ category: 1, rating: -1, price: 1 }` is traversed as:
  1. Find all documents where `category` equals the filter value
  2. Within those, sort by `rating` (descending)
  3. Within those sorted results, apply `price` range filter
- Provide glossary:
  - *Cardinality* — number of unique values in a field
  - *In-memory sort* — MongoDB sorts results in RAM (slow for large datasets)
  - *Index intersection* — combining results from multiple indexes (inefficient)

**Section 1.2: Concrete Example — Non-ESR vs. ESR**
Given query:
```javascript
db.products.find({ category: "electronics", price: { $gte: 100, $lte: 500 } }).sort({ rating: -1 })
```

Non-ESR index `{ category: 1, price: 1, rating: -1 }`:
- Finds "electronics" quickly ✓
- Filters price range ✓
- But must **sort in memory** ✗ (index doesn't help with sort because price fields come before rating in index order)
- `explain()` shows: `"executionStages": { "stage": "SORT", ... }` and high `executionTimeMillis`

ESR index `{ category: 1, rating: -1, price: 1 }`:
- Finds "electronics" quickly ✓
- Uses index to sort by rating (no in-memory sort) ✓
- Applies price filter ✓
- `explain()` shows: No `"stage": "SORT"` and low `executionTimeMillis`

**Scaffold:** Provide side-by-side explain output for both strategies. Ask: "Why does the ESR index not have a SORT stage?"

**Section 1.3: Contrast with SQL**
- SQL: You might index `(price, category, rating)` — order is less critical because query planner optimizes
- MongoDB: **Field order is critical**. MongoDB's query planner cannot reorder index fields; it uses indexes exactly as written. Therefore, field order in your index definition directly affects performance.
- Bridge: "Your SQL intuition says normalize and join. MongoDB says: think about your queries first, then design indexes to match query shape."

#### Milestone Check: Stage 1

**Task:** Given 5 queries, identify the E, S, and R components for each.

**Format:** Fill in `src/stage1-esr-identification.js` using this exact structure:

```javascript
// filepath: src/stage1-esr-identification.js
module.exports = {
  query1: { E: "status", S: "none", R: "none" },
  query2: { E: "status", S: "createdAt", R: "none" },
  query3: { E: "status", S: "none", R: "price" },
  query4: { E: "status", S: "rating", R: "price" },
  query5: { E: "tags", S: "createdAt", R: "rating" }
};
```

**Note:** The same 5 queries are used in Stage 2 to design indexes. Your E, S, R answers here feed directly into the index field order in Stage 2.

**Expected Queries:**
1. `db.products.find({ status: "active" })`
   - Expected answer: E = status; S = none; R = none
2. `db.products.find({ status: "active" }).sort({ createdAt: -1 })`
   - Expected: E = status; S = createdAt; R = none
3. `db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } })`
   - Expected: E = status; S = none; R = price
4. `db.products.find({ status: "active", price: { $gte: 50 } }).sort({ rating: -1 })`
   - Expected: E = status; S = rating; R = price
5. `db.products.find({ tags: "sale", rating: { $gte: 4 } }).sort({ createdAt: -1 })`
   - Expected: E = tags; S = createdAt; R = rating

**Automated Check:**
- Parse learner's answers from `src/stage1-esr-identification.js`
- Compare each to expected E, S, R for each query
- Output: "Query 1: ✓ Correct" or "Query 1: ✗ Expected E=status; you said E=category"
- Pass if 4/5 correct

**File:** `src/stage1-esr-identification.js` (learner fills in answers, check script validates)

---

### Stage 2: Design ESR Indexes
**Duration:** 30–40 minutes (includes time to understand scaffolding patterns)
**KLI Types:** Induction
**Prerequisite:** Complete Stage 1

#### Goal
Apply ESR to real query patterns and create optimal indexes.

#### Content & Scaffolding

**Section 2.1: Index Scaffolding (Guided)**

For each of 5 queries, learner writes the index. Queries 1–2 have scaffolding; queries 3–5 require independent design.

**Query 1 (Full Scaffolding):**
```javascript
// Query:
db.products.find({ status: "active" })

// Your index:
db.products.createIndex({ ??? })

// Expected answer:
db.products.createIndex({ status: 1 })
```

**Query 2 (Full Scaffolding):**
```javascript
// Query:
db.products.find({ status: "active" }).sort({ createdAt: -1 })

// Your index:
db.products.createIndex({ ??? })

// Expected answer:
db.products.createIndex({ status: 1, createdAt: -1 })
```

**Before Query 3 — Why Field Order Matters (Contrast Example)**

Consider this query: `db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 })`

Two possible index orderings:
- Non-ESR: `{ status: 1, price: 1, rating: -1 }` — Range before Sort
- ESR: `{ status: 1, rating: -1, price: 1 }` — Sort before Range

The non-ESR version forces MongoDB to apply the price range first, then sort remaining results in memory (`stage: "SORT"` in explain output). The ESR version uses the index to sort — no in-memory step.

**Rule:** Place Sort fields before Range fields in your index. The Sort field must come after all Equality fields and before any Range fields.

**Query 3 (Guided; they fill in field order):**
```javascript
// Query:
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } })

// This is Equality + Range (no Sort). ESR order: E → R.
// Your index:
db.products.createIndex({ ??? })

// Expected answer:
db.products.createIndex({ status: 1, price: 1 })
// E=status (equality), R=price (range). No Sort field in this query.
```

**Query 4 (Guided; they fill in field order):**
```javascript
// Query:
db.products.find({
  status: "active",
  price: { $gte: 50, $lte: 500 }
}).sort({ rating: -1 })

// This is Equality + Sort + Range. Use ESR guideline.
// Your index:
db.products.createIndex({ ??? })

// Expected answer:
db.products.createIndex({ status: 1, rating: -1, price: 1 })
```

**Query 5 (Independent Design):**
```javascript
// Query:
db.products.find({ tags: "sale", rating: { $gte: 4 } }).sort({ createdAt: -1 })

// Apply ESR guideline. Identify E, S, and R first, then write the index in that order.
// Your index:
db.products.createIndex({ ??? })

// Expected answer:
db.products.createIndex({ tags: 1, createdAt: -1, rating: 1 })
// E=tags (equality), S=createdAt (sort), R=rating (range)
// Sort comes before Range — this is the critical ESR ordering that eliminates the SORT stage.
```

**Section 2.2: Edge Cases**

Provide explanations for:
- **Array fields** (tags): Index includes the array field; MongoDB indexes each array element
- **Multiple sorts** (if present): Maintain order in index
- **Multiple inequalities**: All go in the R section; order doesn't matter much if only ranges

#### Milestone Check: Stage 2

**Task:** Create `src/indexes.js` with index definitions. Include comments explaining E, S, R for each.

**Expected File:**
```javascript
// filepath: src/indexes.js
module.exports = [
  {
    name: "query1-status",
    fields: { status: 1 },
    comment: "Equality: status"
  },
  {
    name: "query2-status-createdAt",
    fields: { status: 1, createdAt: -1 },
    comment: "Equality: status, Sort: createdAt"
  },
  {
    name: "query3-status-price",
    fields: { status: 1, price: 1 },
    comment: "Equality: status, Range: price"
  },
  {
    name: "query4-status-rating-price",
    fields: { status: 1, rating: -1, price: 1 },
    comment: "Equality: status, Sort: rating, Range: price"
  },
  {
    name: "query5-tags-createdAt-rating",
    fields: { tags: 1, createdAt: -1, rating: 1 },
    comment: "Equality: tags, Sort: createdAt, Range: rating"
  }
];
```

**Automated Check:**
- Validate each index definition matches ESR order for its query
- Verify field directions (ascending/descending) are correct
- Check for redundant indexes
- Output example: "✓ All 5 indexes follow ESR order"

**File:** Check script runs `npm run check:indexes`, validates `src/indexes.js`

---

### Stage 3: Measure Performance Gain
**Duration:** 20–25 minutes
**KLI Types:** Sense-Making
**Prerequisite:** Complete Stage 2

#### Goal
Understand *why* ESR improves performance by analyzing explain output.

#### Content & Scaffolding

**Section 3.1: Understanding explain() Output**

Provide template and explanation:
```javascript
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).explain("executionStats")
```

Key fields to observe:
- `executionStages.stage` — How MongoDB executed (COLLSCAN, IXSCAN, SORT, etc.)
- `executionStats.executionStages.docsExamined` — Documents scanned
- `executionStats.nReturned` — Documents returned (desired result)
- `executionStats.executionTimeMillis` — Time taken (milliseconds)

**Interpretation:**
- Ideal: `docsExamined ≈ nReturned` and `executionTimeMillis` is low
- Bad: `docsExamined >> nReturned` (scanning lots of unnecessary docs) or `stage: "SORT"` (in-memory sort)

**Section 3.2: Before and After — ESR Index for Query 4**

For query `db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 })`:

**Before: No Index (Collection Scan)**
```javascript
// Drop all indexes except _id
db.products.dropIndexes()

// Run query and explain
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 }).explain("executionStats")

// Expected output:
// stage: "SORT"
// docsExamined: 10000 (all documents!)
// nReturned: ~400
// executionTimeMillis: 150–300
```

Explanation: MongoDB must scan all 10,000 documents, then sort 400 results in memory. The `"SORT"` stage in explain output is the signal that an in-memory sort is happening.

**After: ESR Index (Correct Order)**
```javascript
db.products.createIndex({ status: 1, rating: -1, price: 1 })

db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 }).explain("executionStats")

// Expected output:
// No "SORT" stage
// docsExamined: ~420
// nReturned: ~400
// executionTimeMillis: 2–5
```

Explanation: The ESR index provides equality (status), sort (rating), and range (price) in one pass. MongoDB uses the index order for sorting — no in-memory step needed. The `"SORT"` stage disappears.

**Scaffold:**
Provide both explain outputs side-by-side. Ask: "What changed between the two explain outputs? Why does the ESR index eliminate the SORT stage?"

**Section 3.3: Learner-Active Observation (Required before automated check)**

Before running `npm run check:explain`, run the following commands yourself and observe the output directly:

```javascript
// Step 1: Drop custom indexes and observe the baseline
db.products.dropIndexes()
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 }).explain("executionStats")
// Look for: executionStages.stage — is "SORT" present?

// Step 2: Create ESR index and re-run
db.products.createIndex({ status: 1, rating: -1, price: 1 })
db.products.find({ status: "active", price: { $gte: 50, $lte: 500 } }).sort({ rating: -1 }).explain("executionStats")
// Look for: is "SORT" gone? What changed?
```

Write one sentence in your notes: *"The ESR index eliminates the SORT stage because..."*

The SORT stage — not execution time — is the signal that ESR is working. Wall-clock timing varies by machine and dataset size. The presence or absence of `stage: "SORT"` is deterministic.

#### Milestone Check: Stage 3

**Task:** Run the query with and without an ESR index and compare explain output.

**Queries & Strategies (Automated)**
```bash
npm run check:explain
```

**Script Behavior:**
1. Drop custom indexes; run query; capture `docsExamined`, `executionTimeMillis`, `hasSortStage`
2. Create ESR index `{ status: 1, rating: -1, price: 1 }`; run same query; capture metrics
3. Compare and output:
   ```
   Before (No Index):
   - Documents Examined: 10000
   - Execution Time: 287ms
   - Sort Stage: YES

   After (ESR Index):
   - Documents Examined: 420
   - Execution Time: 3ms
   - Sort Stage: NO

   ✓ ESR eliminates in-memory sort
   ```

**Pass Criteria:**
- ESR index has no SORT stage ✓ (primary signal — deterministic regardless of machine speed)

**Note on timing:** Wall-clock speedup is informational but not a pass criterion. On small datasets (10K docs) running on fast hardware, all strategies complete in under 25ms. The SORT stage is the only reliable signal at this scale.

**File:** Check script `npm run check:explain` runs automatically; learner doesn't write code here.

---

### Stage 4: Trade-Offs & Design Decisions
**Duration:** 15–20 minutes
**KLI Types:** Sense-Making
**Prerequisite:** Complete Stage 3

#### Goal
Understand when ESR is worth the cost and when to compromise.

#### Content & Scaffolding

**Section 4.1: Index Trade-Offs**

Every index has a cost:
- **Write Cost**: Inserting/updating documents is slower (index must be updated too)
- **Memory Cost**: Indexes consume RAM
- **Read Benefit**: Queries are faster

**Rule of Thumb:**
- If a query runs < 1× per minute, maybe not worth a custom index
- If a query runs > 1× per second and is slow, **definitely** worth an index
- Use `queryPlanner` to see if MongoDB is using the index

**Section 4.2: Real Scenario — Multiple Queries, Limited Indexes**

Scenario:
- Query A runs 1,000× per minute: `{ status: "active", price: { $gte: 50 } }.sort({ rating: -1 })`
  - Performance: 500ms without index, 5ms with ESR index
  - Write impact: Adds ~2% to insert time
- Query B runs 100× per minute: `{ category: "electronics", tags: "sale" }`
  - Performance: 150ms without index, 8ms with index
  - Write impact: Adds ~1.5% to insert time
- Query C runs 10× per hour: `{ status: "active", createdAt: { $gte: Date } }`
  - Performance: 80ms without index (acceptable for rare query)
  - Write impact: Would add ~1% to insert time
- Constraint: Database can handle max 3 indexes (memory limit)

**Decision Questions:**
1. Which queries get dedicated indexes?
2. Can any indexes be shared (index prefix)?
3. Which query(ies) will be slow if deprioritized?

**Provided Analysis:**
- Query A: ESR index `{ status: 1, rating: -1, price: 1 }` (full) — runs 1,000×/min; 495ms time savings per minute = must index
- Query B: ESR index `{ category: 1, tags: 1 }` (full) — runs 100×/min; 142ms time savings per minute = should index
- Query C: Partial ESR `{ status: 1, createdAt: 1 }` (E + R, no S because no sort) — runs 10×/hour; 80ms acceptable = deprioritize

**Observation:** Queries A & B could potentially share a prefix if they both had `status`, but B uses `category`. Decision: Use all 3 indexes because Query A and B are frequent enough to justify dedicated indexes.

**Section 4.3: Learner's Decision**

Learner receives a different scenario:
- **Query X** (critical): `{ user_id: UUID, created: { $gte: Date } }.sort({ updated: -1 })`
  - Frequency: 50× per second
  - Performance without index: ~500ms
  - Performance with ESR index: ~5ms
  - Time savings: 24.75 seconds per minute = **major impact**
- **Query Y** (frequent): `{ status: "draft" }.sort({ updated: -1 })`
  - Frequency: 10× per second
  - Performance without index: ~120ms
  - Performance with index: ~10ms
  - Time savings: 110ms per 10 seconds = **significant**
- **Query Z** (rare): `{ tags: "archived", rating: { $lte: 2 } }`
  - Frequency: 2× per minute
  - Performance without index: ~60ms
  - Performance with index: ~8ms
  - Time savings: ~100ms per hour = **negligible**
- Constraint: Max 2 indexes (memory limit)

**Learner's Task:**
Write `INDEX_DECISIONS.md`:
```markdown
# Index Decisions

## Index 1: Query X (Critical)
- Fields: { user_id: 1, updated: -1, created: 1 }
- Rationale: Runs 50×/sec; saves 24.75 seconds per minute; critical for system performance
- Trade-off: Increased write cost (~2%), but ROI is enormous given query frequency

## Index 2: Query Y (Frequent)
- Fields: { status: 1, updated: -1 }
- Rationale: Runs 10×/sec; saves 110ms per 10 seconds; frequent enough to justify index
- Trade-off: Adds ~1.5% write cost, acceptable given query frequency

## Query Z (Skipped)
- Rationale: Only runs 2×/minute; 60ms without index is acceptable for rare query
- Trade-off: This query will be slower, but impact is negligible (100ms savings per hour)

## Overall Decision
Prioritize Query X (critical) and Query Y (frequent). Accept slightly slower Query Z (rare).
```

**Scaffold:**
Provide the scenario with performance metrics, the constraint, and the template. Learner fills in the reasoning.

#### Milestone Check: Stage 4

**Task:** Analyze a multi-query scenario and document index trade-off decisions.

**Automated Check:**
- Verify `INDEX_DECISIONS.md` exists
- Verify it addresses: which queries get indexes, why, what's given up
- Verify reasoning is sound (frequent queries prioritized over rare ones)
- Output example: "✓ Decisions articulate query frequency and memory tradeoff"

**Pass Criteria:**
- Document explains which query was deprioritized and why
- Rationale references query frequency or other trade-offs
- At least 2 queries discussed

**File:** Learner writes `INDEX_DECISIONS.md`

---

### Stage 5: Reflection
**Duration:** 10–15 minutes
**KLI Types:** Sense-Making & Transfer
**Prerequisite:** Complete Stage 4

#### Goal
Consolidate learning and reflect on how to apply ESR in real projects.

#### Content & Scaffolding

**Task:** Write `REFLECTION.md` addressing 4 sections:

1. **What I Learned**
   - One sentence explaining the ESR guideline
   - One sentence on why field order matters
   - One sentence on when to compromise on indexes

2. **Decisions I Made**
   - Which 2–3 indexes did you create across all stages?
   - Why did you choose that approach?

3. **When I Got Stuck**
   - Was there a query where E, S, R wasn't clear?
   - Did you struggle with index syntax or trade-off reasoning?
   - How did you resolve it?

4. **Transfer to Real Applications**
   - Describe a hypothetical MongoDB query in a real-world application (e.g., e-commerce product search, social media feed, analytics dashboard)
   - What would the E, S, R components be for that query?
   - Why would ESR indexing help in that scenario?

**Expected Length:** 200–300 words

**Scaffold:**
- Provide the template (sections 1–4 with bullet points)
- Show an example reflection (not the answer, but the format and depth expected)

#### Milestone Check: Stage 5

**Task:** Write and submit `REFLECTION.md`

**Automated Check:**
- Verify file exists and is > 150 words
- Verify all 4 sections are present (even if brief)
- Check that learner articulates at least one ESR principle
- Output example: "✓ Reflection complete. You've articulated ESR guideline and identified a transfer scenario."

**Pass Criteria:**
- All 4 sections addressed
- At least one clear articulation of why ESR matters
- At least one decision documented
- Transfer section includes a hypothetical real-world scenario

**File:** Learner writes `REFLECTION.md`

---

## Environment Setup & Prerequisites

### MongoDB Version Compatibility

Built for **MongoDB 5.0+**. The `explain()` output format has been stable since MongoDB 5.0, so this lab works on:
- MongoDB 5.0 (EOL November 2024, but compatible)
- MongoDB 6.0, 6.1, 6.2, 6.3
- MongoDB 7.0+

All versions use the same `executionStats` structure for this lab.

### Docker & MongoDB

```bash
cd lab-test-env/esr-indexing-strategy-v2
cp .env.example .env
npm install
docker-compose up -d
npm run seed
npm run check:env  # verify setup
```

### Environment Requirements

- **Node.js:** v18+ (LTS)
- **MongoDB:** 5.0+ (via Docker)
- **RAM:** 2GB free (seed data + Docker container)

### Seed Data

Run `npm run seed` to populate:
- `products` collection: 10,000 documents
- Fields: status, category, name, description, price, rating, tags, createdAt, updatedAt, stock
- Indexes: Only `_id` (learners create indexes in stages 2–3)

---

## Check Scripts

All check scripts save results to `check-results/stage-{N}-results.json` for automated validation.

### check:env
```bash
npm run check:env
```
- Verify MongoDB connection
- Verify `products` collection exists with 10,000 documents
- Verify no custom indexes exist (only `_id`)
- Output: "✓ Environment READY" or error details

### check:stage1
```bash
npm run check:stage1
```
- Read learner's E, S, R answers from `src/stage1-esr-identification.js`
- Validate against expected answers (format specified above)
- Output: "Query 1: ✓ Correct" or "Query 1: ✗ Expected E=status..."
- Pass if 4/5 correct

### check:indexes
```bash
npm run check:indexes
```
- Read index definitions from `src/indexes.js`
- Validate each index follows ESR order for its query
- Verify field directions (1 or -1) are correct
- Output: "Index 1 (query1-status): ✓ ESR order correct"
- Pass if all 5 indexes valid

### check:explain
```bash
npm run check:explain
```
- Drop custom indexes; run query 4; capture `docsExamined`, `executionTimeMillis`, `hasSortStage`
- Create ESR index `{ status: 1, rating: -1, price: 1 }`; run same query; capture metrics
- Compare and output both results
- Pass if: ESR index has no SORT stage

### check:decisions
```bash
npm run check:decisions
```
- Verify `INDEX_DECISIONS.md` exists
- Validate it addresses index choices and trade-offs
- Output: "✓ Decisions documented with rationale"
- Pass if rationale is present

### check:reflection
```bash
npm run check:reflection
```
- Verify `REFLECTION.md` exists and > 150 words
- Validate all 4 sections present
- Output: "✓ Reflection complete (268 words, all sections)"
- Pass if all sections addressed

### check:all
```bash
npm run check:all
```
Runs all checks in order: env → stage1 → indexes → explain → decisions → reflection

---

## File Structure

```
lab-test-env/esr-indexing-strategy-v2/
├── docker-compose.yml
├── package.json
├── .env.example
├── README.md
├── scripts/
│   ├── seed.js
│   ├── reset.js
│   ├── check-env.js
│   ├── check-stage1.js
│   ├── check-indexes.js
│   ├── check-explain.js
│   ├── check-decisions.js
│   ├── check-reflection.js
│   └── check-all.js
├── lib/
│   └── db.js
├── src/
│   ├── stage1-esr-identification.js    ← Learner fills in E,S,R answers
│   └── indexes.js                       ← Learner defines indexes
└── check-results/                       ← Automated check output
```

---

## Success Criteria & Rubric

### Completion Checklist

✅ **Lab is successful when all of the following are true:**

1. **Stage 1 Complete:** Learner correctly identifies E, S, R for 4+ queries (pass Stage 1 check)
2. **Stage 2 Complete:** 5 indexes defined in ESR order (pass Stage 2 check)
3. **Stage 3 Complete:** ESR index has no SORT stage (pass Stage 3 check)
4. **Stage 4 Complete:** `INDEX_DECISIONS.md` articulates trade-offs (pass Stage 4 check)
5. **Stage 5 Complete:** `REFLECTION.md` addresses all 4 sections (pass Stage 5 check)
6. **All Checks Pass:** `npm run check:all` output shows "✓ All stages PASS"

### Rubric

| Component | Mastery (9–10) | Proficiency (7–8) | Beginning (5–6) | Incomplete (0–4) |
|---|---|---|---|---|
| **ESR Concept Understanding** | Explains why E, S, R order optimizes; applies to novel queries with confidence | Correctly applies ESR to familiar patterns; explanation mostly correct | Can identify E, S, R but explanation unclear or incomplete | Cannot articulate ESR principle |
| **Index Design** | All 5 indexes follow ESR; no redundancy; includes correct field directions | 4/5 indexes follow ESR; mostly correct field directions | 2–3/5 indexes follow ESR; some field direction errors | < 2 indexes correct |
| **Performance Analysis** | Articulates why ESR improves (docs examined, in-memory sort); explains SORT stage elimination | Observes performance difference; explanation of metrics is mostly correct | Sees that ESR is faster; limited explanation of why | Cannot interpret explain output |
| **Trade-Off Reasoning** | Articulates multiple trade-offs (query frequency, memory, write cost) with sound logic | Makes index priority decisions with clear rationale | Documents a decision but reasoning is unclear | No decision documentation |
| **Reflection & Transfer** | Connects ESR to real-world applications; identifies scenarios where it matters and limitations | Summarizes learning; identifies one transfer scenario | Brief reflection; limited transfer thinking | No reflection or transfer |

---

## Known Limitations & Assumptions

- **Seed data size:** 10,000 documents. Performance metrics may differ at scale (100K+)
- **Query patterns:** Lab uses 5 representative queries. Real-world patterns may be more complex
- **Index memory:** Not explicitly tracked; lab assumes memory is not severely limited
- **MongoDB version:** Built for MongoDB 5.0+. All versions in that range use the same explain output format
- **Controlled test:** Stage 3 does not show a non-ESR index strategy. Learners observe before/after (no index → ESR) only. This is intentional — see the controlled test banner at the top of this spec.

---

## Pedagogy & Design Notes

**Why This Lab Works:**

1. **Backwards Design:** Endpoint is "design ESR indexes"; all stages build to that
2. **SQL Bridge:** Stage 1 explicitly contrasts SQL vs. MongoDB to name the instinct (Section 1.3)
3. **Three KLI Types:**
   - Fluency (ESR syntax, stage 1–2)
   - Induction (applying ESR to queries, stage 2)
   - Sense-Making (why ESR works, stages 3–5)
4. **Scaffolding Progression:** Stages 1–2 provide heavy scaffolding; stages 3–4 reduce it
5. **Real Performance Metrics:** Stage 3 uses actual `explain()` output, not abstractions
6. **Trade-Off Reflection:** Stages 4–5 prevent autopilot; learner articulates decisions
7. **Transfer Design:** Stage 5 asks learner to apply ESR to hypothetical real-world scenarios (not "your project")

**Controlled Test Note — SQL Bridge:**
The v1 spec included Strategy B (non-ESR index) as an explicit comparison in Stage 3. The v2 spec removed it. Both runs scored Sense-Making △. This v3 variant holds the lab environment identical to v2 but adds explicit SQL contrast scaffolding to the transfer task prompt (steps 1–4 above). The question this tests: does naming the SQL instinct in the transfer task prompt unlock Sense-Making ✓, or does the learner still score △ even when explicitly prompted to compare?

**SQL Developer Mental Model:**
SQL developers often assume index order is automatic or less important. This lab names that assumption, shows why it fails in MongoDB, and provides the ESR rule as a replacement mental model.

---

## Transfer Task

**Domain:** Hospital appointment scheduling system (no overlap with the product catalog domain used in this lab)

**Problem:** A hospital app runs this query thousands of times per day:

```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

The `appointments` collection has 500,000 documents. The query currently takes 800ms.

Answer the following in order:
1. **SQL instinct:** What would a SQL developer likely do when indexing this query? Name the specific column order they would choose and why.
2. **MongoDB failure mode:** What does that SQL-instinct index produce in MongoDB's query execution plan? Name the specific execution stage it introduces and explain why.
3. **ESR solution:** Design the optimal ESR index. Classify each field as E, S, or R, state the field order, and explain why placing sort before range eliminates the execution stage you named above.
4. **Explain output:** State what the explain output looks like before and after your index is applied.

**KLI mapping:**
- **Fluency:** Correct index syntax written without errors: `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })`
- **Induction:** Field order justified by the query's E/S/R roles — not by analogy to the product catalog queries. Learner identifies `doctorId` as E, `urgency` as S, `appointmentDate` as R and places them in that order.
- **Sense-Making:** Learner explicitly names the SQL instinct (e.g., indexing columns in query appearance order or by cardinality), explains why it produces a SORT stage in MongoDB, and states the ESR alternative. SQL contrast must be named — not just the MongoDB solution.

**Passing bar:** Index is syntactically correct, field order matches E→S→R, the learner names what a SQL developer would do, explains the MongoDB failure mode by name (SORT stage), and explains *why* urgency must come before appointmentDate — not just that it should.

---

## References

- [MongoDB Documentation: Create Indexes to Support Your Queries](https://docs.mongodb.com/manual/tutorial/create-indexes-to-support-queries/)
- [MongoDB University M001: MongoDB Basics, Chapter 3: Indexing](https://university.mongodb.com/)
- [MongoDB University M201: MongoDB Performance, Chapter 4: Index Design Patterns](https://university.mongodb.com/)
- ESR Guideline: [Wikipedia: Cardinality (data)](https://en.wikipedia.org/wiki/Cardinality_(data_management))
