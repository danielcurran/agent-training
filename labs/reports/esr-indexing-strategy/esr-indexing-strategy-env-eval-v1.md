# Learning Report: ESR Indexing Strategy Lab

Date: 2026-04-22
Starting knowledge state: No prior MongoDB knowledge

---

## What I Was Asked to Do

The lab asked me to learn the ESR (Equality, Sort, Range) guideline for designing MongoDB compound indexes. I was given a dataset of 10,000 product documents and five representative queries. Working through five stages, I identified which fields in each query serve as Equality, Sort, or Range components; designed index definitions following the ESR order; observed how the ESR index eliminates an in-memory SORT stage; documented trade-off decisions; and reflected on what I learned and how it transfers to real applications.

---

## Stage-by-Stage Summary

### Stage 1: ESR Identification

**Goal as I understood it:** For each of five queries, identify which field (if any) is the Equality filter, which is the Sort field, and which is the Range filter. Record answers in `src/stage1-esr-identification.js`.

**What I did:** Read the template file. Each query was shown in a comment above the answer slot. I applied the ESR rule: exact-match fields → E, `.sort()` field → S, `$gte`/`$lte`/`$in` fields → R, absent role → `'none'`.

**Milestone check result:** PASS — 5/5 correct.

```
✓ query1: E=status, S=none, R=none
✓ query2: E=category, S=createdAt, R=none
✓ query3: E=none, S=none, R=price
✓ query4: E=status, S=rating, R=price
✓ query5: E=tags, S=createdAt, R=none
Score: 5/5
```

**What I learned:** The ESR classification is a systematic way to read a query. Even before thinking about indexes, you can label every field used as E, S, or R (or none). This gives a direct recipe for index field order.

**What was unclear:** Nothing in Stage 1 was ambiguous. The template was well-structured. The query was shown directly above the answer slot.

**Attempts needed:** 1

---

### Stage 2: Design Indexes

**Goal as I understood it:** Using my Stage 1 ESR answers, create one compound index per query. Fields should appear in E → S → R order. Fill in `src/indexes.js`.

**What I did:** Applied ESR order directly from Stage 1 answers.

**Attempt 1 results:** FAIL — query3 and query5 were wrong.

```
✓ query1-status: {"status":1}
✓ query2-category-createdAt: {"category":1,"createdAt":-1}
✗ query3-status-price:
    Expected: {"status":1,"price":1}
    Got:      {"price":1}
✓ query4-status-rating-price: {"status":1,"rating":-1,"price":1}
✗ query5-tags-createdAt-rating:
    Expected: {"tags":1,"createdAt":-1,"rating":1}
    Got:      {"tags":1,"createdAt":-1}
```

**Analysis of failures:**
- **query3:** My Stage 1 answer correctly identified E=none, S=none, R=price. Pure ESR gives `{ price: 1 }`. But the expected index is `{ status: 1, price: 1 }`. `status` is not in query3's filter. No instruction in the lab explains why `status` is included. The only hint is the index name `query3-status-price`.
- **query5:** My Stage 1 answer correctly identified E=tags, S=createdAt, R=none. Pure ESR gives `{ tags: 1, createdAt: -1 }`. But the expected index is `{ tags: 1, createdAt: -1, rating: 1 }`. `rating` is neither a filter nor a sort field in query5. Again, no instruction explains this.

**Attempt 2:** Used the index names as hints — `query3-status-price` implies `status` + `price`; `query5-tags-createdAt-rating` implies adding `rating`. Updated accordingly.

**Milestone check result (attempt 2):** PASS — 5/5.

```
✓ query3-status-price: {"status":1,"price":1}
✓ query5-tags-createdAt-rating: {"tags":1,"createdAt":-1,"rating":1}
✓ All indexes correct!
```

**What I learned:** ESR field order is the primary determinant of whether MongoDB can eliminate a SORT stage. For query4, placing `rating` (Sort) before `price` (Range) is what allows the in-memory sort to be skipped — confirmed in Stage 3. I also observed that some indexes include fields not present in the specific query, presumably to serve multiple queries, but this concept was not explained by the lab.

**What was unclear:** Why `status` appears in the query3 index and why `rating` appears in the query5 index. The lab instructs learners to apply ESR but then expects results that don't follow from strict ESR application of those queries. This is the most significant instructional gap in the lab.

**Attempts needed:** 2

---

### Stage 3: Measure Performance (Automated)

**Goal as I understood it:** Observe the explain output difference between no index, a non-ESR index, and an ESR index for query4. Verify that the ESR index eliminates the SORT stage and is significantly faster.

**What I did:** Ran `npm run check:explain` three times.

**Milestone check results:** FAIL (all 3 attempts)

```
Strategy 1: No index — Time: 19ms | SORT stage: true
Strategy 2: Non-ESR index — Time: ~11ms | SORT stage: true
Strategy 3: ESR index — Time: ~12ms | SORT stage: false

ESR has no SORT stage: ✓
Speedup (no index / ESR): 1.5–2.2x ✗
```

