---
lab: ESR Indexing Strategy
spec_version: esr-indexing-strategy-tech-spec
env_eval_version: esr-indexing-strategy-env-eval-v2
scorer: transfer-task-scorer
date: 2026-04-27
transfer_score: 4/4
novelty_integrity: ✓
hypothesis_1_kli: Supported
hypothesis_2_sql_bridging: Partially supported
hypothesis_3_decision_records: Supported
---

# Transfer Task Score: ESR Indexing Strategy

## Inputs

**Transfer task domain:** Hospital appointment scheduling system (`appointments` collection, 500,000 documents)

**Core skill being tested:** Design an ESR compound index for a query combining an equality filter, a sort, and a date range — in a domain with no overlap with the lab's product catalog

**Passing bar:** Index syntactically correct, field order matches E→S→R, and the learner explains *why* urgency must come before appointmentDate — not just that it should.

---

## Learner Response Summary

The learner produced the correct index `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` with a full E/S/R classification of the novel query, an explicit named contrast of the non-ESR alternative, and a mechanistic explanation of why placing `urgency` before `appointmentDate` eliminates the SORT stage. The learner also predicted the before/after explain output with appropriate hedging on exact timing values. The "What I had to figure out" section distinguished two genuine extensions (semantic generality of the sort field; selectivity reasoning for `doctorId`) and explicitly stated no additional prior knowledge was required.

---

## Scores

| Criterion | Score | Evidence (learner's exact words) |
|---|---|---|
| Fluency | ✓ | `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })` — correct syntax, correct field names, correct directions, unprompted in new domain |
| Induction | ✓ | "Applying ESR to this query: `doctorId: 'dr-smith'` is an exact match → E = doctorId / `.sort({ urgency: -1 })` → S = urgency / `appointmentDate: { $gte: ..., $lte: ... }` is a range → R = appointmentDate" — field roles derived from the new query's structure, not from analogy to any lab query |
| Sense-Making | △ | "If the index were `{ doctorId: 1, appointmentDate: 1, urgency: -1 }` (non-ESR), MongoDB would need to scan all of May's appointments for dr-smith, then sort them in memory by urgency. That in-memory sort produces a SORT stage in explain output." — the non-ESR contrast is named and the mechanism is correct, but no SQL instinct is named. The learner does not state "a SQL developer might order the index as..." or bridge from a SQL-style field ordering assumption. |
| Novelty Integrity | ✓ | "What I drew on from the lab" cites only lab content (ESR classification rule, Stage 3 SORT stage insight, Stage 3 contrast example, timing observation). "What I had to figure out" identifies two genuine domain-specific extensions (semantic generality of sort field; selectivity of `doctorId`) and explicitly states "Nothing else needed to be figured out beyond the lab." No unmarked prior knowledge detected. |

**Transfer Score: 4/4**

*(Sense-Making scored △ because the SQL bridge was absent from the transfer response, not ✗ because the non-ESR contrast and mechanistic explanation were fully present.)*

---

## Hypothesis Verdicts

| Hypothesis | Verdict | Basis |
|---|---|---|
| KLI typing produces agents that decide, not just execute | **Supported** | Learner applied E/S/R classification to a novel query, justified field order from query structure, and correctly predicted explain output. Decision-making visible across all three KLI types. |
| SQL bridging reduces failure rates beyond structural clarity | **Partially supported** | Learner produced mechanistically correct sense-making (non-ESR contrast, SORT stage explanation) without naming the SQL instinct. The rule's claim that explicit SQL bridging is the causal mechanism cannot be confirmed or denied — the learner succeeded *without* using it. |
| Decision-record artifacts improve novel task performance | **Supported** | Learner's induction was explicit and structured (E/S/R classification with field-by-field justification), consistent with the pattern practiced in Stage 2's decision records. Selectivity reasoning in "What I had to figure out" suggests the decision-record habit generalised to the novel domain. |

---

## Section 14 Finding

ESR Indexing Strategy (April 2026): KLI hypothesis fully supported and decision-record hypothesis supported; SQL bridging hypothesis partially supported — learner produced correct non-ESR contrast without naming the SQL instinct at transfer. Rule 3 (SQL bridging) should be tested in a second lab run where the SQL contrast is *removed* from the learner-active materials in Stage 3; if sense-making scores remain △ without the contrast scaffolding, the rule is confirmed; if they drop to ✗, the scaffolding (not the SQL bridge framing) is the active ingredient.
