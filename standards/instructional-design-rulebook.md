# Instructional Design Rulebook

All agents in this repository (Lab Outline Designer, Lab Outline Converter, Lab Instruction Evaluator, Lab Environment Builder, and Agent Learner) must follow these rules when creating or assessing content. Every outline, spec, and evaluation report is in scope.

See [sources/research-sources.md](sources/research-sources.md) for the research behind these rules.

---

## 0. Foundational Principles

### Backwards Design

Design every lab in reverse order.

1. **State the endpoint**: what should the agent be able to do, without help, after completing the lab?
2. **Define the milestone check**: what artifact or output proves that capability?
3. **Design the stages**: what must each stage build so the agent is ready for the next?

If content doesn't serve a milestone check, remove it. If a stage doesn't build toward an objective, remove it.

### Learning is Not Knowledge Transfer

Labs are not reference guides. A reference guide tells an agent how to operate a tool. A learning lab builds conceptual understanding through **concept progression**, **deliberate practice**, and **self-reflection**.

Agents that memorize operational context can execute but cannot decide when to apply it. Three elements are required:

1. **Concept Progression**: Each stage introduces 1–2 new concepts and connects them to prior knowledge. Agents understand *why* a pattern exists before they apply it, grounded in the SQL mental model they already have (Section 4).

2. **Deliberate Practice**: Each KLI type requires different practice: fluency needs repetition with feedback, induction needs comparative examples, sense-making needs articulating choices (Section 3). Tasks build complexity: full scaffolding → guidance → goals only.

3. **Self-Reflection**: Agents articulate what they chose, why, and what they gave up. Reflection is not journaling — it is how agents confirm they understand, not just execute. Every lab includes at least one decision-record artifact per stage (Section 11).

Teaching an agent to call MongoDB APIs is not a learning lab. Use this rulebook for labs. Use SKILL.md for reference documentation.

### Humans Interpret, Agents Plan

Humans read documentation and fill gaps with judgment. Agents read documentation and convert it directly into actions. Ambiguous instructions don't cause an agent to pause. They cause wrong behavior or silent failure.

Test every instruction with this question: **if an agent reads this and acts immediately, does it know exactly what to do?** If not, rewrite it.

| Written for humans | Write this for agents |
|---|---|
| "Set up the database appropriately" | "Run `npm run seed`. This populates the `orders` collection with 50 sample documents in the shape shown below" |
| "You may want to consider indexes here" | "Create an index on `{ customerId: 1, createdAt: -1 }`. Exact command and expected output below" |
| "Review the schema and make improvements" | "Identify at least two fields stored as strings that should be arrays. Update the schema file. The milestone check will verify both fields are changed" |
| "Understand the tradeoffs" | "Write two sentences in SCHEMA_NOTES.md: one stating which option you chose, one stating what you are giving up" |

---

## 1. Audience

All content is written for **external AI agents with no prior MongoDB knowledge**. The learner knows SQL and general programming concepts. It has never used MongoDB, MQL, aggregation pipelines, indexes, or Atlas.

Never assume MongoDB familiarity. Never reference a concept before defining it.

---

## 2. Learning Objectives

Every lab opens with explicit learning objectives. Objectives must describe what the agent will **do**, not what it will "know" or "understand."

**Rules:**
- State 3–6 objectives per lab.
- Every objective produces a checkable artifact. If it can't be checked, rewrite it.
- Specify the cognitive process: recalling a pattern, comparing alternatives, and evaluating a choice each require different instruction. Don't conflate them.
- Every stage serves at least one objective. Every objective is served by at least one stage.
- Draw a straight line from objective to stage activity to milestone check. If you can't, rewrite all three.

**Bad:** "Understand why MongoDB is better than SQL."
**Good:** "Design a MongoDB schema that eliminates at least one multi-table join and record the access pattern that drove that decision in SCHEMA_NOTES.md."

---

## 3. KLI Learning Process Types

KLI (Knowledge-Learning-Instruction) connects what needs to be learned, how learning happens, and what instruction should do to support it. Different types of learning require fundamentally different instruction. Wrong instruction for the learning type produces agents that can execute but not decide, or explain but not act.

### How to apply KLI when designing a stage

1. **Identify the knowledge component**: what must the agent master?
2. **Select the learning process**: recall a pattern, extract a rule from examples, or build a mental model?
3. **Match instruction to process type** (see below).
4. **Design the activity**: provide exactly what that process type requires. Nothing more.

The three process types:

### Memory and Fluency
The agent needs to recall and apply a pattern reliably: syntax, commands, naming conventions. Instruction must provide the exact pattern, show a worked example, and ask the agent to apply it immediately. Do not ask the agent to choose between alternatives here. That is a different process type.

**Lab example:** "Run this exact command to create a vector index: `[command]`. Now create a second index on the `products` collection using the same pattern."

### Induction and Refinement
The agent needs to extract a rule from varied examples: when to embed vs. reference, when to use a pipeline vs. a simple find. Instruction must show at least two contrasting examples, name what changes between them, and ask the agent to apply the inferred rule to a new case.

**Lab example:** "Here is a schema optimised for reads [A]. Here is one optimised for writes [B]. The access pattern determines the choice. Which fits this app? Update the schema and explain your reasoning in SCHEMA_NOTES.md."

### Understanding and Sense-Making
The agent needs to connect a new concept to its existing mental model: why documents exist, why MongoDB has no joins, why schema flexibility is a feature. Instruction must bridge explicitly from SQL to MongoDB, name the conceptual shift, and confirm understanding through a reflection artifact rather than a mechanical task.

**Lab example:** "In SQL, schema changes require migrations that touch every row. In MongoDB, documents in the same collection can have different shapes. Write one sentence in SCHEMA_NOTES.md describing where this would save time in your app."

**Rule:** Every lab must include at least one stage of each type. Fluency-only labs produce agents that execute but can't decide. Sense-making-only labs produce agents that explain but can't act.

---

## 4. Skill Gap Design

Every lab closes a specific gap. Identify the learner's starting mental model and target model before writing any stage.

**Rules:**
- State the starting mental model in the spec. Default for this program: *SQL-proficient engineer who will instinctively normalize data, write joins, and separate concerns into tables.*
- For every MongoDB concept introduced, name the SQL instinct it overrides. Don't assume the agent will abandon its prior model on its own.
- Teach the anti-pattern before the pattern. Show what the SQL instinct produces, then show what MongoDB does instead and why. Contrast is more durable than instruction alone.
- Introduce one concept at a time. Don't ask the agent to learn syntax and make a decision simultaneously.

**Example of explicit gap-closing instruction:**
> You may be tempted to store order line items in a separate `lineItems` collection and reference them by `orderId`. This mirrors the SQL foreign key pattern. In MongoDB, this creates unnecessary round-trips for every order read. Instead, embed line items directly in the order document. Here is what that looks like: [example]. Here is why: [access pattern rationale].

---

## 5. Stage Design

Labs have 3–5 sequential stages.

**Rules:**
- Each stage introduces **1–2 MongoDB concepts** and **1–3 agent skill interactions**.
- Stages are **independently failable**. A broken Stage 2 must not corrupt Stage 3's starting state.
- Concepts build **cumulatively**. Stage N may only assume knowledge from Stages 1 through N-1.
- Every stage has a **single goal** stated in one sentence.
- Every stage produces at least one **artifact** the milestone check can validate.
- Every stage targets a specific KLI type (see Section 3). State it at the top of each stage definition.

---

## 6. Scaffolding

Scaffolding is support that decreases as the lab progresses, but only for knowledge the agent has already acquired. A lab that provides the same support in every stage is scripting, not teaching. A lab that removes support for concepts the agent hasn't learned yet will fail.

Reducing scaffolding means the agent uses earlier knowledge to plan independently. It does not mean less information about new concepts. New concepts get full scaffolding regardless of where they appear in the lab.

**Rules:**
- **Stage 1**: fully scaffolded. Provide the exact command, expected output, and what to observe. Leave nothing to inference.
- **Middle stages**: guided for previously-taught knowledge. The agent determines the approach using what it has learned. New concepts introduced here still get exact commands, examples, and expected output.
- **Final stages**: minimal for previously-taught knowledge. State the objective and the milestone check. New concepts introduced here still get full scaffolding.
- Never reduce scaffolding for a concept in the same stage it is introduced.

| Stage | Previously-taught knowledge | New knowledge introduced |
|---|---|---|
| 1 | N/A | Exact command, expected output, what to observe |
| 2 | Goal and available tools. Agent determines approach | Exact command, expected output, what to observe |
| 3 | Goal and milestone check only | Exact command, expected output, what to observe |
| 4 | Objective only. Agent plans its own approach | Exact command, expected output, what to observe |

---

## 7. Milestone Checks

Every stage ends with exactly one milestone check.

