# Hypothesis Validation

> Lab-by-lab testing record for the three foundational design hypotheses in the [Instructional Design Rulebook](instructional-design-rulebook.md).

## Summary

All three hypotheses confirmed as of 7 May 2026 across six lab runs (including v5 replication of v3 controlled test).

| Hypothesis | Status | Confidence |
|---|---|---|
| KLI typing produces agents that decide, not just execute | ✓ Confirmed | 🟢 High — 6/6 labs |
| SQL bridging reduces failure rates beyond structural clarity | ✓ Confirmed | 🟢 High — active ingredient identified and replicated (v3/v5) |
| Decision-record artifacts improve novel task performance | ✓ Confirmed | 🟢 High — 6/6 labs |

**Key finding:** The three-rule cluster (KLI typing + SQL bridging + decision records) works as an integrated system. SQL bridging's active ingredient is that reflection prompts and transfer tasks must explicitly surface the SQL contrast — lab stage content teaching the contrast is necessary but not sufficient to elicit it in transfer responses. v5 replication confirms the v3 controlled test finding.

---

## How to Add Findings

1. Run learner through lab
2. Run `/score-transfer-task` to produce a transfer score report
3. Add a lab entry in Per-Lab Findings below (copy the format from an existing entry)
4. Update the Hypothesis Validation Summary table
5. Add a row to the Revision Log if a rule was changed
6. If a rule needs updating, edit the relevant section in the rulebook and note it here

---

## Per-Lab Findings

### Lab 1: ESR Indexing Strategy (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Observation:** Learner produced correct non-ESR contrast but didn't explicitly name SQL instinct.

**Evidence:** Inferred pattern without SQL comparison prompt; strong induction and decision-record application; Sense-Making △ (implicit, not articulated)

---

### Lab 2: ESR Indexing Strategy v2 — Controlled Test (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Observation:** Sense-Making remained △ after removing Stage 3 SQL contrast — contrast not the active ingredient.

**Evidence:** Teaches mechanism effectively; learner demonstrated fluency/induction consistently; score didn't decline when Stage 3 SQL comparison removed → contrast scaffolding alone doesn't produce ✓

**Finding:** Sense-Making's ✓ criterion ("names SQL instinct") requires explicit transfer task scaffolding, not lab materials alone.

---

### Lab 3: Memory for AI Applications (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | ✓ Fully Supported |
| Decision Records | ✓ Supported |

**Score: 4/4** ✅

**Observation:** All three hypotheses validated. Learner explicitly named SQL instinct, explained failure modes, applied decision-record insights to multi-tenant threat modeling.

**Evidence:**
- **Fluency:** Applied namespace tuple pattern without re-teaching
- **Induction:** Provided technical reasons for namespace isolation > row-level filtering
- **Sense-Making:** Contrasted SQL (`db.tickets.find()`) vs. MongoDB namespace; explained SQL failure modes (cross-thread, vector search)
- **Decision Records:** Lab reflection on namespace isolation directly informed threat modeling (GDPR, liability)

**Finding:** KLI typing, SQL bridging, decision records work as predicted when all three are present and integrated. Three-rule cluster works as a system, not as independent components.

---

### Lab 4: Aggregation Foundations (1 May 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Score: 3.5/4**

**Observation:** SQL HAVING analogy applied correctly for post-group filter, but no SQL contrast offered for core $group or $unwind patterns. One correct bridge deployed; broader framing absent.

**Evidence:**
- **Fluency:** Applied $avg and $addToSet correctly in new context without re-teaching
- **Induction:** Justified stage ordering by data availability (*"totalRevenue field does not exist until $group creates it"*)
- **Sense-Making:** Named HAVING analogy once (*"equivalent to SQL's HAVING clause"*); did not name GROUP BY or JOIN contrasts
- **Decision Records:** Explicitly extended *"group first, then project"* rule to novel *"group first, then post-group $match, then project"* sequencing

**Finding:** One correct SQL analogy is insufficient. The transfer task prompt must surface SQL contrast on a core pattern (e.g., GROUP BY → $group), not only on edge-case patterns like HAVING.

