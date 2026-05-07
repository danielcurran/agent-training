# Knowledge Transfer Experiment — Test Playbook

**Experiment goal:** Determine whether hands-on lab completion is necessary for knowledge transfer, or whether a structured KNOWLEDGE.json artifact (Condition B) or tech spec reading alone (Condition C) produces equivalent transfer task performance.

**Status:** 🟡 In progress — Condition A baselines exist for 3/3 scored labs; Conditions B and C not yet run

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

| Lab | Transfer Task | Condition A baseline |
|---|---|---|
| builder-badge | ✗ (KNOWLEDGE.json quality only) | ✓ [env-eval-v1](labs/reports/builder-badge/builder-badge-env-eval-v1.md) |
| insert-and-find | ✗ (KNOWLEDGE.json quality only) | ✓ [env-eval-v3](labs/reports/insert-and-find/insert-and-find-env-eval-v3.md) |
| esr-indexing-strategy | ✓ | ✓ [env-eval-v4](labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-v4.md) — [transfer-v3](labs/reports/esr-indexing-strategy/esr-indexing-strategy-transfer-v3.md) |
| aggregation-foundations | ✓ | ✓ [env-eval-v1](labs/reports/aggregation-foundations/aggregation-foundations-env-eval-v1.md) — [transfer-v1](labs/reports/aggregation-foundations/aggregation-foundations-transfer-v1.md) |
| memory-for-ai | ✓ | ✓ [env-eval-v2](labs/reports/memory-for-ai/memory-for-ai-env-eval-v2.md) — [transfer-v1](labs/reports/memory-for-ai/memory-for-ai-transfer-v1.md) |

---

## Step-by-Step Instructions

### Prerequisites (do once)

```bash
# Verify no stale KNOWLEDGE.json files exist — they must be absent before Condition B/C runs
find lab-test-env -name KNOWLEDGE.json
# Expected output: nothing (empty)

# Check current experiment status
node scripts/compare-conditions.js --all
```

---

### Condition A — Full Lab Completion

Condition A is already complete for all three scored labs. No further Condition A runs required unless a lab is revised.

If re-running Condition A for a specific lab:

