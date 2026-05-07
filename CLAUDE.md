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
| Knowledge-Only Respondent | [agents/knowledge-only-respondent.md](agents/knowledge-only-respondent.md) | `/run-condition-b` in Copilot Chat | Answers a transfer task using only an injected KNOWLEDGE.json (Condition B of knowledge-transfer experiment) |
| Spec-Only Respondent | [agents/spec-only-respondent.md](agents/spec-only-respondent.md) | `/run-condition-c` in Copilot Chat | Answers a transfer task after reading only the tech spec (Condition C of knowledge-transfer experiment) |
| Transfer Task Scorer | [agents/transfer-task-scorer.md](agents/transfer-task-scorer.md) | `/score-transfer-task` in Copilot Chat | Scores the learner's transfer task response against the three KLI hypotheses; produces a hypothesis-validation finding |
| RAG Chunker | [agents/rag-chunker.md](agents/rag-chunker.md) | `/chunk-lab-content` in Copilot Chat | Converts validated lab content into semantically self-contained chunks for LLM retrieval and RAG pipelines |
| RAG Chunk Evaluator | [agents/rag-chunk-evaluator.md](agents/rag-chunk-evaluator.md) | `/evaluate-lab-chunks` in Copilot Chat | Scores every chunk for standalone coherence, heading retrievability, structural completeness, relationship explicitness, and metadata accuracy |

The `.github/prompts/` files are thin wrappers that invoke the agents above. Do not add logic there — put it in the agent definition under `agents/`.

## Labs

Reports are organized by lab topic in `labs/reports/{lab-name}/`:

| Lab | Outline | Tech Spec | Spec Eval | Env Eval | Status |
|---|---|---|---|---|---|
| Builder Badge | [labs/outlines/builder-badge-outline.md](labs/outlines/builder-badge-outline.md) | [labs/specs/builder-badge-tech-spec.md](labs/specs/builder-badge-tech-spec.md) | [v1](labs/reports/builder-badge/builder-badge-tech-spec-eval-v1.md) (9.6/10) | [v1](labs/reports/builder-badge/builder-badge-env-eval-v1.md) | ✓ Production Ready |
| Insert and Find | [labs/outlines/insert-and-find-outline.md](labs/outlines/insert-and-find-outline.md) | [labs/specs/insert-and-find-tech-spec.md](labs/specs/insert-and-find-tech-spec.md) | [v1](labs/reports/insert-and-find/insert-and-find-tech-spec-eval-v1.md) (8.8/10) | [v2](labs/reports/insert-and-find/insert-and-find-env-eval-v2.md) | ⚠️ Reference Spec (Environment Archived) |
| ESR Indexing Strategy | [labs/outlines/esr-indexing-strategy-outline.md](labs/outlines/esr-indexing-strategy-outline.md) | [labs/specs/esr-indexing-strategy-tech-spec-v3.md](labs/specs/esr-indexing-strategy-tech-spec-v3.md) | [v1](labs/reports/esr-indexing-strategy/esr-indexing-strategy-tech-spec-eval-v1.md) (8.6/10) | [v4](labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-v4.md) | ✓ Production Ready |
| Aggregation Foundations | [labs/outlines/aggregation-foundations-outline.md](labs/outlines/aggregation-foundations-outline.md) | [labs/specs/aggregation-foundations-tech-spec.md](labs/specs/aggregation-foundations-tech-spec.md) | [v2](labs/reports/aggregation-foundations/aggregation-foundations-tech-spec-eval-v2.md) (9.1/10) | [v1](labs/reports/aggregation-foundations/aggregation-foundations-env-eval-v1.md) | ✓ Production Ready |
| Memory for AI | [labs/outlines/memory-for-ai-outline.md](labs/outlines/memory-for-ai-outline.md) | [labs/specs/memory-for-ai-tech-spec.md](labs/specs/memory-for-ai-tech-spec.md) | [v1](labs/reports/memory-for-ai/memory-for-ai-tech-spec-eval-v1.md) | [v1](labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md) | ✓ Production Ready |

## Workflow

```
1. Write outline → /design-lab-outline → labs/outlines/{name}-outline.md
2. /convert-lab-outline (attach outline) → saves labs/specs/{name}-tech-spec.md
3. /evaluate-lab-instructions (attach tech spec) → saves labs/reports/{name}/{name}-tech-spec-eval-v{N}.md
4. Iterate spec on feedback until both scores ≥ 8/10 (spec quality + learner experience)
5. /build-lab-environment (attach tech spec) → saves lab-test-env/{name}/
6. /run-learner-agent (provide lab name) → saves labs/reports/{name}/{name}-env-eval-v{N}.md
7. /score-transfer-task (attach spec + env-eval) → saves labs/reports/{name}/{name}-transfer-v{N}.md + hypothesis-validation finding
8. /chunk-lab-content (attach spec + env-eval) → saves labs/chunks/{name}/ (concepts/ + tasks/ + manifest.json)
9. /evaluate-lab-chunks (attach chunk dir + spec) → saves labs/reports/{name}/{name}-chunk-eval-v{N}.md
```

