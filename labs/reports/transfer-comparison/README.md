# Knowledge Transfer Experiment

Three-condition study testing how effectively agents transfer MongoDB knowledge to a novel domain after:

- **Condition A** — Completing the full lab (hands-on, with checks and reflection)
- **Condition B** — Receiving only the lab's `KNOWLEDGE.json` (no hands-on work)
- **Condition C** — Reading only the tech spec (no hands-on work, no knowledge artifact)

All three conditions produce a transfer task response. Responses are scored identically using `/score-transfer-task` against the same KLI rubric.

## Hypothesis Being Tested

From [standards/hypothesis-validation.md](../../standards/hypothesis-validation.md):

1. **KLI typing hypothesis** — Labs that produce KNOWLEDGE.json entries with fluency/induction/sense-making mappings enable transfer without lab completion
2. **SQL bridging hypothesis** — Explicit SQL contrasts in KNOWLEDGE.json entries reduce failure rates on novel domain problems
3. **Decision-record hypothesis** — Structured artifacts (KNOWLEDGE.json) improve novel task performance compared to unstructured spec reading

## Scope

| Lab | Transfer Task | Conditions |
|---|---|---|
| builder-badge | ✗ | KNOWLEDGE.json quality audit only |
| insert-and-find | ✗ | KNOWLEDGE.json quality audit only |
| esr-indexing-strategy | ✓ | A, B, C — full scoring |
| aggregation-foundations | ✓ | A, B, C — full scoring |
| memory-for-ai | ✓ | A, B, C — full scoring |

## Directory Structure

```
labs/reports/transfer-comparison/
  {lab-name}/
    condition-b-v1-context.md      ← prepared by: node scripts/prepare-condition.js --lab <name> --condition b
    condition-b-v1-response.md     ← produced by: /run-condition-b
    condition-b-v1-score.md        ← produced by: /score-transfer-task
    condition-c-v1-context.md      ← prepared by: node scripts/prepare-condition.js --lab <name> --condition c
    condition-c-v1-response.md     ← produced by: /run-condition-c
    condition-c-v1-score.md        ← produced by: /score-transfer-task
```

Condition A outputs stay in the standard location: `labs/reports/{lab-name}/{lab-name}-env-eval-v{N}.md`.

## Workflow

```
# For each lab with a transfer task (esr, aggregation-foundations, memory-for-ai):

# Condition A — run the full lab
/run-learner-agent (lab name: <name>)
/score-transfer-task (attach spec + env-eval)

# Condition B — knowledge only
node scripts/prepare-condition.js --lab <name> --condition b
/run-condition-b (lab name: <name>, attach context doc)
/score-transfer-task (attach spec + condition-b response)

# Condition C — spec only
node scripts/prepare-condition.js --lab <name> --condition c
/run-condition-c (lab name: <name>, attach context doc)
/score-transfer-task (attach spec + condition-c response)

# Compare results
node scripts/compare-conditions.js --lab <name>
node scripts/compare-conditions.js --all
```

## Fresh Agent Requirement

**Critical:** Each condition must be run in a separate Copilot Chat session. The agent must start with no prior context.

Before starting any condition run:
1. Open a new Copilot Chat conversation
2. Verify no KNOWLEDGE.json files exist (run: `find lab-test-env -name KNOWLEDGE.json`)
3. If any exist, delete them before Condition B/C runs — they must not influence the test

## Scoring Rubric (Same for All Conditions)

| Criterion | Tests |
|---|---|
| Fluency | Correct syntax/pattern applied without being shown it |
| Induction | Reasoned choice based on new domain, not lab similarity |
| Sense-Making | SQL instinct named + MongoDB approach explained with contrast |
| Novelty Integrity | Response draws only on what the condition provided |

## Results Summary

Run `node scripts/compare-conditions.js --all` to see current status across all labs.
