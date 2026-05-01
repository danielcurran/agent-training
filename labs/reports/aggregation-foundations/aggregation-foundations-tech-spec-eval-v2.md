# Lab Instruction Evaluation: Aggregation Foundations

**Spec Version:** 2.0
**Evaluation Date:** 1 May 2026
**Evaluator:** Lab Instruction Evaluator Agent
**Target Task:** Help a learner construct, apply, and design multi-stage MongoDB aggregation pipelines
**Audience:** Intermediate MongoDB developer (familiar with basic queries, moving to data transformation)
**Evaluation Version:** v2

---

## Pass 1: Section-by-Section Pedagogical Evaluation

### Section 1 — Terminal Learning Objectives

**Score: 9/10**

| Criterion | Rating | Notes |
|---|---|---|
| Specific and measurable | ✓ Strong | All 4 LOs use action verbs aligned to Bloom's taxonomy |
| Appropriately scoped | ✓ Strong | LO4 (design) is higher-order — appropriate for a transfer task |
| Aligned to stages | ✓ Strong | LOs map directly to Stages 1–4 content |
| Audience-appropriate | ✓ Strong | Assumes basic CRUD; doesn't require advanced knowledge |
| Observable/verifiable | ⚠️ Partial | LO4 assessed via check-reflection.js (now specified) + manual review. Automated check is structural only — design quality still requires human review. Acceptable given the note added to spec. |

**Finding:** LO4 verification is now structurally addressed with `check-reflection.js` and an explicit instructor review note. No new gaps. Score unchanged from v1 as this is an inherent limitation of automated assessment of design tasks.

---

### Section 2 — Prerequisites

