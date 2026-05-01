# Instructional Design Rulebook

All agents must follow these rules for outlines, specs, and evaluations. See [agents/](../agents/) for the full agent list. See [sources/research-sources.md](sources/research-sources.md) for the learning science behind these rules.

**★ = core design principle** — part of the three-rule cluster (KLI typing, SQL bridging, decision records) confirmed across five lab runs.

---

**Design Strategy** — *who you're writing for, what outcomes to target, how to structure stages and skill gaps*

| Section | Rule |
|---|---|
| [0. Foundational Principles](#0-foundational-principles) | Design hypothesis, backwards design, agent-specific writing principles |
| [1. Audience](#1-audience) | Write for SQL-proficient agents with no MongoDB knowledge |
| [2. Learning Objectives](#2-learning-objectives) | Observable, checkable outcomes — not knowledge statements |
| [3. KLI-Typed Stage Design](#3-kli-typed-stage-design) | ★ Fluency, induction, sense-making — one type per stage |
| [4. Skill Gap Design](#4-skill-gap-design) | ★ Name the SQL instinct being overridden for every concept |

**Writing Execution** — *how to write stages: scaffolding, checks, interactions, terminology, content standards*

| Section | Rule |
|---|---|
| [5. Scaffolding](#5-scaffolding) | Decrease support for learned material; never for new concepts |
| [6. Milestone Checks](#6-milestone-checks) | Pass/fail, named command, exact expected output |
| [7. Agent Skill Interactions](#7-agent-skill-interactions) | Every external dependency has a health check and fallback |
| [8. Zero-Knowledge Writing](#8-zero-knowledge-writing) | Define every MongoDB term inline; include glossary |
| [9. Content Standards](#9-content-standards) | Formatting, validation, sourcing standards |

**Deliverable Requirements** — *specific artifacts stages must produce*

| Section | Rule |
|---|---|
| [10. Reflection and Decision Records](#10-reflection-and-decision-records) | ★ Agents articulate design decisions; transfer tasks evaluate these |
| [11. Buildability](#11-buildability) | Environment provisions without trial-and-error |

**Process** — *how labs are evaluated and how findings feed back into the rulebook*

| Section | Rule |
|---|---|
| [12. Evaluation and Scoring](#12-evaluation-and-scoring) | Three-pass scoring; ≥8/10 on both dimensions before building |
| [13. Research Findings](#13-research-findings) | Confirmed findings; links to full hypothesis-validation.md |

---

## 0. Foundational Principles

### Design Hypothesis

*Apply human learning science to LLM-based agent instruction — and validate it empirically.*

The rules in this document apply human learning science — cognitive load theory, KLI process types, spaced retrieval, metacognitive reflection — to LLM-based agent instruction.

The hypothesis: Structured tasks requiring agents to apply prior knowledge, compare alternatives, and explain reasoning improve transfer. This mirrors cognitive load theory in humans — spaced retrieval, deliberate practice, metacognitive reflection build durable mental models. The mechanism is the same: structured context constrains attention. Agents can't parse everything, so constraint forces them to apply, contrast, and articulate. This is how in-context learning works. Labs following these rules produce agents that decide, not just execute.

Three design principles follow from this hypothesis — they are the testable claims these rules are built on:

1. **KLI typing** — Structuring each stage around a single KLI process type (fluency, induction, sense-making) produces agents that decide rather than just execute. (Rule 3)
2. **SQL bridging** — Explicitly naming and contrasting SQL instincts reduces failure on novel MongoDB problems more than structural clarity alone. (Rules 3, 4)
3. **Decision records** — Requiring agents to articulate design decisions improves transfer to tasks not covered in the lab. (Rule 10)

All three have been confirmed across five lab runs. See [hypothesis-validation.md](hypothesis-validation.md) for full findings, per-lab evidence, and the revision log. When evidence from a new lab contradicts a rule, update hypothesis-validation.md and revise the affected rule.

### Backwards Design

*Start from the outcome; work backwards to the stages.*

Design every lab in reverse order. This prevents curriculum creep — adding content because it's interesting rather than because it serves a learning objective.

1. State the endpoint — what should the agent do, without help, when done?
2. Define the milestone check — what artifact proves this?
3. Design the stages — what must each build so the agent is ready for the next?

Remove content not serving a milestone check. Remove stages not building toward an objective.

### Learning is Not Knowledge Transfer

*Labs teach when and why. Reference docs teach how. Don't conflate them.*

Labs build conceptual understanding through concept progression, deliberate practice, and self-reflection. Reference guides tell agents how to call tools. Labs teach *when* and *why*. Agents memorizing operational context execute without deciding when to apply it — they can't transfer to new problems.

**Labs are not SKILLs.** This rulebook covers labs. Use SKILL.md for reference.

### Humans Interpret, Agents Plan

*Ambiguity causes silent failure in agents. Every instruction must be unambiguous and immediately actionable.*

Humans read ambiguous text and ask clarifying questions. Agents read ambiguous text and do the wrong thing without pausing. Ambiguity causes silent failure, not questions. **Test every instruction: if an agent reads this and acts immediately, does it know exactly what to do? If not, rewrite.**

**Bad:** "Set up the database appropriately."
**Good:** "Run `npm run seed`. This populates `orders` collection with 50 sample documents. When complete, `npm run check:env` shows 'PASS.'"

**Bad:** "Consider indexes."
**Good:** "Create `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ 'ok': 1 }`"

---

**Design Strategy** — *Rules 1–4: who you're writing for, what outcomes to target, how to structure stages and skill gaps.*

## 1. Audience

Write for external AI agents with **no prior MongoDB knowledge**. Assume SQL and general programming only. Never reference a concept before defining it.

---

## 2. Learning Objectives

State 3–6 objectives describing **what the agent does**, not what it "knows." Objectives describe observable, checkable outcomes. This distinguishes labs from reference guides.

- Each objective maps to one stage, one milestone check, one artifact. Can't draw the line? Rewrite all three.
- Different cognitive processes (recall vs. comparison vs. evaluation) need different instruction. Don't conflate.

**Bad:** "Understand MongoDB vs. SQL."
**Good:** "Design a schema eliminating one multi-table join. Record the access pattern in SCHEMA_NOTES.md."

---

## 3. KLI-Typed Stage Design

> ★ **Core design principle: KLI typing** — Structuring each stage around a single KLI process type (fluency, induction, sense-making) produces agents that decide rather than just execute.

Labs have 3–5 sequential stages. **Each stage targets one KLI process type.** Every lab includes at least one stage of each type. If you genuinely need only two, justify it in the spec.

Wrong instruction for the type produces execution without judgment. Fluency needs repetition with feedback. Induction needs comparative examples. Sense-making needs explicit bridging from the learner's prior mental model. Don't mix types within a stage.

### Stage Structure

- 1–2 MongoDB concepts, 1–3 skill interactions, a single goal, one artifact, one KLI type
- Independent failure — a failure in Stage N doesn't corrupt Stage N+1
- Cumulative dependency — Stage N assumes only Stages 1–N-1

### Fluency & Memory

Drill one pattern until the agent applies it reliably. Give the exact pattern, a worked example, then immediate practice. Never ask the agent to choose between alternatives — that's induction. Repeat with immediate feedback until the pattern is automatic.

> **Example:** "Run `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ ok: 1 }`. Now create an index on `products` using the same pattern."

### Induction & Refinement

Present at least two contrasting examples. Name the difference. Ask the agent to apply the inferred rule to a novel case. Don't explain the rule — let the contrast reveal it.

> **Example:** "Schema [A]: 10:1 read-write (reporting). Schema [B]: 50:50 (your app). Which fits? Update SCHEMA_NOTES.md with choice and access pattern."

### Sense-Making

Bridge from the agent's existing mental model to the new concept. Name the SQL instinct being overridden and show why it fails in this context. The agent must articulate what's different, not just execute differently. Use SQL-bridging concepts where relevant.

> **Note:** Teaching the SQL contrast in stage content is not sufficient. Reflection prompts and transfer tasks must also surface it directly — learners will not name the contrast unprompted.

> **Example:** "SQL: schema changes migrate every row. MongoDB: documents in a collection differ. Where does this save time in your app? (one sentence)"

Every sense-making or induction stage should produce a decision record — the artifact where the agent captures what it chose and why. See [Rule 10](#10-reflection-and-decision-records).

---

## 4. Skill Gap Design

> ★ **Core design principle: SQL bridging** — Naming the SQL instinct being overridden for every concept reduces failure on novel MongoDB problems.

Every lab closes a specific gap. Identify starting and target mental models before writing stages. The default learner is SQL-proficient and will instinctively normalize, join, and separate concerns into tables. MongoDB requires undoing those instincts — not explaining why they're wrong in general, but showing what they produce in *this* context and why MongoDB's approach is better.

- State the starting model in the spec. Default: the SQL engineer who normalizes instinctively, joins across tables, and separates concerns.
- For every MongoDB concept, name the SQL instinct it overrides.
- **Teach the anti-pattern first.** Show what the SQL approach produces in this context, then the MongoDB alternative and why. Contrast is more durable than instruction alone.
- One concept at a time. Don't teach syntax and decision simultaneously.

> **Example:** "Tempting: separate `lineItems` collection, reference by `orderId` (SQL pattern). In MongoDB: unnecessary round-trips. Instead: embed items in order. [example] [why]"

---

**Writing Execution** — *Rules 5–9: how to write stages: scaffolding, checks, interactions, terminology, content standards.*

## 5. Scaffolding

Decrease support as knowledge becomes established; never decrease support for new concepts.

- **Stage 1:** Full — exact command, expected output, what to observe
- **Stages 2–3:** For prior knowledge, agent determines approach. New concepts still fully scaffolded
- **Stages 4+:** For prior knowledge, state objective and check only. New concepts fully scaffolded

This is rooted in cognitive load theory: the agent has limited working memory. Withdraw support for material already established in prior stages so the agent applies it independently. New material is high-load and will fail without full scaffolding, regardless of stage.

---

## 6. Milestone Checks

Every stage ends with at least one check: **pass/fail, no partial credit, no interpretation.** Ambiguous pass conditions produce ambiguous learning. If a check can't definitively verify the artifact, redesign it.

- Named command (`npm run check:*`) and exact expected terminal output
- Validates artifact, not just command execution
- Define N failed attempts before fallback path

---

## 7. Agent Skill Interactions

Define every skill interaction fully in specs. External dependencies (agent skills, MongoDB connections, APIs) must never cause silent failure. If a skill is unavailable or gives bad advice, the lab should detect it and provide a fallback.

- At least one example prompt per interaction
- Show correct response/artifact
- If two skills conflict — specify precedence and why
- Every external dependency (skills, MongoDB, mock APIs) has health check and fallback

---

## 8. Zero-Knowledge Writing

Write assuming the reader never saw a MongoDB document. Jargon without definition is noise. This is not about being condescending — it's about eliminating ambiguity. The learner's prior experience is SQL; MongoDB terms need anchoring.

- Define every MongoDB term inline on first use
- Never use jargon without defining it
- Include a glossary (Term | MongoDB | SQL) in every tech spec
- Include a "What You Learned" summary at the final stage

> **Example:** "A collection — MongoDB's equivalent of a SQL table"

---

## 9. Content Standards

Format specs consistently. Agents parse content directly — they don't infer structure from prose. A badly structured spec produces worse learning than a poorly written one.

### Structure

- Consistent hierarchy: headers, bullets, code blocks, labeled examples
- Concept formula: **term** → **SQL equivalent** → **why it matters** → **example code**
- Inline code for all MongoDB terms, commands, fields (every use)
- Every example: collections involved, output, what to observe
- Schemas/output as JSON/BSON, not prose
- Glossary (Term | MongoDB | SQL) in every spec
- Rationale for every access pattern, trade-off, decision
- Semantic prefixes: **Required**, **Optional**, **Caution**

### Validation

- Test every MongoDB concept, command, example against [MongoDB docs](https://www.mongodb.com/docs/) in real instance
- Cite source: MongoDB URL, [sources/research-sources.md](sources/research-sources.md), or "tested in Builder Badge"
- Checks validate against best practices, not just completion
- If contradicting MongoDB docs — cite reason and link. Don't work around authority.

---

**Deliverable Requirements** — *Rules 10–11: specific artifacts stages must produce.*

## 10. Reflection and Decision Records

> ★ **Core design principle: Decision records** — Requiring agents to articulate design decisions improves transfer to tasks not covered in the lab.

At least one stage per lab has the agent record a design decision (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`). Articulating reasoning is how agents confirm they understand, not just execute. It's also the artifact that transfer tasks evaluate.

- Prompts ask: what you chose, why, what you're giving up
- Check validates file exists and has minimum content — doesn't score reasoning

---

## 11. Buildability

Every lab provisions without trial-and-error. Ambiguous setup produces failed runs and wasted time before learning can start. Buildability is not optional overhead — it's a prerequisite to learning.

- Include **Environment Requirements** in spec: tools, services, ports, file layout at start
- Include **Seed Data** in spec: collections, document shapes, seed script, starting state
- State platform explicitly: Instruqt, local VS Code, or Codespaces

---

**Process** — *Rules 12–13: how labs are evaluated and how findings feed back into the rulebook.*

## 12. Evaluation and Scoring

Score specs against rules, not subjective quality. Lab Instruction Evaluator uses three passes that build on each other:

### Pass 1 — Section-by-section

Each stage scored independently on clarity, completeness, coherence, testability, self-containment. Does the stage communicate what to do? Can it be verified? This reveals whether individual stages work.

### Pass 2 — Cross-section synthesis

Patterns, consistency across stages, rulebook compliance. Does the lab cohere? Do stages build cumulatively? This reveals whether stages fit together.

### Pass 3 — Learner perspective

Simulate the agent's experience end-to-end. Can they start? Succeed? Learn? This reveals whether the whole lab works for a learner.

### Scoring

- Each criterion scored ✓ (met), △ (partial), ✗ (not met) with specific, cited reasons. Reference exact wording.
- Iteration guidance is actionable. "Be clearer" is not.
- **Spec Quality** (Passes 1+2) + **Learner Experience** (Pass 3) = two /10 scores
- **Must score ≥8 on both** before proceeding to environment builder
- Flag lowest-scoring criteria first for revision

---

## 13. Research Findings

All three design principles confirmed across five lab runs:

- **KLI typing** — 5/5 labs: structured KLI stages produce agents that decide, not just execute
- **SQL bridging** — Confirmed: reflection prompts and transfer tasks must explicitly surface the SQL contrast; stage content alone is not sufficient
- **Decision records** — 5/5 labs: articulating design decisions directly improves transfer task performance

Full per-lab findings, the hypothesis validation summary, and the revision log live in [hypothesis-validation.md](hypothesis-validation.md). When evidence from a new lab contradicts a rule, update that file and revise the affected rule here.


