# Knowledge Transfer Experiment — Test Playbook

**Experiment goal:** Determine whether hands-on lab completion is necessary for knowledge transfer, or whether a structured KNOWLEDGE.json artifact (Condition B) or tech spec reading alone (Condition C) produces equivalent transfer task performance.

**Status:** 🔄 Complete reset — All conditions pending (start with Condition A)

---

## Background

Three conditions are tested against the same transfer task and scored identically:

| Condition | What the agent has | What they do |
|---|---|---|
| **A — Lab Completion** | Full lab environment + instructions | Completes all stages hands-on |
| **B — Knowledge Only** | KNOWLEDGE.json entries only | Answers transfer task from injected knowledge |
| **C — Spec Only** | Tech spec (read-only) | Reads spec, then answers transfer task |

**Hypothesis:** If Condition B matches Condition A, KNOWLEDGE.json artifacts are sufficient for knowledge transfer and hands-on lab work is not required for downstream tasks. If Condition C matches Condition A, tech specs alone are sufficient.

See [README.md](README.md) for the full experiment design and [standards/hypothesis-validation.md](standards/hypothesis-validation.md) for the scoring rubric and per-lab findings.

---

## Labs in Scope

**ESR Indexing Strategy** — Transfer task with Condition A baseline [transfer-v3](labs/reports/esr-indexing-strategy/esr-indexing-strategy-transfer-v3.md)

---

## Step-by-Step Instructions

### Prerequisites (do once)

```bash
# Verify no stale KNOWLEDGE.json files exist — they must be absent before Condition B/C runs
find lab-test-env -name KNOWLEDGE.json
# Expected output: nothing (empty)
```

---

### Condition A — Full Lab Completion

**Critical sequence:** KNOWLEDGE.json created and validated during lab completion, then transfer task completed afterward. This keeps the two completely isolated.

**Per-lab steps:**

```bash
# Step 1: Open a fresh Copilot Chat session (REQUIRED)
# Step 2: Verify no KNOWLEDGE.json files exist
find lab-test-env -name KNOWLEDGE.json
# Expected output: nothing (empty)

# Step 3: Run /run-learner-agent
#   → Lab name: esr-indexing-strategy
#   → Agent completes all stages
#   → KNOWLEDGE.json created and validated (checkpoint during learner execution)
#   → Transfer task answered AFTER knowledge is formally recorded
# → Agent saves report to: labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-v{N}.md
#     (report includes transfer task response)

# Step 4: Score the transfer task with /score-transfer-task
#   → attach: labs/specs/esr-indexing-strategy-tech-spec-v3.md
#   → attach: labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-v{N}.md
# → Score saves to: labs/reports/esr-indexing-strategy/esr-indexing-strategy-transfer-v{N}.md
```

Record results in the [Findings Log](#findings-log) below.

---

### Condition B — Knowledge Only

Requires Condition A to have been completed first so KNOWLEDGE.json exists.

**Per-lab steps:**

```bash
# Step 1: Ensure KNOWLEDGE.json exists from Condition A
find lab-test-env/esr-indexing-strategy -name KNOWLEDGE.json

# Step 2: Prepare context document
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition b
# → Saves: ABC-testing/esr-indexing-strategy/condition-b-v1-context.md

# Step 3: Open a fresh Copilot Chat session (REQUIRED)
# Step 4: Run /run-condition-b
#   → attach: ABC-testing/esr-indexing-strategy/condition-b-v1-context.md
# → Agent saves response to: ABC-testing/esr-indexing-strategy/condition-b-v1-response.md

# Step 5: Score with /score-transfer-task
#   → attach tech spec + condition-b response
#   → Score saves to: ABC-testing/esr-indexing-strategy/condition-b-v1-score.md
```

Record results in the [Findings Log](#findings-log) below.

---

### Condition C — Spec Only

No prerequisites — no KNOWLEDGE.json needed. Run in a completely fresh Copilot Chat session.

**Per-lab steps:**

```bash
# Step 1: Prepare context document
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition c
# → Saves: ABC-testing/esr-indexing-strategy/condition-c-v1-context.md

# Step 2: Open a fresh Copilot Chat session (REQUIRED)
# Step 3: Run /run-condition-c
#   → attach: ABC-testing/esr-indexing-strategy/condition-c-v1-context.md
# → Agent reads tech spec, then answers transfer task
# → Agent saves response to: ABC-testing/esr-indexing-strategy/condition-c-v1-response.md

# Step 4: Score with /score-transfer-task
#   → attach tech spec + condition-c response
#   → Score saves to: ABC-testing/esr-indexing-strategy/condition-c-v1-score.md
```

Record results in the [Findings Log](#findings-log) below.

---

### Check Progress

```bash
node scripts/compare-conditions.js --lab esr-indexing-strategy
```

---

## Scoring Reference

Each transfer task response is scored identically across all three conditions using `/score-transfer-task`:

| Criterion | ✓ Full | △ Partial | ✗ None |
|---|---|---|---|
| **Fluency** | Correct syntax/pattern applied unprompted | Correct but with errors | Not applied or copied verbatim |
| **Induction** | Choice justified by new domain's access pattern | Correct but weak justification | Mirrors lab example without reasoning |
| **Sense-Making** | Names SQL instinct + explains MongoDB approach | Covers MongoDB but no SQL contrast | No explanation or mechanical |
| **Novelty Integrity** | Draws only from condition-provided material | Minor use of outside knowledge | Uses knowledge the condition didn't provide |

**Hypothesis mapping:**

| Hypothesis | Criteria |
|---|---|
| KLI typing produces agents that decide, not just execute | Fluency + Induction + Sense-Making all ✓ |
| SQL bridging reduces failure rates | Sense-Making ✓ |
| Decision-record artifacts improve novel task performance | Induction + Sense-Making both ✓ |

---

## Findings Log

### ESR Indexing Strategy

| Condition | Fluency | Induction | Sense-Making | Novelty Integrity | Overall | Report |
|---|---|---|---|---|---|---|
| A — Full Lab | — | — | — | — | — | not run |
| B — Knowledge Only | — | — | — | — | — | not run |
| C — Spec Only | — | — | — | — | — | not run |

**Status:** All conditions pending

**Hypothesis verdicts:** _Pending all conditions_

---

## Updating hypothesis-validation.md

After completing Condition C, add an entry to [standards/hypothesis-validation.md](standards/hypothesis-validation.md) using the format:

```
### ESR Indexing Strategy — Three-Condition Comparison (2026-05-07)

| Hypothesis | Condition A | Condition B | Condition C |
|---|---|---|---|
| KLI Typing | [result] | [result] | [result] |
| SQL Bridging | [result] | [result] | [result] |
| Decision Records | [result] | [result] | [result] |

**Key finding:** [one sentence]
```

---

## Revision History

| Date | Change |
|---|---|
| 2026-05-07 | Playbook created for ESR Indexing Strategy; Condition A & B complete |
| 2026-05-07 | Scope reduced to ESR only for focused testing; docs simplified |
