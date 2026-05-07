---
mode: ask
description: Evaluate a lab spec for both spec quality and learner experience (runs both evaluators)
---

[agents/lab-instruction-evaluator.md](../../agents/lab-instruction-evaluator.md)

Run a combined evaluation of the attached lab spec using both sub-agents:
1. **Spec Quality Evaluator** — structural quality and rulebook compliance
2. **Learner Experience Evaluator** — completion likelihood from a zero-knowledge perspective

To run each evaluator independently, use `/evaluate-spec-quality` or `/evaluate-learner-experience`.

**Fill in before running:**
- Target task: [e.g., "help an agent query MongoDB using Atlas Search"]

Attach the spec file from `labs/specs/` using #file before sending.
Output saves to `labs/reports/{name}/{name}-tech-spec-eval-v{N}.md`.
