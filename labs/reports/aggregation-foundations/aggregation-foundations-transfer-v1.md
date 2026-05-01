---
lab: aggregation-foundations
spec_version: aggregation-foundations-tech-spec (v2, post-eval fixes)
env_eval_version: aggregation-foundations-env-eval-v1
scorer: transfer-task-scorer
date: 2026-05-01
transfer_score: 3.5/4
novelty_integrity: △
hypothesis_1_kli: Supported
hypothesis_2_sql_bridging: Partially supported
hypothesis_3_decision_records: Supported
---

# Transfer Task Score: Aggregation Foundations

## Inputs

**Transfer task domain:** E-commerce analytics dashboard — per-genre revenue reporting with filtering, sorting, and unique customer counts  
**Core skill being tested:** Design multi-stage MongoDB aggregation pipelines by reasoning about stage sequencing and data flow (LO4 from spec)  
**Passing bar:** ≥ 7/10 on the rubric (2 pts: stage identification, 2 pts: grouping strategy, 2 pts: stage explanation, 2 pts: sequencing, 1 pt: output schema, 1 pt: data flow understanding)

---

## Learner Response Summary

The learner produced a correct 7-stage pipeline: `$match → $unwind → $group (with $sum, $avg, $addToSet) → $match (post-group) → $project → $sort → $limit`. All required stages were present, grouping strategy was technically correct, stage sequencing was correct, and the output schema was logical. The learner applied two operators not explicitly taught in the lab (`$size`, `$gt`) and correctly flagged both as inferred extensions rather than direct lab content.

---

## Scores

