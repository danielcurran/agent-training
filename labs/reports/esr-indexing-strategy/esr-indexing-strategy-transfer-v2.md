---
lab: ESR Indexing Strategy
spec_version: esr-indexing-strategy-tech-spec-v2
env_eval_version: esr-indexing-strategy-env-eval-v3
scorer: transfer-task-scorer
date: 2026-04-27
transfer_score: 4/4
novelty_integrity: ✓
hypothesis_1_kli: Supported
hypothesis_2_sql_bridging: Partially supported
hypothesis_3_decision_records: Supported
---

# Transfer Task Score: ESR Indexing Strategy (v2 Spec — Controlled Test)

> **Experiment context:** This run uses the v2 spec controlled test variant, which removed the non-ESR index contrast from Stage 3 learner-active materials. The Section 14 finding from transfer-v1 directed: *"if sense-making scores remain △ without the contrast scaffolding, the rule is confirmed; if they drop to ✗, the scaffolding is the active ingredient."* This report resolves that experiment.

## Inputs

**Transfer task domain:** Hospital appointment scheduling system (`appointments` collection, 500,000 documents) — no overlap with the lab's product catalog domain

**Core skill being tested:** Design an ESR compound index for a query combining an equality filter, a sort, and a date range, in an unfamiliar domain

**Passing bar (from spec):** Index syntactically correct, field order matches E→S→R, and the learner explains *why* urgency must come before appointmentDate — not just that it should.

---

## Learner Response Summary

The learner produced the correct index `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` with an explicit E/S/R classification of the novel query's fields. The learner named the non-ESR alternative (`{ doctorId: 1, appointmentDate: 1, urgency: -1 }`) and explained the SORT stage mechanism that it produces. The learner also predicted before/after explain output with appropriate hedging on exact timing. Crucially, the learner explicitly attributed the non-ESR contrast reasoning to Stage 1's description — noting *"this is what I used to reason about the non-ESR alternative; I did not observe it live in Stage 3"* — demonstrating awareness of the controlled test condition and careful sourcing of their understanding.

---

## Scores

| Criterion | Score | Evidence (learner's exact words) |
|---|---|---|
| Fluency | ✓ | `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })` — correct syntax, correct field names, correct directions, unprompted in the new domain |
| Induction | ✓ | "Applying ESR to this query: `doctorId: 'dr-smith'` is an exact match → E = doctorId; `.sort({ urgency: -1 })` → S = urgency; `appointmentDate: { $gte: ..., $lte: ... }` is a range → R = appointmentDate" — field roles derived from this query's structure, not from analogy to any lab query |
| Sense-Making | △ | "If the index were `{ doctorId: 1, appointmentDate: 1, urgency: -1 }` (range before sort), MongoDB would scan all of May's appointments for dr-smith using the range, and then sort them in memory by urgency. That in-memory sort produces a SORT stage." — the non-ESR contrast is named and the mechanism is correct, but no SQL instinct is named. The learner does not state "a SQL developer might index these columns as..." or bridge from a SQL-style field ordering assumption. Identical Sense-Making score to transfer-v1. |
| Novelty Integrity | ✓ | "What I drew on from the lab" cites only lab content — the ESR classification rule, Stage 3 before/after contrast, and Stage 1's sort-before-range explanation. The learner explicitly distinguishes observed evidence from described reasoning: "I did not observe it live in Stage 3." No unmarked prior knowledge detected. |

**Transfer Score: 4/4**

*(Sense-Making scored △ because the SQL bridge was absent from the transfer response, not ✗ because the non-ESR contrast and mechanistic explanation were fully present. This is the same △ recorded in transfer-v1.)*

---

## Hypothesis Verdicts

| Hypothesis | Verdict | Basis |
|---|---|---|
| KLI typing produces agents that decide, not just execute | **Supported** | Learner applied E/S/R classification to a novel domain, derived field order from query structure, and correctly predicted explain output. Decision-making visible across all three KLI types. |
| SQL bridging reduces failure rates beyond structural clarity | **Partially supported** | Learner produced mechanistically correct sense-making (non-ESR contrast, SORT stage explanation) without naming the SQL instinct — identical outcome to transfer-v1. Neither the original spec (with Stage 3 non-ESR contrast) nor this variant (without it) produced SQL-language bridging at transfer. The △ is consistent across both conditions. |
| Decision-record artifacts improve novel task performance | **Supported** | Learner's induction was explicit and structured (E/S/R classification with field-by-field justification), consistent with the Stage 2 decision-record habit. The learner transferred the classification structure to the novel domain without prompting. |

---

## Experimental Resolution

**The experiment directed by transfer-v1 Section 14 is now resolved.**

**Original prediction from transfer-v1:** "if sense-making scores remain △ without the contrast scaffolding, the rule is confirmed; if they drop to ✗, the scaffolding is the active ingredient."

**Outcome:** Sense-Making remained △. The Stage 3 non-ESR contrast scaffolding is not the mechanism that drives Sense-Making scores. Removing it produced no change in the transfer score or the quality of the non-ESR explanation. The learner derived the contrast correctly from Stage 1's description alone.

**What this means:** The consistent △ pattern across both conditions (with and without Stage 3 contrast) indicates that neither the Stage 3 scaffolding nor the Stage 1 SQL bridge framing *as currently designed* produces SQL-language bridging at transfer. The learner acquires the mechanism (range-before-sort → SORT stage) but does not reproduce it in SQL contrast terms at transfer. The issue is not which stage teaches the mechanism — it is that the lab does not prompt the learner to frame the explanation in SQL contrast terms when answering the transfer task.

---

## Section 14 Finding

ESR Indexing Strategy v2 (April 2026, controlled test): SQL bridging hypothesis confirmed partially supported — Sense-Making remained △ after removing Stage 3 non-ESR contrast, proving the contrast is not the active ingredient. The △ is structural: the lab teaches the mechanism but does not prompt SQL contrast framing at transfer; Rule 3's ✓ criterion ("names the SQL instinct") should be re-examined — either the transfer task prompt should require a SQL contrast comparison, or the ✓ bar should be revised to accept mechanistic non-ESR contrast without SQL language as full Sense-Making.
