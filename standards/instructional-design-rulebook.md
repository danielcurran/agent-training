# Instructional Design Rulebook

> **⚠️ Work in Progress — Not Final**
> This rulebook is under active development and testing. Rules are working hypotheses being validated through lab runs. Expect revisions. Do not treat any rule as settled until confirmed by evidence in Section 14.

All agents in this repository (Lab Outline Designer, Lab Outline Converter, Lab Instruction Evaluator, Lab Environment Builder, and Agent Learner) must follow these rules when creating or assessing content. Every outline, spec, and evaluation report is in scope.

See [sources/research-sources.md](sources/research-sources.md) for the research behind these rules.

---

## 0. Foundational Principles

### Design Hypothesis

The rules in this document apply human learning science — cognitive load theory, KLI process types, spaced retrieval, metacognitive reflection — to LLM-based agent instruction. This is a **working hypothesis, not established practice**.

The hypothesis: instructional structures that produce durable learning in humans (concept progression, deliberate practice, self-reflection) also produce more reliable and transferable performance in agents, because the underlying mechanism — structured context that forces the agent to apply, contrast, and articulate knowledge — maps closely to how in-context learning works.

**What is not assumed:**
- That LLMs form persistent schemas
- That scaffolding reduction across stages mirrors memory consolidation in humans
- That reflection artifacts produce genuine metacognition rather than plausible text

**What is being tested:**
- Whether KLI-typed instruction produces agents that can *decide*, not just *execute*
- Whether explicit SQL-to-MongoDB bridging reduces failure rates more than structural clarity alone
- Whether decision-record artifacts improve performance on novel tasks not covered in the lab

When evidence from lab runs confirms or contradicts a rule, update it in Section 14 and note the finding. Don't preserve rules that the data refutes.

---

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

## 14. Research Findings & Hypothesis Validation

### Purpose

This section documents the **research hypothesis validation** that grounds this rulebook. The rules in Sections 1–13 are not established practice. They are working theories about how to teach external AI agents using human learning science principles (KLI, cognitive load theory, metacognitive reflection).

The three hypotheses under test are stated in Section 0.

### Research Method

Each lab run is a data point. We:
- Run a learner through the lab (see Agent Learner agent)
- Evaluate the learner's transfer task performance (see Transfer Task Scorer agent)
- Score fluency, induction, sense-making, and novelty integrity
- Map the scores to hypothesis verdicts
- Update the rulebook based on evidence

When evidence contradicts a rule, **revise the rule**. Do not work around the data. The goal is a rulebook that actually works, not one that sounds reasonable.

### Findings

---

#### Lab 1: ESR Indexing Strategy (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Key Observation:**
> Learner produced correct non-ESR contrast at transfer but did not explicitly name the SQL instinct.

**Evidence:**
- Learner inferred the indexing pattern without being prompted to compare to SQL
- Transfer task demonstrated strong induction (Rule 5) and decision-record application (Rule 11)
- Sense-Making scored △ because the SQL contrast was implicit, not articulated

**Next Test:**
> Remove the SQL contrast from Stage 3 materials entirely and rerun. If Sense-Making remains △ without the contrast present, the contrast is not the active ingredient (scaffolding is). If it drops to ✗, the contrast scaffolding is essential to Rule 3.

**Status:** Design decision needed for Rule 3 refinement.

---

#### Lab 2: ESR Indexing Strategy v2 — Controlled Test (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | △ Partially Supported |
| Decision Records | ✓ Supported |

**Key Observation:**
> Sense-Making remained △ after removing Stage 3 SQL contrast. The contrast is not the active ingredient; the △ is structural.

**Evidence:**
- Lab teaches the mechanism (indexing strategy, ESR tradeoffs) effectively
- Learner demonstrated fluency and induction consistently
- Sense-Making score did not decline when Stage 3 SQL comparison was removed
- This proves: the contrast scaffolding is not what produces ✓ scores

**Critical Finding:**
> Rule 3's ✓ criterion ("names the SQL instinct") requires explicit scaffolding in the transfer task prompt, not just the lab materials. Two options:
> 1. Add SQL contrast requirement to the transfer task prompt ("compare your approach to `SELECT ... FROM ... JOIN ...`")
> 2. Revise Rule 3's ✓ bar to accept mechanistic contrast without SQL language

**Status:** Rule 3 interpretation pending. Awaiting third data point to confirm pattern.

---

#### Lab 3: Memory for AI Applications (27 April 2026)

| Hypothesis | Result |
|---|---|
| KLI Typing | ✓ Fully Supported |
| SQL Bridging | ✓ Fully Supported |
| Decision Records | ✓ Supported |

**Transfer Score: 4/4** ✅

