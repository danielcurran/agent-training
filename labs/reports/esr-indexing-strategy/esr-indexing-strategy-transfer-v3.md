---
lab: ESR Indexing Strategy
spec_version: esr-indexing-strategy-tech-spec-v3
env_eval_version: esr-indexing-strategy-env-eval-v4
scorer: transfer-task-scorer
date: 2026-05-01
transfer_score: 3.5/4
novelty_integrity: △
hypothesis_1_kli: Supported
hypothesis_2_sql_bridging: Supported
hypothesis_3_decision_records: Supported
---

# Transfer Task Score: ESR Indexing Strategy (v3)

## Inputs

**Transfer task domain:** Hospital appointment scheduling system (no overlap with the product catalog domain used in the lab)

**Core skill being tested:** Apply the ESR (Equality → Sort → Range) field-ordering rule to a novel compound index query, and explain the SQL instinct that produces the suboptimal alternative.

**Passing bar:** Index syntactically correct, field order matches E→S→R (`{ doctorId: 1, urgency: -1, appointmentDate: 1 }`), learner names what a SQL developer would do, explains the MongoDB failure mode by name (SORT stage), and explains *why* urgency must come before appointmentDate — not just that it should.

---

## Learner Response Summary

The learner answered all four prompted steps in full. They named the SQL instinct as query-appearance order producing `{ doctorId: 1, appointmentDate: 1, urgency: -1 }`, identified the SORT stage as the MongoDB failure mode and explained its B-tree cause, produced the correct ESR index `{ doctorId: 1, urgency: -1, appointmentDate: 1 }` with explicit E/S/R classification, and provided full explain output trees showing SORT+COLLSCAN before and IXSCAN+FETCH (no SORT) after. The response is mechanistically complete and causally grounded throughout.

---

## Scores

| Criterion | Score | Evidence (learner's exact words) |
|---|---|---|
| Fluency | ✓ | *"ESR index: `db.appointments.createIndex({ doctorId: 1, urgency: -1, appointmentDate: 1 })`"* — correct syntax, correct direction, unprompted in new domain |
| Induction | ✓ | *"E = `doctorId` — equality filter, goes first; S = `urgency` — sort field, goes second (before range); R = `appointmentDate` — range filter, goes last"* — justified by the hospital query's access pattern roles, not lab example similarity |
| Sense-Making | ✓ | *"The SQL instinct here specifically is: put the most restrictive filter columns first, then sort columns last... `{ doctorId: 1, appointmentDate: 1, urgency: -1 }`... introduces a **SORT stage**... range field (`appointmentDate`) precedes sort field (`urgency`) in index, MongoDB cannot deliver sorted output from index traversal"* — names the SQL instinct, names the execution stage, explains the causal mechanism, states the ESR alternative |
| Novelty Integrity | △ | *"Naming the SQL instinct precisely (Step 1): The lab gave me the contrast... but not the specific wrong answer a SQL developer would produce. I named two plausible SQL instincts... because I was not sure which the lab intended me to name"* — minor construction of specific wrong-answer examples beyond what the lab explicitly provided; clearly flagged and the core transfer content remains lab-derived |

**Transfer Score: 3.5/4**

---

## Hypothesis Verdicts

| Hypothesis | Verdict | Basis |
|---|---|---|
| KLI typing produces agents that decide, not just execute | **Supported** | Fluency, Induction, and Sense-Making all ✓ — learner classified fields by role, constructed causal explanation, and selected correct index without re-teaching |
| SQL bridging reduces failure rates beyond structural clarity | **Supported** | Sense-Making ✓ — learner explicitly named the SQL instinct, named the SORT stage by name, and explained why the SQL-instinct index produces it; first ✓ for SQL Bridging across three ESR runs |
| Decision-record artifacts improve novel task performance | **Supported** | Induction and Sense-Making both ✓ — learner attributed the SQL-vs-MongoDB contrast directly to Stage 1 Section 1.3 framing and the SORT stage signal to Stage 3 observation; decision-record content scaffolded transfer |

---

## Section 14 Finding

**Variable tested:** v3 is identical to v2 in lab environment and stage content; the sole change is the transfer task prompt, which adds four explicit steps requiring the learner to name the SQL instinct, explain the MongoDB failure mode by name, design the ESR index with E/S/R classification, and state the explain output before and after.

**Sense-Making result:** ✓ — changed from △ in both v1 (original spec) and v2 (controlled test with Stage 3 SQL contrast removed). The learner produced all three required elements: named SQL instinct (`{ doctorId, appointmentDate, urgency }` — query-appearance order), named the execution stage (SORT), explained the B-tree causal mechanism, and stated the ESR alternative with field-by-field classification.

**Conclusion — SQL Bridging hypothesis:** Transfer prompt scaffolding IS sufficient to produce Sense-Making ✓. The active ingredient is not lab content alone — v1 had SQL contrast in Stage 3 and scored △; v2 removed it and still scored △. The four-step prompt structure in v3, which explicitly required the learner to name the SQL instinct before designing the solution, directed attention to existing lab teaching (Stage 1 Section 1.3 SQL-vs-MongoDB framing) that the learner possessed but did not deploy unprompted. The transfer task format, not the stage content, was the missing variable.

**Rulebook recommendation:** Revise Section 3 (Sense-Making) and/or Section 13 to state: *When testing the SQL Bridging hypothesis, the transfer task prompt must include an explicit SQL-instinct naming step — the learner's response will not produce it unprompted even when the lab taught the contrast. A four-step scaffold (name the SQL instinct → name the MongoDB failure mode → state the solution → predict explain output) is sufficient to elicit ✓ Sense-Making when the lab has provided the underlying SQL contrast in its stage content.* Add to the hypothesis summary table: ESR v3 — SQL Bridging ✓ (first confirmed ✓; transfer prompt scaffolding is the active ingredient).

---

**One-sentence rulebook finding:**

*"ESR Indexing Strategy v3 (May 2026): SQL Bridging hypothesis supported — learner explicitly named SQL instinct, SORT stage, and causal mechanism after four-step transfer prompt scaffold; first ✓ across three ESR runs confirms transfer prompt structure, not lab stage content, is the active ingredient for Sense-Making ✓."*

**Rulebook action:** Update Section 13 ESR v3 entry with ✓ SQL Bridging verdict; update the Hypothesis Validation Summary table; add to Section 3 Sense-Making rule: *"Transfer tasks must include an explicit SQL-instinct naming prompt when testing SQL bridging — correct SQL contrast in stage content alone is insufficient to elicit named SQL comparison in transfer responses."*
