# Lab Instruction Evaluation: Aggregation Foundations
**Spec Version:** 1.0  
**Evaluation Date:** 30 April 2026  
**Evaluator:** Lab Instruction Evaluator Agent  
**Target Task:** Help a learner construct, apply, and design multi-stage MongoDB aggregation pipelines  
**Audience:** Intermediate MongoDB developer (familiar with basic queries, moving to data transformation)  
**Evaluation Version:** v1  

---

## Pass 1: Section-by-Section Pedagogical Evaluation

### Section 1 — Terminal Learning Objectives

**Score: 9/10**

| Criterion | Rating | Notes |
|---|---|---|
| Specific and measurable | ✓ Strong | All 4 LOs use action verbs (construct, apply, join, design) aligned to Bloom's taxonomy |
| Appropriately scoped | ✓ Strong | LO4 (design) is higher-order — appropriate for a transfer task |
| Aligned to stages | ✓ Strong | LOs map directly to Stages 1–4 content |
| Audience-appropriate | ✓ Strong | Assumes basic CRUD; doesn't require advanced knowledge |
| Observable/verifiable | ⚠️ Partial | LO4 ("design aggregation pipelines") is assessed only by written reflection — no automated check validates design quality programmatically |

**Finding:** LO4 is the only LO without a hard automated check. The reflection rubric partially compensates, but the check-reflection.js file is referenced in the directory structure and npm scripts but **never specified in the tech spec**. This is a gap.

**Recommendation:** Add a Section 4.5 or appendix specifying the `check-reflection.js` implementation — even if scoring is heuristic/keyword-based.

---

### Section 2 — Prerequisites

**Score: 8/10**

| Criterion | Rating | Notes |
|---|---|---|
| Knowledge prerequisites clear | ✓ Strong | CRUD operations, JS syntax, structured data familiarity all listed |
| Environment prerequisites clear | ✓ Strong | MongoDB version, mongosh, Node.js 18+, VS Code listed |
| Calibrated to audience | ⚠️ Partial | "SQL-style GROUP BY and JOIN concepts (helpful but not required)" — Stage 4's $lookup is complex; learners without JOIN intuition may struggle |
| No hidden prerequisites | ⚠️ Partial | Stage 4 uses `$concat`, `$eq`, `$$book` (double-dollar variable syntax) — these are not listed as prerequisites or pre-taught |

**Finding:** Double-dollar `$$` variable syntax in $filter is a non-trivial prerequisite that's only introduced in the hints section (Section 9), not flagged upfront in prerequisites or as a "new concept" callout in Stage 4's learning content.

**Recommendation:** Add "familiarity with MongoDB expression variables ($$variable syntax)" to Stage 4 learning content, or add a brief explainer callout before the $filter task.

---

### Section 3 — Data Model

**Score: 9.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Schema completeness | ✓ Strong | All 3 collections documented with field names, types, and descriptions |
| Sample documents provided | ✓ Strong | Realistic, concrete samples with actual ObjectId-style values |
| Relationships documented | ✓ Strong | customer_id → customers._id relationship clearly noted |
| Index rationale | ✓ Strong | Indexes listed with purpose (supports date-range $match) |
| Seeding strategy | ✓ Strong | Volume, distribution, idempotency all specified |
| Referential integrity | ⚠️ Minor | `reviews.book_id` references "books (or implicit)" — this is vague. Is there a `books` collection, or is book_id just a loose reference? Stage 3 never joins to a books collection, so this is fine, but the schema note is confusing |

**Finding:** Minor: The `reviews.book_id` comment "(references books (or implicit))" introduces ambiguity. There is no `books` collection in the data model, and Stage 3 does not require one. Simplify the comment.

**Recommendation:** Change to: `book_id: ObjectId // identifier for the book being reviewed (no separate books collection)`

---

### Section 4 — Stage Specifications

#### Stage 1: $match + $unwind

**Score: 8.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 clear outcomes matching the task |
| Scaffolded code appropriate | ✓ Strong | TODOs are clear; $unwind is provided (not a task) |
| Task instructions actionable | ✓ Strong | Step-by-step with concrete operators named |
| Success criteria verifiable | ✓ Strong | 4 criteria, 3 are auto-checkable |
| Check script logic sound | ⚠️ Issue | Check 1 uses `if (!queryContent.includes("$gte") && !queryContent.includes("$lte"))` — this should be `$lt` not `$lte`. The task instructs learners to use `$lt` (exclusive upper bound), not `$lte`. The check will pass even if learner uses `$lte: "2024-12-31"` (incorrect boundary logic) |
| Reflection question included | ✓ Strong | "Why is this count different from the number of sales documents?" drives conceptual understanding |

