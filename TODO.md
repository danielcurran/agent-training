# Agent Training Repository TODO

## Lab Enhancements

### Builder Badge
- [ ] Add optional performance comparison challenges (query speed with/without indexes)
- [ ] Add production deployment mini-stage (indexing, monitoring, optimization)

## Infrastructure & Tooling

- [ ] Set up GitHub Actions CI/CD: run `npm run check:all` on PR
- [ ] Document how to add new agents to `.github/prompts/`
- [ ] Create GitHub issue templates for lab creation workflow
- [ ] Add pre-commit hooks to validate lab structure before commit
- [ ] **Create new agent: Tech Spec Buildability Assessor** — Reviews tech specs for completeness, clarity, and external agent buildability; generates report on spec quality from lab environment builder perspective

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

## Research & Knowledge Base

- [ ] **Research: SQL background for external agents** — Investigate whether external agents have SQL foundational knowledge; determine if SQL comparisons are necessary for labs targeting zero-MongoDB-knowledge learners
- [ ] Study learner feedback from completed labs to identify pain points

## Long-Term Vision

- [ ] Establish lab certification program
- [ ] Open-source this framework for community-contributed labs
