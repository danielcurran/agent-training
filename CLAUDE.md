# agent-training

## Purpose

Repository for designing, evaluating, and iterating AI agent training materials for MongoDB education. Agents work through progressively harder labs that teach MongoDB concepts by doing — starting from a SQL-style data model and migrating to idiomatic MongoDB.

## Agents

| Agent | File | Invoked via | Role |
|---|---|---|---|
| Lab Instruction Evaluator | [agents/ai-agent-training-lab-instruction-evaluator.md](agents/ai-agent-training-lab-instruction-evaluator.md) | `/evaluate-lab-instructions` in Copilot Chat | Scores lab specs on clarity, completeness, and pedagogy |
| Lab Outline Converter | [agents/lab-outline-converter.md](agents/lab-outline-converter.md) | `/convert-lab-outline` in Copilot Chat | Converts high-level outlines into detailed technical specs |
| Lab Outline Designer | [agents/lab-outline-designer.md](agents/lab-outline-designer.md) | Attach in Copilot Chat | Creates lab outlines to feed into the Lab Outline Converter |

The `.github/prompts/` files are thin wrappers that invoke the agents above. Do not add logic there — put it in the agent definition under `agents/`.

## Labs

| Lab | Outline | Tech Spec | Latest Evaluation | Score |
|---|---|---|---|---|
| Builder Badge | [labs/outlines/builder-badge-outline.md](labs/outlines/builder-badge-outline.md) | [labs/specs/builder-badge-tech-spec.md](labs/specs/builder-badge-tech-spec.md) | [labs/reports/builder-badge-tech-spec-eval-v1.md](labs/reports/builder-badge-tech-spec-eval-v1.md) | 9.6/10 — minor revisions recommended |

## Workflow

```
1. Write outline → labs/outlines/{name}-outline.md
2. /convert-lab-outline (attach outline) → saves labs/specs/{name}-tech-spec.md
3. /evaluate-lab-instructions (attach tech spec) → saves labs/reports/{name}-tech-spec-eval-v{N}.md
4. Iterate spec on evaluation feedback until score ≥ 8/10
5. Validate student implementations with lab-execution/ check scripts
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

## Conventions

- Outlines: `labs/outlines/{name}-outline.md`
- Tech specs: `labs/specs/{name}-tech-spec.md`
- Evaluations: `labs/reports/{name}-tech-spec-eval-v{N}.md` — increment N each revision cycle
- Agent definitions live in `agents/` — `.github/prompts/` references them by filename, do not rename
