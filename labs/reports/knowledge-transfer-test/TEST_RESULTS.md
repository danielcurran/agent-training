# Knowledge Transfer Test Results

**Date:** May 7, 2026  
**Test Type:** Knowledge-Injected Agent Performance Baseline  
**Status:** ✓ Complete  

---

## Executive Summary

An AI agent with **only injected KNOWLEDGE.json** (no lab experience) successfully answered all four transfer task questions with **Fluency ✓, Induction ✓, and Sense-Making ✓** across all KLI dimensions. This is the baseline for comparison testing.

---

## Hypothesis

> **Can declarative knowledge (KNOWLEDGE.json) alone achieve the same transfer task performance as procedural experience (full lab completion)?**

This test establishes the **knowledge-only baseline** to answer this question empirically.

---

## Test Setup

### 1. Knowledge Source

**Lab:** ESR Indexing Strategy  
**KNOWLEDGE.json:** `lab-test-env/esr-indexing-strategy/KNOWLEDGE.json`  
**Entry Count:** 5  
**All Confidence Levels:** `verified` (each rule grounded in passing lab checks)

#### Injected Knowledge Entries

| # | Concept | Confidence | Validated By |
|---|---|---|---|
| 1 | ESR index field ordering | verified | `npm run check:stage1 && npm run check:explain` |
| 2 | Index field order significance | verified | `npm run check:explain` (ESR vs non-ESR comparison) |
| 3 | SORT stage elimination via indexes | verified | `npm run check:explain` |
| 4 | Index trade-offs: write cost vs. read performance | verified | `npm run check:decisions` |
| 5 | Array field indexing (multikey indexes) | verified | `npm run check:indexes` (Query 5) |

### 2. Transfer Task

**Domain:** Hospital appointment scheduling (novel domain, no overlap with product catalog from ESR lab)

