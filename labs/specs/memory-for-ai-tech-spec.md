# Memory for AI Applications — Technical Specification

## Lab Metadata

| Field | Value |
|-------|-------|
| **Lab Name** | Memory for AI Applications |
| **Track** | AI Agents with MongoDB |
| **Language** | Python 3.10 |
| **MongoDB Version** | Enterprise 8.0.x |
| **Prerequisite** | Lesson 5 of Memory for AI Applications skill; familiarity with `MongoDBSaver` short-term checkpointers |
| **Est. Duration** | 90 minutes (45 min per challenge) |
| **Primary LO** | Build an AI agent with persistent cross-thread memory backed by MongoDB vector search |

---

## Learning Objectives (Overall)

By completing this lab, learners will be able to:

1. **Configure a MongoDB vector store** for long-term memory storage and semantic retrieval
2. **Implement namespace-based user isolation** to prevent cross-user memory leakage in multi-tenant systems
3. **Integrate long-term memory (store) and short-term memory (checkpointer)** into a single agent
4. **Demonstrate cross-thread persistence:** facts saved in one conversation thread are retrievable in a new thread
5. **Verify namespace isolation:** observe that one user's memories remain inaccessible to another user

---

## Architecture Overview

### Memory Systems

The lab teaches **dual memory architecture:**

- **Short-term memory (Checkpointer):** `MongoDBSaver` — maintains conversation history within a single thread; state is isolated per thread
- **Long-term memory (Store):** `MongoDBStore` with vector search — stores semantically indexed facts across threads; namespaces provide user isolation

### Key MongoDB Features Used

| Feature | Purpose | Implementation |
|---------|---------|-----------------|
| Vector Search Index | Enable semantic retrieval of memories by query similarity | `create_vector_index_config()` with 1024-dim dotProduct similarity |
| Namespaces | Isolate memories per user in a shared collection | Three-part tuple: `("user", user_id, "memories")` |
| Collections | Store checkpoints (short-term) and memories (long-term) | `checkpoints`, `checkpoint_writes`, `memories` (auto-created) |

### Data Model

**Memories Collection Document** (auto-created by `MongoDBStore`):
```json
{
  "_id": ObjectId,
  "namespace": ["user", "sarah", "memories"],
  "key": "memory_<hash>",
  "value": {
    "content": "User has a peanut allergy and needs peanut-free food options"
  },
  "embedding": [0.123, -0.456, ..., 0.789]  // 1024-dim vector
}
```

---

## Challenge 1: Create Memory Infrastructure

### Challenge Objective

Set up the embedding model, vector search index, and memory tools that will power the agent's long-term memory.

### Learning Outcomes

- Configure a Voyage AI embedding model for semantic understanding
- Create a MongoDB vector search index via `create_vector_index_config`
- Initialize `MongoDBStore` as the long-term memory backend
- Implement `save_memory` and `retrieve_memories` tools with namespace-based user isolation

### Collections Affected

| Collection | Action | Details |
|-----------|--------|---------|
| `memories` | Create | Auto-created by `MongoDBStore` on first `put()` call |

### Indexes Created

| Index Name | Fields | Type | Purpose |
|-----------|--------|------|---------|
| Vector search index | `content` | Vector (1024-dim, dotProduct) | Semantic similarity search on memory content |

### Starter Code

Learners receive `agent_simple.py` with **TODO placeholders** for:
1. `embedding_model` instantiation
2. `index_config` parameters
3. `save_memory` tool body (namespace, store.put call)
4. `retrieve_memories` tool body (namespace, store.search call)

### Challenge Steps

1. **Instantiate the embedding model**
   - Open `agent_simple.py`
   - Complete `embedding_model = VoyageAIEmbeddings(model="voyage-4-large")`
   - Rationale: voyage-4-large outputs 1024-dimensional vectors optimized for semantic understanding

2. **Configure the vector search index**
   - Complete `index_config = create_vector_index_config(...)`
   - Arguments:
     - `embed=embedding_model`
     - `dims=1024`
     - `relevance_score_fn="dotProduct"`
     - `fields=["content"]`
   - Rationale: dotProduct similarity is efficient for dense vector comparisons; 1024 dims match Voyage AI's output

3. **Implement `save_memory` tool**
   - Obtain `user_id` from runtime config: `config = get_config(); user_id = config.get("configurable", {}).get("user_id", "default_user")`
   - Call `store.put(namespace=("user", user_id, "memories"), key=f"memory_{hash(content)}", value={"content": content})`
   - Return confirmation message
   - Rationale: Three-part namespace isolates each user's memories distinctly

