---
artifact: builder-badge-tech-spec
evaluator: ai-agent-training-lab-instruction-evaluator
date: 2026-04-20
version: v1
score: 8/10
training_readiness: Needs minor revisions
---

# Lab Evaluation: builder-badge-tech-spec

**Target task:** Help an external AI agent migrate a SQL app to MongoDB, implement queries, vector search, and develop disciplined AI-assisted development habits
**Audience:** External AI agent with no prior MongoDB knowledge
**Current knowledge state:** No prior MongoDB knowledge

---

## Overall Assessment

This is a significantly more mature artifact than the outline — the application context, environment check, example prompts, milestone commands, and glossary address most of the gaps flagged in the previous evaluation. The biggest remaining risks are **agent skill availability assumptions**, **missing failure fallbacks for Stage 3**, and **the reflection stage having no forward-looking iteration signal**. Ready to train with minor revisions.

---

## Detailed Feedback

### 1. Task Clarity

**Strengths**
- Application context is fully defined — SupportDesk with named entities, access patterns, and a starting SQL schema
- Each stage has a single, unambiguous goal statement
- The SQL → MongoDB migration narrative gives a zero-knowledge agent a clear mental model before any technical steps

**Issues**
- "MongoDB Control Plane Server" in the glossary conflicts with the more accurate definition — MCP Server in this context is the **Model Context Protocol** server, not a control plane
- Stage 4 observability goal ("add minimal observability") is vague — "minimal" is undefined for an agent

**Recommendations**
- Fix the MCP Server glossary definition to: *"MongoDB MCP Server — implements the Model Context Protocol, exposing MongoDB operations as callable tools that AI agents can invoke directly from their tool panel"*
- Define "minimal observability" in Stage 4: promote the structured log format already in the spec to the goal statement

---

### 2. Input/Output Definition

**Strengths**
- Every stage produces named output files (`SCHEMA_NOTES.md`, `DAL_NOTES.md`, `REFLECTION.md`, `schema/supportdesk-schema.yaml`)
- Required fields and minimum word counts are specified for all notes files
- Example agent prompts are provided for every major skill interaction
- Expected outputs are shown for milestone check commands

**Issues**
- `src/dal/tickets.js` has no minimum completeness definition — an agent could write a stub and pass the milestone
- "or equivalent DAL file" introduces path ambiguity that could cause milestone check failures

**Recommendations**
- Add to Stage 2 milestone check: *"DAL file must implement all 4 paths (getTicketById, getOpenTicketsByPriority, addCommentAndUpdateStatus, searchTicketsByCategoryAndUser)"*
- Remove "or equivalent DAL file" — fix the path to `src/dal/tickets.js`

---

### 3. Behavioral Constraints

**Strengths**
- Maximum iteration rule (3 attempts) is present for both schema lint and DAL test failures
- Conflict resolution rule for Stage 3 (inline vs separate collection) is explicit
- "Do not proceed if environment check fails" is a hard stop

**Issues**
- No default selection rule when an agent skill returns two equally valid options in Stage 1
- No rule for what to do when an agent skill response is unclear

**Recommendations**
- Add: *"If both schema options appear equally valid, default to the more embedded option. Record the alternative in SCHEMA_NOTES.md as a rejected option with reasoning."*
- Add: *"If an agent skill response is unclear, re-prompt once with the specific point of confusion. If still unclear, use the spec's example as the implementation and record the uncertainty in notes."*

---

### 4. Evaluability & Testability

**Strengths**
- Every stage has a named `npm run check:*` command with exact expected output
- Milestone checks are machine-verifiable (file existence, length, lint, test pass/fail, SQL detection)
- Vector search milestone includes a similarity threshold (0.85)

**Issues**
- `npm run check:reflection` validates existence and length but not content quality
- No check command for the structured logging added in Stage 4

**Recommendations**
- Add content check to `npm run check:reflection`: validate that "accepted", "overrode", and "monitor" appear in the file
- Add `npm run check:logging` that grep-checks at least one DAL file for `event: "db_query"` and `duration_ms`

---

### 5. Failure Mode Coverage

**Strengths**
- Environment check hard-stops before Stage 1
- Maximum iteration limits prevent infinite loops in Stages 1 and 2
- Stage 3 conflict resolution covers the most likely agent skill disagreement

**Issues**
- No fallback if the mocked embedding endpoint (`http://localhost:3001/embed`) is unavailable
- No fallback if `npm run check:vector` similarity threshold fails (below 0.85)
- Stage 3 uses deprecated `$search.knnBeta` syntax — current syntax is `$vectorSearch`

