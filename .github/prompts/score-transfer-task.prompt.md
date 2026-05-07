---
mode: agent
description: Score a learner agent's transfer task response against the three KLI hypotheses and produce a finding for standards/hypothesis-validation.md
---

[agents/transfer-task-scorer.md](../../agents/transfer-task-scorer.md)

Score the transfer task using the agent definition above.

**Attach before running:**
- The lab tech spec (for the Transfer Task section)
- The response document containing the Transfer Task Response section. This may be:
  - **Condition A:** `labs/reports/{lab-name}/{lab-name}-env-eval-v{N}.md`
  - **Condition B:** `ABC-testing/{lab-name}/condition-b-v{N}-response.md`
  - **Condition C:** `ABC-testing/{lab-name}/condition-c-v{N}-response.md`

Output saves to:
- **Condition A:** `labs/reports/{lab-name}/{lab-name}-transfer-v{N}.md`
- **Conditions B/C:** `ABC-testing/{lab-name}/condition-{b|c}-v{N}-score.md`
