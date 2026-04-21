# Instructional Design Rulebook

This rulebook governs how all agents in this repository — the Lab Outline Designer, Lab Outline Converter, and Lab Instruction Evaluator — create and assess training content. Every outline, spec, and evaluation report must follow these rules. When in doubt, defer to this document.

Rules are grounded in research on how AI agents learn from documentation. See [standards/sources/research-sources.md](sources/research-sources.md) for the full reference list.

---

## 0. Foundational Principles

Two principles underpin every rule in this document. Read these before anything else.

### Backwards Design

Design every lab in reverse order: define the final capability first, design the assessment that proves it, then design the learning activities that build toward it. Never start with content.

In practice this means:
1. **State the endpoint** — what should the agent be able to do, without help, after completing the lab?
2. **Define the milestone check** — what observable artifact or output proves that capability?
3. **Design the stages** — what prerequisite knowledge and skills must each stage build so the agent arrives ready for the next?

Content that doesn't serve a milestone check doesn't belong in the lab. Stages that don't build toward a learning objective don't belong in the spec.

### Humans Interpret, Agents Plan

This is the most important distinction in designing content for AI agents.

When a human reads documentation, they interpret — filling in gaps with judgment, background knowledge, and contextual reasoning. They can tolerate ambiguity, infer intent, and course-correct when something feels wrong.

When an agent reads documentation, it plans — converting instructions directly into an action sequence. It cannot fill gaps with judgment. Ambiguous instructions don't prompt an agent to pause and think; they produce unpredictable behavior, wrong assumptions, or silent failure.

This distinction has concrete consequences for every content decision:

| If you write for humans | Write this for agents instead |
|---|---|
| "Set up the database appropriately" | "Run `npm run seed` — this populates the `orders` collection with 50 sample documents in the shape shown below" |
| "You may want to consider indexes here" | "Create an index on `{ customerId: 1, createdAt: -1 }`. Here is the exact command and the expected output" |
| "Review the schema and make improvements" | "Identify at least two fields currently stored as strings that would be better represented as arrays. Update the schema file. The milestone check will verify both fields are changed" |
| "Understand the tradeoffs" | "Write two sentences in SCHEMA_NOTES.md: one stating which option you chose, one stating what you are giving up by not choosing the alternative" |

Every instruction in every outline, spec, and report should be tested against this question: **if an agent reads this and immediately starts acting, does it know exactly what to do?** If not, it is written for a human interpreter, not an agent planner. Rewrite it.

---

## 1. Audience

All content is written for **external AI agents with no prior MongoDB knowledge**. Treat the learner as a capable engineer who knows SQL and general programming concepts, but has never used MongoDB, MQL, aggregation pipelines, indexes, or Atlas.

Never assume familiarity with MongoDB. Never skip to "just use an index" without explaining what an index is and why it helps.

---

## 2. Learning Objectives

Every lab must open with explicit learning objectives. Because agents plan rather than interpret, objectives must describe the exact behavior the agent will demonstrate — not knowledge it will "have" or concepts it will "understand."

**Rules:**
- State 3–6 objectives per lab.
- Every objective must describe a **measurable, observable behavior** — something that produces a checkable artifact, not something that only changes internal state.
- Objectives must specify **what cognitive process is required**, not just the topic. Recognizing when to use an aggregation pipeline is a different skill than writing one — they require different instruction.
- Every stage must serve at least one objective. Every objective must be served by at least one stage. Objectives without stages are aspirational; stages without objectives are filler — eliminate both.
- The milestone check for each stage must directly and unambiguously measure the objective it serves. If you cannot draw a straight line from objective → stage activity → milestone check, rewrite all three.

**Bad:** "Understand why MongoDB is better than SQL."
**Good:** "Design a MongoDB schema that eliminates at least one multi-table join from the equivalent SQL data model and record the access pattern that drove that decision in SCHEMA_NOTES.md."

**Cognitive process test:** for each objective, ask — is the agent being asked to *recall and apply* a pattern, *compare and decide* between alternatives, or *evaluate and justify* a choice? Each requires different instruction. Don't conflate them in a single objective.

---

## 3. KLI Learning Process Types