**Finding (Bug):** `check-stage-1.js` Check 1 tests for `$lte` but the task instructs learners to use `$lt`. The check should test for `$lt` OR `$lte` as both may be reasonable — but the check currently only passes if the learner uses `$gte` but NOT `$lte`, which is inverted logic (`&&` not `||`). This will cause false failures.

**Recommendation:** Fix check logic to:
```javascript
if (!queryContent.includes("$gte") || (!queryContent.includes("$lt") && !queryContent.includes("$lte"))) {
  return { pass: false, error: "$match stage missing date comparison operators ($gte and $lt/$lte)" };
}
```

---

#### Stage 2: $group + $project

**Score: 9/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 outcomes, all tied to task steps |
| Scaffolded code appropriate | ✓ Strong | Both $group and $project have clear TODO blocks with hints |
| Task instructions actionable | ✓ Strong | Field paths ($books.genre after $unwind) explicitly stated |
| Success criteria verifiable | ✓ Strong | 6 criteria; all checkable programmatically |
| Check script logic sound | ✓ Strong | Pipeline is re-executed from known-good code; schema validation checks field names and types |
| Cross-stage continuity | ✓ Strong | Task explicitly states "Starting from Stage 1's query.js" — builds on prior stage |
| Verification step included | ✓ Strong | "Total revenue across all genres should match sum of Stage 1 output prices" — teaches learner to cross-validate |

**Finding:** Minor: The check script file header (`check-stage-2.js`) is missing the `const fs = require("fs")` and `const path = require("path")` imports that are present in `check-stage-1.js`. The function uses `path.join` and `fs.existsSync` without importing them.

**Recommendation:** Add missing imports to `check-stage-2.js`, `check-stage-3.js`, and `check-stage-4.js` headers.

---

#### Stage 3: $sort + $limit

**Score: 8.5/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 3 outcomes; sort-then-limit pattern explicitly named |
| Scaffolded code appropriate | ✓ Strong | $match and $limit are provided; $group and $sort are TODOs |
| Task instructions actionable | ✓ Strong | Direction (-1) explicitly named |
| Success criteria verifiable | ✓ Strong | "Output is sorted high-to-low (first rating ≥ last rating)" is a precise, programmatic criterion |
| Check logic: $limit detection | ⚠️ Issue | Check uses `queryContent.includes("$limit: 10")` — this will fail if learner writes `$limit:10` (no space) or `const limitStage = { $limit: 10 }` where `$limit` is on a different line. String matching is fragile |
| Dataset adequacy | ⚠️ Minor | 200 reviews across 30 books = ~6.7 reviews/book average. $limit: 10 requires at least 10 distinct book_ids with post-2018 reviews. With 200 reviews and 30 books, this is likely fine but should be confirmed in seed data design |

**Finding:** The `$limit: 10` string check is brittle. Consider using AST parsing or a regex that's whitespace-tolerant: `/\$limit\s*:\s*10/`.

**Recommendation:** Change check to: `if (!/\$limit\s*:\s*10/.test(queryContent))` for robustness.

---

#### Stage 4: $lookup + $set + $filter

**Score: 8/10**

| Criterion | Rating | Notes |
|---|---|---|
| Learning outcomes specific | ✓ Strong | 4 outcomes; stage sequencing rationale included |
| Scaffolded code appropriate | ✓ Strong | Most complex stage; $match, $unwind, and $matchChildrens are fully provided |
| Task instructions actionable | ⚠️ Partial | Step 2 uses `"$$book.genre" === "Children's literature"` — this is JavaScript comparison syntax, not MQL. Learners may copy this literally. The correct MQL is `{ $eq: ["$$book.genre", "Children's literature"] }` (shown in the check script but not in the task instructions) |
| Success criteria verifiable | ✓ Strong | 8 specific criteria including genre filter validation |
| Check script logic sound | ✓ Strong | Full pipeline re-executed with known-good implementation; validates no non-children's books appear |
| Complexity jump | ⚠️ Concern | Stage 4 introduces 3 new operators ($lookup, $set, $filter) simultaneously. This is the largest conceptual jump in the lab. No intermediate "partial execution" checkpoint exists between $lookup and $filter |

**Finding (Instruction Error):** The learner task for Step 2 uses JavaScript equality syntax (`===`) instead of MQL expression syntax (`$eq`). This is a meaningful error that will cause confusion or copy-paste bugs.

