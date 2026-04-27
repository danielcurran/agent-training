# Learning Report: ESR Indexing Strategy Lab (v2 Spec — Controlled Test)

Date: 2026-07-25
Starting knowledge state: No prior MongoDB knowledge
Spec variant: `esr-indexing-strategy-tech-spec-v2.md` (controlled test — Stage 3 non-ESR contrast removed)

---

## What I Was Asked to Do

The lab asked me to learn the ESR (Equality, Sort, Range) guideline for designing MongoDB compound indexes. Starting from a 10,000-document product catalog with no custom indexes, I worked through five stages: identifying the E, S, and R roles in five queries; designing compound indexes following ESR order; observing the explain output difference between no-index and ESR strategies; documenting index trade-off decisions; and reflecting on what I learned and where it transfers.

> **Controlled test note:** This is the v2 spec variant. Stage 3 was modified to show only a before/after comparison (no index → ESR index). The non-ESR index contrast shown in the original spec's Stage 3 was removed. This tests whether the Stage 1 SQL bridge framing alone is sufficient for sense-making transfer, or whether the Stage 3 non-ESR scaffolding is the active learning ingredient.

---

## Stage-by-Stage Summary

### Stage 1: ESR Identification

**Goal as I understood it:** For each of five queries, identify which field serves as E (equality), S (sort), and R (range). Record answers in `src/stage1-esr-identification.js`.

**What I did:** Read the stub file. Each query was shown in a comment directly above the answer slot. Applied the ESR classification rule:
- Equality: field tested with exact match (`field: value`)
- Sort: field used in `.sort()`
- Range: field tested with inequality operators (`$gte`, `$lte`, `$in`, etc.)
- `'none'` if a role has no corresponding field in the query

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

**What I learned:** ESR classification is a systematic read of any MongoDB query. E fields appear with exact-match syntax; S fields appear in `.sort()`; R fields use inequality operators. The five queries were internally consistent — `status` served as the equality field across queries 1–4, making the pattern visible.

**What was unclear:** Nothing blocked. Query 5's `tags: 'sale'` (equality on an array field) required a moment's pause — I wasn't certain whether matching a value in an array counted as an equality filter. Re-reading the example in the README ("field used in exact match: field === value") confirmed it does.

**Attempts needed:** 1

---

### Stage 2: Design ESR Indexes

**Goal as I understood it:** Using my Stage 1 E/S/R answers, create one compound index per query in `src/indexes.js`. Fields must appear in E→S→R order. Sort direction must match the query's `.sort()` direction.

**What I did:** Read the index stub file. Each entry had a comment restating the ESR roles and the expected field order. Applied Stage 1 answers directly:
- Q1: `{ status: 1 }` — equality only
- Q2: `{ status: 1, createdAt: -1 }` — E→S; sort is descending
- Q3: `{ status: 1, price: 1 }` — E→R; no sort
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

**What I learned:** Field order in an index is not interchangeable. `{ status: 1, rating: -1, price: 1 }` and `{ status: 1, price: 1, rating: -1 }` contain the same fields but produce different query execution plans. Query 4 is the clearest example of this — the sort field (`rating`) must come before the range field (`price`).

**Attempts needed:** 1

---

### Stage 3: Performance Comparison

**Goal as I understood it:** Observe how the ESR index changes query explain output for Query 4. Run `npm run check:explain` to see the before and after.

**What I did:** Ran `npm run check:explain`. The script automated two strategies:
1. Dropped custom indexes → ran query 4 with no index → captured explain
2. Created ESR index `{ status: 1, rating: -1, price: 1 }` → ran query 4 → captured explain

**Milestone check result:** PASS on first attempt

```
Running performance comparison for Query 4...

Before (No Index):
- Documents Examined: 10000
- Execution Time: 7ms
- Sort Stage: YES

After (ESR Index):
- Documents Examined: 775
- Execution Time: 1ms
- Sort Stage: NO

--- Results ---
  ESR has no SORT stage: ✓

✓ ESR eliminates in-memory sort

Note: Execution time is shown for reference only. The SORT stage is the pass criterion.
```

**Execution evidence:** The check script ran two live MongoDB explain queries. The SORT stage presence/absence is a direct signal from MongoDB's execution planner. Before the ESR index: 10,000 documents examined, SORT stage present. After: 775 documents examined, SORT stage gone.

**What I learned:** The SORT stage — not execution time — is the reliable indicator that ESR is working. The before/after contrast showed two things simultaneously: (1) the ESR index reduced document examination from 10,000 to 775 (index scan vs. collection scan); and (2) the SORT stage disappeared because the index is now ordered such that sort order is satisfied during index traversal.

