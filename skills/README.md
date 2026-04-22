# Custom Skills for Agent Training

This directory contains custom skills that extend Claude's capabilities for use in the agent-training repository.

## What are Skills?

Skills are folders of instructions that Claude loads dynamically to improve performance on specialized tasks. Each skill teaches Claude how to complete specific tasks in a repeatable way.

## Skill Structure

Each skill is a folder containing:
- **SKILL.md** — The skill definition with YAML frontmatter and instructions

Example:
```
skills/
├── template/
│   └── SKILL.md
└── README.md
```

## Using Skills

### In Claude.ai
1. Open the Skills interface
2. Upload the skill folder or individual `SKILL.md` file
3. Activate the skill for your chat session
4. Reference it by name when asking Claude for help

### In Claude Code
After installing a skill, reference it directly:
- "Use the [skill-name] skill to help me with..."
- Claude will automatically apply the skill's instructions

### Via Claude API
Include skills in your API requests when calling Claude's models.

## Creating New Skills

1. Copy the `template/` folder
2. Rename it to your skill name (use hyphens for spaces: `my-skill`)
3. Edit `SKILL.md`:
   - Update the YAML frontmatter (`name` and `description`)
   - Replace the content with your skill's instructions
4. Add your skill-specific instructions, examples, and guidelines

## Template Skill

Start with `template/SKILL.md` which contains:
- Full documentation of the skill format
- Multiple pattern examples
- Best practices for skill creation
- Tips for effective skills

## Current Skills in This Repository

| Skill | Description |
|---|---|
| `template/` | Template and examples for creating new skills |
| `mongodb-learning-design/` | Core principles for designing effective MongoDB training labs and learning experiences |

## Adding New Skills

To create a new skill:

```bash
mkdir skills/my-new-skill
cp skills/template/SKILL.md skills/my-new-skill/SKILL.md
# Edit skills/my-new-skill/SKILL.md
```

Then update this README to list your new skill.

## Resources

- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Agent Skills Specification](https://agentskills.io/)

## Best Practices

- **Skill focus**: Each skill should teach one coherent area of expertise
- **Clear instructions**: Write specific, actionable instructions
- **Examples**: Include concrete examples of expected behavior
- **Testing**: Test your skill with Claude to verify it works as intended
- **Documentation**: Keep your skill's purpose and guidelines clear

## Questions?

Refer to the `template/SKILL.md` file for detailed guidance on skill creation and structure.
