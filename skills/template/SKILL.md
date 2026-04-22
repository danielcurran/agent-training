---
name: template-skill
description: A template skill demonstrating the structure and format for creating custom skills for Claude
---

# Template Skill

This is a template skill that demonstrates the basic structure and format for creating custom skills for use with Claude. Skills are folders of instructions, scripts, and resources that Claude can dynamically load to improve performance on specialized tasks.

## Purpose

Use this template as a starting point when creating new skills. Skills teach Claude how to complete specific tasks in a repeatable way, whether that's:
- Following your organization's specific workflows and procedures
- Using your company's brand guidelines and standards
- Automating personal or professional tasks
- Implementing domain-specific best practices

## Skill Structure

A skill is simply a folder containing:
- **SKILL.md** — The skill definition file (this file) containing YAML frontmatter and instructions

That's all that's required! Optional additions:
- Supporting documentation files
- Code samples or templates
- Reference materials
- Resource links

## SKILL.md Format

Every skill requires:

```yaml
---
name: unique-skill-name
description: Clear description of what this skill does and when to use it
---
```

Followed by markdown content with:
- A title (# Skill Name)
- Purpose/overview
- Instructions and guidelines
- Examples
- Any additional context

## Example Skills

Here are patterns you can follow:

### Pattern 1: Procedural Skill
Teaches Claude a step-by-step process to follow.

```yaml
---
name: brand-compliance
description: Ensures all written content follows company brand guidelines
---

# Brand Compliance Skill

When creating content, always:
1. Use the primary brand color palette (see guidelines below)
2. Follow the brand voice and tone
3. Include proper trademark symbols
4. Verify spelling of all company names
```

### Pattern 2: Domain Expertise Skill
Shares specialized knowledge in a particular field.

```yaml
---
name: mongodb-optimization
description: Teaches MongoDB query optimization and best practices
---

# MongoDB Optimization Skill

When working with MongoDB queries:
- Always index frequently filtered fields
- Use projection to limit returned fields
- Consider the access patterns when designing schemas
```

### Pattern 3: Workflow Skill
Documents a specific workflow or process.

```yaml
---
name: code-review-process
description: Follows your team's code review standards and practices
---

# Code Review Process

Code reviews should verify:
1. Tests are included and passing
2. Performance impact is documented
3. Security considerations are addressed
```

## Best Practices

- **Be specific**: Write clear, actionable instructions
- **Use examples**: Show concrete examples of the expected output
- **Document tradeoffs**: Explain when different approaches are appropriate
- **Keep it focused**: A skill should teach one coherent area of expertise
- **Test it**: Verify Claude follows your skill's instructions correctly

## Tips for Creating Effective Skills

1. **Start with a use case**: Begin by identifying what task or domain you want to teach Claude
2. **Write from experience**: Base instructions on proven workflows and best practices
3. **Be explicit about preferences**: State your preferences clearly (e.g., "Always prefer X over Y because...")
4. **Include guardrails**: Mention important constraints and when not to use certain approaches
5. **Use clear language**: Avoid jargon where possible, or define it clearly when necessary

## Using Your Skill

Once you've created a skill folder with `SKILL.md`:

1. **In Claude.ai**: Upload the skill through the skill interface
2. **In Claude Code**: Install the skill and reference it when asking Claude to help
3. **Via API**: Include the skill in your request to Claude's API

## Organizing Multiple Skills

If you have multiple related skills, organize them in a single folder:

```
my-skills/
├── skill-1/
│   └── SKILL.md
├── skill-2/
│   └── SKILL.md
└── README.md
```

## Example: Your First Custom Skill

Here's a complete minimal skill example:

```yaml
---
name: technical-writing
description: Teaches clear, structured technical writing for API documentation
---

# Technical Writing Skill

When writing technical documentation:

## Structure
- Start with a one-sentence purpose statement
- Add a "Prerequisites" section listing required knowledge
- Include working code examples
- End with a "See Also" section with related resources

## Tone
- Use active voice: "The API returns..." not "It is returned by..."
- Use second person: "You can configure..." not "One can configure..."
- Be direct: Avoid hedging language like "might" or "usually"

## Examples
✓ "Call the `getUserById()` function with a numeric ID to fetch user data."
✗ "The `getUserById()` function might be used to potentially fetch user data if needed."
```

## Resources

- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [How to create custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Agent Skills Specification](https://agentskills.io/)

## Getting Started

1. Copy this template folder
2. Rename it to your skill name (use hyphens for spaces)
3. Edit the YAML frontmatter with your skill's name and description
4. Replace this content with your skill's actual instructions
5. Upload or register your skill with Claude

Good luck creating your custom skill!