**What was notably absent:** The stage showed only two strategies — no index, then ESR index. I did not see a non-ESR index comparison (e.g., `{ status: 1, price: 1, rating: -1 }` with sort field after range). From Stage 1's explanation of why E→S→R matters, I understood the principle: if the range field precedes the sort field in the index, MongoDB cannot traverse the index in sort order because range-matched entries are not consecutively ordered by the sort field. But this was reasoned from Stage 1's framing — I did not observe it directly in Stage 3's automated check.

**Attempts needed:** 1

---

### Stage 4: Trade-Offs & Design Decisions

**Goal as I understood it:** Write `INDEX_DECISIONS.md` with rationale for index choices given a constrained scenario: three queries, maximum 2 indexes.

**What I did:** Applied the ESR understanding to a cost/benefit framing across three queries with different frequencies:
- Query X (50×/sec, 500ms without index → 5ms with) → Index 1: `{ user_id: 1, updated: -1, created: 1 }`
- Query Y (10×/sec, 120ms without → 10ms with) → Index 2: `{ status: 1, updated: -1 }`
- Query Z (2×/min, 60ms without → 8ms with) → Skipped

**Milestone check result:** PASS

```
✓ INDEX_DECISIONS.md found
✓ Word count: 239
✓ All required keywords present (index, rationale, trade-off, performance, queries)
✓ INDEX_DECISIONS.md check passed!
```

**What I learned:** Not all queries warrant an index. The decision is a time-savings calculation: multiply the per-query savings by query frequency to get total time saved. Query X saves ~495ms × 50/sec = enormous impact; Query Z saves ~52ms × 2/min = negligible. Indexes add write overhead (~2% per index), so skipping rarely-called queries is correct unless their latency is a blocking concern.

**Attempts needed:** 1

---

### Stage 5: Reflection

**Goal as I understood it:** Write `REFLECTION.md` covering four sections — what I learned, decisions I made, where I got stuck, and transfer — with at least 150 words and all ESR keywords.

**What I did:** Wrote ~450 words across four sections articulating the ESR rule, the key decision in Query 4, the Query 5 array field clarification, and a transfer example using a ride-sharing `trips` collection.

**Transfer example I wrote:**
> `db.trips.find({ driverId: "d-42", startTime: { $gte: today } }).sort({ fare: -1 })` — E=driverId, S=fare, R=startTime → index `{ driverId: 1, fare: -1, startTime: 1 }`. Non-ESR `{ driverId: 1, startTime: 1, fare: -1 }` would produce a SORT stage because the range field precedes the sort field.

**Milestone check result:** PASS

```
✓ REFLECTION.md found
✓ Word count: 454
✓ All required sections present
✓ ESR concept articulated in reflection
✓ REFLECTION.md check passed!
```

**Attempts needed:** 1

---

## Final Check

```
=== ESR Indexing Strategy Lab — Full Check ===

[PASSED] Environment
[PASSED] Stage 1: ESR Identification
[PASSED] Indexes
[PASSED] Performance
[PASSED] Decisions
[PASSED] Reflection

=== Summary ===
✓ All checks passed! Lab complete.
```

**Score: 6/6**

---

## What I Learned About MongoDB

- **Compound index:** An index on multiple fields in a specified order. Field order determines which queries the index can fully support.
- **ESR guideline:** Design compound indexes with Equality fields first, then Sort fields, then Range fields. This order allows the index to both filter and sort in a single pass without additional in-memory steps.
- **SORT stage:** A query execution stage visible in `explain()` output where MongoDB sorts results in RAM after scanning. Appears as `"stage": "SORT"`. Eliminating it is the primary benefit of correct ESR ordering.
- **Equality filter:** A field tested with exact match (`field: value`). Should be the leftmost field(s) in the index.
- **Range filter:** A field tested with inequality operators (`$gte`, `$lte`, `$gt`, `$lt`, `$in`). Should be the rightmost field(s) in the index.
- **Sort field:** The field in `.sort()`. Should come after equality fields and before range fields in the index.
- **Index field direction:** `1` = ascending, `-1` = descending. Must match the query's sort direction for the index to eliminate the SORT stage.
- **Multikey index:** An index on an array field. MongoDB creates one index entry per array element per document.
- **Index selectivity:** How many documents match the index's leading field. High-cardinality fields are more selective.
- **Documents examined vs. returned:** The explain stat gap between `totalDocsExamined` and `nReturned` shows how efficiently the index narrows the result set. Before the ESR index: 10,000 examined, ~775 returned. After: 775 examined, ~775 returned.

