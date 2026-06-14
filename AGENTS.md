# Agent Training — AI Agent MongoDB Lab Framework

## Purpose
Research and development framework for designing, building, and evaluating AI agent training labs focused on MongoDB education. Trains external AI agents (LLMs) to transition from a SQL mental model to idiomatic MongoDB document patterns.

## Tech Stack
- **Runtime:** Node.js
- **Database:** MongoDB 6.0/8.0 (Docker)
- **Driver:** mongodb Node.js driver ^6.x
- **API:** Express ^4.x/^5.x
- **Config:** dotenv
- **CI/CD:** GitHub Actions (Ubuntu, MongoDB, Node 18)
- **AI Agents:** Anthropic Claude (VS Code Copilot Chat)
- **Prompt System:** `.github/prompts/*.prompt.md` + `agents/*.md`
- **Skills System:** Custom Claude skills in `skills/`
- **Vector Search:** Mock embedding server (deterministic 1536-dim)

## Key Directories
- `agents/` — 12 agent definitions (lab-outline-designer, converter, evaluators, learner, etc.)
- `labs/` — Lab content: outlines, specs, evaluation reports
- `lab-test-env/` — Self-contained lab environments (builder-badge, esr-indexing-strategy, aggregation-foundations, memory-for-ai)
- `lab-execution/` — Legacy template for building lab environments
- `standards/` — Instructional design rulebook, hypothesis validation
- `scripts/` — Cross-session knowledge injection, experiment scripts
- `skills/` — Custom Claude skills for MongoDB learning design
- `ABC-testing/` — Three-condition knowledge transfer experiment

## Agent Pipeline
1. Lab Outline Designer → 2. Lab Outline Converter → 3. Lab Instruction Evaluator (Spec Quality + Learner Experience) → 4. Lab Environment Builder → 5. Agent Learner → 6. Transfer Task Scorer → 7. RAG Chunker → 8. RAG Chunk Evaluator

## Key Conventions
- All agents follow PREAMBLE.md template
- Lab environments start from SQL-normalized starting state
- Each lab produces REFLECTION.md + KNOWLEDGE.json
- Gate: spec quality and learner experience scores must both be >= 8/10
- Check scripts run in stage order: env → schema → dal → vector → final → reflection
- Agent definitions in `agents/`, prompts in `.github/prompts/` are thin wrappers
- See CLAUDE.md for full workflow and agent reference
