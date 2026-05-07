---
mode: agent
description: "Condition C test — answer a lab's transfer task using only the tech spec (no lab completion, no KNOWLEDGE.json)"
---

[agents/spec-only-respondent.md](../../agents/spec-only-respondent.md)

Run Condition C of the knowledge-transfer experiment using the agent definition above.

**Before running:**
1. Prepare the context document:
   ```
   node scripts/prepare-condition.js --lab [lab-name] --condition c
   ```
2. Attach the generated context document from `ABC-testing/[lab-name]/condition-c-v[N]-context.md`

**Fill in before running:**
- Lab name: [kebab-case lab name]

No lab completion or KNOWLEDGE.json required — this condition starts cold with only the tech spec.

Output saves to `ABC-testing/[lab-name]/condition-c-v[N]-response.md`.

After saving, score with `/score-transfer-task` (attach the tech spec + the condition-c response as the env-eval).
