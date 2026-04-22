# Using Skills with Agents

This guide explains how to set up Claude to automatically apply the `mongodb-learning-design` skill when using agents in this repository.

## Quick Setup (Recommended)

### In Claude.ai
1. Open [Claude.ai](https://claude.ai)
2. Start a new conversation
3. Click **Skills** (or use the sidebar menu)
4. Upload or add the skill:
   - Option A: Paste the contents of `skills/mongodb-learning-design/SKILL.md`
   - Option B: If your workspace supports skill sharing, import from this repository
5. Activate the `mongodb-learning-design` skill
6. Now when you use any `/command` prompt, the skill will be active

### In Claude Code
1. In Claude Code, click **Skills** (usually in the left sidebar)
2. Search for or upload `mongodb-learning-design`
3. Install the skill
4. The skill will be available for all subsequent agent invocations

### Via Claude API
```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    system="You are the Lab Outline Designer agent from the agent-training repository.",
    skills=[
        {
            "name": "mongodb-learning-design",
            "path": "skills/mongodb-learning-design"  # or URL to skill
        }
    ],
    messages=[
        {
            "role": "user",
            "content": "Design a lab on ..."
        }
    ]
)
```

## What Happens When the Skill is Active

When you invoke any agent command (`/design-lab-outline`, `/evaluate-lab-instructions`, etc.) with the `mongodb-learning-design` skill active:

1. ✅ Agent reads the [Instructional Design Rulebook](../standards/instructional-design-rulebook.md) as usual
2. ✅ Skill's 10 principles are added to Claude's context
3. ✅ Agent automatically applies both the rulebook AND the skill's principles
4. ✅ Output quality is enhanced with field-tested learning design guidance

## Agents That Benefit From This Skill

All 5 agents in the repository have been updated to acknowledge and use this skill:

| Agent | Benefit |
|---|---|
| Lab Outline Designer | Designs outlines using core learning principles |
| Lab Outline Converter | Converts outlines with consistent pedagogical structure |
| Lab Instruction Evaluator | Evaluates against learning principles, not just rules |
| Lab Environment Builder | Generates environments that support the learning design |
| Agent Learner | Assesses labs based on learning effectiveness |

## Making It Automatic (Long-term)

To make skill activation truly automatic across sessions:

### Option 1: Claude.ai Settings (Easiest)
1. In Claude.ai, save the skill as part of your workspace configuration
2. Future conversations will auto-load it
3. (Requires Claude.ai workspace/org features)

### Option 2: Custom System Prompt
Create a custom system prompt that includes:
```
You have access to the mongodb-learning-design skill. 
Always apply its principles when working with lab design.
```

### Option 3: API Wrapper
Wrap your API calls to always include the skill:
```python
def design_outline(...):
    skills = [{"name": "mongodb-learning-design"}]
    return invoke_agent("lab-outline-designer", skills=skills, ...)
```

### Option 4: VS Code Extension (Future)
If VS Code Copilot Chat adds skill auto-loading features, this will be automatic.

## Verification

To verify the skill is being used, check the agent's output for:
- ✅ Explicit references to learning principles
- ✅ KLI types mentioned (Memory & Fluency, Induction & Refinement, Sense-Making)
- ✅ Backwards design approach (endpoint → check → stages)
- ✅ Zero-knowledge writing (terms defined on first use)
- ✅ Clear scaffolding strategy per stage

## Troubleshooting

**Q: My agent output doesn't mention the skill's principles.**
A: Verify the skill is activated in your session. In Claude.ai, check the Skills panel.

**Q: I want this to happen automatically without activating each time.**
A: Use Option 2 (custom system prompt) or Option 3 (API wrapper) above.

**Q: Can I embed the skill directly in the agent definition?**
A: Not recommended. Skills and agents serve different purposes. Keep them separate for reusability.

## See Also

- [mongodb-learning-design Skill](../skills/mongodb-learning-design/SKILL.md)
- [Instructional Design Rulebook](../standards/instructional-design-rulebook.md)
- [Agent Definitions](../agents/)
