---
mode: agent
description: Evaluate RAG chunks produced by the RAG Chunker for standalone coherence, heading retrievability, structural completeness, relationship explicitness, and metadata accuracy
---

[agents/rag-chunk-evaluator.md](../../agents/rag-chunk-evaluator.md)

Evaluate the lab chunks using the agent definition above.

**Attach before running:**
- The chunk directory path (`labs/chunks/{lab-name}/`)
- The tech spec (`labs/specs/{lab-name}-tech-spec.md`) — for accuracy verification only

The agent scores every chunk (not a sample) against five criteria and produces a PASS / REVISE / FAIL verdict per chunk with specific, actionable revision guidance.

Output saves to `labs/reports/{lab-name}/{lab-name}-chunk-eval-v{N}.md`.

Chunks marked PASS or REVISE (minor) are ready for indexing. Any FAIL requires revision and a re-run.
