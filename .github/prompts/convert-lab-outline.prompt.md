---
mode: ask
description: Convert a high-level lab outline into a detailed technical spec for agent training
---
**Recommended:** First activate the `mongodb-learning-design` skill in your Claude session for better spec quality.
[agents/lab-outline-converter.md](../../agents/lab-outline-converter.md)

Convert the attached lab outline into a full technical spec using the agent definition above.

**Fill in before running:**
- Target task: [what should the agent be able to do after completing the lab?]
- Constraints: [tooling, language, environment — leave blank for defaults]

Attach the outline file from `labs/outlines/` using #file before sending.
Output saves to `labs/specs/{name}-tech-spec.md`.