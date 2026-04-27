# Learning Report: ESR Indexing Strategy Lab

Date: 2026-04-27
Starting knowledge state: No prior MongoDB knowledge

---

## What I Was Asked to Do

The lab asked me to learn the ESR (Equality, Sort, Range) guideline for designing MongoDB compound indexes. Starting from a 10,000-document product catalog with no custom indexes, I worked through five stages: identifying the E, S, and R roles in five queries; designing compound indexes following ESR order; observing the explain output difference between no-index, non-ESR, and ESR strategies; documenting index trade-off decisions; and reflecting on what I learned and where it transfers.

---

## Stage-by-Stage Summary

### Stage 1: ESR Identification

**Goal as I understood it:** For each of five queries, identify which field (if any) serves as the Equality filter (E), which is the Sort field (S), and which is the Range filter (R). Record answers in `src/stage1-esr-identification.js`.

**What I did:** Read the stub file. Each query was shown in a comment directly above the answer slot. Applied the ESR classification rule:
- Equality: field tested with `===` (`field: value`)
- Sort: field used in `.sort()`
- Range: field tested with inequality (`$gte`, `$lte`, `$in`, etc.)
- `'none'` if a role has no corresponding field

Filled in all five queries:
- Q1: `E=status, S=none, R=none` (equality-only filter)
- Q2: `E=status, S=createdAt, R=none` (equality + sort)
- Q3: `E=status, S=none, R=price` (equality + range, no sort)
- Q4: `E=status, S=rating, R=price` (full ESR)
- Q5: `E=tags, S=createdAt, R=rating` (equality on array field + sort + range)

**Milestone check result:** PASS — 5/5

```
✓ query1: E=status, S=none, R=none
✓ query2: E=status, S=createdAt, R=none
✓ query3: E=status, S=none, R=price
✓ query4: E=status, S=rating, R=price
✓ query5: E=tags, S=createdAt, R=rating
Score: 5/5
✓ Stage 1 passed!
```

**Execution evidence:** Stage 1 is a file-parsing check with no MongoDB queries. The check reads `src/stage1-esr-identification.js` and compares each answer to expected values. No database connection required at this stage.

**What I learned:** ESR classification is a systematic read of any MongoDB query. Given a query, I can identify the role of every field before thinking about the index. E fields appear in the find filter with equality syntax; S fields appear in `.sort()`; R fields appear in the find filter with inequality operators. Fields that don't appear in either get `'none'`.

**What was unclear:** Nothing was ambiguous. The stub comments showed each query directly above the answer slot. The example at the top of the file made the format clear. The five queries were consistent with each other (all used `status` as equality, which made the pattern visible across queries).

**Attempts needed:** 1

---

### Stage 2: Design ESR Indexes

**Goal as I understood it:** Using my Stage 1 E/S/R answers, create one compound index per query in `src/indexes.js`. Fields must appear in E→S→R order. Sort direction must match the query's `.sort()` direction.

**What I did:** Read the index stub file. Each entry had a comment restating the query, the ESR roles, and the expected field order. Applied the Stage 1 answers directly:
- Q1: `{ status: 1 }` — equality only
- Q2: `{ status: 1, createdAt: -1 }` — E→S; `.sort({ createdAt: -1 })` → descending
- Q3: `{ status: 1, price: 1 }` — E→R; no sort field, ascending range
- Q4: `{ status: 1, rating: -1, price: 1 }` — E→S→R; sort descending
- Q5: `{ tags: 1, createdAt: -1, rating: 1 }` — E→S→R; sort descending, range ascending

**Milestone check result:** PASS — 5/5 on first attempt

```
✓ query1-status: {"status":1}
✓ query2-status-createdAt: {"status":1,"createdAt":-1}
✓ query3-status-price: {"status":1,"price":1}
✓ query4-status-rating-price: {"status":1,"rating":-1,"price":1}
✓ query5-tags-createdAt-rating: {"tags":1,"createdAt":-1,"rating":1}
✓ All indexes correct!
```

**Execution evidence:** The check script created the indexes in MongoDB, then validated field order against expected. Intermediate MongoDB output (from the check script log) confirmed each index was created and its field sequence matched. No manual index creation was required.

