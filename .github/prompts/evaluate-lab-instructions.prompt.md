---
mode: ask
description: Evaluate a lab instruction artifact for spec quality and learner experience
---

[agents/lab-instruction-evaluator.md](../../agents/lab-instruction-evaluator.md)

Evaluate the attached lab instruction artifact using the agent definition above. The evaluation covers three passes:
1. **Pass 1:** Section-by-section pedagogical evaluation
2. **Pass 2:** Full-spec structural synthesis
3. **Pass 3:** Learner experience assessment (completion likelihood, pacing, recovery)

**Fill in before running:**
- Target task: [e.g., "help an agent query MongoDB using Atlas Search"]
- Audience: an external AI agent with no prior MongoDB knowledge
- Current knowledge state: No prior MongoDB knowledge

Attach the spec file from `labs/specs/` using #file before sending.
Output saves to `labs/reports/{name}-tech-spec-eval-v{N}.md`.
