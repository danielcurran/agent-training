---
name: mongodb-learning-design
description: Core principles for designing effective MongoDB training labs and learning experiences that work for external AI agents
---

# MongoDB Learning Design Principles

Use these principles when designing MongoDB training content, labs, or learning experiences. These principles are field-tested across the agent-training repository and optimize for agent learners (external AI agents with no prior MongoDB knowledge).

## Core Design Principles

### 1. Backwards Design
Design every lab in reverse:
1. What should the learner do **after** completing this? (endpoint capability)
2. What artifact proves they can do it? (milestone check)
3. What must each stage build to reach that endpoint? (stage design)

**What it prevents:** Rambling labs with content that doesn't serve any objective. If content doesn't lead to the checkpoint, remove it.

**Example:** Builder Badge lab endpoint: "Design a MongoDB schema that passes vector search queries." Working backwards: (1) learner must write a migration file, (2) milestone check runs queries and validates results, (3) earlier stages teach schema design patterns.

---

### 2. Agents Plan, Not Interpret
Agents read instructions literally and act immediately. They don't pause to ask for clarification.

**Test every instruction:** If an agent reads this and acts immediately without asking questions, does it know exactly what to do?

**What it prevents:** Silent failures and wrong behavior. Ambiguous instructions like "set up the database appropriately" become "do something that might work."

**Instead write:**
- ❌ "Review the schema and make improvements"
- ✅ "Identify at least two fields stored as strings that should be arrays. Update the schema file. The milestone check will verify both."

---

### 3. Bridge Explicitly From SQL to MongoDB
Learner has SQL experience. It will instinctively normalize, join, and separate concerns. Name this instinct and explain why MongoDB does it differently.

**Pattern:** State the SQL instinct → show what it produces in MongoDB → explain why that's a problem → show the MongoDB pattern → explain the rationale.

**What it prevents:** Learners reverting to SQL thinking because no one explained **why** MongoDB is different.

**Example:** "You may embed line items in the order document instead of a separate collection. This mirrors SQL's foreign key pattern, but in MongoDB it reduces round-trips. Here's why..." (Insert and Find does this poorly; Builder Badge does it well).

---

### 4. Teach Three Learning Process Types
Different knowledge requires different instruction:

**Memory and Fluency** — Recall and apply a pattern reliably (syntax, commands)
- Provide exact pattern + worked example + immediate application
- ❌ Don't ask them to choose between alternatives

**Induction and Refinement** — Extract a rule from varied examples (when to embed vs. reference)
- Show 2+ contrasting examples + name what changes + apply to new case
- ❌ Don't ask them to discover rules without examples

**Sense-Making** — Connect concept to existing mental model (why MongoDB has no joins)
- Bridge explicitly from SQL → name the conceptual shift → confirm with reflection
- ❌ Don't just explain; require them to articulate the shift

**Rule:** Every lab must include at least one stage of each type. Fluency-only labs produce agents that execute but can't decide. Sense-making-only labs produce agents that explain but can't act.

---

### 5. One Concept Per Stage
Each stage introduces 1–2 MongoDB concepts, not more.

**What it prevents:** Cognitive overload. Agents can't learn syntax and make design decisions simultaneously.

**Bad stage:** Introduces both aggregation pipelines AND schema optimization in one stage.
**Good stage:** Introduces aggregation pipelines. Schema optimization comes in a later stage.

---

### 6. Full Scaffolding for New Knowledge
Whenever a concept is introduced for the first time, provide full scaffolding **regardless of stage**:
- Exact command to run
- Expected output
- What to observe
- Why this matters

**Reduce scaffolding only for previously-taught knowledge**, letting learners determine their own approach.

**What it prevents:** Learners guessing when they encounter new concepts. Scaffolding decreases over a lab, but only for knowledge already taught.

**Example:**
- Stage 1: "Run this exact command: `db.products.createIndex(...)`" (full scaffolding)
- Stage 2: "Create an index on `{ customerId: 1 }`" (guided; they've seen indexing)
- Stage 3: "Optimize this query" (minimal; they've done indexing before)

But if Stage 3 introduces **aggregation pipelines for the first time**, that new concept gets full scaffolding again.

---

### 7. Milestone Checks Are Pass/Fail, Not Interpreted
Every stage ends with exactly one checkpoint.

**Rules:**
- ✓ Pass or ✗ Fail. No partial credit.
- No human judgment required. Automated check when possible.
- Validates the artifact, not just that a command ran
- Include exact terminal output that passing looks like

**What it prevents:** Ambiguous grading. Learners don't know if they succeeded.

**Example:**
- ❌ "Check if your schema is good"
- ✓ "Run `npm run check:schema`. Output must show: 'Schema validation: PASS' and 'All indexes verified'"

---

### 8. Define Everything (Zero-Knowledge Writing)
Learner has never seen MongoDB. Define every term on first use.

**Rules:**
- *A collection* (MongoDB's equivalent of a SQL table)
- *A document* (a JSON-like record in a collection)
- *An index* (a database structure that speeds up queries)
- Include a glossary mapping MongoDB terms to SQL equivalents

**What it prevents:** Jargon walls. Learners don't bounce because they don't know what a "shard" is.

---

### 9. Single Goal Per Stage
Every stage has one goal stated in one sentence.

**What it prevents:** Diffuse learning. Clear goals let learners know when they've succeeded and why.

**Example:** "Write a Node.js function that inserts a product document and returns its `_id`."

---

### 10. Record Design Decisions
At least one stage per lab asks learners to write down a choice, why they made it, and what they're giving up.

**Pattern:** Create a file like `SCHEMA_NOTES.md` with:
1. What you chose
2. Why you chose it
3. What you are giving up

**What it prevents:** Autopilot learning. Writing about decisions deepens understanding.

---

## When to Apply These Principles

✅ **Use these principles when:**
- Designing new MongoDB labs or training content
- Reviewing learning materials for clarity and completeness
- Debugging why a learner got stuck
- Creating documentation for agents or humans

✅ **Example application:**
You're designing a "Schema Versioning" lab:
1. Define the endpoint: "Design a migration strategy that changes a field type without downtime"
2. Identify the skill gap: SQL uses migrations; MongoDB doesn't (principle 3)
3. Choose KLI types: Sense-making (why), induction (when to embed vs. reference), fluency (exact syntax)
4. Design stages (1-2 concepts each): Stage 1 introduces document versioning, Stage 2 migration strategies
5. Scaffold fully for new concepts, reduce for known (principle 6)
6. Create pass/fail checks (principle 7)

---

## See Also

- [Instructional Design Rulebook](../../standards/instructional-design-rulebook.md) — Full specification for agents
- [Builder Badge Lab](../../labs/specs/builder-badge-tech-spec.md) — Complete example applying these principles
- [Agent Learner](../../agents/learner.md) — How these principles are validated in practice