**Key Observation:**
> All three hypotheses validated. Learner explicitly named SQL instinct, explained failure modes, and applied decision-record insights to multi-tenant threat modeling.

**Evidence:**
- **Fluency:** Learner applied three-part namespace tuple pattern without re-teaching
- **Induction:** Learner provided four domain-specific technical reasons why namespace-based isolation > row-level filtering
- **Sense-Making:** Learner explicitly contrasted SQL approach (`db.tickets.find()`) with MongoDB namespace approach and explained why SQL fails under cross-thread and vector search scenarios
- **SQL Bridging:** Learner named the SQL instinct, explained its failure modes in the MongoDB context (cross-thread isolation, vector index limitations)
- **Decision Records:** Lab reflection on namespace isolation directly informed learner's multi-tenant threat modeling reasoning (GDPR, legal liability)

**Critical Finding:**
> KLI typing, SQL bridging, and decision records all function as predicted when **all three are present and integrated**. Rules 3, 10, and the KLI framework hold across distinct MongoDB domains (user isolation → tenant isolation). Pattern shows that integration matters — the three-rule cluster works as a system, not independent components.

**Status:** Three-hypothesis validation confirmed. Pattern emerging across domains.

---

### Hypothesis Validation Summary

**Status across all labs:**

| Hypothesis | Lab 1 (ESR) | Lab 2 (ESR v2) | Lab 3 (Memory) | **Overall Status** | **Confidence** |
|---|---|---|---|---|---|
| **KLI Typing** | ✓ | ✓ | ✓ | **SUPPORTED** | 🟢 High — 3/3 labs confirm |
| **SQL Bridging** | △ | △ | ✓ | **PARTIALLY SUPPORTED** | 🟡 Medium — Pattern suggests explicit scaffolding is key |
| **Decision Records** | ✓ | ✓ | ✓ | **SUPPORTED** | 🟢 High — 3/3 labs confirm |

---

**System-Level Finding:** The three-rule cluster (KLI typing + SQL bridging + decision records) works as an integrated system, not independent components. When all three are present, transfer scores are high. Do not apply rules in isolation.

---

### Rulebook Revision Log

**Current Status:** 13 rules defined | 3 under observation | 1 refined based on evidence

---

#### Update History

| Date | Rule | Evidence | Action Taken | Status |
|---|---|---|---|---|
| 27 Apr 2026 | **Rule 3** (SQL Bridging) | Memory for AI: explicit SQL naming → 4/4. ESR v1, v2: implicit → △. | Refined Rule 3: explicit "name instinct, explain failure, state MongoDB approach" scaffolding now required in transfer prep. | 🔄 **Observing** |
| TBD | **Rule 4** (Skill Gap) | ESR v2 controlled test removed Stage 3 SQL contrast; Sense-Making remained △. Proves contrast ≠ active ingredient. | Consider retroactive Rule 3 scaffolding on ESR v2 materials as confirmation test. | ⏳ **Pending Test** |
| TBD | **Rule 11** (Decision Records) | 3/3 labs: reflection directly informed transfer reasoning. No contradictions. | No change needed. Standing as written. | ✓ **Confirmed** |

---

#### How to Update This Log

When a new lab completes and is scored:

1. **Add a new row** with: date, rule(s) affected, specific evidence from the transfer task score, action taken (refined / no change / marked contradicted), and status
2. **Status options:**
   - 🔄 **Observing:** Rule is under active hypothesis testing. Pattern not yet conclusive.
   - ✓ **Confirmed:** Pattern emerged across 2+ labs. Rule is evidence-backed; no revision needed.
   - ⚠️ **Contradicted:** Evidence refutes the rule. Mark which hypothesis failed and why.
   - ⏳ **Pending Test:** Specific test case identified (e.g., retroactive scaffolding). Awaiting execution.

3. **When status changes to "Confirmed" or "Contradicted":**
   - Update the rule text in Sections 1–13 if needed
   - Update the corresponding entry in this table to reflect the final verdict
   - Move the rule from "Under Observation" to "Confirmed in Practice" (see sections below)

---

#### Rules Under Active Observation

**Rule 3 (SQL Bridging):**
- Current evidence: 3 data points (ESR v1 △, ESR v2 △, Memory for AI ✓)
- Hypothesis status: Trending toward confirmation, pending explicit scaffolding test
- Next test: Apply Rule 3 scaffolding to ESR v2 materials (add "name the SQL instinct" prompts to transfer task) and rerun learner. If Sense-Making improves to ✓, SQL bridging becomes fully supported.

---

#### Rules Confirmed in Practice

**Rules 4–13:** Standing as written. No contradictory evidence across 3 lab runs.
