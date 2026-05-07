# Knowledge Transfer Test Report
Date: 2026-05-07T09:28:32.033Z
Test Type: Knowledge-Injected Agent (no lab completion)

## Baseline

**Knowledge Source:** `lab-test-env/esr-indexing-strategy/KNOWLEDGE.json`
**Entries:** 5
**All Entries:** Confidence = verified (grounded in lab checks)

---

## Injected Knowledge Context

──────────────────────────────────────────────────────────────────────
PRIOR KNOWLEDGE CONTEXT (Injected)
──────────────────────────────────────────────────────────────────────

1. ESR index field ordering [verified]
   SQL instinct: In SQL, column order in WHERE clauses does not affect query performance
   Rule: Order compound index fields as: Equality first, Sort second, Range last. MongoDB traverses indexes left-to-right; this order eliminates in-memory SORT stages.
   When to apply: Any compound MongoDB index that supports queries with equality filters, a sort, and a range filter together
   Validated by: npm run check:stage1 && npm run check:explain

2. Index field order significance [verified]
   SQL instinct: SQL query optimizer adapts automatically to column order; MongoDB index field order is not interchangeable
   Rule: Field order in a compound index is not commutative. {status:1, rating:-1, price:1} and {status:1, price:1, rating:-1} are meaningfully different for query performance.
   When to apply: When designing any compound index, verify the field order matches the query's access pattern exactly
   Validated by: npm run check:explain (compared ESR vs non-ESR index on Query 4)

3. SORT stage elimination via indexes [verified]
   SQL instinct: Think of indexes as serving only WHERE clauses; ORDER BY is handled separately by sorting in memory
   Rule: A correctly ordered index (ESR) can eliminate the in-memory SORT stage. Check explain() output: SORT stage presence indicates the index field order is wrong for that query.
   When to apply: When a query is slow, inspect explain('executionStats') for a SORT stage. If present, reorder the index's sort field before the range field.
   Validated by: npm run check:explain

4. Index trade-offs: write cost vs. read performance [verified]
   SQL instinct: Assume indexes should exist for all queries; neglect write amplification and storage cost
   Rule: Adding an index improves query speed but increases write latency and storage. ESR indexes are worth the cost only for frequent queries or when sort-free performance is critical.
   When to apply: Decide whether to add an index based on query frequency, write throughput requirements, and dataset size. Single-field or partial indexes may be preferable for infrequent queries.
   Validated by: npm run check:decisions

5. Array field indexing (multikey indexes) [verified]
   SQL instinct: Indexes on array columns are rare in SQL; MongoDB uses multikey indexes transparently
   Rule: When a field contains an array (e.g., tags: []), an index on that field becomes a multikey index. Each array element is indexed separately. ESR field ordering still applies.
   When to apply: Query 5 in this lab: when indexing on {tags: 1, createdAt: -1, rating: 1}, the tags array expands the index size. Account for this in trade-off analysis.
   Validated by: npm run check:indexes (Query 5)

──────────────────────────────────────────────────────────────────────


---

## Transfer Task


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

**1. SQL instinct:** What would a SQL developer likely do when indexing this query? Name the specific column order they would choose and why.

**2. MongoDB failure mode:** What does that SQL-instinct index produce in MongoDB's query execution plan? Name the specific execution stage it introduces and explain why.

**3. ESR solution:** Design the optimal ESR index. Classify each field as E, S, or R, state the field order, and explain why placing sort before range eliminates the execution stage you named above.

**4. Explain output:** State what the explain output looks like before and after your index is applied.


---

## Agent Response

### 1. SQL Instinct

A SQL developer would likely index columns in the order they appear in the query: `(doctorId, appointmentDate, urgency)` — filtering first, then sorting. The rationale is cardinality: doctorId has low cardinality (many appointments per doctor), so it should narrow the working set first. This matches SQL query optimization patterns where you filter before sorting.

### 2. MongoDB Failure Mode

In MongoDB, this SQL-style index `{doctorId: 1, appointmentDate: 1, urgency: -1}` produces a SORT stage in the execution plan. This happens because MongoDB traverses indexes left-to-right. It finds all doctorId matches, then filters appointmentDate range within those results, but the urgency field comes *after* the range field in the index. MongoDB cannot use the urgency field from the index to provide pre-sorted results (because it had to apply a range filter first). So the query planner forces MongoDB to sort results in memory — the SORT execution stage — which is expensive for large result sets (500,000 appointments).