1. Open a **fresh Copilot Chat session**
2. Confirm no KNOWLEDGE.json files exist: `find lab-test-env -name KNOWLEDGE.json`
3. Run: `/run-learner-agent` → Lab name: `[lab-name]`
4. Agent saves report to `labs/reports/[lab-name]/[lab-name]-env-eval-v{N}.md`
5. Score the transfer task: `/score-transfer-task` → attach tech spec + env-eval
6. Score saves to `labs/reports/[lab-name]/[lab-name]-transfer-v{N}.md`
7. Record findings in the [Findings Log](#findings-log) below

---

### Condition B — Knowledge Only

Run once per lab that has a transfer task (ESR, Aggregation Foundations, Memory for AI). Requires Condition A to have been completed first so KNOWLEDGE.json exists.

**Important:** Delete stale KNOWLEDGE.json files from other labs before running to avoid cross-contamination.

**Per-lab steps:**

```bash
# Step 1: Ensure KNOWLEDGE.json exists from Condition A
find lab-test-env/[lab-name] -name KNOWLEDGE.json

# Step 2: Prepare context document
node scripts/prepare-condition.js --lab [lab-name] --condition b
# → Saves: ABC-testing/[lab-name]/condition-b-v1-context.md
# → Prints the full context block to stdout

# Step 3: Open a fresh Copilot Chat session (REQUIRED)
# Step 4: Run in Copilot Chat:
#   /run-condition-b
#   → attach: ABC-testing/[lab-name]/condition-b-v1-context.md
#   → Lab name: [lab-name]
# → Agent saves response to: ABC-testing/[lab-name]/condition-b-v1-response.md

# Step 5: Score the response
#   /score-transfer-task
#   → attach tech spec + condition-b response
#   → Score saves to: ABC-testing/[lab-name]/condition-b-v1-score.md
```

Record results in the [Findings Log](#findings-log) below.

---

### Condition C — Spec Only

Run once per lab that has a transfer task. No prerequisites — no KNOWLEDGE.json needed.

**Important:** Run in a **completely fresh Copilot Chat session** with no prior context.

**Per-lab steps:**

```bash
# Step 1: Prepare context document
node scripts/prepare-condition.js --lab [lab-name] --condition c
# → Saves: ABC-testing/[lab-name]/condition-c-v1-context.md
# → Prints the full context block to stdout

# Step 2: Open a fresh Copilot Chat session (REQUIRED)
# Step 3: Run in Copilot Chat:
#   /run-condition-c
#   → attach: ABC-testing/[lab-name]/condition-c-v1-context.md
#   → Lab name: [lab-name]
# → Agent reads tech spec, then answers transfer task
# → Agent saves response to: ABC-testing/[lab-name]/condition-c-v1-response.md

# Step 4: Score the response
#   /score-transfer-task
#   → attach tech spec + condition-c response
#   → Score saves to: ABC-testing/[lab-name]/condition-c-v1-score.md
```

Record results in the [Findings Log](#findings-log) below.

---

### Check Progress at Any Time

```bash
node scripts/compare-conditions.js --all
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

Record one row per condition run as results come in. Update the hypothesis verdicts at the bottom when all three conditions are complete for a lab.

### ESR Indexing Strategy

| Condition | Fluency | Induction | Sense-Making | Novelty Integrity | Overall | Report |
|---|---|---|---|---|---|---|
| A — Full Lab | ✓ | ✓ | ✓ | △ | 3.5/4 | [transfer-v3](labs/reports/esr-indexing-strategy/esr-indexing-strategy-transfer-v3.md) |
| B — Knowledge Only | ✓ | ✓ | ✓ | ✓ | 4/4 | [condition-b-v1-score](esr-indexing-strategy/condition-b-v1-score.md) |
| C — Spec Only | — | — | — | — | — | not run |

**Hypothesis verdicts (ESR):** 
- **KLI Typing:** ✓ Supported (B matches A across all three criteria)
- **SQL Bridging:** ✓ Supported (Sense-Making ✓ in both A and B)
- **Decision Records:** ✓ Supported (KNOWLEDGE.json alone achieves parity with full lab on Induction + Sense-Making)
- **Pending:** Condition C to confirm if tech spec alone also achieves parity

---

### Aggregation Foundations

| Condition | Fluency | Induction | Sense-Making | Novelty Integrity | Overall | Report |
|---|---|---|---|---|---|---|
| A — Full Lab | ✓ | ✓ | △ | △ | 3.5/4 | [transfer-v1](labs/reports/aggregation-foundations/aggregation-foundations-transfer-v1.md) |
| B — Knowledge Only | — | — | — | — | — | not run |
| C — Spec Only | — | — | — | — | — | not run |

**Hypothesis verdicts (Aggregation Foundations):** _Pending Conditions B and C_

---

### Memory for AI

| Condition | Fluency | Induction | Sense-Making | Novelty Integrity | Overall | Report |
|---|---|---|---|---|---|---|
| A — Full Lab | ✓ | ✓ | ✓ | ✓ | 4/4 | [transfer-v1](labs/reports/memory-for-ai/memory-for-ai-transfer-v1.md) |
| B — Knowledge Only | — | — | — | — | — | not run |
| C — Spec Only | — | — | — | — | — | not run |

**Hypothesis verdicts (Memory for AI):** _Pending Conditions B and C_

---

### KNOWLEDGE.json Quality Audit (Labs Without Transfer Tasks)

For Builder Badge and Insert and Find, Conditions B and C cannot be transfer-task scored. Instead, evaluate the KNOWLEDGE.json quality directly: are the entries specific enough that a new agent could apply them to a novel problem?

| Lab | KNOWLEDGE.json | Entries | Quality Assessment | Notes |
|---|---|---|---|---|
| builder-badge | — | — | not run | No transfer task; KNOWLEDGE.json audit only |
| insert-and-find | — | — | not run | No transfer task; KNOWLEDGE.json audit only |

---

## Cross-Lab Summary

Fill in after all conditions are complete across all three scored labs.

| Lab | A vs B | A vs C | B vs C | Key finding |
|---|---|---|---|---|
| esr-indexing-strategy | — | — | — | — |
| aggregation-foundations | — | — | — | — |
| memory-for-ai | — | — | — | — |

**Overall conclusion:** _Pending_

---

## Updating hypothesis-validation.md

After completing all conditions for a lab, add a row to [standards/hypothesis-validation.md](standards/hypothesis-validation.md) using the format:

```
### Lab N: [Lab Name] — Three-Condition Comparison ([date])

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
| 2026-05-07 | Playbook created; Condition A baselines confirmed for all 3 scored labs |