4. **Implement `retrieve_memories` tool**
   - Use the same namespace tuple as `save_memory`: `("user", user_id, "memories")`
   - Call `store.search(namespace, query=query, limit=5)`
   - Extract and format results; return "No relevant memories found" if empty
   - Rationale: `MongoDBStore.search()` internally converts the query to a vector and performs semantic similarity search

5. **Verify and save**
   - Run `agent_simple.py` in terminal to confirm no import/syntax errors

### Success Criteria

✓ `embedding_model` is a `VoyageAIEmbeddings` instance with `model="voyage-4-large"`  
✓ `index_config` specifies `dims=1024`, `relevance_score_fn="dotProduct"`, `fields=["content"]`  
✓ `save_memory` tool obtains `user_id` from `get_config()` and calls `store.put()` with namespace tuple `("user", user_id, "memories")`  
✓ `retrieve_memories` tool calls `store.search()` on the correct namespace with `limit=5`  
✓ `agent_simple.py` runs without errors in terminal  

### Milestone Checkpoint

Learners can manually test the tools:
```python
# Pseudo-test (not in lab, but conceptual)
store.put(("user", "sarah", "memories"), "mem1", {"content": "peanut allergy"})
results = store.search(("user", "sarah", "memories"), "food restrictions", limit=5)
# Should return the saved memory via semantic search
```

---

## Challenge 2: Build the Agent and Verify Memory Persistence

### Challenge Objective

Wire together short-term and long-term memory systems into a functioning agent, then demonstrate cross-thread persistence and user isolation.

### Learning Outcomes

- Integrate long-term memory tools and a short-term checkpointer into a single agent
- Demonstrate that facts saved in thread-1 are retrievable in thread-2 (cross-thread persistence)
- Verify that one user's namespace is inaccessible to another user (user isolation)

### Collections Affected

| Collection | Action | Details |
|-----------|--------|---------|
| `memories` | Write | New memory documents written during agent conversations |
| `checkpoints` | Write | Checkpoint records created by `MongoDBSaver` per thread |
| `checkpoint_writes` | Write | Write records for each checkpoint state transition |

### Starter Code

Learners receive:
- **`agent_simple.py`** — solved from Challenge 1, with embedding model, index config, and memory tools complete
- **`create_memory_agent()` function** — partially complete, missing `tools=` and `checkpointer=` arguments in the `create_agent()` call
- **`examples/create_agent_instance.py`** — fully pre-written; run as-is

### Challenge Steps

1. **Complete the `create_agent()` call**
   - Locate the `create_agent()` call in `create_memory_agent()`
   - Add `tools=memory_tools` (the list returned by `create_memory_tools(store)`)
   - Add `checkpointer=checkpointer` (the `MongoDBSaver` instance)
   - Rationale: This gives the agent both memory systems: checkpointer for in-thread state, tools for cross-thread fact persistence

2. **Save `agent_simple.py`**

3. **Review the demo script**
   - Open `examples/create_agent_instance.py` (pre-written; no changes needed)
   - Note the four conversations:
     - **Conversation 1 & 2:** Sarah (thread-1, thread-2) — tests cross-thread persistence
     - **Conversation 3 & 4:** Mike (thread-3, thread-4) — tests user isolation

4. **Run the demo**
   - Execute `python examples/create_agent_instance.py` in terminal
   - Observe output for each conversation

5. **Verify cross-thread persistence (Sarah)**
   - In thread-1, Sarah mentions: "I have a severe peanut allergy"
   - Expected: Agent autonomously calls `save_memory()` to store this fact
   - In thread-2 (brand new thread), Sarah asks: "can you help me pick a restaurant?"
   - Expected: Agent calls `retrieve_memories()`, performs vector search, and replies with peanut-safe suggestions
   - **Key insight:** The agent has no in-thread context about the allergy (thread-2 is separate), yet it recalls the fact from MongoDB — proving persistence

6. **Verify user isolation (Mike)**
   - In thread-3, Mike says: "I'm a total foodie — I'll try pretty much anything"
   - Expected: Agent stores Mike's status as a foodie (no allergies) in Mike's namespace
   - In thread-4, Mike asks: "Are there any food allergies or dietary restrictions I should let them know about?"
   - Expected: Agent searches only Mike's namespace and correctly reports **no allergies** — NOT Sarah's peanut allergy
   - **Key insight:** If namespace isolation failed, Mike would incorrectly receive Sarah's allergy information; the fact that he doesn't proves namespaces work