**Core finding observed:** The ESR index **does** eliminate the SORT stage — the primary proof of correct ESR design. This is confirmed on every run. The check fails only because the speedup ratio threshold (50×) is never met.

**Root cause:** With 10,000 documents on a modern laptop, all three strategies complete in under 25ms. Achieving a 50× speedup (requiring ESR ≤ 0.4ms) is physically impossible at this scale. The lenient fallback (≤5ms) is also not triggered because queries take 10–13ms regardless of strategy.

**What I learned:** The explain output's SORT stage is the reliable signal for ESR correctness — not wall-clock timing. Timing comparisons are unreliable on small datasets. I understand the concept; the check cannot validate it at this scale.

**Attempts needed:** 3 — incomplete (environment issue, not learner error)

---

### Stage 4: Trade-Off Decisions

**Goal as I understood it:** Create `INDEX_DECISIONS.md` documenting the rationale behind each index design, trade-offs made, and performance considerations.

**What I did:** Wrote a document covering all five indexes with rationale, trade-offs for each, and a general trade-offs section. Flagged the query3 and query5 cases where the expected answer diverged from ESR.

**Milestone check result:** PASS

```
✓ INDEX_DECISIONS.md found
✓ Word count: 599
✓ All required keywords present
```

**What I learned:** Writing out decisions surfaces understanding gaps. Writing "I don't know why status is in query3's index" forced me to recognise it as an unresolved question rather than quietly moving on.

**What was unclear:** The lab doesn't scaffold the structure of INDEX_DECISIONS.md. It's entirely learner-generated. The check only validates word count and keywords — it doesn't verify that the content is accurate or meaningful. A learner could write 100 words of filler and pass.

**Attempts needed:** 1

---

### Stage 5: Reflection

**Goal as I understood it:** Write `REFLECTION.md` with four required sections covering what I learned, decisions I made, where I got stuck, and how this transfers to real applications.

**What I did:** Wrote a reflection covering all four sections. Explicitly articulated the ESR rule in my own words and described where I'd apply it in practice.

**Milestone check result:** PASS

```
✓ REFLECTION.md found
✓ Word count: 614
✓ All required sections present
✓ ESR concept articulated in reflection
```

**What was unclear:** Nothing in Stage 5 was ambiguous. The required section headers were specified in the README and the check validated them mechanically.

**Attempts needed:** 1

---

## What I Learned About MongoDB

- **Compound index:** An index on multiple fields, in a specified order. Field order determines which queries the index can support.
- **ESR guideline:** Design compound indexes with Equality fields first, then Sort fields, then Range fields. This order allows the index to both filter and sort without an additional in-memory step.
- **SORT stage:** A query execution stage where MongoDB sorts results in memory after scanning. It appears in `explain()` output as `"SORT"`. Eliminating it reduces memory usage and improves performance on large collections.
- **Equality filter:** A field tested with exact match (`field === value`). E.g., `{ status: 'active' }`.
- **Range filter:** A field tested with an inequality operator (`$gte`, `$lte`, `$gt`, `$lt`, `$in`). E.g., `{ price: { $gte: 50, $lte: 500 } }`.
- **Index selectivity:** An index on a low-cardinality field (like `status` with 3 values) scans many documents. Higher-cardinality fields (like `category`) are more selective.
- **Index field direction:** `-1` means descending, `1` means ascending. The direction must match the query's sort direction for the index to eliminate the SORT stage.
- **explain() output:** MongoDB's tool for inspecting how a query is executed. The winning plan shows which index was used and which execution stages ran.
- **Multi-query index design:** Indexes can be designed to serve multiple queries by including a common prefix field, even if that field isn't in every query's filter. (Introduced implicitly; not explained by the lab.)

---

## Learning Effectiveness

| Dimension | Score | Evidence |
|---|---|---|
| Clarity | △ | Stage 1 instructions were clear and well-scaffolded. Stage 2 instructions were clear for ESR-pure indexes but did not explain why some expected answers included fields absent from the query. Learner had to reverse-engineer the answer from the index name. |
| Progression | ✓ | Each stage built on the last. Stage 1 ESR identification fed directly into Stage 2 index design, which fed into Stage 3 performance observation. No concept was required before it was taught. |
| Scaffolding | △ | Stage 1 had full scaffolding: query in comment, exact slot to fill, worked example. Stage 2 had index names as implicit hints but no explanation of multi-query design. Stages 4 and 5 had no structural template — only keyword requirements validated by the check. |
| Contrast | ✗ | The lab never showed what a wrong index approach looks like before showing the correct one. Stage 3 does compare three strategies (no index, non-ESR, ESR) in the automated check, but the learner only sees the output — they don't actively reason through the non-ESR approach. No SQL instinct → MongoDB pattern bridge exists. |
| Checkability | △ | Stage 1 check accurately validates ESR understanding. Stage 2 check validates index field order correctly but expects answers that diverge from the taught rule without explanation. Stage 3 check validates the right thing (SORT stage elimination) but gates on an unreliable timing metric that always fails at this scale. Stages 4 and 5 checks validate presence and keywords but not content quality — a learner could pass with 100 words of filler. |
| Reflection | ✓ | Stage 5 asks for explicit articulation of decisions and transfer. Writing INDEX_DECISIONS.md (Stage 4) also deepened understanding by forcing me to articulate what I didn't know. |

