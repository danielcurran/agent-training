# agent-training

## Purpose

Repository for designing, evaluating, and iterating AI agent training materials for MongoDB education. Agents work through progressively harder labs that teach MongoDB concepts by doing — starting from a SQL-style data model and migrating to idiomatic MongoDB.

## Agents

| Agent | File | Invoked via | Role |
|---|---|---|---|
| Lab Instruction Evaluator | [agents/agent-lab-evaluator.md](agents/agent-lab-evaluator.md) | `/evaluate-lab-instructions` in Copilot Chat | Scores lab specs on clarity, completeness, and pedagogy |
| Lab Outline Converter | [agents/lab-outline-converter.md](agents/lab-outline-converter.md) | `/convert-lab-outline` in Copilot Chat | Converts high-level outlines into detailed technical specs |
| Lab Outline Designer | [agents/lab-outline-designer.md](agents/lab-outline-designer.md) | `/design-lab-outline` in Copilot Chat | Creates lab outlines to feed into the Lab Outline Converter |
| Lab Environment Builder | [agents/lab-environment-builder.md](agents/lab-environment-builder.md) | `/build-lab-environment` in Copilot Chat | Generates a working skeleton app and check scripts from a tech spec |
| Agent Learner | [agents/learner.md](agents/learner.md) | `/run-learner-agent` in Copilot Chat | Completes a lab as an external AI agent learner and produces a learning report |

The `.github/prompts/` files are thin wrappers that invoke the agents above. Do not add logic there — put it in the agent definition under `agents/`.

## Labs

| Lab | Outline | Tech Spec | Latest Evaluation | Score |
|---|---|---|---|---|
| Builder Badge | [labs/outlines/builder-badge-outline.md](labs/outlines/builder-badge-outline.md) | [labs/specs/builder-badge-tech-spec.md](labs/specs/builder-badge-tech-spec.md) | [labs/reports/builder-badge-tech-spec-eval-v1.md](labs/reports/builder-badge-tech-spec-eval-v1.md) | 9.6/10 — minor revisions recommended |
| Insert and Find | [labs/outlines/insert-and-find-outline.md](labs/outlines/insert-and-find-outline.md) | [labs/specs/insert-and-find-tech-spec.md](labs/specs/insert-and-find-tech-spec.md) | — | Not yet evaluated |

## Workflow

```
1. Write outline → labs/outlines/{name}-outline.md
2. /convert-lab-outline (attach outline) → saves labs/specs/{name}-tech-spec.md
3. /evaluate-lab-instructions (attach tech spec) → saves labs/reports/{name}-tech-spec-eval-v{N}.md
4. Iterate spec on evaluation feedback until score ≥ 8/10
5. /build-lab-environment (attach tech spec) → saves lab-test-environment/{name}/
6. /run-learner-agent (provide lab name) → saves labs/reports/{name}-env-eval-v{N}.md
```

## Lab Execution

```bash
cd lab-execution
cp .env.example .env        # set MONGODB_URI
npm install
npm run seed                # load starting data
npm run check:env           # verify setup
npm run check:all           # run all validation checks in order
```

Check scripts run in stage order: `check:env` → `check:schema` → `check:dal` → `check:vector` → `check:final` → `check:reflection`

See [lab-execution/README.md](lab-execution/README.md) for the full guide.

## Standards

All agents must follow the [Instructional Design Rulebook](standards/instructional-design-rulebook.md) when creating or evaluating any content. It is the authoritative reference for learning objectives, stage design, milestone checks, and evaluation criteria.

## Conventions

- Outlines: `labs/outlines/{name}-outline.md`
- Tech specs: `labs/specs/{name}-tech-spec.md`
- Evaluations: `labs/reports/{name}-tech-spec-eval-v{N}.md` — increment N each revision cycle
- Agent definitions live in `agents/` — `.github/prompts/` references them by filename, do not rename