**Query:**
```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

**Parameters:**
- Collection size: 500,000 appointments
- Current query performance: 800ms (baseline problem)
- Task: Design optimal compound index + explain the approach

**Transfer Task Questions:**

1. **SQL Instinct:** What would a SQL developer index and why?
2. **MongoDB Failure Mode:** What execution stage does that approach create?
3. **ESR Solution:** Design the optimal index using E/S/R field classification
4. **Explain Output:** Describe before/after performance metrics

### 3. Test Method

1. Load 5 KNOWLEDGE.json entries from ESR lab
2. Format as "PRIOR KNOWLEDGE CONTEXT" block for injection
3. Present transfer task to agent with injected knowledge only (no lab completion)
4. Capture agent response
5. Score response on KLI dimensions

---

## Results

### Knowledge-Injected Agent Response

#### Q1: SQL Instinct

**Response:**
> A SQL developer would likely index columns in the order they appear in the query: `(doctorId, appointmentDate, urgency)` — filtering first, then sorting. The rationale is cardinality: doctorId has low cardinality (many appointments per doctor), so it should narrow the working set first.

**Scoring:** ✓ PASS
- Correctly identified SQL pattern (query column order)
- Named specific index `(doctorId, appointmentDate, urgency)`
- Explained reasoning (cardinality, filtering before sorting)

#### Q2: MongoDB Failure Mode

**Response:**
> In MongoDB, this SQL-style index `{doctorId: 1, appointmentDate: 1, urgency: -1}` produces a SORT stage in the execution plan. This happens because MongoDB traverses indexes left-to-right. It finds all doctorId matches, then filters appointmentDate range within those results, but the urgency field comes *after* the range field in the index. MongoDB cannot use the urgency field from the index to provide pre-sorted results (because it had to apply a range filter first). So the query planner forces MongoDB to sort results in memory — the SORT execution stage — which is expensive for large result sets.

**Scoring:** ✓ PASS
- Named the failure mode: SORT stage
- Explained mechanism (left-to-right traversal, range blocking sort)
- Identified performance cost (in-memory sort on 500k docs)
- Connected to MongoDB internals (query planner decision)

#### Q3: ESR Solution

**Response:**
> The optimal index is `{doctorId: 1, urgency: -1, appointmentDate: 1}`:
> - E (Equality) = doctorId (equality filter)
> - S (Sort) = urgency (sort field)
> - R (Range) = appointmentDate (range filter: $gte and $lte)
> 
> The reason urgency must come *before* appointmentDate is that MongoDB uses index fields left-to-right. After finding all doctorId matches and before applying the appointmentDate range, MongoDB can traverse urgency in the index to provide pre-sorted results. This eliminates the need for the in-memory SORT stage.

**Scoring:** ✓ PASS
- Correct index syntax: `{doctorId: 1, urgency: -1, appointmentDate: 1}`
- Correctly classified each field as E, S, or R
- Explained ordering logic (why S before R)
- Demonstrated induction (not copying product catalog example; novel domain)
- Causally connected to MongoDB's left-to-right index traversal

#### Q4: Explain Output

**Response:**
> *Before the ESR index:*
> - `"executionStages": { "stage": "SORT", ... }`
> - `"executionStats": { "executionStages": { "totalDocsExamined": 500000 } }` (large working set)
> - `"executionTimeMillis": ~800` (slow due to in-memory sort)
> 
> *After the ESR index:*
> - No `"stage": "SORT"` — the index provides pre-sorted results
> - `"totalDocsExamined"` is much smaller (only documents matching doctorId and appointmentDate range)
> - `"executionTimeMillis"` drops significantly (no in-memory sort cost)

**Scoring:** ✓ PASS
- Identified specific explain() fields: `executionStages.stage`, `executionStats.totalDocsExamined`, `executionTimeMillis`
- Showed before/after contrast
- Explained performance improvement mechanism

---

## KLI Dimension Scoring

| Dimension | Criterion | Evidence | Score |
|---|---|---|---|
| **Fluency** | Index syntax correct and error-free | ✓ `{doctorId: 1, urgency: -1, appointmentDate: 1}` — correct syntax, proper direction indicators (-1 for descending) | ✓ PASS |
| **Induction** | Field order justified by E/S/R roles; applied to novel domain | ✓ Agent classified E=doctorId, S=urgency, R=appointmentDate; applied to hospitals (novel domain) without copying product example | ✓ PASS |
| **Sense-Making** | Names SQL instinct + MongoDB SORT stage + explains causal connection | ✓ Named SQL approach ("index query order", "filter then sort"); named SORT stage; explained causation ("range blocks sort usage") | ✓ PASS |

### Final Score: **3/3 KLI Dimensions Achieved**

---

## Interpretation

### What This Demonstrates

1. **Knowledge extraction is effective**
   - Lab experiences can be compressed into KNOWLEDGE.json rules that transfer to novel domains
   - 5 entries from product catalog lab support solving hospital appointment problem

2. **SQL contrast framing is preserved**
   - The "SQL instinct" field in KNOWLEDGE.json captures what SQL developers would do
   - Agent successfully retrieved and applied this contrast to generate index reasoning

3. **Sense-Making is achievable through declarative knowledge**
   - Explicitly naming MongoDB concepts (SORT stage, left-to-right traversal) in the knowledge artifact is sufficient
   - Agent did not need to have *run* explain() itself; understanding the principle enabled correct reasoning

4. **Cross-domain transfer works**
   - Knowledge from product catalog (status, rating, price, tags) successfully transferred to hospital appointments (doctorId, urgency, appointmentDate)
   - The ESR principle is domain-agnostic; the transfer task validated this

### What This Does NOT Demonstrate

- **Procedural experience value:** Cannot yet determine if running explain() and seeing SORT stage disappear adds value beyond declarative knowledge
- **Failure recovery:** Did not test agent's ability to recover from making mistakes (e.g., proposing wrong field order, then correcting)
- **Edge case handling:** Did not test handling of complex scenarios (multikey indexes, partial indexes, compound filters)

---

## Next Steps: Full-Lab Comparison

To complete the hypothesis test, run the following sequence:

### Step 1: Generate Full-Lab Response

```bash
# Run the learner agent to complete the entire ESR lab
# (In Copilot Chat: /run-learner-agent, lab: esr-indexing-strategy)
```

This will produce:
- A new learning report at `labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-vN.md`
- Transfer task response from a full-lab completion agent

### Step 2: Extract Transfer Task Response

- Find the transfer task section in the new learning report
- Copy the agent's response to the same transfer task

### Step 3: Score Both Responses

```bash
# In Copilot Chat: /score-transfer-task
# Attach spec: labs/specs/esr-indexing-strategy-tech-spec-v3.md
# Attach response 1: Knowledge-only response (in TEST_RESULTS.md or knowledge-transfer-test.md)
# Attach response 2: Full-lab response (from new learning report)
```

Run scoring twice (once per response) to get KLI verdicts.

### Step 4: Compare & Analyze

**Questions to answer:**
- Do all three KLI dimensions score identically?
- If Fluency matches but Sense-Making differs, what details does full-lab agent add?
- Does full-lab agent cite specific performance numbers (e.g., "I saw SORT stage disappear, execution time dropped from 800ms to 150ms")?
- Is the procedural experience (running explain(), iterating on indexes) necessary for transfer, or is declarative knowledge sufficient?

**Expected Outcomes:**

| Hypothesis | KLI Pattern | Interpretation |
|---|---|---|
| Knowledge sufficient | Identical scores (3/3 both) | Declarative knowledge alone achieves transfer; procedural experience adds minimal value |
| Knowledge + procedure complementary | Sense-Making differs | Procedural experience (seeing changes, iterating) adds confidence/metacognition; knowledge provides the foundation |
| Procedure required | Multiple dimensions differ | Hands-on experience is necessary; knowledge artifacts insufficient |

---

## Files Generated

| File | Purpose |
|---|---|
| `labs/reports/knowledge-transfer-test/knowledge-transfer-test.md` | Full test report with injected knowledge context, transfer task, agent response, and scoring rubric |
| `labs/reports/knowledge-transfer-test/TEST_RESULTS.md` | This summary document |
| `lab-test-env/esr-indexing-strategy/KNOWLEDGE.json` | Knowledge artifact with 5 verified entries used for injection |

---

## Key Metrics

| Metric | Value |
|---|---|
| Knowledge entries injected | 5 |
| Confidence level of all entries | verified (100%) |
| Transfer task questions answered correctly | 4/4 |
| KLI dimensions achieved | 3/3 |
| Test success rate | 100% |

---

## Conclusion

The knowledge transfer test **baseline is complete and successful**. An agent with only KNOWLEDGE.json can answer complex transfer task questions correctly, demonstrating that:

✓ Knowledge extraction works  
✓ Rules transfer across domains  
✓ Sense-making is achievable declaratively  

The next phase is to run a full-lab agent through the same task and compare empirically to determine whether procedural experience adds value beyond declarative knowledge.

**Ready for:** Comparative hypothesis testing