**What I learned:** Index field order is not just about which fields are included — it is about the sequence. `{ status: 1, rating: -1, price: 1 }` and `{ status: 1, price: 1, rating: -1 }` contain the same fields but have different performance implications. The sort direction (`1` or `-1`) must match the query's sort direction for the index to eliminate the in-memory sort step.

I also learned that query 3 (no sort, equality + range) places the equality field first even though there is no sort field to separate it from the range field. The ESR order collapses cleanly when S is absent: it becomes just E→R.

**What was unclear:** The stub comments described the ESR field order in plain text (`status first (equality), then price (range)`), which removed all ambiguity. The sort direction was not stated as a separate rule — I inferred it from the query comment. This inference was easy but could be made explicit: "Use `-1` if the query sorts descending, `1` if ascending."

**Attempts needed:** 1

---

### Stage 3: Measure Performance Gain

**Goal as I understood it:** Observe the difference between no index, a non-ESR index, and an ESR index for query 4. The key signal is whether a SORT stage appears in the explain output. Run `npm run check:explain` to see all three strategies side-by-side.

**What I did:** Ran `npm run check:explain`. The script automated all three strategies:
1. Dropped custom indexes → ran query 4 → captured explain
2. Created `{ status: 1, price: 1, rating: -1 }` (non-ESR) → ran query 4 → captured explain
3. Created `{ status: 1, rating: -1, price: 1 }` (ESR) → ran query 4 → captured explain

**Milestone check result:** PASS on first attempt

```
Running performance comparison for Query 4...

Strategy 1: No index (collection scan)
  Time: 19ms | SORT stage: true

Strategy 2: Non-ESR index { status:1, price:1, rating:-1 }
  Time: 11ms | SORT stage: true

Strategy 3: ESR index { status:1, rating:-1, price:1 }
  Time: 11ms | SORT stage: false

--- Results ---
  ESR has no SORT stage:     ✓
  Non-ESR has SORT stage:    ✓

✓ Performance check passed! ESR index eliminates the SORT stage.
```

**Execution evidence:** The check script ran three live MongoDB explain queries. The raw SORT stage presence/absence is a direct signal from MongoDB's execution planner, not an approximation. Strategies 1 and 2 both returned `SORT stage: true`; Strategy 3 returned `SORT stage: false`. The pass criteria checked this directly.

**What I learned:** The SORT stage — not execution time — is the reliable indicator that ESR is working. On a 10,000-document dataset on local hardware, all three strategies complete in 10–20ms because the dataset fits easily in memory. Timing differences at this scale are noise. What is deterministic is the presence or absence of `"SORT"` in the explain output: MongoDB's query planner adds a SORT stage only when it cannot use the index to satisfy the sort order. Eliminating this stage is the actual benefit of ESR ordering.

The non-ESR index `{ status: 1, price: 1, rating: -1 }` uses the index for the equality and range filters but cannot use it for sorting, because `rating` comes after `price` in the index. The ESR index `{ status: 1, rating: -1, price: 1 }` places the sort field before the range field, allowing MongoDB to traverse the index in sort order and return results directly.

**What was unclear:** The stage instructions asked me to run the check script — they did not ask me to run `explain()` directly in a MongoDB shell first. The README's Section 3.3 (the new learner-active step) instructed me to run three manual mongosh commands before the automated check. I did not have direct mongosh access in this execution context; the automated check provided equivalent evidence (the explain strategy outputs). The concept is fully demonstrated by the check output; the manual step would reinforce it visually but is not strictly necessary to understand the result.

**Attempts needed:** 1

---

### Stage 4: Trade-Offs & Design Decisions

**Goal as I understood it:** Write `INDEX_DECISIONS.md` documenting the rationale behind each index designed in Stage 2. Address which queries get indexes, why, and what trade-offs are being accepted (write cost, memory, selectivity).

**What I did:** Wrote decisions for all five indexes, covering:
- Rationale for field order choice
- Selectivity considerations (low-cardinality `status` field)
- Direction trade-offs (index direction must match sort direction)
- Multikey index cost for array fields (`tags`)
- Index prefix sharing across queries

