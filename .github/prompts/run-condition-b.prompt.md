---
mode: agent
description: "Condition B test — answer a lab's transfer task using only an injected KNOWLEDGE.json (no lab completion)"
---

[agents/knowledge-only-respondent.md](../../agents/knowledge-only-respondent.md)

Run Condition B of the knowledge-transfer experiment using the agent definition above.

**Before running:**
1. Ensure the lab's full run (Condition A) has been completed and a `KNOWLEDGE.json` exists in `lab-test-env/[lab-name]/`
2. Prepare the context document:
   ```
   node scripts/prepare-condition.js --lab [lab-name] --condition b
   ```
3. Attach the generated context document from `ABC-testing/[lab-name]/condition-b-v[N]-context.md`

**Fill in before running:**
- Lab name: [kebab-case lab name]

Output saves to `ABC-testing/[lab-name]/condition-b-v[N]-response.md`.

After saving, score with `/score-transfer-task` (attach the tech spec + the condition-b response as the env-eval).
