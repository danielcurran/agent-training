# Instructional Design Rulebook

This rulebook governs how all agents in this repository — the Lab Outline Designer, Lab Outline Converter, and Lab Instruction Evaluator — create and assess training content. Every outline, spec, and evaluation report must follow these rules. When in doubt, defer to this document.

---

## 1. Audience

All content is written for **external AI agents with no prior MongoDB knowledge**. Treat the learner as a capable engineer who knows SQL and general programming concepts, but has never used MongoDB, MQL, aggregation pipelines, indexes, or Atlas.

Never assume familiarity with MongoDB. Never skip to "just use an index" without explaining what an index is and why it helps.

---

## 2. Learning Objectives

Every lab must open with explicit learning objectives.

**Rules:**
- State 3–6 objectives per lab.
- Every objective must describe a **measurable, observable behavior** — something you can pass or fail, not something you can only feel.
- Objectives must be carried forward into stage design. Every stage must serve at least one objective.

**Bad:** "Understand why MongoDB is better than SQL."
**Good:** "Design a MongoDB schema that eliminates at least one multi-table join from the equivalent SQL data model."

---

## 3. Stage Design

Labs are broken into 3–5 sequential stages.

**Rules:**
- Each stage introduces **1–2 MongoDB concepts** and **1–3 agent skill interactions**.
- Stages must be **independently failable** — a broken Stage 2 must not corrupt Stage 3's starting state.
- Concepts build **cumulatively**. Stage N may only assume knowledge introduced in Stages 1 through N-1.
- Every stage must have a **single, unambiguous goal** stated in one sentence.
- Every stage must produce at least one **artifact** (a file, a schema, a code change) that the milestone check can validate.

---

## 4. Milestone Checks

Every stage ends with exactly one milestone check.

**Rules:**
- Checks must be **objectively pass/fail** — no partial credit, no interpretation required.
- Every check must have a **named command** (`npm run check:*`) and the **exact expected terminal output** when passing.
- The check must validate the artifact produced in the stage, not just that the learner ran a command.
- If a check fails, the learner stays in the stage. After **N failed attempts** (defined per stage), a fallback path must be provided.

---

## 5. Agent Skill Interactions

When a stage involves an agent skill, the spec must fully define the interaction.

**Rules:**
- Provide at least **one example prompt** per skill interaction.
- Show what a **correct response or artifact** looks like.
- If two skills could give conflicting advice, specify which takes precedence and why.
- Every external dependency (agent skills, MongoDB connections, mock APIs) must have a **health check** and a **fallback instruction** if unavailable.

---

## 6. Zero-Knowledge Writing

Write as if the reader has never seen a MongoDB document.

**Rules:**
- Define every MongoDB term **inline on first use**: *"a collection — MongoDB's equivalent of a SQL table"*.
- Never use MongoDB jargon (collection, document, pipeline, index, Atlas, MQL) without a definition the first time it appears.
- Include a **Glossary** at the end of every tech spec listing all MongoDB terms introduced, with a SQL-equivalent comparison where applicable.
- Include a **What You Learned** summary at the end of the final stage.

---

## 7. Reflection and Decision Records

Agents learn best when they record decisions, not just execute steps.

**Rules:**
- At least one stage per lab must ask the learner to capture a **written design decision or tradeoff** in a notes file (e.g., `SCHEMA_NOTES.md`, `DAL_NOTES.md`).
- Reflection prompts must ask for a **specific decision** (what you chose), a **reason** (why you chose it), and a **tradeoff** (what you are accepting or giving up).
- The notes file must be validated by the stage's milestone check — existence and minimum content are checkable; quality of reasoning is not.

---

## 8. Buildability

Every lab must be provisioned without trial-and-error.

**Rules:**
- Tech specs must include an **Environment Requirements** section listing all pre-installed tools, running services, ports, and file system layout at the start of the lab.
- Tech specs must include a **Seed Data** section describing collections to seed, document shapes, a sample seed script, and the intentional starting state (what is wrong or incomplete).
- The lab must be provisionable in at least one of: Instruqt, local VS Code, or Codespaces. State which explicitly.

---

## 9. Evaluation and Scoring

Evaluation reports score specs against these rules, not against subjective quality.

**Rules:**
- Every criterion must be scored as ✓ (met), △ (partial), or ✗ (not met) with a specific, cited reason.
- Scores must reference exact wording or structure from the spec — not general impressions.
- Iteration guidance must be **actionable in the next draft** — not general advice like "be clearer."
- A spec scoring below 8/10 must be revised before use. Flag the lowest-scoring criteria as the revision priority.

---

## 10. Living Document

This rulebook evolves as the program matures. When a rule proves unworkable in practice, update it here and note the reason. Do not work around a rule without updating it — silent workarounds create inconsistency across agents and content.