Also wrote an overall trade-off summary covering write vs. read balance, memory cost, and prefix reuse.

**Milestone check result:** PASS

```
✓ INDEX_DECISIONS.md found
✓ Word count: 739
✓ All required keywords present (index, rationale, trade-off, performance, queries)
✓ INDEX_DECISIONS.md check passed!
```

**Execution evidence:** No MongoDB queries in Stage 4. The check validates the document's content (word count and keyword presence), not MongoDB state.

**What I learned:** Not all indexes deliver the same benefit. A low-cardinality equality field like `status` (3 values) still helps narrow the working set compared to a full collection scan, but its selectivity is limited. Higher-cardinality fields (like `category` with 15 values, or `price` with thousands of distinct values) provide better selectivity when used as equality fields.

Index prefix reuse was a new concept: a compound index with `status` as the first field serves not just its own query but also any query that filters on `status` alone, because MongoDB can use the leading fields of a compound index for prefix queries.

**What was unclear:** The Stage 4 scenario in the spec (Section 4.3, Queries X/Y/Z) gave a different set of queries to reason about — not the same five from Stages 1–2. This was slightly disorienting. The file I was writing decisions for (`INDEX_DECISIONS.md`) is checked against the Stage 2 indexes, but the example in the spec scaffolds reasoning about unrelated queries. The lab would be tighter if the Stage 4 decision document was explicitly about the Stage 2 indexes, which is how I interpreted it anyway.

**Attempts needed:** 1

---

### Stage 5: Reflection

**Goal as I understood it:** Write `REFLECTION.md` covering four sections: what I learned, decisions I made, where I got stuck, and how this transfers to real applications. Minimum 150 words.

**What I did:** Wrote a reflection articulating the ESR rule, the key decision in query 4 (sort before range), what was clear vs. unclear, and two transfer patterns: checking for SORT stage as a diagnostic tool, and index prefix reuse.

**Milestone check result:** PASS

```
✓ REFLECTION.md found
✓ Word count: 610
✓ All required sections present
✓ ESR concept articulated in reflection
✓ REFLECTION.md check passed!
```

**Execution evidence:** No MongoDB queries in Stage 5. The check validates section headers, word count, and presence of ESR keywords.

**What I learned:** Writing the reflection exposed one gap: I had not explicitly articulated the rule about sort direction in the index matching the query's sort direction until I tried to write it out. The stage worked as a consolidation step.

**What was unclear:** Nothing was ambiguous in Stage 5. The required section headers were stated, and the check validated them by name. An example reflection format (even a short one) would help calibrate depth expectations, but the word count minimum (150 words) provides a reasonable lower bound.

**Attempts needed:** 1

---

## Reflection Artifacts

### INDEX_DECISIONS.md

