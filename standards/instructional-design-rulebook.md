# Instructional Design Rulebook

All agents in this repo (Lab Outline Designer, Lab Outline Converter, Lab Instruction Evaluator, Lab Environment Builder, Agent Learner) must follow these rules for outlines, specs, evaluations.

See [sources/research-sources.md](sources/research-sources.md) for research.

---

## 0. Foundational Principles

### Design Hypothesis

The rules in this document apply human learning science — cognitive load theory, KLI process types, spaced retrieval, metacognitive reflection — to LLM-based agent instruction. This is a **working hypothesis, not established practice**.

The hypothesis: Structured tasks requiring agents to apply prior knowledge, compare alternatives, and explain reasoning improve transfer. This mirrors cognitive load theory in humans — spaced retrieval, deliberate practice, metacognitive reflection build durable mental models. The mechanism is the same: structured context constrains attention. Agents can't parse everything, so constraint forces them to apply, contrast, and articulate. This is how in-context learning works. If true, then labs following these rules should produce agents that decide, not just execute.

All three foundational hypotheses (KLI typing, SQL bridging, decision records) have been confirmed across five lab runs. See [hypothesis-validation.md](hypothesis-validation.md) for full findings, per-lab evidence, and the revision log. When evidence from a new lab contradicts a rule, update hypothesis-validation.md and revise the affected rule.

---

### Backwards Design

Design every lab in reverse order. This prevents "curriculum creep" where content gets added because it's interesting, not because it serves the learning goal.

1. State the endpoint — what should the agent do, without help, when done?
2. Define the milestone check — what artifact proves this?
3. Design the stages — what must each build so the agent is ready for the next?

Remove content not serving a milestone check. Remove stages not building toward an objective.

### Learning is Not Knowledge Transfer

Labs build conceptual understanding through concept progression, deliberate practice, and self-reflection. Reference guides tell agents how to call tools. Labs teach *when* and *why*. Agents memorizing operational context execute without deciding when to apply it — they can't transfer to new problems.

**Labs are not SKILLs.** This rulebook covers labs. Use SKILL.md for reference.

### Humans Interpret, Agents Plan

Humans read ambiguous text and ask clarifying questions. Agents read ambiguous text and do the wrong thing without pausing. Ambiguity causes silent failure, not questions. **Test every instruction: if an agent reads this and acts immediately, does it know exactly what to do? If not, rewrite.**

Bad: "Set up the database appropriately."
Good: "Run `npm run seed`. This populates `orders` collection with 50 sample documents. When complete, `npm run check:env` shows 'PASS.'"

Bad: "Consider indexes."
Good: "Create `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ 'ok': 1 }`"

---

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

Labs have 3–5 sequential stages. **Each stage targets one KLI (Knowledge-Learning-Instruction) process type.** Wrong instruction for the type produces execution without judgment. Different learning processes require fundamentally different instruction. Fluency needs repetition with feedback. Induction needs comparative examples. Sense-making needs explicit bridging between old and new mental models. **Every lab includes at least one stage of each type.** If genuinely needing only two, justify in spec.

**Stage Structure:**
- 1–2 MongoDB concepts, 1–3 skill interactions, single goal, one artifact, one KLI type
- Independently failable — failure in Stage N doesn't corrupt Stage N+1 (isolates learning from failures)
- Cumulative — Stage N assumes only Stages 1–N-1

