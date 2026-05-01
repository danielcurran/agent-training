---
version: 1.2
last_updated: 2026-05-01
---

# Instructional Design Rulebook

Rules for outlines, specs, and evaluations. All agents follow these. See [agents/](../agents/) for the agent list. See [sources/research-sources.md](sources/research-sources.md) for the learning science behind these rules.

### Conventions

| Marker | Meaning |
|---|---|
| **[CORE]** | Core design principle — confirmed across five lab runs. Non-negotiable. |
| **Required** | Spec fails evaluation without this. |
| **Caution** | Common mistake or anti-pattern. |
| `> **Principle:**` | Core design principle restatement in context. |
| `> **Example:**` | Worked example demonstrating the rule. |
| `> **Caution:**` | Common mistake to avoid. |

### Table of Contents

| # | Rule | Summary |
|---|---|---|
| — | [Preamble](#preamble) | Design hypothesis, backwards design, labs vs. reference docs |
| 1 | [Audience](#1-audience) | Write for SQL-proficient agents with no MongoDB knowledge |
| 2 | [Learning Objectives](#2-learning-objectives) | Observable, checkable outcomes — not knowledge statements |
| 3 | [KLI-Typed Stage Design](#3-kli-typed-stage-design) | **[CORE]** Fluency, induction, sense-making — one type per stage |
| 4 | [Skill Gap Design](#4-skill-gap-design) | **[CORE]** Name the SQL instinct being overridden for every concept |
| 5 | [Scaffolding](#5-scaffolding) | Decrease support for learned material; never for new concepts |
| 6 | [Milestone Checks](#6-milestone-checks) | Pass/fail, named command, exact expected output |
| 7 | [Agent Skill Interactions](#7-agent-skill-interactions) | Every external dependency has a health check and fallback |
| 8 | [Zero-Knowledge Writing](#8-zero-knowledge-writing) | Define every MongoDB term inline; include glossary |
| 9 | [Content Standards](#9-content-standards) | Formatting, validation, sourcing standards |
| 10 | [Reflection and Decision Records](#10-reflection-and-decision-records) | **[CORE]** Agents articulate design decisions; transfer tasks evaluate these |
| 11 | [Buildability](#11-buildability) | Environment provisions without trial-and-error |
| 12 | [Evaluation and Scoring](#12-evaluation-and-scoring) | Three-pass scoring; ≥8/10 on both dimensions before building |
| — | [Glossary](#glossary) | Terms used in this rulebook |

---

## Preamble

### Design Hypothesis

These rules apply human learning science — cognitive load theory, KLI process types, spaced retrieval, metacognitive reflection — to LLM-based agent instruction.

The hypothesis: structured tasks that force agents to apply, compare, and explain improve transfer. Constraint focuses attention. Labs following these rules produce agents that decide, not just execute.

Three testable claims:

1. **[CORE] KLI typing** — One KLI process type per stage produces agents that decide, not just execute. (Rule 3)
2. **[CORE] SQL bridging** — Naming and contrasting SQL instincts reduces failure on novel MongoDB problems. (Rules 3, 4)
3. **[CORE] Decision records** — Articulating design decisions improves transfer to tasks not covered in the lab. (Rule 10)

All three confirmed across five lab runs. See [hypothesis-validation.md](hypothesis-validation.md) for per-lab evidence and the revision log. When new evidence contradicts a rule, update that file and revise the rule here.

### Backwards Design

Design every lab in reverse order:

1. State the endpoint — what should the agent do, without help, when done?
2. Define the milestone check — what artifact proves this?
3. Design the stages — what must each build so the agent is ready for the next?

Remove content not serving a milestone check. Remove stages not building toward an objective.

### Labs vs. Reference Docs

Labs teach *when* and *why*. Reference docs teach *how*. Don't conflate them.

Labs build conceptual understanding through deliberate practice and self-reflection. Agents memorizing operational context execute without deciding when to apply it — they can't transfer to new problems.

**Labs are not SKILLs.** This rulebook covers labs. Use SKILL.md for reference.

---

## Design Strategy

### 1. Audience

Write for external AI agents with **no prior MongoDB knowledge**. Assume SQL and general programming only. Never reference a concept before defining it.

### 2. Learning Objectives

State 3–6 objectives describing **what the agent does**, not what it "knows."

- Each objective maps to one stage, one milestone check, one artifact. Can't draw the line? Rewrite all three.
- Different cognitive processes (recall vs. comparison vs. evaluation) need different instruction. Don't conflate.

**Bad:** "Understand MongoDB vs. SQL."
**Good:** "Design a schema eliminating one multi-table join. Record the access pattern in SCHEMA_NOTES.md."

### 3. KLI-Typed Stage Design

> **Principle: [CORE] KLI typing** — One KLI process type per stage. Wrong type produces execution without judgment.

Labs have 3–5 sequential stages. **Each stage targets one KLI process type.** Every lab includes at least one of each type. If you need only two, justify it in the spec.

Fluency needs repetition with feedback. Induction needs comparative examples. Sense-making needs explicit bridging from the learner's prior mental model. Don't mix types within a stage.

#### Stage Structure

- 1–2 MongoDB concepts, 1–3 skill interactions, a single goal, one artifact, one KLI type
- Independent failure — a failure in Stage N doesn't corrupt Stage N+1
- Cumulative dependency — Stage N assumes only Stages 1–N-1

#### Fluency

Drill one pattern until the agent applies it reliably. Give the exact pattern, a worked example, then immediate practice. Never ask the agent to choose between alternatives — that's induction.

> **Example:** "Run `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ ok: 1 }`. Now create an index on `products` using the same pattern."

#### Induction

Present at least two contrasting examples. Name the difference. Ask the agent to apply the inferred rule to a novel case. Don't explain the rule — let the contrast reveal it.

> **Example:** "Schema [A]: 10:1 read-write (reporting). Schema [B]: 50:50 (your app). Which fits? Update SCHEMA_NOTES.md with choice and access pattern."

#### Sense-Making

Bridge from the agent's existing mental model to the new concept. Name the SQL instinct being overridden and show why it fails here. The agent must articulate what's different, not just execute differently.

> **Caution:** Teaching the SQL contrast in stage content is not sufficient. Reflection prompts and transfer tasks must also surface it directly — learners will not name the contrast unprompted.

> **Example:** "SQL: schema changes migrate every row. MongoDB: documents in a collection differ. Where does this save time in your app? (one sentence)"

Every sense-making or induction stage should produce a decision record. See [Rule 10](#10-reflection-and-decision-records).

### 4. Skill Gap Design

> **Principle: [CORE] SQL bridging** — Name the SQL instinct being overridden for every concept. Contrast is more durable than instruction alone.

Every lab closes a specific gap. Identify starting and target mental models before writing stages. The default learner normalizes instinctively, joins across tables, and separates concerns. MongoDB requires undoing those instincts — not explaining why they're wrong in general, but showing what they produce in *this* context and why MongoDB's approach is better.

- State the starting model in the spec
- For every MongoDB concept, name the SQL instinct it overrides
- **Teach the anti-pattern first.** Show the SQL approach, then the MongoDB alternative and why
- One concept at a time. Don't teach syntax and decision simultaneously.

> **Example:** "Tempting: separate `lineItems` collection, reference by `orderId` (SQL pattern). In MongoDB: unnecessary round-trips. Instead: embed items in order. [example] [why]"

---

## Writing Execution

Ambiguity causes silent failure in agents. Every instruction must be unambiguous and immediately actionable. **Test: if an agent reads this and acts immediately, does it know exactly what to do? If not, rewrite.**

**Bad:** "Set up the database appropriately."
**Good:** "Run `npm run seed`. This populates `orders` collection with 50 sample documents. When complete, `npm run check:env` shows 'PASS.'"

**Bad:** "Consider indexes."
**Good:** "Create `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ 'ok': 1 }`"

### 5. Scaffolding

Decrease support as knowledge becomes established. Never decrease support for new concepts.

- **Stage 1:** Full — exact command, expected output, what to observe
- **Stages 2–3:** Prior knowledge — agent determines approach. New concepts still fully scaffolded.
- **Stages 4+:** Prior knowledge — state objective and check only. New concepts fully scaffolded.

The agent has limited working memory. Withdraw support for established material so the agent applies it independently. New material will fail without full scaffolding, regardless of stage.

### 6. Milestone Checks

Every stage ends with at least one check: **pass/fail, no partial credit, no interpretation.** If a check can't definitively verify the artifact, redesign it.

- Named command (`npm run check:*`) and exact expected terminal output
- Validates artifact, not just command execution
- Define N failed attempts before fallback path

### 7. Agent Skill Interactions

Define every skill interaction fully in specs. External dependencies must never cause silent failure.

- At least one example prompt per interaction
- Show correct response/artifact
- If two skills conflict — specify precedence and why
- Every external dependency (skills, MongoDB, mock APIs) has health check and fallback

### 8. Zero-Knowledge Writing

Write assuming the reader never saw a MongoDB document. The learner's prior experience is SQL; MongoDB terms need anchoring.

- Define every MongoDB term inline on first use
- Never use jargon without defining it
- Include a glossary (Term | MongoDB | SQL) in every tech spec
- Include a "What You Learned" summary at the final stage

> **Example:** "A collection — MongoDB's equivalent of a SQL table"

### 9. Content Standards

Agents parse content directly — they don't infer structure from prose.

#### Structure

- Consistent hierarchy: headers, bullets, code blocks, labeled examples
- Concept formula: **term** → **SQL equivalent** → **why it matters** → **example code**
- Inline code for all MongoDB terms, commands, fields (every use)
- Every example: collections involved, output, what to observe
- Schemas/output as JSON/BSON, not prose
- Glossary (Term | MongoDB | SQL) in every spec
- Rationale for every access pattern, trade-off, decision

#### Validation

- Test every MongoDB concept, command, example against [MongoDB docs](https://www.mongodb.com/docs/) in a real instance
- Cite source: MongoDB URL, [sources/research-sources.md](sources/research-sources.md), or "tested in Builder Badge"
- Checks validate against best practices, not just completion
- If contradicting MongoDB docs — cite reason and link. Don't work around authority.

---

## Deliverable Requirements

### 10. Reflection and Decision Records

> **Principle: [CORE] Decision records** — Agents articulate design decisions. Transfer tasks evaluate these artifacts.

At least one stage per lab has the agent record a design decision (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`).

- Prompts ask: what you chose, why, what you're giving up
- Check validates file exists and has minimum content — doesn't score reasoning

### 11. Buildability

Every lab provisions without trial-and-error. Ambiguous setup produces failed runs before learning can start.

- **Required:** Environment Requirements in spec — tools, services, ports, file layout at start
- **Required:** Seed Data in spec — collections, document shapes, seed script, starting state
- **Required:** State platform explicitly — Instruqt, local VS Code, or Codespaces

---

## Process

### 12. Evaluation and Scoring

Score specs against rules, not subjective quality. Three passes, each building on the last:

#### Pass 1 — Section-by-section

Each stage scored independently on clarity, completeness, coherence, testability, self-containment. Does the stage communicate what to do? Can it be verified?

#### Pass 2 — Cross-section synthesis

Patterns, consistency across stages, rulebook compliance. Does the lab cohere? Do stages build cumulatively?

#### Pass 3 — Learner perspective

Simulate the agent's experience end-to-end. Can they start? Succeed? Learn?

#### Scoring

- Each criterion: ✓ (met), △ (partial), ✗ (not met) — with specific, cited reasons
- Iteration guidance is actionable. "Be clearer" is not.
- **Spec Quality** (Passes 1+2) + **Learner Experience** (Pass 3) = two /10 scores
- **Must score ≥8 on both** before proceeding to environment builder
- Flag lowest-scoring criteria first for revision

---

## Glossary

| Term | Definition | Rule |
|---|---|---|
| **KLI** | Knowledge-Learning-Instruction framework. Categorizes learning tasks by cognitive process type. | 3 |
| **Fluency** | KLI type: drill one pattern until reliable. Repetition with feedback. | 3 |
| **Induction** | KLI type: infer a rule from contrasting examples. At least two cases. | 3 |
| **Sense-making** | KLI type: bridge from existing mental model to new concept. Name what changes. | 3 |
| **Scaffold** | Structured support (commands, expected output, hints) during learning. Withdrawn as competence grows. | 5 |
| **Skill interaction** | Any point where the agent invokes an external tool, API, or dependency during the lab. | 7 |
| **Decision record** | Artifact where the agent states what it chose, why, and what it traded off. | 10 |
| **SQL bridging** | Teaching technique: name the SQL instinct, show what it produces here, contrast with MongoDB. | 4 |
| **Milestone check** | Pass/fail verification at end of stage. Named command, exact expected output. | 6 |
| **Transfer** | Ability to apply learned concepts to problems not covered in the lab. | Preamble |
| **Zero-knowledge writing** | Writing that assumes no prior MongoDB experience. Every term defined inline on first use. | 8 |
