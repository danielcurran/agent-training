# ESR Indexing Strategy Lab Outline

## Lab Metadata
- **Name:** ESR Indexing Strategy
- **Domain:** MongoDB Index Optimization
- **Target Audience:** SQL developers transitioning to MongoDB; developers optimizing query performance
- **Estimated Duration:** 90–120 minutes
- **Prerequisites:** Basic MongoDB (collections, documents, queries); familiarity with database indexes
- **Environment:** Local Node.js + MongoDB (Docker)

---

## Learning Objectives

By completing this lab, learners will:
1. **Understand** the ESR guideline and why it optimizes query performance
2. **Apply** ESR ordering to design indexes for multi-field queries
3. **Diagnose** performance issues in queries and fix them with ESR-ordered indexes
4. **Trade off** query performance against write cost and memory usage

---

## Context & Motivation

### SQL Background
In SQL, indexes are ordered by the columns you specify. Query planners use indexes for WHERE clauses and JOIN conditions, typically scanning in order. MongoDB indexes work similarly, but the **order of fields in the index matters for performance**—and not always in the way SQL developers expect.

The **ESR guideline** (Equality, Sort, Range) tells you the optimal field order for indexes on multi-field queries. Following it can turn a slow, collection-scanning query into a millisecond response.

### Why This Matters
- Poorly ordered indexes force MongoDB to scan unnecessary documents or sort results in memory
- Query patterns often use Equality + Sort + Range together (e.g., find by user ID, sort by date, limit by price range)
- Understanding ESR prevents the "why is my query still slow?" trap

---

## Lab Application & Endpoint

### Endpoint Capability
Learner can design indexes for complex queries following the ESR guideline and verify they improve query performance.

### Lab Application
A product catalog with inventory, ratings, and pricing. Learners optimize queries that filter by category (Equality), sort by rating (Sort), and range-filter by price (Range).

### Artifact & Milestone Check
**Artifact:** `indexes.js` — An array of index definitions, ordered by ESR, with comments explaining each one.
**Milestone Check:** Run queries against indexed and unindexed data; compare execution times; validate indexes follow ESR.

---

## Knowledge Learning Indicators (KLI)

### KLI 1: Fluency (Syntax & Pattern)
**Concept:** ESR field order and index creation syntax
**Type:** Memory & Fluency
**Mastery:** Learner can write `db.products.createIndex({ category: 1, rating: -1, price: 1 })` and explain why the order is (category, rating, price)

### KLI 2: Induction (When to Apply)
**Concept:** Identifying queries that benefit from ESR
**Type:** Induction & Refinement
**Mastery:** Given 3+ queries, learner identifies which are E, S, and R, and designs the index

### KLI 3: Sense-Making (Why It Works)
**Concept:** How ESR reduces scans and memory usage
**Type:** Sense-Making & Transfer
**Mastery:** Learner articulates why (E, S, R) order is faster than (R, S, E) or (S, E, R) using explain output

---

## Stage Breakdown

### Stage 1: Understand the ESR Guideline (Fluency)
**Goal:** Learn the ESR pattern and why field order matters in indexes.

**Content:**
- Introduce the ESR acronym: Equality (E), Sort (S), Range (R)
- Explain MongoDB's index-scanning behavior: indexes are traversed in order
- Show a concrete example: query `{ category: "electronics", price: { $gte: 100, $lte: 500 } }` sorted by `rating`
  - Without index: collection scan (slow)
  - With index `{ category: 1, price: 1, rating: -1 }` (wrong order): MongoDB finds category quickly but must then sort in memory
  - With index `{ category: 1, rating: -1, price: 1 }` (ESR order): MongoDB finds category, uses index for sort, then filters price (fast)
- Contrast with SQL: in SQL, you might index (price, category, rating); in MongoDB, the order changes based on query shape

**Scaffold:**
- Provide the exact MongoDB University reference
- Show the explain output for both bad and good indexes
- Include a glossary: "Index cardinality," "in-memory sort," "index intersection"

**Milestone Check:**
- Given 5 queries, learner identifies E, S, R components for each
- Automatic check: parse queries and verify learner's answers match

---

### Stage 2: Design ESR Indexes (Induction)
**Goal:** Apply ESR to real query patterns.

**Content:**
- Learners receive 5 queries on the product catalog:
  1. `{ status: "active" }` — Equality only
  2. `{ status: "active", createdAt: 1 }` — Equality + Sort
  3. `{ status: "active", price: { $gte: 50 } }` — Equality + Range
  4. `{ status: "active", createdAt: -1, price: { $gte: 50 } }` — ESR (E, S, R)
  5. `{ tags: "sale", rating: -1, price: { $lte: 200 } }` — ESR with array field