**Recommendation:** Change Step 2 instruction to:
> Condition: `{ $eq: ["$$book.genre", "Children's literature"] }` (use MQL `$eq`, not JavaScript `===`)

**Additional Recommendation:** Add a mid-stage checkpoint: after completing $lookup and $unwind, instruct learner to execute the partial pipeline (just match → lookup → unwind) before adding $set. This reduces the debugging surface.

---

#### Stage 5: Transfer Task / Reflection

**Score: 8/10**

| Criterion | Rating | Notes |
|---|---|---|
| Task requires transfer (not recall) | ✓ Strong | Learner must design (not execute) a pipeline — higher-order task |
| Business context is realistic | ✓ Strong | E-commerce dashboard scenario is plausible and motivating |
| Rubric is specific | ✓ Strong | 6 criteria, 10 points, passing threshold defined |
| Format guidance provided | ✓ Strong | Template with Stage N / Transformation / Fields / Connection structure |
| check-reflection.js unspecified | ✗ Gap | Referenced in npm scripts, directory structure, and checks/index.js but never implemented or specified anywhere in the tech spec |
| Unique customer count challenge | ⚠️ Concern | Rubric awards 2 points for "$addToSet or similar" — but $addToSet requires knowing about set accumulation operators not taught in Stages 1–4. This is an undisclosed prerequisite for full marks |

**Finding (Critical Gap):** `check-reflection.js` is referenced 4 times in the spec but never implemented or pseudocoded. This will cause `npm run check:reflection` and `npm run check:all` to fail with a module-not-found error.

**Recommendation:** Add a `check-reflection.js` specification (keyword-based or structural heuristic) that checks for:
- Presence of required stage names ($match, $unwind, $group, $sort, $limit)
- Presence of "genre" field reference
- Minimum word count (e.g., >150 words) as proxy for explanation quality
- Passes automatically at this threshold; flag for human review if borderline

---

## Pass 2: Full-Spec Structural Synthesis

### Alignment Matrix: LOs → Stages → Checks

| Learning Objective | Stage | Check | Gap |
|---|---|---|---|
| LO1: Construct pipelines ($match, $unwind, $group, $project) | Stages 1 + 2 | check-stage-1, check-stage-2 | None |
| LO2: Apply $sort + $limit | Stage 3 | check-stage-3 | None |
| LO3: Join collections ($lookup, $set, $filter) | Stage 4 | check-stage-4 | None |
| LO4: Design aggregation pipelines | Stage 5 (reflection) | check-reflection (**unimplemented**) | **Critical: check-reflection.js missing** |

### Progressive Complexity Assessment

| Stage | New Operators | Complexity Delta | Rating |
|---|---|---|---|
| Stage 1 | $match, $unwind | Low (2 operators, 1 TODO) | ✓ Appropriate |
| Stage 2 | $group, $project | Medium (2 operators, 2 TODOs) | ✓ Appropriate |
| Stage 3 | $sort, $limit | Low (2 operators, 2 TODOs, familiar pattern) | ✓ Appropriate |
| Stage 4 | $lookup, $set, $filter, $eq, $$variables | **High** (5 new concepts, 3 TODOs, new syntax) | ⚠️ Jump too large |
| Stage 5 | None (design task) | N/A (transfer) | ✓ Appropriate |

**Finding:** Stage 4 introduces more new concepts simultaneously than any other stage. The complexity delta from Stage 3 → Stage 4 is the largest in the lab. This is the highest-risk stage for learner abandonment.

### Consistency Audit

| Item | Status |
|---|---|
| File paths in directory structure match file paths in check scripts | ✓ Consistent |
| npm script names match check script invocations | ✓ Consistent |
| Collection names in checks match data model | ✓ Consistent (`sales`, `reviews`, `customers`) |
| check-stage-2/3/4 missing `require` imports | ✗ Bug |
| check-stage-1 uses `$lte` but task uses `$lt` | ✗ Bug |
| Stage 4 task uses `===` instead of `$eq` | ✗ Instruction Error |
| `check-reflection.js` referenced but unspecified | ✗ Critical Gap |
| REFLECTION.md placed in `queries/` in directory structure but described as root-level in Stage 5 | ✗ Inconsistency |
| `checks/index.js` parses `--stage=N` but npm scripts use `--stage=1` format — this is consistent | ✓ Consistent |
| `checks/index.js` does not handle `--env` flag (referenced in npm scripts as `check:env`) | ✗ Gap |