**Score: 8.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Knowledge prerequisites clear | ✓ Strong | CRUD, JS syntax, structured data listed |
| Environment prerequisites clear | ✓ Strong | MongoDB version, mongosh, Node.js 18+, VS Code listed |
| Calibrated to audience | ⚠️ Partial | SQL JOIN note retained — Stage 4 still complex for learners without JOIN intuition |
| No hidden prerequisites | ✓ Improved | `$$variable` double-dollar syntax now surfaced in Stage 4 learning outcomes (fix #9 applied) |

**Finding:** The `$$variable` note is now in Stage 4 learning outcomes. Not yet in Section 2 prerequisites — acceptable placement since it's introduced at point-of-use, which follows good just-in-time scaffolding practice.

---

### Section 3 — Data Model

**Score: 10/10**

| Criterion | Rating | Notes |
|---|---|---|
| Schema completeness | ✓ Strong | All 3 collections documented |
| Sample documents provided | ✓ Strong | Realistic samples with ObjectId-style values |
| Relationships documented | ✓ Strong | customer_id → customers._id clearly noted |
| Index rationale | ✓ Strong | Indexes listed with purpose |
| Seeding strategy | ✓ Strong | Volume, distribution, idempotency specified |
| Referential integrity | ✓ Fixed | `reviews.book_id` comment now reads "identifier for the book being reviewed (no separate books collection)" — unambiguous |

**Finding:** Fix #10 fully resolved. No remaining issues in this section.

---

### Section 4 — Stage Specifications

#### Stage 1: $match + $unwind

**Score: 9.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 clear outcomes |
| Scaffolded code appropriate | ✓ Strong | TODOs are clear |
| Task instructions actionable | ✓ Strong | Operators named explicitly |
| Success criteria verifiable | ✓ Strong | 4 criteria, auto-checkable |
| Check script logic sound | ✓ Fixed | Check 1 now uses correct `\|\|` logic and tests `$lt` / `$lte` — fix #3 applied correctly |
| Reflection question included | ✓ Strong | Drives conceptual understanding |

**Finding:** Fix #3 resolved. Check logic is now: `if (!queryContent.includes("$gte") \|\| (!queryContent.includes("$lt") && !queryContent.includes("$lte")))` — correct boolean logic that requires both a lower bound and an upper bound operator.

---

#### Stage 2: $group + $project

**Score: 9.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 outcomes tied to task steps |
| Scaffolded code appropriate | ✓ Strong | Both $group and $project have TODO blocks |
| Task instructions actionable | ✓ Strong | Field paths explicitly stated |
| Success criteria verifiable | ✓ Strong | 6 criteria, all checkable |
| Check script imports | ✓ Fixed | `const fs = require("fs")` and `const path = require("path")` now present — fix #4 applied |
| Check script logic sound | ✓ Strong | Pipeline re-executed from known-good code |
| Cross-stage continuity | ✓ Strong | Explicitly builds on Stage 1 |

**Finding:** Fix #4 resolved. All imports present in check-stage-2.js.

---

#### Stage 3: $sort + $limit

**Score: 9.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 outcomes; sort-then-limit pattern named |
| Scaffolded code appropriate | ✓ Strong | $match and $limit provided; $group and $sort are TODOs |
| Task instructions actionable | ✓ Strong | Direction (-1) explicitly named |
| Success criteria verifiable | ✓ Strong | Precise programmatic criteria |
| Check script: $limit detection | ✓ Fixed | Now uses `/\$limit\s*:\s*10/` regex — fix #5 applied |
| Check script imports | ✓ Fixed | fs and path imports present — fix #4 applied |

**Finding:** Fix #5 resolved. Regex is whitespace-tolerant and will match all reasonable formatting variations.

---

#### Stage 4: $lookup + $set + $filter

**Score: 9/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 4 outcomes; stage sequencing rationale included |
| `$$variable` syntax flagged | ✓ Fixed | "New syntax: `$$variable` (double-dollar)" added to learning outcomes — fix #9 applied |
| Scaffolded code appropriate | ✓ Strong | Most complex stage; partial code provided |
| Task Step 2 instruction | ✓ Fixed | Now uses `{ $eq: ["$$book.genre", "Children's literature"] }` with explicit note "use MQL `$eq`, not JavaScript `===`" — fix #2 applied |
| Mid-stage checkpoint | ✓ Fixed | Partial pipeline checkpoint added after Step 1 — fix #8 applied |
| Check script imports | ✓ Fixed | fs and path imports present — fix #4 applied |
| Success criteria verifiable | ✓ Strong | 8 specific criteria |
| Complexity jump | ⚠️ Residual | Stage 4 still introduces the most new concepts simultaneously (5 operators). Mid-stage checkpoint mitigates but doesn't eliminate this. Acceptable given the checkpoint addition. |

**Finding:** Fixes #2, #8, #9 all applied correctly. The `===` instruction error — the highest-risk learner confusion source in v1 — is resolved. The mid-stage checkpoint meaningfully reduces debugging surface.

**Residual concern (minor):** The `$filter` hint in Section 9 and the task in Section 4 are now slightly redundant (both explain `$$book.genre`). Not a problem — reinforcement is beneficial.

---

#### Stage 5: Transfer Task / Reflection

**Score: 9.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Task requires transfer | ✓ Strong | Design (not execute) — higher-order |
| Business context realistic | ✓ Strong | E-commerce dashboard scenario |
| Rubric specific | ✓ Strong | 6 criteria, 10 points, threshold defined |
| Format guidance provided | ✓ Strong | Template with Stage N / Transformation / Fields / Connection |
| check-reflection.js | ✓ Fixed | Now fully specified and implemented — fix #1 applied |
| Instructor review note | ✓ New | "Flag for human review if borderline" note added — good practice |
| $addToSet prerequisite | ⚠️ Residual | Rubric still awards 2 points for "$addToSet or similar" — this operator is not taught in Stages 1–4. "Or similar" language partially mitigates, but learners may not know what "similar" means here |

**Finding:** Fix #1 fully resolved. `check-reflection.js` now implements:
- Minimum length check (150 chars)
- Required stage name checks ($match, $unwind, $group, $sort, $limit)
- Genre reference check
- Revenue/`$sum` reference check

**Residual concern:** The $addToSet rubric criterion remains an undisclosed prerequisite for 2 of 10 points. This is a minor issue — the "or similar" language gives partial credit paths — but worth noting for v3 if this eval triggers another revision.

---

## Pass 2: Full-Spec Structural Synthesis

### Alignment Matrix: LOs → Stages → Checks

| Learning Objective | Stage | Check | Gap |
|---|---|---|---|
| LO1: Construct pipelines ($match, $unwind, $group, $project) | Stages 1 + 2 | check-stage-1, check-stage-2 | None |
| LO2: Apply $sort + $limit | Stage 3 | check-stage-3 | None |
| LO3: Join collections ($lookup, $set, $filter) | Stage 4 | check-stage-4 | None |
| LO4: Design aggregation pipelines | Stage 5 (reflection) | check-reflection (✓ now specified) | None — human review recommended for borderline |

### Progressive Complexity Assessment

| Stage | New Operators | Complexity Delta | Rating |
|---|---|---|---|
| Stage 1 | $match, $unwind | Low | ✓ Appropriate |
| Stage 2 | $group, $project | Medium | ✓ Appropriate |
| Stage 3 | $sort, $limit | Low | ✓ Appropriate |
| Stage 4 | $lookup, $set, $filter, $eq, $$variables | High | ✓ Mitigated — mid-stage checkpoint added |
| Stage 5 | None (design task) | N/A | ✓ Appropriate |

**Finding:** Stage 3 → Stage 4 complexity jump is unchanged structurally, but the mid-stage checkpoint (partial pipeline execution after $lookup/$unwind) meaningfully reduces the debugging surface. Combined with the `$$variable` syntax callout and the corrected `$eq` instruction, Stage 4 is now well-scaffolded for its complexity level.

### Consistency Audit

| Item | Status |
|---|---|
| File paths in directory structure match check scripts | ✓ Consistent |
| npm script names match check script invocations | ✓ Consistent |
| Collection names in checks match data model | ✓ Consistent |
| check-stage-2/3/4 missing `require` imports | ✓ Fixed |
| check-stage-1 uses `$lte` but task uses `$lt` | ✓ Fixed |
| Stage 4 task uses `===` instead of `$eq` | ✓ Fixed |
| `check-reflection.js` referenced but unspecified | ✓ Fixed |
| REFLECTION.md location inconsistency | ✓ Fixed — now at lab root in directory structure |
| `checks/index.js` missing `--env` handler | ✓ Fixed — `checkEnv()` implemented |
| `checks/index.js` missing `--reflection` handler | ✓ Fixed — `--reflection` now handled in arg parsing |
| `checkReflection` called with `db` arg in `runChecks` but function signature takes no args | ⚠️ New minor issue — see below |

**New Finding:** In `checks/index.js`, `runChecks()` calls `await checks[s](db)` for all stages including `"reflection"`. However, `checkReflection` in `check-reflection.js` is defined as `async function checkReflection()` with no parameters — it reads from the filesystem only and does not need a `db` argument. Passing `db` as an argument is harmless in JavaScript (extra args are ignored), but it is inconsistent and may confuse maintainers.

**Recommendation:** Either update `checkReflection` signature to `async function checkReflection(db)` (accepting but ignoring `db`), or update `runChecks` to call reflection without the `db` arg: `await checks["reflection"]()`. The latter is cleaner.

### Specification Completeness Scorecard

| Component | Present | Complete | Notes |
|---|---|---|---|
| Terminal LOs | ✓ | ✓ | |
| Prerequisites | ✓ | ✓ | $$variable noted at point-of-use |
| Data model (all 3 collections) | ✓ | ✓ | book_id comment clarified |
| Seeding strategy | ✓ | ✓ | |
| Stage specs (1–4) | ✓ | ✓ | $eq fix applied; mid-stage checkpoint added |
| Transfer task spec | ✓ | ✓ | |
| Scaffolded code (all 4 stages) | ✓ | ✓ | |
| Check scripts (stages 1–4) | ✓ | ✓ | Imports fixed; logic bugs fixed |
| check-reflection.js | ✓ | ✓ | Fully specified and implemented |
| checks/index.js --env handler | ✓ | ✓ | checkEnv() implemented |
| checks/index.js --reflection handler | ✓ | ✓ | |
| Directory structure | ✓ | ✓ | REFLECTION.md at lab root |
| npm scripts | ✓ | ✓ | |
| Sample output (all 4 stages) | ✓ | ✓ | |
| Hints & common mistakes | ✓ | ✓ | |
| Accessibility section | ✓ | ✓ | |
| Alignment with Instructional Design Rulebook | ✓ | ✓ | |
| Estimated duration | ✓ | ✓ | Updated to 105 minutes |

---

## Pass 3: Learner Experience Assessment

### Completion Likelihood

**Estimated completion rate: 84%** (up from 72% in v1)

| Stage | Estimated Completion | Risk Factor |
|---|---|---|
| Stage 1 | 96% | Low — single TODO, check logic now correct |
| Stage 2 | 90% | Low-Medium — imports fixed, no false failures |
| Stage 3 | 88% | Low — regex check prevents false failures on formatting variants |
| Stage 4 | 78% | Medium — `$eq` fix and mid-stage checkpoint significantly reduce abandonment risk |
| Reflection | 84% | Medium — structural check now defined; $addToSet still undisclosed for full marks |

**Primary dropout risk: Stage 4** — Reduced but not eliminated. The complexity of $lookup + $set + $filter simultaneously remains the highest cognitive load point. Mid-stage checkpoint is the correct mitigation.

**Improvement from v1:** +12 percentage points overall. The two critical path blockers (the `===` instruction error and missing `check-reflection.js`) are resolved, which accounts for most of the improvement.

### Pacing Assessment

| Stage | Allocated Time | Estimated Actual | Status |
|---|---|---|---|
| Stage 1 | 20 min | 15–20 min | ✓ Well-paced |
| Stage 2 | 25 min | 20–28 min | ✓ Well-paced |
| Stage 3 | 20 min | 15–20 min | ✓ Slightly generous |
| Stage 4 | 25 min | 28–38 min | ⚠️ Still slightly under-estimated — mid-stage checkpoint adds 3–5 min |
| Reflection | 15 min | 12–18 min | ✓ Improved — 5 min added from v1's 10 min allocation |
| **Total** | **105 min** | **90–124 min** | ✓ Revised estimate is realistic for most learners |

**Finding:** The 105-minute estimate (fix #11) is now accurate for the median learner. Fast learners (experienced JS developers) may finish in ~90 min; slower learners may need up to ~120 min. The revised estimate is honest and appropriate.

### Recovery Assessment

| Scenario | Recovery Path | Rating |
|---|---|---|
| Syntax error in $match | Hints section covers this | ✓ Good |
| Wrong field path in $group | Hint explicitly covers $books.genre | ✓ Good |
| $sort ascending instead of descending | Hint covers this | ✓ Good |
| $lookup with wrong localField | Hint mentions `as` field | ⚠️ Partial |
| $filter using `===` instead of $eq | Task now explicitly warns against this | ✓ Fixed |
| check-reflection.js crashes | check-reflection.js now implemented | ✓ Fixed |
| `checkReflection` called with extra `db` arg | Harmless but inconsistent | ⚠️ Minor |

**Finding:** Both critical recovery blockers from v1 are resolved. The `$lookup` localField/foreignField confusion hint remains partial — acceptable as a known minor gap.

### Motivational Arc

| Dimension | Rating | Notes |
|---|---|---|
| Real-world context | ✓ Strong | Revenue reports, rankings, marketing lists — credible business tasks |
| Progressive achievement | ✓ Strong | Each stage produces visible, meaningful output |
| Feedback immediacy | ✓ Strong | `npm run check:stage-N` provides instant pass/fail |
| Difficulty ramp | ✓ Improved | Mid-stage checkpoint in Stage 4 breaks the hardest stage into two confirming moments |
| Transfer task framing | ✓ Strong | "You're designing a dashboard" — practitioner framing |

---

## Summary Scores

### Spec Quality Score

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| LO clarity and measurability | 9.0 | 15% | 1.35 |
| Data model completeness | 10.0 | 10% | 1.00 |
| Stage spec completeness | 9.0 | 25% | 2.25 |
| Check script correctness | 9.0 | 20% | 1.80 |
| Spec internal consistency | 9.0 | 15% | 1.35 |
| Transfer task specification | 9.0 | 15% | 1.35 |
| **Spec Quality Total** | — | — | **9.1 / 10** |

### Learner Experience Score

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Completion likelihood | 8.4 | 25% | 2.10 |
| Pacing accuracy | 8.5 | 15% | 1.275 |
| Scaffolding quality | 9.0 | 20% | 1.80 |
| Recovery / error handling | 8.5 | 20% | 1.70 |
| Motivational arc | 9.0 | 20% | 1.80 |
| **Learner Experience Total** | — | — | **8.68 / 10** |

---

## Verdict

**Spec Quality: 9.1 / 10 — Meets threshold (≥ 8.0) ✓**
**Learner Experience: 8.68 / 10 — Meets threshold (≥ 8.0) ✓**

**Status: ✅ Approved — Proceed to `/build-lab-environment`**

---

## Remaining Items (Optional — address in v3 if desired)

| # | Severity | Location | Issue | Fix |
|---|---|---|---|---|
| 1 | 🟢 Minor | `checks/index.js` | `checkReflection` called with `db` arg but accepts no params | Change `await checks["reflection"](db)` to `await checks["reflection"]()` or update function signature |
| 2 | 🟢 Minor | Stage 5 Rubric | $addToSet worth 2 points but not taught in Stages 1–4 | Add brief note: "Hint: consider how you'd track unique customers — look up $addToSet" |
| 3 | 🟢 Minor | Stage 4 Hints | $lookup hint covers `as` but not localField/foreignField confusion | Add: "Ensure localField references the field in the source collection (sales.customer_id) and foreignField references the field in the joined collection (customers._id)" |

---

## Delta from v1

| Issue | v1 Status | v2 Status |
|---|---|---|
| check-reflection.js missing | 🔴 Critical | ✅ Resolved |
| Stage 4 `===` instruction error | 🔴 Critical | ✅ Resolved |
| check-stage-1.js boolean/operator bug | 🔴 Bug | ✅ Resolved |
| check-stage-2/3/4 missing imports | 🟡 Bug | ✅ Resolved |
| $limit string check brittle | 🟡 Bug | ✅ Resolved |
| --env flag unimplemented | 🟡 Gap | ✅ Resolved |
| REFLECTION.md location inconsistency | 🟡 Inconsistency | ✅ Resolved |
| Stage 4 mid-stage checkpoint missing | 🟡 Gap | ✅ Resolved |
| $$variable syntax not flagged | 🟢 Minor | ✅ Resolved |
| reviews.book_id comment ambiguous | 🟢 Minor | ✅ Resolved |
| Duration under-estimated | 🟢 Minor | ✅ Resolved |
| checkReflection called with db arg | — | 🟢 New minor |