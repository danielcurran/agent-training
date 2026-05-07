# ESR Indexing Strategy — Transfer Task Scoring Report

**Lab:** ESR Indexing Strategy  
**Learner Condition:** Lab Completion (Full)  
**Transfer Task Domain:** Surgical scheduling system (hospital network)  
**Session:** Transfer Task Scorer Agent  
**Date:** 7 May 2026

---

## Criteria Scoring

### 1. Fluency — Correct MongoDB Index Syntax (Unprompted, Novel Domain)

**Score: ✓ PASS**

**Evidence:**
- Proposed index: `{ operatingRoomId: 1, surgicalSpecialty: 1, estimatedDuration: -1, scheduledDate: 1 }`
- Syntax is correct MongoDB compound index notation (field order, ascending/descending directions)
- Applied unprompted in novel domain (surgical scheduling, not MongoDB lab domain)
- No syntax errors; index directly executable

**Interpretation:**  
Learner successfully generalizes index syntax beyond lab examples to independent application.

---

### 2. Induction — Domain-Driven Field Priority Reasoning (Not Mechanical Copying)

**Score: ✓ PASS**

**Evidence:**
- **Selectivity Reasoning:** Explicitly orders fields by selectivity: "operatingRoomId (single room, most selective)" → surgicalSpecialty (array, medium) → scheduledDate (more selective) vs. priority (low)
- **Quantitative Trade-off:** "priority has low selectivity (~33% filtering); scheduledDate more selective"
- **Write Volume Awareness:** "High write volume (300+ surgeries/hour); Write cost of 5-field index not justified by marginal query benefit"
- **Deliberate Omission:** Chose NOT to include priority despite being a range condition in query—explicit trade-off reasoning, not pattern copying
- **Array Field Logic:** Included surgicalSpecialty despite higher maintenance cost because "selectivity outweighs higher maintenance cost"—contextual cost-benefit analysis

**Interpretation:**  
Learner reasons about field priority inductively from domain constraints (write volume, selectivity distribution) rather than mechanically following ESR template. Evidence of genuine problem decomposition.

---

### 3. Sense-Making — Bridge from SQL Intuition → MongoDB Solution via Failure Modes

**Score: ✓ PASS**

**Evidence:**

**SQL-to-MongoDB Bridge (Failure Modes):**
- "COLLSCAN stage (scan all 2M documents)" — Maps to SQL full table scan intuition
- "SORT stage (all matches loaded to memory, expensive)" — Identifies in-memory sort bottleneck (SQL instinct: unsorted result requires client-side sort)
- "Post-index filter evaluation for other conditions" — Recognizes index partial coverage concept
- "No index bounds for range filtering" — Articulates MongoDB range predicate cost

**Solution Justification (Index Remediation):**
- "Index eliminates COLLSCAN (seeks directly to operatingRoomId, surgicalSpecialty)" — Direct cause-effect
- "Index eliminates SORT stage (pre-ordered by estimatedDuration)" — Explains how MongoDB avoids in-memory sort
- "Uses index bounds for scheduledDate range" — Shows index bounds optimization
- "priority evaluated post-index (acceptable trade-off)" — Acknowledges residual filtering cost
- "Connects trade-off reasoning to Stage 4 lab learning" — Explicit meta-awareness of lab progression

**Interpretation:**  
Learner demonstrates sophisticated mapping from SQL failure modes to MongoDB index advantages, grounded in stage-based learning progression. Articulates both what the index solves and what it does not.

---

### 4. Novelty Integrity — Lab Content Boundary (External Knowledge Detection)

**Score: ✓ PASS**

**Evidence:**
- **Lab-Origin Concepts:** ESR framework, array field handling, compound index syntax, trade-off framing—all directly traceable to ESR Indexing Strategy lab content
- **Domain Reasoning:** Selectivity estimates (~33% for priority) and write volume impact (300+/hour) are applied from lab principles to novel domain, not external MongoDB knowledge injection
- **Surgical Domain:** External context (hospital scheduling), but learner applies it correctly *through lab framework* without introducing advanced concepts (e.g., sparse indexes, partial indexes, collation) that would signal external study
- **Scope Boundary:** Stays within ESR+trade-off model; no mention of index hints, query planner optimization, or multi-key index side effects

**Interpretation:**  
Learner appropriately generalizes lab concepts to novel domain without overreach. No evidence of external MongoDB knowledge beyond lab scope.

---

## Hypothesis Validation

| Hypothesis | Criteria | Status | Evidence |
|-----------|----------|--------|----------|
| **KLI Typing Hypothesis** | Fluency ✓ + Induction ✓ + Sense-Making ✓ | **SUPPORTED** | Learner applies framework, reasons inductively, and bridges failure modes |
| **SQL Bridging Hypothesis** | Sense-Making ✓ | **SUPPORTED** | Clear mapping from SQL intuition (full scan, in-memory sort) to MongoDB index solution |
| **Decision Records Hypothesis** | Induction ✓ + Sense-Making ✓ | **SUPPORTED** | Trade-off reasoning explicit; connects priority omission to write cost; references Stage 4 learning |

---

## Finding

**Fact Statement (≤10 words):**  
ESR Indexing Strategy: Framework transfers to novel domain with explicit trade-off reasoning; all KLI hypotheses supported.

**Implication for Rulebook:**  
This finding confirms that Stage 3–4 ESR indexing curriculum successfully builds transferable mental models. Learners do not merely copy lab patterns but can reason about field priority independently using domain constraints (write volume, selectivity distribution). The lab design supports inductive transfer beyond MongoDB to database indexing principles generally. **Rulebook Action:** Retain ESR Indexing Strategy lab design; evidence supports hypothesis that hands-on index design builds transferable reasoning skills.

---

## Notes for Lab Design Team

- **Strength:** Learner's explicit omission of priority field with quantitative justification (write overhead vs. marginal query gain) suggests Stage 4 trade-off framing is effective.
- **Strength:** Reference to Stage 4 learning in index solution indicates learner internalized lab progression narrative.
- **Observation:** Learner applied domain-specific selectivity estimates (~33%) without being coached—suggests either strong general reasoning or prior domain knowledge (outside lab scope, but acceptable for transfer task validation).

---

**Report Status:** ✓ Ready for hypothesis-validation.md integration  
**Scored By:** Transfer Task Scorer Agent  
**Verification:** Cross-referenced against [esr-indexing-strategy-tech-spec-v3.md](../../specs/esr-indexing-strategy-tech-spec-v3.md) and [esr-indexing-strategy-env-eval-v4.md](./esr-indexing-strategy-env-eval-v4.md)