```markdown
# Index Decisions

## Index Decisions

### query1-status `{ status: 1 }`

**Rationale:** Query 1 is an equality-only filter on `status`. No sort or range field is present. The index covers just the equality field, which is sufficient to allow MongoDB to use an index scan instead of a collection scan for queries that filter by status.

**Trade-off:** The `status` field has only three values (active, archived, draft), making it low-cardinality. An index on a low-cardinality field offers limited selectivity — many documents will still match. For queries filtering on `status: 'active'`, roughly one-third of documents will pass the filter even with the index. Performance gains are modest. A more selective compound index would be better for high-volume queries.

### query2-status-createdAt `{ status: 1, createdAt: -1 }`

**Rationale:** Query 2 filters on `status` (equality) and sorts by `createdAt` descending. ESR order places equality first, sort second. This allows MongoDB to filter to matching status values and then return documents in `createdAt` order from the index itself — no in-memory sort stage is needed.

**Trade-off:** The `-1` direction on `createdAt` means this index cannot be used for a query sorting `createdAt` ascending. A separate index or a direction-reversal scan would be required for the ascending sort variant. Descending sort is the common case for "recent items first" queries, so the direction choice is reasonable.

### query3-status-price `{ status: 1, price: 1 }`

**Rationale:** Query 3 filters on `status` (equality) and `price` as a range. ESR order: E=status first, R=price second. There is no sort field in this query. Placing status first gives the index a more selective prefix, reducing the number of entries the range scan must traverse.

**Trade-off:** This index serves queries that combine a status equality filter with a price range. It also benefits query 1 as a prefix index (status-only queries can use this index's leading field). The cost is additional write overhead and index storage compared to a single-field price index.

### query4-status-rating-price `{ status: 1, rating: -1, price: 1 }`

**Rationale:** Query 4 has equality on `status`, sort on `rating` descending, and range on `price`. This is the canonical ESR example: E=status, S=rating, R=price. Placing the sort field (rating) before the range field (price) allows MongoDB to use the index order for sorting — no in-memory SORT stage is needed. Confirmed by Stage 3: the explain output shows no SORT stage with this index.

**Trade-off:** If the sort direction on `rating` changed to ascending, a new index would be required. If price range is very wide, many documents per status group will match, and the sort over all those documents is done via the index rather than in memory — still more efficient than a collection scan sort, but less dramatic than on a smaller dataset.

### query5-tags-createdAt-rating `{ tags: 1, createdAt: -1, rating: 1 }`

**Rationale:** Query 5 filters on `tags` (equality on an array field), sorts by `createdAt` descending, and filters on `rating` as a range. ESR order: E=tags, S=createdAt, R=rating. MongoDB indexes array fields by indexing each element individually, so `tags: 1` correctly handles the `tags: 'sale'` equality filter. Placing `createdAt` (sort) before `rating` (range) ensures no in-memory sort is needed.

**Trade-off:** Indexing array fields (multikey indexes) has a higher storage cost because each document contributes multiple index entries — one per tag value. A product with 4 tags produces 4 index entries. For collections with many tags per document, the index size grows significantly. The performance benefit for frequent queries on `tags` still justifies the trade-off.

## Overall Trade-Off Summary

- **Write vs. read trade-off:** Each of these 5 indexes adds overhead to every insert and update on the products collection. The trade-off is justified when the queries these indexes support are frequent enough that the read savings outweigh the write cost.
- **Memory cost:** Five compound indexes consume significantly more RAM than a single `_id` index. For production, index memory usage should be monitored.
- **Index prefix sharing:** query1, query2, query3, and query4 all share a `status` prefix. MongoDB can use a compound index to satisfy queries on leading fields (prefix queries). This means query1's equality filter on `status` can use the `query3-status-price` index even without a dedicated single-field `status` index — though having the simpler index is more selective for status-only queries.
```

### REFLECTION.md

```markdown
# Reflection: ESR Indexing Strategy Lab

## What I Learned

The ESR guideline (Equality, Sort, Range) is a rule for ordering fields in a compound MongoDB index. It matters because MongoDB traverses indexes left to right: equality filters narrow the working set first, sort fields allow the index to serve query sort order without an in-memory step, and range fields apply last. Placing a range field before a sort field forces MongoDB to sort results in memory after the range scan — the SORT stage in explain output. ESR eliminates this by placing sort before range. Field order in an index is not interchangeable; `{ status: 1, rating: -1, price: 1 }` and `{ status: 1, price: 1, rating: -1 }` are meaningfully different for queries that sort on rating and range on price.

When to compromise: a single-field or partial index may be preferable when a query is infrequent, when write throughput is a higher priority than read performance, or when the index would be very large (e.g., a multikey index on a high-cardinality array field).

## Decisions I Made

For query 4, I placed `rating` before `price` in the index. The Stage 3 check confirmed this decision was correct: the explain output showed no SORT stage with `{ status: 1, rating: -1, price: 1 }` but did show a SORT stage with the non-ESR `{ status: 1, price: 1, rating: -1 }`. This is the clearest proof point in the lab that ESR ordering does what the guideline claims.

For query 5, I identified `tags` as equality, `createdAt` as sort, and `rating` as range. The index `{ tags: 1, createdAt: -1, rating: 1 }` applies ESR order directly. This was the most complex of the five queries because it involved an array field and three distinct ESR roles simultaneously.

## When I Got Stuck

Stage 2 had no confusion because each query comment in the stub file already identified the E, S, R roles and the expected field order. The five queries were internally consistent: Stage 1 identification mapped directly to Stage 2 index design with no hidden steps or extra fields to infer.

The only inference required was sort direction. The stub comments say "sort" but do not state the direction as a separate rule. I inferred descending (`-1`) from the query comment which showed `.sort({ createdAt: -1 })`. This was straightforward but implicit.

## Transfer to Real Applications

The ESR rule applies to any compound index design decision in MongoDB, not just product catalogs. Any time a query combines an equality filter, a sort, and a range filter, the index field order should follow E→S→R to avoid an in-memory sort stage.

One pattern I would apply in a real system: if an index is correct but a query is still slow, check the explain output's SORT stage first. Wall-clock timing is unreliable on small datasets and variable hardware. The SORT stage is a deterministic signal that the index field order is wrong.

Index prefix reuse is also worth applying: if multiple queries share a leading equality field (e.g., all filter on `status`), a single compound index with `status` as the prefix can serve all of them for their status-filter component, reducing the total number of indexes needed.
```