**Recommendations**
- Add to Stage 3 Step 2: *"Before generating embeddings, confirm the endpoint is reachable: `curl http://localhost:3001/health`. If it returns non-200, stop and record the blocker."*
- Fix vector search to use `$vectorSearch` syntax:
```javascript
{ $vectorSearch: { index: "knowledge_articles_vector", path: "embedding", queryVector: embedding, numCandidates: 50, limit: 5 } }
```
- Add similarity threshold failure path: *"If the sample query scores below 0.85, re-run embedding generation and retry once. If still below threshold, record the score and proceed."*

---

### 6. Iteration Guidance

**Strengths**
- DAL_NOTES.md and SCHEMA_NOTES.md create a persistent decision log across stages
- "Run tests after each path" enforces a tight feedback loop in Stage 2

**Issues**
- No explicit cross-stage backtrack instruction if Stage 1 schema proves wrong during Stage 2
- Stage 4 reflection is retrospective only — no forward-looking output

**Recommendations**
- Add to Stage 2 intro: *"Before implementing, re-read `schema/supportdesk-schema.yaml`. If any of the 4 query paths cannot be satisfied without a `$lookup`, consider returning to Stage 1 to revise the schema."*
- Add to Stage 4 reflection: *"If you ran this lab again with a different app domain, what MongoDB concept are you most confident applying immediately? What would you need to look up again?"*

---

### 7. Transferability

**Strengths**
- Glossary covers all introduced MongoDB concepts with SQL-equivalent comparisons
- MongoDB Concepts Covered table maps every concept to the stage where it appears
- SupportDesk domain is generic enough to map to other CRUD-heavy apps

**Issues**
- Tightly coupled to Node.js — no guidance for Python or Java environments
- No end-of-lab summary of what the agent now knows

**Recommendations**
- Add a language note to Environment Setup: *"This spec uses Node.js examples. If your environment uses Python or another language, substitute the MongoDB driver syntax for your language."*
- Add a **What You Learned** section at the end of Stage 4 listing all 14 concepts from the MongoDB Concepts Covered table with one-line definitions

---

## Priority Action Items

1. **Fix the `$vectorSearch` syntax** — `$search.knnBeta` is deprecated and will cause Stage 3 to fail on any current Atlas cluster
2. **Add embedding endpoint health check** — Stage 3 has no recovery path if the mock endpoint is unavailable
3. **Add a cross-stage backtrack rule in Stage 2** — without it, an agent with the wrong Stage 1 schema will produce broken query implementations silently

---

## Lab Quality Score

**8/10 — Needs Minor Revisions**

The environment check, example prompts, milestone commands, glossary, and conflict resolution rules make this substantially more trainable than the outline. The `$vectorSearch` syntax bug is the only issue likely to cause a hard failure. The cross-stage backtrack rule and embedding health check are lower-risk but would meaningfully improve agent success rate on first run.

---

## MongoDB Knowledge Acquisition Report

| Concept | Confidence | Notes |
|---|---|---|
| Documents and collections | High | Well defined in glossary with SQL comparison |
| Embedding vs referencing | High | Covered with concrete schema examples and YAML |
| Compound indexes | High | Named fields and index definitions provided |
| MQL `find()` and filters | High | Code examples with real field names |
| Aggregation pipelines | High | `$lookup` and `$push`/`$set` shown with code |
| Write amplification | Medium | Defined in glossary, referenced in DAL notes template |
| Vector indexes | Medium | Index definition provided but `$vectorSearch` syntax is incorrect |
| Auto-embeddings | Medium | Concept explained, mocked endpoint provided |
| Semantic search | Medium | Code shown but uses deprecated syntax |
| Explain plans | Low | Mentioned as optional, no output example provided |
| MongoDB MCP Server | Low | Glossary definition is inaccurate |
| MongoDB Agent Skills | Medium | Referenced throughout with example prompts |

**Gaps that would block task completion:**
- `$vectorSearch` syntax bug would cause Stage 3 to fail
- MCP Server definition mismatch could cause confusion when the agent tries to use it

**Updated knowledge state:**
> Agent has solid working knowledge of MongoDB document modeling, embedding vs referencing tradeoffs, compound indexes, MQL queries, aggregation pipelines with `$lookup`, and write amplification. Vector search and auto-embeddings are partially understood — the concept is clear but the implementation syntax needs correction before it can be executed. MongoDB Agent Skills interaction patterns are well understood through the example prompts. MCP Server purpose is unclear due to an inaccurate glossary definition.