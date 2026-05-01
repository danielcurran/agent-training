# Agent Training Repository TODO

## Priority: Rulebook Testing

The rulebook has 3 data points (ESR v1, ESR v2, Memory for AI). SQL Bridging hypothesis is the only unresolved hypothesis. The next lab run should be designed to resolve it.

### Resolve SQL Bridging Hypothesis
- [ ] **Run ESR v2 with explicit Rule 3 scaffolding** — Add "name the SQL instinct, explain why it fails here, state the MongoDB approach" prompts to the ESR v2 transfer task. If Sense-Making improves to ✓, SQL Bridging hypothesis is fully supported. If it stays △, revise Rule 3's ✓ bar to accept mechanistic contrast without SQL language.
- [ ] **Update hypothesis-validation.md** after the above run — move Rule 3 from 🔄 Observing to ✓ Confirmed or revise the criterion, based on outcome.

### Expand Evidence Base
- [ ] **Run a 4th lab** from a domain unrelated to indexing or memory (e.g., aggregation pipelines, change streams, schema design) — confirms whether the KLI + SQL bridging + decision record cluster generalises beyond the current two domains.
- [ ] **Resolve Rule 3 ✓ bar ambiguity** — decide: does ✓ require the learner to *name* the SQL instinct, or is mechanistic contrast (without SQL language) sufficient? Document the decision in hypothesis-validation.md.

### New Agents to Test
- [ ] **Test RAG Chunker** on Builder Badge (most complete lab, best candidate for first chunk run)
- [ ] **Test RAG Chunk Evaluator** on Builder Badge chunks
- [ ] Assess chunk quality results and refine chunker agent definition if needed

---

## Lab Enhancements

### Builder Badge
- [ ] Add optional performance comparison challenges (query speed with/without indexes)
- [ ] Add production deployment mini-stage (indexing, monitoring, optimization)

## Infrastructure & Tooling

- [x] **Create new agent: Lab Learner Quality Assessor** — Merged into Lab Instruction Evaluator (3-pass evaluation covering spec quality + learner experience)
- [x] **Merge evaluators** — Combined Lab Instruction Evaluator and Lab Learner Quality Assessor into single 3-pass agent (`agents/lab-instruction-evaluator.md`)
- [x] **Create RAG Chunker agent** — `agents/rag-chunker.md` + `/chunk-lab-content` slash command. Converts validated lab content into semantically self-contained chunks for LLM retrieval.
- [x] **Create RAG Chunk Evaluator agent** — `agents/rag-chunk-evaluator.md` + `/evaluate-lab-chunks` slash command. Scores chunks on 5 criteria; PASS/REVISE/FAIL per chunk.
- [ ] Set up GitHub Actions CI/CD: run `npm run check:all` on PR
- [ ] Document how to add new agents to `.github/prompts/`
- [ ] Create GitHub issue templates for lab creation workflow
- [ ] Add pre-commit hooks to validate lab structure before commit

## Documentation

- [x] **Restructure hypothesis-validation.md** — Renamed "Living Document" to "Research Findings & Hypothesis Validation"; added Purpose, Research Method, per-lab findings with structured layout, Hypothesis Validation Summary table, and Revision Log with update instructions.
- [ ] Add troubleshooting guide for common lab environment issues
- [ ] Document best practices for designing new labs
- [ ] Create quick-start guide for lab authors using the agent workflow
- [ ] Expand [standards/instructional-design-rulebook.md](standards/instructional-design-rulebook.md) with examples from existing labs

## Testing & Validation

- [ ] Automated testing of all lab validation scripts
- [ ] Stress test labs with multiple concurrent learner executions
- [ ] Verify all external dependencies are pinned to compatible versions
- [ ] Create lab environment health check script

## Evaluator Blind Spots (Found: ESR Lab env-eval-v1)

Two categories of issue were approved by the tech spec evaluator and only caught by the learner agent. Both represent structural gaps in what the evaluator checks.

### Blind spot 1: Teach/check semantic consistency
**What happened:** Stage 2 expected index values for query3 (`{ status: 1, price: 1 }`) and query5 (`{ tags: 1, createdAt: -1, rating: 1 }`) include fields absent from those queries' filters and sorts. Strict ESR application of the taught rule produces different answers. The evaluator scored the Stage 2 check scripts ✅ ("validates ESR order, checks field directions, Good validation") because the check was *clearly specified*. It never asked: "can a learner derive this expected value using only what was taught in the preceding stage?"
**Root cause:** Evaluator checks for clarity of the criterion, not consistency between the rule taught and the answer the check expects.
- [ ] Add evaluator pass to cross-check each check script's expected answers against the instructions in the preceding stage. Flag any case where the expected answer requires knowledge not yet introduced.

### Blind spot 2: Achievability of quantitative pass criteria
**What happened:** The tech spec specified `≥50x faster` as the Stage 3 pass criterion. Evaluator scored it ✅ ("Pass Criteria: Clear"). The learner agent ran the check 3× and found it unreachable — on 10K docs all queries run in 10–25ms regardless of index strategy (noise floor), making 50× physically impossible without a sub-millisecond ESR result. The evaluator also noted "10,000 docs is appropriate for performance visibility" — a related miscalibration.
**Root cause:** Evaluator validates that performance criteria are clearly stated, not that they are achievable in the specified environment. No step models whether the math holds (e.g., baseline ÷ threshold = required ESR time; is that realistic?).
- [ ] Add evaluator step for quantitative pass criteria: reason through the math (baseline time estimate ÷ speedup threshold = required target time) and flag criteria where the required target is implausible at the specified dataset size and environment.
- [ ] Fix `check:explain` in ESR lab: replace `speedupRatio >= 50` with `!esrHasSortStage && nonEsrHasSortStage` as the primary pass condition (SORT stage elimination is deterministic and directly validates the ESR concept; timing is not).

## Research & Knowledge Base

- [x] **Memory for AI Applications lab** — Built environment, ran learner (2/2 challenges ✓), scored transfer task (4/4), added findings to hypothesis-validation.md. All three hypotheses supported.
- [x] **Research: SQL background for external agents** — Confirmed through 3 lab runs: SQL instinct is present in learner agents and SQL bridging scaffolding strengthens transfer. See hypothesis-validation.md findings.
- [ ] Study learner feedback from completed labs to identify pain points

## Long-Term Vision

- [ ] Establish lab certification program
- [ ] Open-source this framework for community-contributed labs