| Criterion | Score | Evidence (learner's exact words) |
|---|---|---|
| Fluency | ✓ | Applied `$addToSet`, `$avg`, `$sum`, `$concat`-family patterns correctly in new context without re-teaching. Wrote `uniqueCustomers: { $addToSet: "$customer_id" }` and `avgPrice: { $avg: "$books.price" }` — correct syntax, correct field paths, unprompted. |
| Induction | ✓ | Justified sequencing choices with domain-specific reasoning, not template matching: *"This must come after $group because the totalRevenue field does not exist until $group creates it"* and *"Required before $group so each book can be independently aggregated by genre."* Each stage placement is explained by what is available at that point in the pipeline — not by analogy to a lab stage. |
| Sense-Making | △ | Named the SQL analogy for one concept only: *"This is equivalent to SQL's HAVING clause — it filters on computed values that don't exist until after $group."* However, the SQL contrast was not applied to the foundational aggregation pattern itself (e.g., no explicit contrast between SQL GROUP BY and MongoDB $group, or between SQL joins and embedded documents). One correct SQL bridge was deployed at the right moment; broader SQL contrast framing was absent. |
| Novelty Integrity | △ | "What I drew on" cites only lab content — appropriate. However, the learner extended to two operators the lab did not teach: *"{ $size: '$field' } to convert an array to a count — the $addToSet hint directed me to look this up, but the lab did not explicitly teach $size"* and *"The $gt operator in the post-group $match — not shown in the lab (which used $gte/$lt). I inferred it from the same comparison operator family."* Both extensions are correctly flagged as inferred. The inferences are minimal, competent, and clearly disclosed — they do not represent undisclosed prior knowledge. Scored △ rather than ✓ because prior training data may have informed `$size` and `$gt` beyond what the lab taught, even though the learner framed them as inferences. |

**Transfer Score: 3.5/4**

*(Sense-Making and Novelty Integrity each scored △, weighted as 0.5. Fluency and Induction scored ✓, weighted as 1.0 each.)*

---

## Rubric Score (Spec's 10-point rubric)

For completeness against the spec's own rubric:

| Criterion | Points Available | Awarded | Rationale |
|---|---|---|---|
| Identifies all necessary stages | 2 | 2 | All 7 required stages present ($match, $unwind, $group with $sum/$avg/$addToSet, second $match, $project, $sort, $limit) |
| Correct grouping strategy | 2 | 2 | Groups by `$books.genre`; accumulates totalRevenue ($sum), avgPrice ($avg), uniqueCustomers ($addToSet on $customer_id) — all correct |
| Explains stage purpose | 2 | 2 | Each stage has a substantive explanation (e.g., "$unwind: Deconstruct the embedded books array so each book becomes an independent document") |
| Correct stage sequencing | 2 | 2 | $match-before-$group ✓; second $match after $group ✓; $sort-before-$limit ✓ |
| Output schema is logical | 1 | 1 | genre (renamed from _id), totalRevenue, avgPrice, uniqueCustomerCount — matches spec's expected output schema |
| Demonstrates understanding of data flow | 1 | 1 | *"Required before $group so each book can be independently aggregated by genre"* — explicit stage-to-stage connection reasoning |
| **Total** | **10** | **10** | |

**Spec rubric score: 10/10** — exceeds passing threshold of ≥7/10.

---

## Hypothesis Verdicts

| Hypothesis | Verdict | Basis |
|---|---|---|
| KLI typing produces agents that decide, not just execute | **Supported** | Fluency ✓ + Induction ✓ + Sense-Making △ — learner applied two accumulators not directly shown together ($avg + $addToSet in same $group), justified stage ordering by data availability, and correctly identified the post-group $match constraint without prompting. Decision-making evidence is strong even with partial SQL bridging. |
| SQL bridging reduces failure rates beyond structural clarity | **Partially supported** | Sense-Making △ — learner named the SQL HAVING analogy for the post-group filter, which is the highest-risk ordering constraint in the task. However, no SQL contrast was offered for the core $group pattern or for $unwind's role as an array-flattening prerequisite. One correct SQL bridge deployed; broader framing absent. |
| Decision-record artifacts improve novel task performance | **Supported** | Induction ✓ — learner explicitly cited *"Stage 2's observation that 'group first, then project' — applied as 'group first, then post-group $match, then project'"* as a decision record from the lab that they extended to the new context. The sequencing rule was extracted from a lab-stage pattern and correctly generalized to a novel constraint. |

---

## Rubric vs. Hypothesis Divergence Note

The spec's 10-point rubric awarded 10/10. The hypothesis scoring awarded 3.5/4. The divergence is explained by the rubric not testing Sense-Making directly — it checks *whether* SQL/HAVING analogy appears but does not require it for full marks. The hypothesis scoring penalises the absence of broader SQL bridging that the rubric does not require. Both scores are valid for their purpose: the rubric measures task completion; the hypothesis scores measure theory of instruction.

---

## Section 14 Finding

**Aggregation Foundations (May 2026):** KLI hypothesis supported and decision-records hypothesis supported; SQL bridging hypothesis partially supported — learner applied the HAVING analogy correctly but did not bridge the core $group pattern to SQL GROUP BY. The rubric should be revised to award the SQL bridging criterion only when the contrast appears on at least two distinct concepts (not just HAVING), or the lab's Stage 2 learning content should explicitly name the SQL GROUP BY → MongoDB $group parallel so the connection is available for transfer.

---

## Rulebook Section 14 Update Required

Add to the **Findings** section of `standards/instructional-design-rulebook.md`:

**Lab 4: Aggregation Foundations (1 May 2026)**

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Score: 3.5/4**

**Observation:** SQL HAVING analogy applied correctly for post-group filter, but no SQL contrast offered for core $group or $unwind patterns. One correct bridge deployed; broader framing absent.

**Evidence:**
- **Fluency:** Applied $avg and $addToSet correctly in new context without re-teaching
- **Induction:** Justified stage ordering by data availability ("totalRevenue field does not exist until $group creates it")
- **Sense-Making:** Named HAVING analogy once; did not name GROUP BY or JOIN contrasts
- **Decision Records:** Explicitly extended "group first, then project" rule to novel "group first, then post-group $match, then project" sequencing

**Finding:** SQL bridging pattern continues at △ (now 3 of 4 labs). Active ingredient for ✓ appears to be explicit multi-concept bridging, not single-concept bridging. One correct SQL analogy is insufficient to score ✓. Recommend revising transfer task prompt to require explicit SQL comparison on at least one core pattern (not just edge-case patterns like HAVING).

**Updated Hypothesis Validation Summary (4 labs):**

| Hypothesis | Lab 1 (ESR) | Lab 2 (ESR v2) | Lab 3 (Memory) | Lab 4 (Agg) | **Overall** |
|---|---|---|---|---|---|
| KLI Typing | ✓ | ✓ | ✓ | ✓ | **SUPPORTED** (4/4) |
| SQL Bridging | △ | △ | ✓ | △ | **PARTIALLY SUPPORTED** (1/4 ✓) |
| Decision Records | ✓ | ✓ | ✓ | ✓ | **SUPPORTED** (4/4) |