7. **Inspect raw MongoDB documents**
   - Run `python utils/check_memories.py` (utility provided)
   - Observe the raw `memories` collection documents
   - Verify that Sarah's namespace is `["user", "sarah", "memories"]` and Mike's is `["user", "mike", "memories"]`
   - Note that both namespaces are stored in the same collection, but the namespace field provides logical isolation

### Success Criteria

✓ `create_agent()` is called with both `tools=memory_tools` and `checkpointer=checkpointer`  
✓ `create_agent_instance.py` runs without errors  
✓ Sarah's cross-thread persistence: thread-2 dinner recommendation correctly reflects the peanut allergy saved in thread-1  
✓ Mike's user isolation: thread-4 query returns no allergy info, confirming his namespace is separate from Sarah's  
✓ Learner ran `check_memories.py` and verified namespace field separation in MongoDB  

### Milestone Checkpoint

Learners inspect MongoDB to confirm:
```json
// Sarah's memory
{
  "namespace": ["user", "sarah", "memories"],
  "key": "memory_...",
  "value": { "content": "peanut allergy..." }
}

// Mike's memory
{
  "namespace": ["user", "mike", "memories"],
  "key": "memory_...",
  "value": { "content": "foodie, no allergies..." }
}
```

Both are in the same collection, but namespaces isolate them logically.

---

## Reflection Requirement

**File:** `REFLECTION.md` (required; ~500–700 words)

Learners must articulate:

