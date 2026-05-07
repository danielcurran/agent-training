# Knowledge Transfer Experiment

Three-condition study testing how effectively agents transfer MongoDB knowledge to a novel domain after:

- **Condition A** — Completing the full lab (hands-on, with checks and reflection)
- **Condition B** — Receiving only the lab's `KNOWLEDGE.json` (no hands-on work)
- **Condition C** — Reading only the tech spec (no hands-on work, no knowledge artifact)

All three conditions produce a transfer task response. Responses are scored identically using `/score-transfer-task` against the same KLI rubric.

## Hypothesis Being Tested

Testing whether structured knowledge artifacts and specifications alone can transfer skills without hands-on lab work:

1. **KLI typing hypothesis** — KNOWLEDGE.json entries alone enable transfer (no lab completion needed)
2. **SQL bridging hypothesis** — Explicit SQL contrasts reduce failure rates on novel problems
3. **Decision-record hypothesis** — Structured artifacts outperform unstructured spec reading

**Transfer task design:** The task requires agents to extend and infer beyond the lab pattern. It introduces:
- A novel surgical scheduling domain (vs. product catalog)
- Multiple fields in the same E/S/R role (requiring prioritization)
- Array fields and write-performance trade-offs (requiring reasoning beyond mechanical ESR)
- This tests whether the lab truly enables conceptual understanding or just pattern matching

## Scope

**Current lab:** ESR Indexing Strategy (transfer task with 3 conditions: A, B, C — full scoring)

## Directory Structure

```
ABC-testing/esr-indexing-strategy/
  condition-a-v1-env-eval.md     ← produced by /run-learner-agent (pending)
  condition-a-v1-transfer.md     ← produced by /score-transfer-task (pending)
  condition-b-v1-context.md      ← prepared by prepare-condition.js
  condition-b-v1-response.md     ← produced by /run-condition-b (pending)
  condition-b-v1-score.md        ← produced by /score-transfer-task (pending)
  condition-c-v1-context.md      ← prepared by prepare-condition.js
  condition-c-v1-response.md     ← produced by /run-condition-c (pending)
  condition-c-v1-score.md        ← produced by /score-transfer-task (pending)
```

## Workflow

```
# Condition A — run the full lab
# ⚠️ CRITICAL: KNOWLEDGE.json is created and validated DURING lab completion,
#    THEN the transfer task is completed AFTER knowledge is formally recorded.
#    This keeps the two completely isolated.
/run-learner-agent (lab name: esr-indexing-strategy)
  → Creates KNOWLEDGE.json and validates it
  → Then completes transfer task
  → Outputs: env-eval report (includes transfer response)
/score-transfer-task (attach spec + env-eval)

# Condition B — knowledge only
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition b
/run-condition-b (attach context doc)
/score-transfer-task (attach spec + condition-b response)

# Condition C — spec only
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition c
/run-condition-c (attach context doc)
/score-transfer-task (attach spec + condition-c response)

# Compare results
node scripts/compare-conditions.js --lab esr-indexing-strategy
```

## Fresh Agent Requirement

**Critical:** Each condition must be run in a separate Copilot Chat session. The agent must start with no prior context.

Before starting any condition run:
1. Open a new Copilot Chat conversation
2. Verify no KNOWLEDGE.json files exist (run: `find lab-test-env -name KNOWLEDGE.json`)
3. If any exist, delete them before Condition B/C runs — they must not influence the test

## Next Step

Start with Condition A (Full Lab Completion):

```bash
/run-learner-agent (lab name: esr-indexing-strategy in fresh Copilot Chat)
/score-transfer-task (attach spec + env-eval)
```