---

## Learning Effectiveness

| Dimension | Score | Evidence |
|---|---|---|
| Clarity | ✓ | Instructions were specific. Query comments in stub files showed exact query, ESR roles, and expected field order. No ambiguity required assumption-making. |
| Progression | ✓ | Stage 1 identification fed directly into Stage 2 index design — same 5 queries, same field labels. Stage 3 validated why Stage 2's field order mattered by showing the SORT stage appear and disappear. Stage 4 extended understanding to cost/benefit reasoning. |
| Scaffolding | ✓ | Stage 1 and 2 provided query comments restating ESR roles alongside answer slots. Stage 3 was fully automated. Stages 4 and 5 required free-form writing with structural guidance (required keywords/section headers). Scaffolding reduction was appropriate. |
| Contrast | △ | **The v2 change is directly visible here.** Stage 3 shows only two strategies: no-index and ESR. The non-ESR contrast (showing that a wrongly ordered index also fails) was absent from the automated check. The before/after comparison was sufficient to demonstrate that ESR *works*. However, the mechanism *why* it works — that the sort field must precede range specifically — required reasoning from Stage 1's description rather than from live observation. |
| Checkability | ✓ | Stage 1 check validates E/S/R answers against correct values. Stage 2 validates exact index field order and directions. Stage 3 validates the SORT stage — a deterministic measure. Stages 4 and 5 check keywords and section headers. |
| Reflection | ✓ | INDEX_DECISIONS.md required articulating rationale for each index decision. REFLECTION.md required stating the rule, key decisions, and a transfer application. Writing the reflection surfaced the understanding that the non-ESR arrangement of fields produces a SORT stage, derived from Stage 1's explanation. |

**Overall effectiveness score:** 5.5/6 (△ on Contrast)

---

## Where I Got Stuck

| Stage | Issue | Classification | Description |
|---|---|---|---|
| 1 | Array field equality ambiguity | Minor Lab Instruction | Query 5's `tags: 'sale'` (equality on array field) required a moment's pause. Re-reading the README example resolved it. Low blocking risk. |
| 2 | Sort direction not stated as a rule | Minor Lab Instruction | The stub comments describe ESR field order but do not state "use the direction from the query's `.sort()` call" as an explicit rule. Inferred from query comments. Straightforward but implicit. |
| 3 | No non-ESR contrast in Stage 3 | Design (intentional) | Stage 3 showed only before (no index) → after (ESR index). The mechanism that a wrongly-ordered index also produces a SORT stage had to be derived from Stage 1's description. This is the controlled test variable. |

---

## Transfer Task

**Problem statement:** A hospital app runs this query thousands of times per day:

```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

The `appointments` collection has 500,000 documents. The query currently takes 800ms. Design the optimal ESR index. Explain your field order choice. State what the explain output will look like before and after.

---

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

The query sorts results by `urgency` descending. MongoDB can use the index to satisfy this sort — but only if the sort field appears in the index before any range field. If the index were `{ doctorId: 1, appointmentDate: 1, urgency: -1 }` (range before sort), MongoDB would scan all of May's appointments for dr-smith using the range, and then sort them in memory by urgency. That in-memory sort produces a SORT stage.

With the ESR index `{ doctorId: 1, urgency: -1, appointmentDate: 1 }`, MongoDB traverses the index in `(doctorId, urgency)` order first, then applies the date range as a filter within each urgency bucket. No in-memory SORT is needed because the index already delivers results in descending urgency order.

**Expected explain output — before (no custom index):**
- `"stage": "SORT"` present in execution tree
- `totalDocsExamined: 500000`
- `executionTimeMillis: ~800`

**Expected explain output — after (ESR index applied):**
- No `"SORT"` stage in execution tree
- `"stage": "IXSCAN"` using `doctorId_1_urgency_-1_appointmentDate_1`
- `totalDocsExamined ≈ nReturned` (only May appointments for dr-smith scanned)
- `executionTimeMillis`: significantly lower; exact value depends on the fraction of appointments matching dr-smith in May

**What I drew on from the lab:**
- The ESR classification rule applied directly: equality match = E, `.sort()` field = S, range operator = R
- Stage 3's before/after contrast showed that adding the ESR index eliminates the SORT stage — the same mechanism applies here
- Stage 1's explanation that the sort field must precede the range field for the index to provide sorted output without an in-memory step — this is what I used to reason about the non-ESR alternative; I did not observe it live in Stage 3

---

## Transfer Task Assessment

| Criterion | Result | Notes |
|---|---|---|
| **Fluency:** Correct index syntax | ✓ PASS | `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` — correct field order, correct directions |
| **Induction:** Field order justified by E/S/R roles (not analogy) | ✓ PASS | Identified doctorId=E, urgency=S, appointmentDate=R from query structure |
| **Sense-Making:** Explains why non-ESR (`{ doctorId, appointmentDate, urgency }`) would produce SORT stage | ✓ PASS | Named the SORT stage mechanism and the range-before-sort cause |

**Transfer score: 3/3**

**Experimental finding:** Despite Stage 3 not showing the non-ESR contrast directly, the learner correctly identified and explained the SORT stage mechanism for a non-ESR arrangement. The Stage 1 SQL bridge framing ("sort field must precede range field") was sufficient to enable sense-making transfer. The learner explicitly noted that the non-ESR reasoning was derived from Stage 1 description, not Stage 3 observation.

---

## Questions I Still Have

1. **Non-ESR observation:** I understood that `{ doctorId, appointmentDate, urgency }` would produce a SORT stage because Stage 1 described why. But I never saw a non-ESR index fail live. Would observing it fail in Stage 3 change the durability of this understanding over time, or is the Stage 1 description sufficient?

2. **Multiple sort fields:** If a query sorts on two fields (e.g., `.sort({ urgency: -1, appointmentDate: -1 })`), how does ESR handle the S position? Are both sort fields placed between E and R?

3. **Index direction reversal:** If a query could sort both ascending and descending, can a compound index be used in reverse, or does a new index need to be created?

4. **Covered queries:** When would MongoDB choose a longer compound index (e.g., the 3-field ESR index) for a query that only needs the leading equality field?

---

## Recommendations

1. **Stage 3 — add an optional non-ESR contrast note.** The v2 check shows only no-index → ESR. A note ("You can optionally observe what happens with a non-ESR index — try creating `{ status: 1, price: 1, rating: -1 }` before running the check") would let learners verify the mechanism live without it being a required pass criterion. This would preserve the controlled test condition in the check while giving learners an optional discovery path.

2. **Stage 2 — state sort direction as an explicit rule.** Add one sentence: "Set the direction to `-1` if the query's `.sort()` uses `-1`, and `1` if it uses `1`. The index direction must match the sort direction to eliminate the SORT stage." This is implied by the examples but never stated.

3. **Stage 4 — clarify deliverable scope.** The spec's Section 4.3 scaffold uses queries X/Y/Z unrelated to the Stage 2 indexes. The check validates INDEX_DECISIONS.md content for Stage 2's five indexes. Clarify: "Write decisions for the indexes in this scenario — not for the Stage 2 queries." The scenario is correctly scoped; the ambiguity is in how the document should be structured.

4. **Stage 1 — add one clarifying sentence about array equality.** "For array fields, `tags: 'sale'` is an equality filter — MongoDB checks whether the array contains the value, which counts as an E field in ESR." This removes the moment of uncertainty visible at Query 5.

---

## Controlled Test Evaluation

**Hypothesis tested:** Is the Stage 3 non-ESR contrast the mechanism that enables sense-making transfer, or is the Stage 1 SQL bridge framing sufficient?

**Outcome:** The Stage 1 SQL bridge framing was sufficient. The learner:
1. Correctly named `urgency` as S and `appointmentDate` as R in an unfamiliar domain
2. Produced the correct non-ESR alternative (`{ doctorId, appointmentDate, urgency }`) without prompting
3. Correctly explained that the non-ESR arrangement would produce a SORT stage because range precedes sort in the index

**Explicit evidence:** The learner explicitly attributed this reasoning to Stage 1 framing: *"this was reasoned from Stage 1's framing — I did not observe it directly in Stage 3's automated check."*

**Comparison to v2 run (original spec):** In the v2 run (original spec with non-ESR contrast in Stage 3), the learner also achieved 3/3 transfer and also named the SORT stage mechanism. In this v2-spec (controlled test) run, the learner achieved 3/3 transfer without having observed the non-ESR contrast live. Both runs: same transfer score, same quality of SORT stage explanation.

**Implication:** The Stage 3 non-ESR contrast is not the sole active ingredient for sense-making transfer. The Stage 1 SQL bridge ("sort field must precede range field" framing) appears to encode the mechanism sufficiently for transfer to a new domain. The Stage 3 contrast may reinforce and confirm what Stage 1 established, but is not necessary for the transfer to occur.

**Caveat:** This is a single-agent run. The finding is consistent with the hypothesis but not conclusive. Multiple agent runs, especially with varying Stage 1 clarity conditions, would strengthen the inference.