1. **How namespace isolation works** — Why the three-part tuple `("user", user_id, "memories")` ensures that one user's memories are not accessible to another
2. **Cross-thread persistence mechanism** — How `MongoDBStore` with vector search allows facts saved in thread-1 to be retrieved in thread-2, enabling the agent to "remember" across conversations
3. **Vector search rationale** — Why semantic similarity (dotProduct on 1024-dim vectors) is better than keyword matching for memory retrieval (e.g., "dietary restrictions" should match "peanut allergy" even though words don't overlap)
4. **Multi-tenant considerations** — What would happen if namespace isolation failed? Real-world implications for an agent serving multiple users
5. **Short-term vs. long-term memory** — How the two systems work together: the checkpointer maintains in-thread conversation history, while the store provides persistent facts across threads

---

## Environment & Setup

### Infrastructure

| Component | Spec | Notes |
|-----------|------|-------|
| OS | Ubuntu 22.04.5 LTS | Virtual machine |
| MongoDB | Enterprise 8.0.x | Local Atlas deployment |
| Python | 3.10 | Package manager: `uv` |
| Embedding Model | Voyage AI (`voyage-4-large`) | **Mocked** in lab environment (deterministic vectors) |

### Python Packages

```
pymongo
langchain
langchain-core
langchain-voyageai
langchain-openai
langgraph
langgraph-checkpoint-mongodb
langgraph-store-mongodb
python-dotenv
```

### Environment Variables

```
MONGODB_URI=mongodb+srv://...  # Local Atlas connection
OPENAI_API_KEY=sk-...          # For LLM (development only)
MODEL=gpt-4o                   # LLM model identifier
```

### Lab Files Structure

```
lab-test-env/memory-for-ai/
├── .env.example
├── .env
├── agent_simple.py                 # Main agent code (Challenge 1 + 2)
├── examples/
│   └── create_agent_instance.py    # Demo script (pre-written, Challenge 2)
├── utils/
│   └── check_memories.py           # Inspect MongoDB docs
├── scripts/
│   ├── setup.sh                    # Bootstrap environment
│   ├── seed.py                     # (Optional) Pre-load sample data
│   └── check-all.sh                # Run all verification checks
└── requirements.txt
```

---

## Verification Checks

Learners run checks at key points to verify correctness:

### Check 1: Imports & Syntax (Challenge 1)
```bash
python agent_simple.py --check-imports
```
Verifies: VoyageAIEmbeddings, MongoDBStore, create_vector_index_config, MongoDBSaver all import without error.

### Check 2: Vector Index Creation (Challenge 1)
```bash
python -c "from agent_simple import index_config; print(index_config)"
```
Verifies: `index_config` has dims=1024, relevance_score_fn="dotProduct", fields=["content"].

### Check 3: Demo Execution (Challenge 2)
```bash
python examples/create_agent_instance.py
```
Verifies: Agent runs 4 conversations without errors; Sarah and Mike memories are stored and retrieved correctly.

### Check 4: Namespace Isolation (Challenge 2)
```bash
python utils/check_memories.py
```
Verifies: MongoDB `memories` collection contains documents with separate namespaces for Sarah and Mike.

---

## Learning Pathway & Scaffolding

### Conceptual Bridge: From SQL to Memory

Learners familiar with relational databases may think: "Can't I just query by user_id?" 

**Key insight:** Namespaces provide logical isolation **without separate tables**. One collection, multiple namespaces — a document-oriented, schema-flexible approach that's efficient at scale and enables multi-tenant systems without schema duplication.

### Pedagogical Approach: Transparency Over Abstraction

The lab uses **custom `@tool` functions** (not opaque LangChain abstractions) so learners see:
- When `save_memory` is called (explicit in agent code)
- How namespaces are constructed (three-part tuple visible)
- What `store.put()` and `store.search()` do (not hidden behind framework magic)

This transparency builds mental models for debugging and extending agent memory systems.

---

## Transfer Task (Required)

**Scenario:** You're building a multi-tenant customer support agent. Each tenant (Company A, Company B, etc.) has its own support tickets stored in MongoDB. When a support agent queries the system, they should retrieve only their tenant's tickets — never another tenant's.

Currently, your system uses a simple query: `db.tickets.find({ tenant_id: tenant_id })`. This works for basic queries, but your agent will have long-running conversations across multiple threads, and you want to leverage MongoDB's vector search to find semantically similar tickets (e.g., searching "login timeout" should match stored tickets about "authentication failure").

**Question 1:** Design a namespace tuple for this multi-tenant ticket isolation scenario, following the pattern from the Memory for AI Applications lab. Write your namespace tuple.

**Question 2:** Why would a simple `db.tickets.find({ tenant_id: tenant_id })` query not be sufficient for this use case? What advantage does the namespace tuple provide over row-level filtering?

**Question 3:** If you accidentally used the same namespace for all tenants (e.g., `("support", "tickets")` without tenant_id), what data leakage risk would occur? How would this differ from the lab's user isolation failure scenario with Sarah and Mike?

**Expected Responses:**

1. **Namespace tuple:** `("tenant", tenant_id, "support_tickets")` or equivalent three-part tuple that isolates by tenant. Variations like `("customer", tenant_id, "tickets")` are acceptable.

2. **Why tuple over filtering:** 
   - The namespace approach provides **logical isolation at the storage layer**, not just query filtering. Even if a learner accidentally writes a query without the tenant_id filter, the namespace ensures wrong data cannot be retrieved.
   - The namespace integrates seamlessly with `MongoDBStore.search()` — all semantic similarity queries automatically respect the namespace boundary. Row-level filtering requires manual checks at query time.
   - Scales cleanly: as you add more MongoDB features (vector search, custom indexes, archival policies), the namespace remains the isolation mechanism.

3. **Data leakage scenario:**
   - Without tenant isolation in the namespace, a Company A support agent searching "refund request" would receive both Company A's and Company B's refund tickets in the same search results.
   - This is a **multi-tenant data breach**: sensitive customer information leaks across company boundaries.
   - Differs from Sarah/Mike in scope: Sarah/Mike is *user-level* isolation within one system; this is *tenant-level* isolation in a shared SaaS platform. The namespace pattern scales to both, but the stakes are higher for tenant isolation (legal/compliance implications).

---

**Rubric:**

| Criterion | Full Credit (✓) | Partial Credit (△) | No Credit (✗) |
|-----------|-----------------|-------------------|---------------|
| **Namespace Design** | Three-part tuple with tenant identifier (Q1) | Two-part tuple or missing tenant component | Missing or incorrect tuple structure |
| **Isolation Rationale** | Explains both logical isolation + seamless vector search integration (Q2) | Explains one aspect (e.g., isolation) but not integration with vector search | Confuses namespace with row-level filtering only |
| **Threat Recognition** | Identifies multi-tenant data leakage + compliance implications (Q3) | Identifies leakage but doesn't articulate scope/severity difference | Missing threat awareness |

---

**Sense-Making Depth:**

This transfer task assesses **Rule 10 (Transfer):** Can learners generalize the namespace concept beyond user-level isolation to a higher-stakes multi-tenant scenario? The task also touches **Rule 3 (Sense-Making):** Learners must explain *why* the namespace approach is superior, not just replicate it.

Success on this task signals that learners understand namespaces as a **general-purpose isolation primitive**, not a lab-specific trick.

---

## File Checklist

| File | Created in | Required |
|---|---|---|
| `agent_simple.py` | Challenge 1 | ✓ (embedding model + index config + tools) |
| `agent_with_tools.py` | Challenge 2 | ✓ (integrated agent with memory) |
| `REFLECTION.md` | Transfer Task | ✓ |
| `KNOWLEDGE.json` | After completion | ✓ |