**Finding (Inconsistency):** `REFLECTION.md` appears in `queries/REFLECTION.md` in the directory tree but is described in Stage 5 as just `REFLECTION.md` (implying root). The convention in CLAUDE.md places `REFLECTION.md` at root level (`lab-test-env/{name}/REFLECTION.md`). The directory structure in the spec should be corrected.

**Finding:** `check:env` npm script calls `checks/index.js --env` but `checks/index.js` has no `--env` handler. This script will silently do nothing.

### Specification Completeness Scorecard

| Component | Present | Complete | Notes |
|---|---|---|---|
| Terminal LOs | ✓ | ✓ | |
| Prerequisites | ✓ | ⚠️ | Missing $$variable syntax note |
| Data model (all 3 collections) | ✓ | ✓ | Minor reviews.book_id comment ambiguity |
| Seeding strategy | ✓ | ✓ | |
| Stage specs (1–4) | ✓ | ⚠️ | Stage 4 instruction error ($eq vs ===) |
| Transfer task spec | ✓ | ⚠️ | check-reflection.js unimplemented |
| Scaffolded code (all 4 stages) | ✓ | ✓ | |
| Check scripts (stages 1–4) | ✓ | ⚠️ | Missing imports in 2–4; logic bug in 1 |
| check-reflection.js | ✗ | ✗ | Not specified anywhere |
| checks/index.js --env handler | ✗ | ✗ | Referenced but unimplemented |
| Directory structure | ✓ | ⚠️ | REFLECTION.md location inconsistency |
| npm scripts | ✓ | ✓ | |
| Sample output (all 4 stages) | ✓ | ✓ | |
| Hints & common mistakes | ✓ | ✓ | Good coverage |
| Accessibility section | ✓ | ✓ | Thoughtful; screen reader note is a nice touch |
| Alignment with Instructional Design Rulebook | ✓ | ✓ | |

---

## Pass 3: Learner Experience Assessment

### Completion Likelihood

**Estimated completion rate: 72%**

| Stage | Estimated Completion | Risk Factor |
|---|---|---|
| Stage 1 | 95% | Low — single TODO, clear operators |
| Stage 2 | 88% | Low-Medium — two TODOs but directly follows Stage 1 |
| Stage 3 | 85% | Low — familiar pattern (sort+limit), new collection but same structure |
| Stage 4 | 68% | **High** — $lookup + $set + $filter simultaneously; `===` instruction error will cause confusion |
| Reflection | 78% | Medium — design task is clear but undisclosed $addToSet requirement may frustrate |

**Primary dropout risk: Stage 4** — The combination of new syntax (`$$`), three new operators, a JavaScript-syntax instruction error, and no mid-stage checkpoint creates a high abandonment risk.

### Pacing Assessment

| Stage | Allocated Time | Estimated Actual | Status |
|---|---|---|---|
| Stage 1 | 20 min | 15–20 min | ✓ Well-paced |
| Stage 2 | 25 min | 20–28 min | ✓ Well-paced |
| Stage 3 | 20 min | 15–20 min | ✓ Slightly generous |
| Stage 4 | 25 min | 30–40 min | ⚠️ Under-estimated by 5–15 min |
| Reflection | 10 min | 12–18 min | ⚠️ Under-estimated |
| **Total** | **90 min** | **92–126 min** | ⚠️ May run over for ~40% of learners |

**Finding:** Stage 4 and the Reflection are both under-timed. Total lab duration of 90 minutes is achievable for experienced developers but optimistic for the stated intermediate audience. Consider revising the estimated duration to 105 minutes or splitting Stage 4 into two checkpoints.

### Recovery Assessment (What happens when a learner is stuck?)

| Scenario | Recovery Path | Rating |
|---|---|---|
| Syntax error in $match | Hints section mentions $and mistake; mongosh error messages are clear | ✓ Good |
| Wrong field path in $group ($books.genre vs $genre) | Hint explicitly covers this | ✓ Good |
| $sort ascending instead of descending | Hint covers this | ✓ Good |
| $lookup with wrong localField | Hint mentions `as` but not localField/foreignField confusion | ⚠️ Partial |
| $filter using `===` instead of $eq (copied from instructions) | No recovery hint — **this error is introduced by the spec itself** | ✗ Poor |
| check-reflection.js crashes (module not found) | No recovery path — learner cannot run `npm run check:all` | ✗ Blocked |