The Knowledge-Learning-Instruction (KLI) framework identifies three fundamentally different types of learning. Each requires different instruction design. Identify which type each stage targets before writing the stage.

### Memory and Fluency
The agent needs to recall and apply a pattern reliably — syntax, commands, naming conventions. Instruction should: provide the exact pattern, show a worked example, and ask the agent to apply it immediately. Do not ask the agent to choose between alternatives at this stage — that is a different type of learning.

**Lab application:** "Run this exact command to create a vector index: `[command]`. Now create a second index on the `products` collection using the same pattern."

### Induction and Refinement
The agent needs to see enough varied examples to extract the underlying rule itself — when to embed vs. reference, when to use an aggregation pipeline vs. a simple find. Instruction should: show at least two contrasting examples, name the variable that changes between them, and ask the agent to apply the inferred rule to a new case.

**Lab application:** "Here is a schema optimised for reads [example A]. Here is one optimised for writes [example B]. The access pattern is what determines the choice. Given this app's access patterns, which fits better? Update the schema and explain your reasoning in SCHEMA_NOTES.md."

### Understanding and Sense-Making
The agent needs to connect a new concept to its existing mental model — why documents exist, why MongoDB has no joins, why schema flexibility is a feature not a bug. Instruction should: explicitly bridge from the known (SQL) to the new (MongoDB), name the conceptual shift required, and confirm understanding through a reflection artifact rather than a mechanical task.

**Lab application:** "In SQL, schema changes require migrations that touch every row. In MongoDB, documents in the same collection can have different shapes — you can add a field to new documents without altering existing ones. Write one sentence in SCHEMA_NOTES.md describing a scenario in your app where this would save you time."

**Rule:** Every lab must include at least one stage of each type. A lab that only drills fluency produces an agent that can execute but not decide. A lab that only asks for sense-making produces an agent that can explain but not act.

---

## 4. Skill Gap Design

Every lab must close a specific, diagnosed gap — not teach MongoDB in the abstract. Before writing a single stage, identify the learner's starting mental model and the target mental model, and design the gap-closing explicitly.

**Rules:**
- State the **starting mental model** in the spec: what does the agent already know, and what harmful assumption will it bring from that prior knowledge? For this program, the default starting model is: *SQL-proficient engineer who will instinctively normalize data, write joins, and separate concerns into tables.*
- For every MongoDB concept introduced, **name the SQL instinct it will override** and explicitly address it. Do not assume the agent will naturally abandon its prior model.
- **Teach the anti-pattern before the pattern.** Show what the SQL-instinct approach produces (unnecessary joins, multiple round-trips, rigid schema), then show what the MongoDB approach replaces it with and why. Agents, like humans, learn more durably from contrast than from instruction alone.
- **Reduce cognitive load at the moment of new concept introduction.** When a stage introduces a new concept, strip everything else to the minimum. Don't introduce two new concepts simultaneously. Don't ask the agent to make a decision and learn a syntax at the same time.

**Example of explicit gap-closing instruction:**
> You may be tempted to store order line items in a separate `lineItems` collection and reference them by `orderId` — this mirrors the SQL pattern of a foreign key join. In MongoDB, this creates unnecessary round-trips for every order read. Instead, embed line items directly in the order document. Here is what that looks like: [example]. Here is why: [access pattern rationale].

---

## 5. Stage Design

Labs are broken into 3–5 sequential stages.

**Rules:**
- Each stage introduces **1–2 MongoDB concepts** and **1–3 agent skill interactions**.
- Stages must be **independently failable** — a broken Stage 2 must not corrupt Stage 3's starting state.
- Concepts build **cumulatively**. Stage N may only assume knowledge introduced in Stages 1 through N-1.
- Every stage must have a **single, unambiguous goal** stated in one sentence.
- Every stage must produce at least one **artifact** (a file, a schema, a code change) that the milestone check can validate.
- Every stage must target a specific KLI learning process type (see Section 3). State which type at the top of each stage definition.

---

## 6. Scaffolding

Scaffolding is support provided to the agent that is progressively removed as the lab advances. Early stages provide maximum structure; later stages require the agent to apply what it has learned with less guidance. A lab that provides the same level of support in every stage is not teaching — it is scripting.