---

## What I Learned About MongoDB

- **Compound index:** An index on multiple fields in a specified order. Field order determines which queries the index can fully support.
- **ESR guideline:** Design compound indexes with Equality fields first, then Sort fields, then Range fields. This order allows the index to both filter and sort in a single pass without additional in-memory steps.
- **SORT stage:** A query execution stage visible in `explain()` output where MongoDB sorts results in RAM after scanning. Appears as `"stage": "SORT"`. Eliminating it is the primary benefit of correct ESR ordering.
- **Equality filter:** A field tested with exact match (`field: value`). E.g., `{ status: 'active' }`. Should be the leftmost field(s) in the index.
- **Range filter:** A field tested with an inequality operator (`$gte`, `$lte`, `$gt`, `$lt`, `$in`). Should be the rightmost field(s) in the index.
- **Sort field:** The field used in `.sort()`. Should come after equality fields and before range fields in the index.
- **Index field direction:** `1` = ascending, `-1` = descending. Must match the query's sort direction for the index to eliminate the SORT stage.
- **Multikey index:** An index on an array field. MongoDB creates one index entry per array element per document. Larger than a scalar index but correct for equality queries on array values.
- **Index selectivity:** How many documents match the index's leading field. High-cardinality fields (many distinct values) are more selective. Low-cardinality fields like `status` (3 values) are less selective — the index still helps, but more documents pass the initial filter.
- **Index prefix:** A compound index can answer queries that filter on only the leading fields. `{ status: 1, createdAt: -1 }` can serve a query filtering on `status` alone using just the prefix.
- **explain("executionStats"):** MongoDB command for inspecting query execution. The `executionStages` tree shows which indexes were used and which stages (IXSCAN, SORT, COLLSCAN) were executed.
- **Collection scan (COLLSCAN):** MongoDB reads every document to satisfy the query. Slow for large collections. Indexes replace collection scans for the fields they cover.

---

## Learning Effectiveness

| Dimension | Score | Evidence |
|---|---|---|
| Clarity | ✓ | Instructions were specific and acted on without guessing. Query comments in the stub files showed the exact query, the ESR roles, and the expected field order. No ambiguity required assumption-making. |
| Progression | ✓ | Stage 1 ESR identification fed directly into Stage 2 index design — same 5 queries, same field labels. Stage 3 validated why Stage 2's field order mattered by showing the SORT stage appear and disappear. Stage 4 applied the same understanding to a cost/benefit framing. |
| Scaffolding | ✓ | Stage 1 and 2 provided query comments restating the ESR roles alongside the answer slots. Stage 3 was fully automated with clear output. Stages 4 and 5 required free-form writing but specified required keywords and section headers. Scaffolding reduction across stages was appropriate. |
| Contrast | ✓ | Stage 3 shows all three strategies (no index, non-ESR, ESR) in a single run, making the SORT stage contrast visible and immediate. Stage 2 stub comments introduced the contrast concept before query 3: non-ESR `{ status, price, rating }` vs. ESR `{ status, rating, price }`. The contrast is now embedded in the instructional content rather than only in the check output. |
| Checkability | ✓ | Stage 1 check validates E/S/R answers against correct values (knowledge check, not just format). Stage 2 check validates exact index field order and directions. Stage 3 check validates the SORT stage signal — a deterministic measure of conceptual correctness. Stages 4 and 5 check keywords and word count only; content quality is not validated, but the structural prompts (required sections) guide meaningful writing. |
| Reflection | ✓ | INDEX_DECISIONS.md (Stage 4) required articulating rationale for each index. REFLECTION.md (Stage 5) required articulating the rule, key decisions, and transfer. Writing the rationale for index prefix sharing and multikey indexes in Stage 4 surfaced understanding that was implicit when filling in the stubs. |