**Critical Finding:** Two of the six stuck-learner scenarios have no recovery path because they are caused by spec errors (the `===` instruction error and the missing `check-reflection.js`). These must be fixed before the lab is published.

### Motivational Arc

| Dimension | Rating | Notes |
|---|---|---|
| Real-world context | ✓ Strong | Revenue reports, rankings, marketing lists — all credible business tasks |
| Progressive achievement | ✓ Strong | Each stage produces visible, meaningful output (genre revenue, top 10 list, customer contacts) |
| Feedback immediacy | ✓ Strong | `npm run check:stage-N` provides instant pass/fail |
| Difficulty ramp | ⚠️ Concern | Stage 3 → Stage 4 complexity jump may feel discouraging if learner is already tired |
| Transfer task framing | ✓ Strong | "You're designing a dashboard" — learner feels like a practitioner, not a student |

---

## Summary Scores

### Spec Quality Score

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| LO clarity and measurability | 9.0 | 15% | 1.35 |
| Data model completeness | 9.5 | 10% | 0.95 |
| Stage spec completeness | 7.5 | 25% | 1.875 |
| Check script correctness | 6.5 | 20% | 1.30 |
| Spec internal consistency | 7.0 | 15% | 1.05 |
| Transfer task specification | 7.0 | 15% | 1.05 |
| **Spec Quality Total** | — | — | **7.6 / 10** |

### Learner Experience Score

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Completion likelihood | 7.2 | 25% | 1.80 |
| Pacing accuracy | 7.0 | 15% | 1.05 |
| Scaffolding quality | 8.5 | 20% | 1.70 |
| Recovery / error handling | 6.0 | 20% | 1.20 |
| Motivational arc | 8.5 | 20% | 1.70 |
| **Learner Experience Total** | — | — | **7.45 / 10** |

---

## Verdict

**Spec Quality: 7.6 / 10 — Does not meet threshold (< 8.0)**  
**Learner Experience: 7.45 / 10 — Does not meet threshold (< 8.0)**

**Status: ⚠️ Revise before building environment**

---

## Required Fixes (Must resolve before v2)

| # | Severity | Location | Issue | Fix |
|---|---|---|---|---|
| 1 | 🔴 Critical | `checks/check-reflection.js` | File referenced but never specified or implemented | Add check-reflection.js specification (keyword-based heuristic) |
| 2 | 🔴 Critical | Stage 4, Learner Task Step 2 | Uses `===` (JavaScript) instead of `$eq` (MQL) | Change to `{ $eq: ["$$book.genre", "Children's literature"] }` |
| 3 | 🔴 Bug | `checks/check-stage-1.js` Check 1 | `&&` logic inverted; tests `$lte` but task uses `$lt` | Fix boolean logic and operator name |
| 4 | 🟡 Bug | `checks/check-stage-2/3/4.js` | Missing `require("fs")` and `require("path")` imports | Add imports to all three files |
| 5 | 🟡 Bug | `checks/check-stage-3.js` | `$limit: 10` string check is whitespace-sensitive | Replace with regex `/\$limit\s*:\s*10/` |
| 6 | 🟡 Gap | `checks/index.js` | `--env` flag handler not implemented | Add `--env` case to `runChecks()` that validates MongoDB connection |
| 7 | 🟡 Inconsistency | Directory structure | `REFLECTION.md` placed in `queries/` but should be root-level per CLAUDE.md convention | Move to `lab-test-env/aggregation-foundations/REFLECTION.md` |
| 8 | 🟡 Gap | Stage 4 | No mid-stage checkpoint between $lookup and $filter | Add step: "Execute partial pipeline (match → lookup → unwind) before adding $set" |
| 9 | 🟢 Minor | Section 2 Prerequisites | `$$variable` syntax not flagged | Add note in Stage 4 learning content: "New syntax: `$$variable` (double-dollar) used inside $filter expressions" |
| 10 | 🟢 Minor | Section 3 Data Model | `reviews.book_id` comment is ambiguous | Simplify to "identifier for the book being reviewed (no separate books collection)" |
| 11 | 🟢 Minor | Timing | Stage 4 + Reflection under-estimated | Update estimated duration to 105 minutes |

---

## Recommended Next Steps

1. **Fix items 1–7** (critical + bugs) — these will cause runtime failures
2. **Address items 8–11** (enhancements) — these improve learner experience
3. Re-run `/evaluate-lab-instructions` on v2 spec — target ≥ 8.0 on both scores
4. When both scores ≥ 8.0, proceed to `/build-lab-environment`