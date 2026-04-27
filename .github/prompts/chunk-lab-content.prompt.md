---
mode: agent
description: Convert a validated lab tech spec into semantically self-contained chunks optimised for LLM retrieval and RAG pipelines
---

[agents/rag-chunker.md](../../agents/rag-chunker.md)

Chunk the lab content using the agent definition above.

**Attach before running:**
- The lab tech spec (`labs/specs/{lab-name}-tech-spec.md`)
- The env-eval report (`labs/reports/{lab-name}/{lab-name}-env-eval-v{N}.md`)

The agent will enforce a quality gate — both a passing spec evaluation (≥ 8/10) and a completed env-eval must exist before chunking begins.

Output saves to `labs/chunks/{lab-name}/` with subdirectories `concepts/` and `tasks/`, plus a `manifest.json`.

After completing, run `/evaluate-lab-chunks` to validate chunk quality before indexing.