**Fluency & Memory:** Agent recalls and applies a pattern reliably (syntax, commands, naming). Requires exact pattern → worked example → immediate practice. Never ask to choose between alternatives (that's induction). Repetition with immediate feedback builds automaticity.
*"Run `db.orders.createIndex({ customerId: 1, createdAt: -1 })`. Output: `{ ok: 1 }`. Now create an index on `products` using the same pattern."*

**Induction & Refinement:** Agent extracts a rule from contrasting examples (when to embed vs. reference, pipeline vs. find). Comparison forces the agent to identify what changed and generalize the principle. Requires at least two examples, names the difference, asks agent to apply rule to novel case.
*"Schema [A]: 10:1 read-write (reporting). Schema [B]: 50:50 (your app). Which fits? Update SCHEMA_NOTES.md with choice and access pattern."*

**Sense-Making:** Agent connects new concept to existing mental model — why documents exist, why no joins, why schema flexibility matters. This is conceptual change, not skill acquisition. Use SQL-bridging concepts where appropriate — name the SQL instinct being overridden and show why it fails in this context. The agent must articulate what's different, not just execute differently. **Note:** Stage content teaching the SQL contrast is not sufficient on its own — reflection prompts and transfer tasks must also surface it directly, or learners will not name the contrast unprompted.
*"SQL: schema changes migrate every row. MongoDB: documents in a collection differ. Where saves time in your app? (one sentence)"*

---

## 4. Skill Gap Design

Every lab closes a specific gap. Identify starting and target mental models before writing stages. The default learner is SQL-proficient and will instinctively normalize, join, and separate concerns into tables. MongoDB requires undoing those instincts — not explaining why they're wrong in general, but showing what they produce in *this* context and why MongoDB's approach is better.

- State starting model in spec. Default: *SQL engineer instinctively normalizes, joins, separates concerns.*
- For every MongoDB concept, name the SQL instinct overridden
- **Teach anti-pattern first.** Show SQL output, then MongoDB alternative and why. Contrast is more durable than instruction alone.
- One concept at a time. Don't learn syntax and decide simultaneously.

*"Tempting: separate `lineItems` collection, reference by `orderId` (SQL pattern). In MongoDB: unnecessary round-trips. Instead: embed items in order. [example] [why]"*

---

## 5. Scaffolding

Scaffolding decreases for learned knowledge, never for new knowledge. This is rooted in cognitive load theory — the agent has limited working memory. Remove support for material already in long-term memory (prior stages) so the agent uses that knowledge to plan independently. But always provide full scaffolding for new concepts, regardless of stage. New material is high-load and will fail without support.

- **Stage 1:** Full — exact command, expected output, what to observe
- **Stages 2–3:** For prior knowledge, agent determines approach. New concepts still fully scaffolded
- **Stages 4+:** For prior knowledge, state objective and check only. New concepts fully scaffolded

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

- Define every MongoDB term inline on first use. *"A collection — MongoDB's equivalent of a SQL table"*
- Never use jargon without defining it
- Include glossary (Term | MongoDB | SQL) in every tech spec
- Include "What You Learned" summary at final stage

---

## 9. Structured, Accurate, and Authoritative Content

Agents parse content directly — they don't infer structure from prose like humans do. Formatting, accuracy, sourcing all affect learning quality. A badly structured spec produces worse learning than a poorly written one.

**Structure:**
- Consistent hierarchy: headers, bullets, code blocks, labeled examples
- Concept formula: **term** → **SQL equivalent** → **why it matters** → **example code**
- Inline code for all MongoDB terms, commands, fields (every use)
- Every example: collections involved, output, what to observe
- Schemas/output as JSON/BSON, not prose
- Glossary (Term | MongoDB | SQL) in every spec
- Rationale for every access pattern, trade-off, decision
- Semantic prefixes: **Required**, **Optional**, **Caution**

**Validation:**
- Test every MongoDB concept, command, example against [MongoDB docs](https://www.mongodb.com/docs/) in real instance
- Cite source: MongoDB URL, [sources/research-sources.md](sources/research-sources.md), or "tested in Builder Badge"
- Checks validate against best practices, not just completion
- If contradicting MongoDB docs — cite reason and link. Don't work around authority.

---

## 10. Reflection and Decision Records

At least one stage per lab has the agent record a design decision (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`). Articulating reasoning is how agents confirm they understand, not just execute. It's also the artifact that transfer tasks evaluate.

- Prompts ask: what you chose, why, what you're giving up
- Check validates file exists and has minimum content — doesn't score reasoning

---

## 11. Buildability

Every lab provisions without trial-and-error. Ambiguous setup produces failed runs and wasted time before learning can start. Buildability is not optional overhead — it's a prerequisite to learning.

- Specs include **Environment Requirements**: tools, services, ports, file layout at start
- Specs include **Seed Data**: collections, document shapes, seed script, starting state
- State platform explicitly: Instruqt, local VS Code, or Codespaces

---

## 12. Evaluation and Scoring

Score specs against rules, not subjective quality. Lab Instruction Evaluator uses three passes that build on each other:

**Pass 1:** Section-by-section — each stage scored independently on clarity, completeness, coherence, testability, self-containment. Does the stage communicate what to do? Can it be verified? This reveals whether individual stages work.

**Pass 2:** Cross-section synthesis — patterns, consistency across stages, rulebook compliance. Does the lab cohere? Do stages build cumulatively? This reveals whether stages fit together.

**Pass 3:** Learner perspective — can they start? succeed? learn? Simulate agent's experience. This reveals whether the whole lab works for a learner.

**Scoring:**
- Each criterion scored ✓ (met), △ (partial), ✗ (not met) with specific, cited reasons. Reference exact wording.
- Iteration guidance is actionable. "Be clearer" is not.
- **Spec Quality** (Passes 1+2) + **Learner Experience** (Pass 3) = two /10 scores
- **Must score ≥8 on both** before proceeding to environment builder
- Flag lowest-scoring criteria first for revision

---

## 13. Research Findings

All three foundational hypotheses have been confirmed across five lab runs. Full per-lab findings, the hypothesis validation summary, and the revision log live in [standards/hypothesis-validation.md](hypothesis-validation.md).

**Key finding:** The three-rule cluster — KLI typing, SQL bridging, decision records — works as an integrated system. SQL bridging's active ingredient is that reflection prompts and transfer tasks must explicitly surface the SQL contrast; stage content teaching the contrast is necessary but not sufficient.


