# agent-training

## Purpose

Repository for designing, evaluating, and iterating AI agent training materials for MongoDB education. Agents work through progressively harder labs that teach MongoDB concepts by doing — starting from a SQL-style data model and migrating to idiomatic MongoDB.

## Agents

| Agent | File | Invoked via | Role |
|---|---|---|---|
| Lab Outline Designer | [agents/lab-outline-designer.md](agents/lab-outline-designer.md) | `/design-lab-outline` in Copilot Chat | Creates lab outlines to feed into the Lab Outline Converter |
| Lab Outline Converter | [agents/lab-outline-converter.md](agents/lab-outline-converter.md) | `/convert-lab-outline` in Copilot Chat | Converts high-level outlines into detailed technical specs |
| Lab Instruction Evaluator | [agents/lab-instruction-evaluator.md](agents/lab-instruction-evaluator.md) | `/evaluate-lab-instructions` in Copilot Chat | Scores lab specs on spec quality and learner experience (3-pass evaluation) |
| Lab Environment Builder | [agents/lab-environment-builder.md](agents/lab-environment-builder.md) | `/build-lab-environment` in Copilot Chat | Generates a working skeleton app and check scripts from a tech spec |
| Agent Learner | [agents/learner.md](agents/learner.md) | `/run-learner-agent` in Copilot Chat | Completes a lab as an external AI agent learner and produces a learning report |

The `.github/prompts/` files are thin wrappers that invoke the agents above. Do not add logic there — put it in the agent definition under `agents/`.

## Labs

| Lab | Outline | Tech Spec | Spec Eval | Env Eval | Status |
|---|---|---|---|---|---|
| Builder Badge | [labs/outlines/builder-badge-outline.md](labs/outlines/builder-badge-outline.md) | [labs/specs/builder-badge-tech-spec.md](labs/specs/builder-badge-tech-spec.md) | [v1](labs/reports/builder-badge-tech-spec-eval-v1.md) (9.6/10) | [v1](labs/reports/builder-badge-env-eval-v1.md) | ✓ Production Ready |
| Insert and Find | [labs/outlines/insert-and-find-outline.md](labs/outlines/insert-and-find-outline.md) | [labs/specs/insert-and-find-tech-spec.md](labs/specs/insert-and-find-tech-spec.md) | [v1](labs/reports/insert-and-find-tech-spec-eval-v1.md) (8.8/10) | [v2](labs/reports/insert-and-find-env-eval-v2.md) | ⚠️ Reference Spec (Environment Archived) |

## Workflow

```
1. Write outline → /design-lab-outline → labs/outlines/{name}-outline.md
2. /convert-lab-outline (attach outline) → saves labs/specs/{name}-tech-spec.md
3. /evaluate-lab-instructions (attach tech spec) → saves labs/reports/{name}-tech-spec-eval-v{N}.md
4. Iterate spec on feedback until both scores ≥ 8/10 (spec quality + learner experience)
5. /build-lab-environment (attach tech spec) → saves lab-test-environment/{name}/
6. /run-learner-agent (provide lab name) → saves labs/reports/{name}-env-eval-v{N}.md
```

## Lab Execution

Each lab has a self-contained environment in `lab-test-environment/{name}/`. Currently only Builder Badge has an active environment:

```bash
cd lab-test-environment/builder-badge
cp .env.example .env
npm install
npm run seed                # load starting data
npm run check:env           # verify setup
npm run check:all           # run all validation checks in order
```

Check scripts run in stage order: `check:env` → `check:schema` → `check:dal` → `check:vector` → `check:final` → `check:reflection`

**Note:** Insert and Find has a complete spec and evaluation reports but the environment was archived. Use as a reference for new lab development.

### lab-execution/ (Legacy Template)

`lab-execution/` is a **template/reference** for building new lab environments. It contains generic Node.js harness, mock embedding server (deterministic 1536-dim vectors), and script templates. New labs should copy this structure into `lab-test-environment/{name}/` and customize. See [lab-execution/README.md](lab-execution/README.md) for harness documentation.

## Standards

All agents must follow the [Instructional Design Rulebook](standards/instructional-design-rulebook.md) when creating or evaluating any content. It is the authoritative reference for learning objectives, stage design, milestone checks, and evaluation criteria.

## Skills

Custom Claude skills are stored in the `skills/` directory. These teach Claude specialized knowledge for use with this repository:

| Skill | Purpose |
|---|---|
| [template](skills/template/SKILL.md) | Template and examples for creating new skills |
| [mongodb-learning-design](skills/mongodb-learning-design/SKILL.md) | Core principles for designing effective MongoDB training labs and learning experiences |

See [skills/README.md](skills/README.md) for details on using and creating skills.

## Directory Reference

### .claude/
Reserved for Copilot-specific configuration (e.g., custom instructions, Claude-specific settings). Currently unused; preserved for future extension.

## Conventions

- Outlines: `labs/outlines/{name}-outline.md`
- Tech specs: `labs/specs/{name}-tech-spec.md`
- Tech spec evaluations: `labs/reports/{name}-tech-spec-eval-v{N}.md` — increment N each revision cycle
- Environment evaluations: `labs/reports/{name}-env-eval-v{N}.md` — tracks learner execution results
- Agent definitions live in `agents/` — `.github/prompts/` references them by filename, do not rename
- Stage deliverables: `REFLECTION.md` (required in all labs). `SCHEMA.md` is optional for intro labs (labs with fewer than 3 stages or no schema design component); complex labs like Builder Badge include it to document the data model.