## Lab Execution

Each lab has a self-contained environment in `lab-test-env/{name}/`. Example using Builder Badge:

```bash
cd lab-test-env/builder-badge
cp .env.example .env
npm install
npm run seed                # load starting data
npm run check:env           # verify setup
npm run check:all           # run all validation checks in order
```

Check scripts run in stage order: `check:env` → `check:schema` → `check:dal` → `check:vector` → `check:final` → `check:reflection`

**Note:** Insert and Find has a complete spec and evaluation reports but the environment was archived. Use as a reference for new lab development.

### lab-execution/ (Legacy Template)

`lab-execution/` is a **template/reference** for building new lab environments. It contains generic Node.js harness, mock embedding server (deterministic 1536-dim vectors), and script templates. New labs should copy this structure into `lab-test-env/{name}/` and customize. See [lab-execution/README.md](lab-execution/README.md) for harness documentation.

## Standards

All agents must follow the [Instructional Design Rulebook](standards/instructional-design-rulebook.md) when creating or evaluating any content. It is the authoritative reference for learning objectives, stage design, milestone checks, and evaluation criteria. See [hypothesis-validation.md](standards/hypothesis-validation.md) for lab-by-lab testing results. See [sources/research-sources.md](standards/sources/research-sources.md) for the learning science research behind these rules.

## Skills

Custom Claude skills are stored in the `skills/` directory. These teach Claude specialized knowledge for use with this repository:

| Skill | Purpose |
|---|---|
| [template](skills/template/SKILL.md) | Template and examples for creating new skills |
| [mongodb-learning-design](skills/mongodb-learning-design/SKILL.md) | Core principles for designing effective MongoDB training labs and learning experiences |

See [skills/README.md](skills/README.md) for details on using and creating skills.

## Research & Experiments

- [standards/hypothesis-validation.md](standards/hypothesis-validation.md) — Ongoing KLI hypothesis tracking across all labs
- [ABC-testing/](ABC-testing/) — Three-condition knowledge transfer experiment (lab completion vs. knowledge-only vs. spec-only)
- [labs/reports/knowledge-transfer-test/](labs/reports/knowledge-transfer-test/) — Legacy single-lab knowledge injection vs. lab completion study

## Knowledge Transfer Experiment

Tests three conditions against a transfer task to determine whether hands-on lab completion is necessary:

| Condition | Method | Prompt |
|---|---|---|
| A — Lab Completion | Complete full lab | `/run-learner-agent` |
| B — Knowledge Only | Receive KNOWLEDGE.json; no lab work | `/run-condition-b` |
| C — Spec Only | Read tech spec; no lab work, no KNOWLEDGE.json | `/run-condition-c` |

**Labs with transfer tasks (fully testable):** ESR Indexing Strategy, Aggregation Foundations, Memory for AI  
**Labs without transfer tasks (KNOWLEDGE.json quality audit only):** Builder Badge, Insert and Find

```bash
# Prepare context for a condition
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition b
node scripts/prepare-condition.js --lab esr-indexing-strategy --condition c

# Check progress across all labs
node scripts/compare-conditions.js --all
```

**Important:** Each condition must run in a fresh Copilot Chat session. Delete all `KNOWLEDGE.json` files before Condition B/C runs:
```bash
find lab-test-env -name KNOWLEDGE.json
```

## Directory Reference

### .claude/
Contains Copilot permission rules (`settings.local.json`) for git operations and web access.

## Conventions

- Outlines: `labs/outlines/{name}-outline.md`
- Tech specs: `labs/specs/{name}-tech-spec.md`
- Tech spec evaluations: `labs/reports/{name}/{name}-tech-spec-eval-v{N}.md` — increment N each revision cycle
- Environment evaluations: `labs/reports/{name}/{name}-env-eval-v{N}.md` — tracks learner execution results
- Lab environments: `lab-test-env/{name}/` — self-contained Node.js + Docker environment per lab
- Chunk output: `labs/chunks/{name}/` — concept and task chunks for RAG pipelines (concepts/ + tasks/ + manifest.json)
- Agent definitions live in `agents/` — `.github/prompts/` references them by filename, do not rename
- Stage deliverables: `REFLECTION.md` (required in all labs), `KNOWLEDGE.json` (required in all labs — machine-readable knowledge record for cross-session retention). `SCHEMA.md` is optional for intro labs (labs with fewer than 3 stages or no schema design component); complex labs like Builder Badge include it to document the data model.
- ABC testing outputs: `ABC-testing/{name}/condition-{b|c}-v{N}-{context|response|score}.md`