### 3. ESR Solution

The optimal index is `{doctorId: 1, urgency: -1, appointmentDate: 1}`:
- E (Equality) = doctorId (equality filter)
- S (Sort) = urgency (sort field)
- R (Range) = appointmentDate (range filter: $gte and $lte)

The reason urgency must come *before* appointmentDate is that MongoDB uses index fields left-to-right. After finding all doctorId matches and before applying the appointmentDate range, MongoDB can traverse urgency in the index to provide pre-sorted results. This eliminates the need for the in-memory SORT stage.

### 4. Explain Output

*Before the ESR index:*
- `"executionStages": { "stage": "SORT", ... }`
- `"executionStats": { "executionStages": { "totalDocsExamined": 500000 } }` (large working set)
- `"executionTimeMillis": ~800` (slow due to in-memory sort)

*After the ESR index:*
- No `"stage": "SORT"` — the index provides pre-sorted results
- `"totalDocsExamined"` is much smaller (only documents matching doctorId and appointmentDate range)
- `"executionTimeMillis"` drops significantly (no in-memory sort cost)

---

## Scoring Rubric

| Dimension | Criterion | Expected | Actual |
|---|---|---|---|
| **Fluency** | Index syntax is correct and error-free | `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` | ? |
| **Induction** | Field order justified by E/S/R roles; not by analogy | Identifies E=doctorId, S=urgency, R=appointmentDate | ? |
| **Sense-Making** | Names SQL instinct + MongoDB SORT stage + ESR reasoning | Compares SQL approach to MongoDB execution plan | ? |

**Passing bar:** Fluency ✓, Induction ✓, Sense-Making ✓ (all three).

---


## Scoring Analysis: Knowledge-Injected Agent

| KLI Dimension | Criterion | Evidence from Response | Score |
|---|---|---|---|
| **Fluency** | Index syntax correct; error-free | ✓ `{doctorId: 1, urgency: -1, appointmentDate: 1}` — correct syntax and field directions | ✓ |
| **Induction** | Field order justified by E/S/R roles; applied to novel domain | ✓ Agent identified E=doctorId, S=urgency, R=appointmentDate; not merely copying product catalog | ✓ |
| **Sense-Making** | Names SQL instinct + MongoDB SORT stage + explains causal connection | ✓ SQL approach named ("index in query order", "filter then sort"); SORT stage named; ESR reasoning explained ("urgency before range to use index for sorting") | ✓ |

### Result: **Fluency ✓, Induction ✓, Sense-Making ✓** 

All three KLI dimensions achieved with knowledge-injected agent.

### Interpretation

The agent with **only KNOWLEDGE.json** (no lab completion) successfully demonstrates all three cognitive processes. This indicates that:

1. **Knowledge extraction works** — lab experiences compress into rules that transfer
2. **SQL contrast is preserved** — the "SQL instinct" framing survives in knowledge artifacts
3. **Procedural aspects may be less critical** — the agent didn't need to run explain() itself; understanding the principle is sufficient
4. **Sense-Making is achievable through declarative knowledge** — explicitly naming the SQL instinct and MongoDB failure mode in KNOWLEDGE.json is sufficient for transfer

### Next: Compare to Full-Lab Response

**To complete this test:**

1. Have an agent complete the full ESR lab end-to-end (all 5 stages)
2. Present the same transfer task
3. Compare the two responses:
   - Are KLI scores identical?
   - Does the full-lab agent add any procedural details (e.g., specific explain() output formats)?
   - Does Sense-Making scoring differ (e.g., does the full-lab agent score higher because it ran explain() and saw the SORT stage disappear)?

**Expected outcome if hypothesis holds (knowledge sufficient):**
- KLI scores match on all three dimensions
- Minor wording differences, but no substantive gap in reasoning

**Expected outcome if hypothesis doesn't hold (procedural experience matters):**
- Sense-Making scores differ — full-lab agent provides more detail about seeing SORT stage and how it changed

---
## Next Steps

1. **Manual scoring:** Compare this response to an agent's response after completing the full lab
2. **Automated scoring:** Run both through `/score-transfer-task` and compare KLI hypothesis verdicts
3. **Analysis:** Identify gaps between knowledge-injected and full-lab performance