**Overall effectiveness score:** 6/6

---

## Where I Got Stuck

| Stage | Issue | Classification | Description |
|---|---|---|---|
| 2 | Sort direction not stated as a rule | Lab Instruction | The stub comments describe ESR field order but do not state "use the direction from the query's .sort() call" as an explicit rule. I inferred it from the query comment. Straightforward but implicit. |
| 3 | Manual explain step not executable | Environment | Section 3.3 instructs the learner to run three manual `mongosh` commands. In the current execution context (agent with file/script access, no direct mongosh shell), the manual step was not executable. The automated `check:explain` provided equivalent evidence. This is an agent-specific limitation, not a design flaw. |
| 4 | Stage 4 scenario mismatch | Lab Instruction | The spec's Section 4.3 scaffold example uses different queries (X/Y/Z) unrelated to the lab's five queries. The INDEX_DECISIONS.md check validates the document against the Stage 2 indexes. The disconnect between the scaffolding example and the deliverable could confuse a learner who writes decisions about queries X/Y/Z instead of queries 1–5. I interpreted the stage correctly but the spec should clarify this explicitly. |

---

## Questions I Still Have

1. **Covered queries:** The reflection mentioned index prefix reuse, but I'm unclear when MongoDB uses a longer compound index for a query that only needs a prefix (e.g., using `{ status: 1, rating: -1, price: 1 }` for a status-only query). Does the longer index always serve the prefix query, or only in specific conditions?
2. **Multiple sort fields:** The spec mentions "multiple sorts" as an edge case. If a query sorts on two fields (e.g., `.sort({ rating: -1, price: 1 })`), how does ESR extend? Are both sort fields placed between E and R?
3. **Partial indexes:** Could a partial index (e.g., `{ rating: -1, price: 1 }` with a filter `{ status: 'active' }`) reduce index size compared to the full compound index? The lab doesn't address partial indexes.
4. **Index intersection:** The glossary in Stage 1 mentions "index intersection" as inefficient but doesn't explain what it is or when MongoDB does it. When would MongoDB intersect two single-field indexes instead of using one compound index?

---

## Recommendations

1. **Stage 2 — state sort direction as a rule.** Add one sentence to the stub comments or the Stage 2 introduction: "Set the direction to `-1` if the query's `.sort()` uses `-1`, and `1` if it uses `1`. Direction must match the query's sort direction for the index to eliminate the SORT stage." This is implied by the example but never stated explicitly.

2. **Stage 4 — clarify the deliverable scope.** Section 4.3's scaffold example uses queries X/Y/Z. The INDEX_DECISIONS.md deliverable (and the check) is about the Stage 2 indexes (queries 1–5). Add one sentence clarifying: "Write decisions for the five indexes you created in Stage 2, not for the scenario queries above." The scenario is useful for teaching the trade-off reasoning; the scope ambiguity should be removed.

3. **Stage 3 — note that manual mongosh steps are optional for automated environments.** Section 3.3 instructs the learner to run manual explain commands. For agent learners running in non-interactive environments, this step is not executable. A note ("If you have mongosh access, run these commands directly. If not, the automated check provides equivalent output.") would prevent confusion without removing the learner-active step for environments where it is possible.

