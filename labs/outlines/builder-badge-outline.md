# Lab: Building an App with Code Agents: Beyond the SQL Mental Model

## Learning objectives

* Understand why MongoDB is a better fit than a traditional SQL database for AI capabilities and modern application development.  
* Understand AI-assisted application development with MongoDB, including how agents support design, refactoring, and extension of an app.  
* Use MongoDB MCP Server as part of a modern development workflow.  
* Use MongoDB Agent Skills as part of a modern development workflow.  
* Design and implement a MongoDB data model that aligns with application access patterns and is easy to evolve.  
* Use MongoDB Agent Skills to create and refine MongoDB queries and aggregation pipelines.  
* Implement core AI capabilities in a MongoDB app, including vector indexes, semantic search and autoembeddings.  
* Develop disciplined AI-assisted development habits with MongoDB Agent Skills by reviewing and refining agent output, then recording final decisions and context in project notes.

## Narrative and environment

* You are maintaining an existing SQL-backed service. The team is evaluating how MongoDB and code agents can make it easier to ship and evolve features compared to staying within the SQL model.  
* The lab runs in a VS Code style hosted IDE with:  
  * Application code checked out locally  
  * Existing SQL database running in the background  
  * A MongoDB local Atlas cluster connection available  
  * A code agent panel embedded in the IDE  
* The SQL data has already been migrated into MongoDB using a schema migration tool but some of the schema and queries still need to be refined. The lab briefly explains this approach and recommends using deterministic tools for data migration, not AI or LLMs, but learners do not write or run migration scripts themselves.  
* The code agent panel exposes a small set of project-specific skills. These project-specific skills are implemented using MongoDB MCP Server and [MongoDB Agent Skills](https://github.com/mongodb/agent-skills/tree/main/skills):  
  * [**MongoDB Schema Design**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-schema-design) suggests how to group data into MongoDB documents.  
  * **Test Suite Runner** runs the canonical test command, interprets results, and suggests next steps when tests fail.  
  * **Baseline Flow Checker** walks a short end to end scenario and verifies baseline state in the SQL database.  
  * **Mongo Explorer** helps you inspectinsxfpect the equivalent data and schema in MongoDB.  
  * [**MongoDB Query Optimizer**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-query-optimizer) and **AI Integrator** support later steps for optimizing queries and adding vector search.  
* Learners work in a single long-running challenge with discrete, validated milestones.

## Lab Walkthough 

1. ## Design and refine the MongoDB data model

   **Goal: Design a MongoDB-first model that better fits app needs compared with SQL alternative.**  
     
* Explore the MongoDB representation:  
* Use **Mongo Explorer** and **[MongoDB Schema Design](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-schema-design)** to**:**  
  * Inspect the MongoDB collections and representative documents.  
  * Compare how the same entities and relationships appear in SQL tables versus MongoDB documents.  
* With [**MongoDB Schema Design**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-schema-design), refine the target document schema:  
  * Propose collections, key document shapes, and key indexes that better match read and write patterns.  
  * Explicitly map important SQL tables and join patterns to documents or embedded structures in a way that reduces query complexity.  
* Learner tasks:  
  * Ask [**MongoDB Schema Design**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-schema-design) to propose at least two alternative MongoDB schemas (for example, more embedded, more normalized, hybrid), each with a brief pros and cons summary.  
  * Choose one option (or define a hybrid) and capture it in code (YAML or JSON schema design file).  
  * In SCHEMA\_NOTES.md, write a brief reflection covering:  
* Which option you chose and why.  
* Which read and write patterns drove that decision.  
* What you would worry about if you had to change this design in six months.  
  * Pick one core workflow (for example, orders, customers, or tickets) and update the schema file so that workflow is fully supported by your MongoDB collections, fields, and indexes.  
* Milestone check:  
  * Lint or schema checker validates the mapping file.  
  * Agent-generated summary of tradeoffs (such as embed versus reference) appears and is acknowledged by running a short check command.

2. ## Optimize queries for MongoDB

   **Goal: show how MongoDB queries and aggregation simplify flows that were complex in SQL.**  
* Use [**MongoDB Query Optimizer**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-query-optimizer) to:  
  * Propose at least two alternative MongoDB implementations for each core data access path (for example, embedded document plus simple find, normalized model plus aggregation or lookup).  
  * Summarize the pros and cons of each option in terms of query simplicity, write complexity, and future schema evolution.  
* Learner tasks:  
  * For each core path (simple reads, writes and updates, and any previously joined queries), ask [**MongoDB Query Optimizer**](https://github.com/mongodb/agent-skills/tree/main/skills/mongodb-query-optimizer) for at least two implementation options.  
  * Select one option per path (or define a hybrid) and implement it in the data access layer.  
  * Run the test suite via **Test Suite Runner** after each major refactor and adjust implementations as needed.  
  * In DAL\_NOTES.md, record:  
    * Which option you chose for each core path.  
    * Why you chose it (for example, simpler queries, fewer round trips, easier future changes).  
    * One tradeoff you are accepting (for example, more write amplification or more complex aggregation).  
* Milestone check:  
  * All unit tests that exercise migrated paths pass against MongoDB.  
  * Diff-based check ensures no lingering SQL client usage in the core app path.  
  * DAL\_NOTES.md exists and contains a brief justification for the chosen implementations.


3. ## Implement vector search and AI assistance

   **Goal: show how MongoDB-native AI capabilities extend the app beyond what is straightforward in a typical SQL setup.**  
     
* Starting from the MongoDB-backed app, use **AI Integrator** to:  
  * Create a basic vector index on a chosen collection (for example, products, tickets, or knowledge articles).  
  * Generate code to:  
    * Produce auto-embeddings or other embedding generation (via a hosted or mocked model)  
    * Store embeddings alongside documents in MongoDB  
    * Run a simple vector search query  
* Learner tasks:  
  * Add an endpoint or CLI command that exposes the semantic search or recommendation query.  
  * Run provided scripts that demonstrate at least one successful semantic query end to end.  
* Milestone check:  
  * Validation script confirms:  
    * Vector index exists with the expected definition.  
    * Sample query returns at least one expected document within a similarity threshold.  
      

4. ## Observability and wrap-up

   **Goal: reinforce production-minded habits and reflect on where MongoDB and agents added value beyond SQL.**  
     
* Add minimal observability around the new MongoDB code paths:  
  * Basic logging or metrics of key operations.  
  * Optional: query logging or explain-plan snapshots via agent prompts.  
* Final validation:  
  * Use **Test Suite Runner** to run the full test suite entirely against MongoDB, with SQL usage disabled.  
  * A single green check script validates:  
    * Collections and indexes  
    * Document counts  
    * Key user journeys (happy path) via scripted calls  
* Reflection:  
  * Short written prompt:  
    * Where the agent’s suggestions were accepted versus overridden  
    * What tradeoffs you made in the schema and data access layer  
    * What you would monitor as the app evolves on MongoDB in a real environment 