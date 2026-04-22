---
mode: agent
description: Generate a working skeleton app and check scripts from a lab tech spec
---

**Recommended:** First activate the `mongodb-learning-design` skill in your Claude session.

[agents/lab-environment-builder.md](../../agents/lab-environment-builder.md)

Build the test environment using the agent definition above.

**Prerequisites:**
- The tech spec must have passed evaluation with BOTH Spec Quality ≥ 8/10 AND Learner Experience ≥ 8/10
- If not, iterate the spec first by running /evaluate-lab-instructions

**Fill in before running:**
- Lab name: [kebab-case name for the output folder]

Attach the tech spec from `labs/specs/` using #file before sending.
Output saves to `lab-test-env/[lab-name]/`.