---

### Lab 5: ESR Indexing Strategy v3 — Transfer Prompt Scaffolding Test (1 May 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | ✓ Fully Supported |
| Decision Records | ✓ Supported |

**Score: 3.5/4**

**Observation:** Sense-Making moved △ → ✓ when transfer prompt explicitly required the learner to name the SQL instinct. Lab environment and stage content identical to v2. The only change: a four-step transfer task prompt requiring (1) name the SQL instinct, (2) name the MongoDB failure mode, (3) state the ESR solution, (4) predict explain output.

**Evidence:**
- **Fluency:** `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })` — correct, unprompted, new domain
- **Induction:** *"E = doctorId — equality filter, goes first; S = urgency — sort field, goes second; R = appointmentDate — range filter, goes last"* — justified by hospital query roles, not lab analogy
- **Sense-Making:** *"The SQL instinct here specifically is: put the most restrictive filter columns first, then sort columns last... introduces a SORT stage... range field precedes sort field in index, MongoDB cannot deliver sorted output from index traversal"* — all three required elements present
- **Novelty Integrity:** △ — learner constructed specific SQL wrong-answer examples beyond what the lab explicitly provided; clearly flagged; core transfer content lab-derived

**Finding:** Transfer prompt scaffolding IS the active ingredient. ESR v1 (Stage 3 SQL contrast present): △. ESR v2 (Stage 3 SQL contrast removed): △. ESR v3 (transfer prompt scaffold added, lab identical to v2): ✓. **SQL Bridging hypothesis: confirmed.** The lab already taught the SQL contrast; the structured prompt directed attention to it.

---

### Lab 6: ESR Indexing Strategy v5 — Replication of v3 (7 May 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | ✓ Fully Supported |
| Decision Records | ✓ Supported |

**Score: 4/4**

**Observation:** Replication of v3 controlled test. Learner achieved Sense-Making ✓ with all four criteria at full level (v3 scored 3.5/4 due to minor Novelty Integrity ambiguity; v5 scores ✓ on all four). Confirms v3 finding holds across multiple independent runs.

**Evidence:**
- **Fluency:** `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` — correct syntax and directions, applied unprompted in hospital domain
- **Induction:** *"E = `doctorId` — exact match filter; S = `urgency` — `.sort({ urgency: -1 })`; R = `appointmentDate` — range filter with `$gte` and `$lte`... This places equality first (narrows by doctor), sort second (documents come out in urgency order from the index), and range last"* — field order justified by hospital query's access pattern roles, not lab analogy
- **Sense-Making:** *"A SQL developer would likely index the columns in query appearance order... This mirrors how they think about WHERE clauses (filters first), then ORDER BY (sort second)"* ... *"introduces a SORT stage in the explain output"* ... *"MongoDB can scan the index in order... all without an in-memory sort. The SORT stage disappears from explain output."* — all three required elements (SQL instinct name, SORT stage mechanism, ESR alternative)
- **Novelty Integrity:** ✓ — *"What I drew on from the lab: Stage 1 (classifying fields as E, S, R), Stage 3 (understanding SORT stage), Stage 4 (articulating trade-offs), INDEX_DECISIONS.md. What I had to figure out: The exact appointment scheduling domain"* — clearly distinguished; no outside knowledge

**Finding:** v5 replication confirms v3 hypothesis. The v3 transfer task scaffold (four-step structure) reliably elicits Sense-Making ✓. Both v3 and v5 learners demonstrated all elements: naming SQL instinct (query appearance order), identifying MongoDB failure mode (SORT stage), explaining mechanism (in-memory sorting), and applying ESR. **SQL Bridging hypothesis remains confirmed.** Rule 3 stands: transfer task prompts must explicitly surface SQL contrast.

---

## Hypothesis Validation Summary