4. **Stage 1 glossary — expand "index intersection" definition.** The term is introduced in the Stage 1 glossary but not explained. A one-sentence definition ("MongoDB can combine results from two single-field indexes to answer a query, but this is slower than using a single compound index because it requires merging two result sets") would complete the concept.

---

## Feedback for Spec Revision

**Stages that need spec revision:**
- **Stage 2:** Explicit statement of sort direction rule (minor addition, high clarity payoff)
- **Stage 4:** Clarify that INDEX_DECISIONS.md should cover the Stage 2 indexes, not the scenario queries in Section 4.3

**Stages that need environment fixes:**
- None. All five milestone checks passed on first attempt. The Stage 3 fix (SORT stage as pass criterion) worked correctly — the check passed deterministically on the first run.

**Stages where scaffolding was insufficient:**
- None at a blocking level. The Stage 2 stub comments were significantly improved from v1. All five indexes were derived cleanly from Stage 1 answers with no guessing required.

---

## Transfer Task

**Problem statement:** A hospital app runs this query thousands of times per day:

```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

The `appointments` collection has 500,000 documents. The query currently takes 800ms. Design the optimal ESR index. Explain your field order choice. State what the explain output will look like before and after your index is applied.

---

**Your response:**

**Index:**
```javascript
db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })
```

**Field order reasoning:**

Applying ESR to this query:
- `doctorId: "dr-smith"` is an exact match → **E = doctorId**
- `.sort({ urgency: -1 })` → **S = urgency**
- `appointmentDate: { $gte: ..., $lte: ... }` is a range → **R = appointmentDate**

ESR order: `doctorId` (E) → `urgency` (S) → `appointmentDate` (R)

**Why urgency must come before appointmentDate:**

The query sorts results by `urgency` descending. MongoDB can use the index to satisfy this sort — but only if the sort field appears in the index before any range fields. If the index were `{ doctorId: 1, appointmentDate: 1, urgency: -1 }` (non-ESR), MongoDB would need to scan all of May's appointments for dr-smith, then sort them in memory by urgency. That in-memory sort produces a SORT stage in explain output.

With the ESR index `{ doctorId: 1, urgency: -1, appointmentDate: 1 }`, MongoDB traverses the index in `(doctorId, urgency)` order first, then applies the date range within each urgency bucket. No SORT stage is needed because the index already delivers results in descending urgency order within each doctor's namespace.

**Expected explain output — before (no custom index):**
- `stage: "COLLSCAN"` or `stage: "SORT"` with `docsExamined: 500000`
- `executionTimeMillis: ~800`

**Expected explain output — after (ESR index applied):**
- No `"SORT"` stage in execution tree
- `stage: "IXSCAN"` using `doctorId_1_urgency_-1_appointmentDate_1`
- `docsExamined ≈ nReturned` (only May appointments for dr-smith examined)
- `executionTimeMillis: significantly lower` — exact value depends on selectivity of `doctorId` filter and date range size

**What I drew on from the lab:**
- The ESR classification rule applied directly: equality match = E, `.sort()` field = S, range operator = R
- The Stage 3 insight that placing sort before range is what eliminates the SORT stage — not just having all three fields in the index
- The Stage 3 contrast example: non-ESR `{ status, price, rating }` forces in-memory sort; ESR `{ status, rating, price }` eliminates it. The same logic applies here with `{ doctorId, appointmentDate, urgency }` vs. `{ doctorId, urgency, appointmentDate }`
- The observation that timing-based performance claims are secondary; the SORT stage is the deterministic signal

**What I had to figure out that the lab didn't cover:**
- The lab uses `urgency` as a sort field but the lab's product catalog doesn't have an equivalent "priority" sort — I had to confirm mentally that the same ESR rule applies regardless of what the sort field semantically means
- The lab didn't discuss selectivity explicitly for the transfer domain: `doctorId` could be high or low cardinality depending on the system. For a large hospital (thousands of doctors), `doctorId` would be highly selective — the index prefix would narrow to a small fraction of documents before the sort and range are applied. This is a favorable condition for the ESR index.
- Nothing else needed to be figured out beyond the lab. The transfer applied cleanly.