- For each query, learners design an ESR-ordered index
- Include edge cases: array fields, compound sorts, multiple inequalities

**Scaffold:**
- For query 1 & 2: provide index scaffolding; learners fill in the field order
- For query 3, 4, 5: learners design indexes with guidance on what E, S, R are

**Milestone Check:**
- Learners write indexes to `indexes.js`
- Check script validates:
  - Each index follows ESR order (parse query + index, verify order)
  - No redundant indexes
  - Correct field directions (ascending/descending for sort)

---

### Stage 3: Measure Performance Gain (Sense-Making)
**Goal:** Understand *why* ESR improves performance using explain output.

**Content:**
- Run queries against the catalog with three index strategies:
  1. No index (collection scan)
  2. Non-ESR index (wrong field order)
  3. ESR index (correct order)
- Capture `db.products.find(...).explain("executionStats")`
- Compare: `executionStages`, `docsExamined`, `executionTimeMillis`
- Learners articulate the difference: ESR reduces documents examined and eliminates in-memory sorts

**Scaffold:**
- Provide the explain command template
- Show expected output for all three scenarios
- Ask: "Why does the ESR index examine fewer documents?"

**Milestone Check:**
- Learners run `npm run check:explain`
- Verification:
  - Query with ESR index examines ≤ 10% of documents vs. non-ESR
  - No in-memory sort (`stage: "SORT"` should not appear with ESR)
  - Performance difference is ≥ 100x faster

---

### Stage 4: Trade-Offs & Design Decisions (Sense-Making)
**Goal:** Understand when ESR is worth the cost and when to compromise.

**Content:**
- Introduce index trade-offs: query speed vs. write cost vs. memory usage
- Scenario: A query runs rarely but inserts happen constantly. Is a custom index worth it?
- ESR indexes are optimized for a *specific query shape*. Changing the query (e.g., adding a new sort field) invalidates the index.
- Learners design 3 indexes for a realistic scenario:
  - Index for the most common query (full ESR)
  - Index for a secondary query (partial ESR, shared prefix)
  - Decision: Are both indexes necessary? What if we prioritize write speed over this query?

**Scaffold:**
- Provide the query frequency and performance requirements
- Show insert throughput with/without the index
- Ask learners to write a decision in `INDEX_DECISIONS.md`:
  - What index did you choose?
  - Why?
  - What are you giving up?

**Milestone Check:**
- `INDEX_DECISIONS.md` exists and articulates:
  - Index choice
  - Rationale (query frequency, insert cost, memory)
  - Tradeoff acknowledged

---

### Stage 5: Reflection (Sense-Making)
**Goal:** Consolidate learning and reflect on transfer.

**Content:**
- Learners write `REFLECTION.md`:
  1. **What I Learned:** ESR guideline, why it works, trade-offs
  2. **Decisions I Made:** Which indexes to create, which to skip
  3. **When I Got Stuck:** Were there queries where ESR didn't clearly apply? (Learner documents the confusion)
  4. **Transfer:** Where would you apply ESR in your own projects?

**Scaffold:**
- Provide the reflection template
- Expect 200–400 words

**Milestone Check:**
- `REFLECTION.md` exists and addresses all 4 sections
- Check that learner articulates at least one scenario where ESR matters

---

## Success Criteria

✅ **Lab is successful when:**
1. Learner completes all 5 stages
2. Indexes in `indexes.js` follow ESR ordering for their respective queries
3. Explain output shows performance improvement (fewer docs examined, no in-memory sorts)
4. `INDEX_DECISIONS.md` articulates at least one trade-off decision
5. `REFLECTION.md` shows understanding of ESR and transfer to real scenarios

---

## Alignment with MongoDB University

**References:**
- MongoDB University M001, Chapter 3: Indexing
- MongoDB University M201, Chapter 4: Index Design Patterns
- ESR Guideline: [MongoDB Documentation - Create Indexes to Support Your Queries](https://docs.mongodb.com/manual/tutorial/create-indexes-to-support-queries/)

---

## Rubric

| Component | Mastery | Proficiency | Beginning |
|---|---|---|---|
| **ESR Concept** | Explains why E, S, R order optimizes; applies to novel queries | Applies ESR to familiar query patterns | Can name ESR but order is inconsistent |
| **Index Design** | All indexes follow ESR; no redundancy | 80%+ of indexes follow ESR | <50% follow ESR |
| **Performance Measurement** | Articulates why ESR improves (docs examined, sorts); quantifies gain | Observes performance difference but explanation incomplete | Runs explain but doesn't analyze output |
| **Trade-Off Reasoning** | Articulates cost-benefit for multiple index scenarios | Makes one design decision with rationale | No decision documentation |
| **Reflection** | Connects ESR to own use cases; identifies limitations | Summarizes what was learned | Minimal reflection |