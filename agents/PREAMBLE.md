# Shared Preamble for All Agents

This file contains the standard Foundation, conventions, and formatting used across all agents. Include the relevant sections below in your agent definition to avoid duplication.

---

## Standard Foundation

Copy this into every new agent:

> Read the [Instructional Design Rulebook](../standards/instructional-design-rulebook.md) before starting. Every decision you make must follow the rules defined there. See [sources/research-sources.md](../standards/sources/research-sources.md) for the learning science backing these rules. If anything in this agent definition conflicts with the rulebook, the rulebook takes precedence.
>
> **Optional but recommended:** Enable the `mongodb-learning-design` skill. The skill distills the rulebook into 10 actionable principles. If active, follow both the rulebook AND the skill.

---

## Standard Sections

Every agent uses these three sections to declare inputs and outputs:

### Consumes
- **List format:** bullet list of artifacts or data the agent reads
- **Include source paths** where relevant (e.g., `labs/specs/{lab-name}-tech-spec.md`)
- **Include format** (markdown, JSON, code files, etc.)

### Produces
- **List format:** bullet list of artifacts the agent creates
- **Include output paths** and naming conventions
- **Include format**

### Constraints
- **Format:** "MUST" and "MUST NOT" statements
- **Use imperative language:** each constraint is a rule the agent must follow
- **Examples:**
  - MUST score both dimensions
  - MUST NOT modify files outside the `labs/` directory
  - MUST flag all issues requiring spec revision
  - MUST cite specific rulebook rules when scoring

---

## YAML Frontmatter

All agents begin with this metadata header (do NOT include the preamble reference in frontmatter):

```yaml
---
agent: [agent-name-kebab-case]
role: [Optimizer / Analyst / Learner / Specialist / Orchestrator]
depends_on: [list of upstream agents or empty brackets]
feeds_to: [list of downstream agents or empty brackets]
input_from_agent:
  [optional: specify which agent provides which input]
---
```

**Roles (choose one):**
- **Optimizer:** Creates or transforms artifacts
- **Analyst:** Evaluates artifacts and produces scores/reports
- **Learner:** Simulates learning or completing a task
- **Specialist:** Applies domain expertise to a narrow task
- **Orchestrator:** Delegates to other agents and combines results

---

## Saving Output Files

Most agents save reports or artifacts. Use this naming convention:

```
labs/reports/[lab-name]/[artifact-type]-v[N].md
```

**Rules:**
- Derive `[lab-name]` from the input spec or lab identifier
- Use descriptive `[artifact-type]` (e.g., `spec-quality-eval`, `env-eval`, `chunk-eval`)
- Derive `[N]` by checking for existing versions and incrementing — start at `v1` if none exist
- Always check for previous versions before saving to avoid overwriting

---

## Common Constraint Patterns

Reuse these constraints across agents where applicable:

- **MUST ground all decisions in the rulebook** (for evaluators)
- **MUST NOT read files outside `labs/` directory** (for simulation agents)
- **MUST flag all blocking issues** (for evaluators)
- **MUST cite specific rulebook rules when scoring** (for evaluators)
- **MUST NOT suppress MongoDB knowledge** (for learners simulating zero-knowledge state — reframe as "MUST flag when drawing on external knowledge")
- **MUST distinguish between provided input and independent reasoning** (for experiment agents)

---

## Template Structure

Use this structure for agent definitions to keep them consistent and scannable:

```
---
agent: [name]
role: [role]
depends_on: [list]
feeds_to: [list]
---

# Agent: [Name]

## Foundation
[Include Standard Foundation from above, or reference it]

## Role
[2–3 sentences describing what this agent does uniquely]

## Consumes
[Agent-specific inputs]

## Produces
[Agent-specific outputs and naming conventions]

## Constraints
[Agent-specific rules and requirements]

[The rest: unique behaviors, task description, inputs/outputs, etc.]
```

---

## Consolidation Checklist

When creating or updating an agent definition:

- [ ] Does it include or reference the Standard Foundation?
- [ ] Does it have the three standard sections (Consumes, Produces, Constraints)?
- [ ] Are constraints written in imperative "MUST" / "MUST NOT" language?
- [ ] Does the YAML frontmatter include agent name, role, dependencies, and output destinations?
- [ ] Are output paths using the standard naming convention?
- [ ] Is the total length reasonable for the agent's scope? (aim for 100–150 lines for focused agents)
- [ ] Could any duplicated language be moved to this preamble?