**Rules:**
- **Stage 1** must be fully scaffolded: provide the exact command or prompt to use, show the expected output, and confirm what the agent should observe. Leave nothing to inference.
- **Middle stages** reduce scaffolding incrementally: provide the goal and the available tools, but require the agent to determine the approach. Example prompts shift from "run this exact command" to "ask the Schema Design skill to propose two alternatives."
- **Final stages** operate with minimal scaffolding: state the objective, name the milestone check, and let the agent plan its own path. The agent should be applying knowledge from earlier stages, not following new instructions.
- **Never remove scaffolding faster than knowledge has been built.** If Stage 3 removes support for a concept introduced in Stage 2, Stage 2 must have fully established that concept first. Use the KLI type to verify: fluency must be established before induction; induction must be established before sense-making can be applied independently.

**Scaffolding progression example:**

| Stage | Support level | What the spec provides |
|---|---|---|
| 1 | Full | Exact command, expected output, what to observe |
| 2 | Guided | Goal, available skills, example prompt to adapt |
| 3 | Partial | Goal, milestone check, one hint if a common error is likely |
| 4 | Minimal | Objective only — agent plans its own approach |

---

## 7. Milestone Checks

Every stage ends with exactly one milestone check.

**Rules:**
- Checks must be **objectively pass/fail** — no partial credit, no interpretation required.
- Every check must have a **named command** (`npm run check:*`) and the **exact expected terminal output** when passing.
- The check must validate the artifact produced in the stage, not just that the learner ran a command.
- If a check fails, the learner stays in the stage. After **N failed attempts** (defined per stage), a fallback path must be provided.

---

## 8. Agent Skill Interactions

When a stage involves an agent skill, the spec must fully define the interaction.

**Rules:**
- Provide at least **one example prompt** per skill interaction.
- Show what a **correct response or artifact** looks like.
- If two skills could give conflicting advice, specify which takes precedence and why.
- Every external dependency (agent skills, MongoDB connections, mock APIs) must have a **health check** and a **fallback instruction** if unavailable.

---

## 9. Zero-Knowledge Writing

Write as if the reader has never seen a MongoDB document.

**Rules:**
- Define every MongoDB term **inline on first use**: *"a collection — MongoDB's equivalent of a SQL table"*.
- Never use MongoDB jargon (collection, document, pipeline, index, Atlas, MQL) without a definition the first time it appears.
- Include a **Glossary** at the end of every tech spec listing all MongoDB terms introduced, with a SQL-equivalent comparison where applicable.
- Include a **What You Learned** summary at the end of the final stage.

---

## 10. Reflection and Decision Records

Agents learn best when they record decisions, not just execute steps.

**Rules:**
- At least one stage per lab must ask the learner to capture a **written design decision or tradeoff** in a notes file (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`).
- Reflection prompts must ask for a **specific decision** (what you chose), a **reason** (why you chose it), and a **tradeoff** (what you are accepting or giving up).
- The notes file must be validated by the stage's milestone check — existence and minimum content are checkable; quality of reasoning is not.

---

## 11. Buildability

Every lab must be provisioned without trial-and-error.

**Rules:**
- Tech specs must include an **Environment Requirements** section listing all pre-installed tools, running services, ports, and file system layout at the start of the lab.
- Tech specs must include a **Seed Data** section describing collections to seed, document shapes, a sample seed script, and the intentional starting state (what is wrong or incomplete).
- The lab must be provisionable in at least one of: Instruqt, local VS Code, or Codespaces. State which explicitly.

---

## 12. Evaluation and Scoring

Evaluation reports score specs against these rules, not against subjective quality.

**Rules:**
- Every criterion must be scored as ✓ (met), △ (partial), or ✗ (not met) with a specific, cited reason.
- Scores must reference exact wording or structure from the spec — not general impressions.
- Iteration guidance must be **actionable in the next draft** — not general advice like "be clearer."
- A spec scoring below 8/10 must be revised before use. Flag the lowest-scoring criteria as the revision priority.

---

## 13. Living Document

This rulebook evolves as the program matures. When a rule proves unworkable in practice, update it here and note the reason. Do not work around a rule without updating it — silent workarounds create inconsistency across agents and content.
