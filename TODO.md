# Agent Training Repository TODO

## Lab Enhancements

### Builder Badge
- [ ] Add optional performance comparison challenges (query speed with/without indexes)
- [ ] Add production deployment mini-stage (indexing, monitoring, optimization)

## Infrastructure & Tooling

- [x] **Create new agent: Lab Learner Quality Assessor** — Merged into Lab Instruction Evaluator (3-pass evaluation covering spec quality + learner experience)
- [x] **Merge evaluators** — Combined Lab Instruction Evaluator and Lab Learner Quality Assessor into single 3-pass agent (`agents/lab-instruction-evaluator.md`)
- [ ] Set up GitHub Actions CI/CD: run `npm run check:all` on PR
- [ ] Document how to add new agents to `.github/prompts/`
- [ ] Create GitHub issue templates for lab creation workflow
- [ ] Add pre-commit hooks to validate lab structure before commit

## Documentation

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

- [ ] **Research: SQL background for external agents** — Investigate whether external agents have SQL foundational knowledge; determine if SQL comparisons are necessary for labs targeting zero-MongoDB-knowledge learners
- [ ] Study learner feedback from completed labs to identify pain points

## Long-Term Vision

- [ ] Establish lab certification program
- [ ] Open-source this framework for community-contributed labs