**Overall effectiveness score:** 3/6

---

## Where I Got Stuck

| Stage | Issue | Classification | Description |
|---|---|---|---|
| 2 | query3 expected index includes `status` | Lab Instruction | Query 3 has no `status` filter. ESR gives `{ price: 1 }`. Expected is `{ status: 1, price: 1 }`. No explanation in lab instructions. Learner must guess using index name as hint. |
| 2 | query5 expected index includes `rating` | Lab Instruction | Query 5 has no `rating` filter or sort. ESR gives `{ tags: 1, createdAt: -1 }`. Expected is `{ tags: 1, createdAt: -1, rating: 1 }`. No explanation. |
| 3 | 50× speedup threshold unreachable | Environment | With 10,000 documents on a modern laptop, all strategies complete in 10–25ms. A 50× speedup would require ESR to run in <0.4ms. The lenient 5ms fallback is also never triggered. The SORT stage elimination (the real ESR signal) is correctly observed but cannot gate the check. |

---

## Questions I Still Have

1. **Multi-query index design:** Why does the query3 index include `status` when query3 doesn't filter on it? When should you add fields to an index to serve queries they're not strictly required for?
2. **Covered queries:** Is the `rating` field in the query5 index intended to make the query a "covered query" (all needed fields in the index)? The lab doesn't mention this concept.
3. **Index maintenance cost:** How does each additional index affect write performance? The lab mentions this as a trade-off but doesn't quantify or demonstrate it.
4. **Partial indexes:** Could a partial index (e.g., only index `active` status documents) improve selectivity? The lab doesn't introduce this concept.
5. **explain() navigation:** The lab shows `hasSortStage` detection via JSON stringification. Where exactly in the explain output tree does the SORT stage appear?

---

## Recommendations

1. **Stage 2 — query3 and query5: Add explanatory scaffolding.** Before asking the learner to design these indexes, explain that indexes can be designed to serve multiple queries by including a common prefix. Show an example of a "covering" field added for selectivity. Without this, the learner either guesses or fails — neither outcome teaches the concept.

2. **Stage 3 — replace timing threshold with SORT stage check.** The 50× speedup threshold is unreliable at any small dataset size. Replace the pass condition with: ESR index has no SORT stage AND non-ESR index does have a SORT stage. This directly validates the concept the lab is teaching and is deterministic regardless of machine speed.

3. **Stage 3 — add learner-facing explain output.** Currently, Stage 3 is fully automated — the learner only sees pass/fail. Add a step where the learner runs `explain('executionStats')` themselves and reads the output. Seeing the `SORT` stage appear and disappear in the raw explain tree cements the concept. The automated check can still validate, but the active observation should be learner-driven.

4. **Add a contrast example (Stage 2 or 3).** Show what happens when you place a Range field before the Sort field (e.g., `{ status: 1, price: 1, rating: -1 }`). Have the learner predict whether a SORT stage will appear, then verify. This is the "show what not to do" contrast pattern that is currently absent from the lab.

5. **Stage 4 and 5 — add a structural template.** The check validates keywords and word count but not meaning. Without a template, a learner could write anything and pass. Provide a structured prompt: "For each index, write: (1) which query it supports, (2) why the field order follows ESR, (3) what trade-off you're making." This improves both the learning experience and the quality of self-assessment.

6. **README — add a troubleshooting entry for port conflicts.** The lab's docker-compose binds port 27018, which may conflict with other running containers. The README troubleshooting section only covers general MongoDB startup failures. Add: "If port 27018 is already in use, update the port in `docker-compose.yml` and `.env`."

---

## Feedback for Spec Revision

**Stages that need spec revision:**
- **Stage 2:** query3 and query5 index definitions diverge from strict ESR application. The spec must either (a) teach multi-query index design before this stage, or (b) change the expected indexes to match pure ESR, or (c) add an explicit instruction explaining the rationale for the extra fields.
- **Stage 3:** The performance comparison concept is sound, but the check mechanism (timing threshold) is broken. The spec should specify that the check validates SORT stage elimination, not wall-clock time. The spec should also include a learner-active step to read explain output directly.

**Stages that need environment fixes:**
- **Stage 3:** `check:explain` — replace `speedupRatio >= 50 || esrTime <= 5` with `!esrHasSortStage` (and optionally `nonEsrHasSortStage`) as the pass condition.

**Stages where scaffolding was insufficient:**
- **Stage 2:** Missing explanation of multi-query index design (for query3 `status` prefix and query5 `rating` field).
- **Stage 4/5:** Missing structural template for INDEX_DECISIONS.md and REFLECTION.md.
