# Instructional Design Rulebook

All agents in this repository (Lab Outline Designer, Lab Outline Converter, and Lab Instruction Evaluator) must follow these rules when creating or assessing content. Every outline, spec, and evaluation report is in scope.

See [sources/research-sources.md](sources/research-sources.md) for the research behind these rules.

---

## 0. Foundational Principles

### Backwards Design

Design every lab in reverse order.

1. **State the endpoint**: what should the agent be able to do, without help, after completing the lab?
2. **Define the milestone check**: what artifact or output proves that capability?
3. **Design the stages**: what must each stage build so the agent is ready for the next?

If content doesn't serve a milestone check, remove it. If a stage doesn't build toward an objective, remove it.

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
- Specify the cognitive process required: recalling a pattern, comparing alternatives, and evaluating a choice each require different instruction. Don't conflate them.
- Every stage serves at least one objective. Every objective is served by at least one stage.
- Draw a straight line from objective to stage activity to milestone check. If you can't, rewrite all three.

**Bad:** "Understand why MongoDB is better than SQL."
**Good:** "Design a MongoDB schema that eliminates at least one multi-table join and record the access pattern that drove that decision in SCHEMA_NOTES.md."

---

## 3. KLI Learning Process Types

The KLI (Knowledge-Learning-Instruction) framework defines three types of learning. Each requires different instruction. Identify the type before writing each stage.

### Memory and Fluency
The agent recalls and applies a pattern: syntax, commands, conventions. Provide the exact pattern, show a worked example, ask the agent to apply it. Don't ask it to choose between alternatives here.

**Example:** "Run this exact command to create a vector index: `[command]`. Now create a second index on the `products` collection using the same pattern."

### Induction and Refinement
The agent extracts a rule from varied examples: when to embed vs. reference, when to use a pipeline vs. a simple find. Show at least two contrasting examples, name what changes between them, ask the agent to apply the inferred rule to a new case.

**Example:** "Here is a schema optimised for reads [A]. Here is one optimised for writes [B]. The access pattern determines the choice. Which fits this app? Update the schema and explain your reasoning in SCHEMA_NOTES.md."

### Understanding and Sense-Making
The agent connects a new concept to its existing mental model. Bridge explicitly from SQL to MongoDB, name the conceptual shift, confirm understanding through a reflection artifact.

**Example:** "In SQL, schema changes require migrations that touch every row. In MongoDB, documents in the same collection can have different shapes. Write one sentence in SCHEMA_NOTES.md describing where this would save time in your app."

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

Scaffolding is support that decreases as the lab progresses. A lab that provides the same support in every stage is scripting, not teaching.

**Rules:**
- **Stage 1**: fully scaffolded. Provide the exact command, expected output, and what to observe. Leave nothing to inference.
- **Middle stages**: guided. Provide the goal and available tools. Require the agent to determine the approach.
- **Final stages**: minimal. State the objective and the milestone check. The agent plans its own path.
- Never remove scaffolding faster than knowledge has been built. Fluency must be established before induction. Induction must be established before independent sense-making.

| Stage | Support level | What the spec provides |
|---|---|---|
| 1 | Full | Exact command, expected output, what to observe |
| 2 | Guided | Goal, available skills, example prompt to adapt |
| 3 | Partial | Goal, milestone check, one hint for likely errors |
| 4 | Minimal | Objective only. Agent plans its own approach |

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

## 10. Reflection and Decision Records

At least one stage per lab asks the agent to record a design decision in a notes file (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`).

**Rules:**
- Reflection prompts ask for three things: what you chose, why you chose it, and what you are giving up.
- The milestone check validates the file exists and has minimum content. It does not score reasoning quality.

---

## 11. Buildability

Every lab can be provisioned without trial-and-error.

**Rules:**
- Tech specs include an **Environment Requirements** section: pre-installed tools, running services, ports, and file system layout at start.
- Tech specs include a **Seed Data** section: collections to seed, document shapes, a sample seed script, and the intentional starting state.
- State explicitly which platform the lab runs on: Instruqt, local VS Code, or Codespaces.

---

## 12. Evaluation and Scoring

Evaluation reports score specs against these rules, not against subjective quality.

**Rules:**
- Score every criterion as ✓ (met), △ (partial), or ✗ (not met) with a specific, cited reason.
- Reference exact wording from the spec. Not general impressions.
- Iteration guidance is actionable in the next draft. "Be clearer" is not actionable.
- A spec scoring below 8/10 must be revised before use. Flag the lowest-scoring criteria first.

---

## 13. Living Document

When a rule proves unworkable in practice, update it here and note the reason. Don't work around a rule without updating it.