**Rules:**
- Checks are **pass/fail**. No partial credit. No interpretation required.
- Every check has a **named command** (`npm run check:*`) and the **exact expected terminal output** when passing.
- The check validates the artifact, not just that the agent ran a command.
- After **N failed attempts** (defined per stage), provide a fallback path.

---

## 8. Agent Skill Interactions

Every agent skill interaction must be fully defined in the spec.

**Rules:**
- Provide at least **one example prompt** per skill interaction.
- Show what a correct response or artifact looks like.
- If two skills could give conflicting advice, specify which takes precedence and why.
- Every external dependency (agent skills, MongoDB connections, mock APIs) has a health check and a fallback if unavailable.

---

## 9. Zero-Knowledge Writing

Write as if the reader has never seen a MongoDB document.

**Rules:**
- Define every MongoDB term inline on first use. Example: *"a collection, MongoDB's equivalent of a SQL table"*.
- Never use MongoDB jargon without defining it first.
- Include a **Glossary** at the end of every tech spec with all MongoDB terms and SQL-equivalent comparisons.
- Include a **What You Learned** summary at the end of the final stage.

---

## 10. Structured, Accurate, and Authoritative Content

Lab content must be structured, accurate, and authoritative. Agents and LLMs parse it directly — formatting, accuracy, and sourcing all affect learning quality.

**Rules:**

### Information Retrieval and Agent Parsing

- Use consistent hierarchical formatting: headers, bullet lists, code blocks, labeled examples.
- Every concept introduction follows: **term definition** → **SQL equivalent** → **why it matters** → **example code** → **when to use it**.
- Use inline code formatting (`term`) for all MongoDB terms, command names, and field names. Every use, not just first use.
- Every code example includes context: what collections are involved, what it produces, and what to observe.

### Accuracy and Response Quality

- Validate every MongoDB concept, command, and code example against the [MongoDB documentation](https://www.mongodb.com/docs/) and test in a real instance before inclusion.
- Every stage cites its source: MongoDB documentation URL, a reference from [sources/research-sources.md](sources/research-sources.md), or "tested in Builder Badge environment."
- Check scripts validate correctness against MongoDB best practices, not just task completion. Ambiguous pass conditions produce ambiguous learning.
- If a spec contradicts MongoDB documentation, cite the reason and link to the docs. Don't work around authoritative sources.

### Machine Readability and LLM Learning

- Structure all schema examples and output as JSON or BSON. Don't describe structures in prose alone.
- Include a **Glossary** table in every tech spec: Term | MongoDB Definition | SQL Equivalent.
- State the **rationale** for every access pattern, trade-off, and design decision. State what is gained and what is given up.
- Use semantic prefixes: **Required:**, **Optional:**, **Caution:**.

---

## 11. Reflection and Decision Records

At least one stage per lab asks the agent to record a design decision in a notes file (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`).

**Rules:**
- Reflection prompts ask for three things: what you chose, why you chose it, and what you are giving up.
- The milestone check validates the file exists and has minimum content. It does not score reasoning quality.

---

## 12. Buildability

Every lab can be provisioned without trial-and-error.

**Rules:**
- Tech specs include an **Environment Requirements** section: pre-installed tools, running services, ports, and file system layout at start.
- Tech specs include a **Seed Data** section: collections to seed, document shapes, a sample seed script, and the intentional starting state.
- State explicitly which platform the lab runs on: Instruqt, local VS Code, or Codespaces.

---

## 13. Evaluation and Scoring

Evaluation reports score specs against these rules, not against subjective quality. The Lab Instruction Evaluator uses a three-pass approach:

1. **Pass 1 — Section-by-Section:** Evaluates each stage independently for clarity, completeness, coherence, testability, and self-containment. Cites specific rulebook sections.
2. **Pass 2 — Full-Spec Synthesis:** Evaluates cross-section patterns for structural quality, consistency, and rulebook compliance.
3. **Pass 3 — Learner Experience:** Evaluates from the learner's perspective — can they start, will they succeed, will they learn?

**Rules:**
- Score every criterion as ✓ (met), △ (partial), or ✗ (not met) with a specific, cited reason.
- Reference exact wording from the spec. Not general impressions.
- Iteration guidance is actionable in the next draft. "Be clearer" is not actionable.
- Produce two scores: **Spec Quality** (Passes 1+2) and **Learner Experience** (Pass 3), each out of 10.
- A spec must score **≥8 on both dimensions** before proceeding to the environment builder.
- Flag the lowest-scoring criteria first for revision.

---

## 14. Living Document

When a rule proves unworkable in practice, update it here and note the reason. Don't work around a rule without updating it.