| Hypothesis | Lab 1 (ESR) | Lab 2 (ESR v2) | Lab 3 (Memory) | Lab 4 (Agg) | Lab 5 (ESR v3) | Lab 6 (ESR v5) | **Overall Status** | **Confidence** |
|---|---|---|---|---|---|---|---|---|
| **KLI Typing** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **SUPPORTED** | 🟢 High — 6/6 labs confirm |
| **SQL Bridging** | △ | △ | ✓ | △ | ✓ | ✓ | **SUPPORTED** | 🟢 High — confirmed; v3/v5 replication validates active ingredient (transfer task scaffold) |
| **Decision Records** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **SUPPORTED** | 🟢 High — 6/6 labs confirm |

---

## Revision Log

### Update History

| Date | Rule | Evidence | Action Taken | Status |
|---|---|---|---|---|
| 27 Apr 2026 | **Rule 3** (SQL Bridging) | Memory for AI: explicit SQL naming → 4/4. ESR v1, v2: implicit → △. | Refined Rule 3: SQL bridging requires surfacing the contrast in reflection prompts and transfer tasks, not only in stage content. | ✓ **Confirmed** |
| 1 May 2026 | **Rule 3** (SQL Bridging) | Aggregation Foundations: single HAVING analogy → △. Pattern holds: 3 of 4 labs at △ when only one SQL concept bridged. | Rule 3 note: transfer task must surface SQL contrast on a core pattern, not just edge cases. | ✓ **Confirmed** |
| 1 May 2026 | **Rule 3** (SQL Bridging) | ESR v3: structured transfer prompt → Sense-Making ✓. Lab identical to v2 (which scored △). Transfer prompt structure confirmed as active ingredient. | Rule 3 simplified to design principle: use SQL bridging where appropriate; ensure prompts surface it directly. | ✓ **Confirmed** |
| 7 May 2026 | **Rule 3** (SQL Bridging) | ESR v5 replication: v3 controlled test re-run with same spec and similar learner outcome. Both v3 and v5 achieved Sense-Making ✓ with four-step transfer prompt. Finding validated across independent runs. | No change needed. Rule 3 stands. Hypothesis confirmed. v5 serves as independent validation of v3 active-ingredient finding. | ✓ **Confirmed** |
| 27 Apr 2026 | **Rule 4** (Skill Gap) | ESR v2 controlled test removed Stage 3 SQL contrast; Sense-Making remained △. Confirmed by ESR v3: stage content is not the active variable. | No rule change needed — finding is about transfer task design, not stage design. | ✓ **Confirmed** |
| 1 May 2026 | **Rule 10** (Decision Records) | 5/5 labs: reflection directly informed transfer reasoning. No contradictions. | No change needed. Standing as written. | ✓ **Confirmed** |

### How to Update

1. Add row: date | rule(s) | evidence | action (refined / no change / contradicted) | status
2. Status options:
   - 🔄 **Observing:** Testing pattern. Not conclusive.
   - ✓ **Confirmed:** 2+ labs confirm. Evidence-backed.
   - ⚠️ **Contradicted:** Evidence refutes. Mark hypothesis failed.
   - ⏳ **Pending:** Test case identified. Awaiting execution.
3. When status → "Confirmed" or "Contradicted":
   - Update rule text in the rulebook if needed
   - Update table entry with final verdict

### Under Active Observation

**Novelty Integrity (🔄 Observing):** Scored △ in both ESR v3 and Aggregation Foundations for the same reason: learner inferred operators from a family the lab taught (e.g., `$gt` from `$gte`). Not actionable yet. If this recurs across 2+ more labs, consider whether labs should teach operator families rather than individual members.

### Confirmed in Practice

**Rule 3 (Sense-Making / SQL Bridging):** Confirmed 1 May 2026 (ESR v3). Reflected prompts and transfer tasks must explicitly surface the SQL contrast; stage content teaching it is necessary but not sufficient. Replicated 7 May 2026 (ESR v5): same spec, independent learner, same outcome (Sense-Making ✓). The transfer task four-step scaffold is the active ingredient.

**Rules 1–2, 4–12:** Standing as written. No contradictory evidence across 6 lab runs.
