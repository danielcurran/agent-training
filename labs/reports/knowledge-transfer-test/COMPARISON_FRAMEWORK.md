# Knowledge Injection vs. Lab Completion: Comparative Study

**Objective:** Determine whether injecting KNOWLEDGE.json into a fresh agent produces equivalent learning outcomes to having an agent complete the lab step-by-step.

**Study Design:** Two-condition comparison with identical transfer task scoring

---

## The Question

> **Does a fresh agent with injected KNOWLEDGE.json achieve the same transfer task performance as an agent that completed the full lab?**

This tests whether procedural experience (running through all lab stages, failing and correcting, running checks) adds value beyond declarative knowledge (extracted rules in KNOWLEDGE.json).

---

## Experimental Design

### Condition 1: Knowledge Injection (✓ Complete)

**Method:**
1. Start with fresh agent (no lab experience)
2. Load KNOWLEDGE.json from completed ESR lab (5 verified entries)
3. Inject knowledge as context block before transfer task
4. Agent answers transfer task with only injected knowledge

**Result:** 
- Transfer task score: **Fluency ✓, Induction ✓, Sense-Making ✓** (3/3 KLI)
- Location: `labs/reports/knowledge-transfer-test/knowledge-transfer-test.md`

---

### Condition 2: Lab Completion (⏳ Pending)

**Method:**
1. Start with fresh agent (no prior knowledge)
2. Have agent complete full ESR lab (all 5 stages)
   - Stage 1: Identify query patterns (E/S/R)
   - Stage 2: Design indexes
   - Stage 3: Run explain() to verify
   - Stage 4: Document decisions
   - Stage 5: Reflection
3. At end of lab, present same transfer task
4. Agent answers transfer task after procedural experience

**Next Steps:**
```bash
# In Copilot Chat: /run-learner-agent
# Lab name: esr-indexing-strategy
# This will generate: labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-vN.md
# Extract transfer task response from the learning report
```

---

## Transfer Task (Same for Both Conditions)

**Domain:** Hospital appointment scheduling (novel domain, different from lab's product catalog)

**Query:**
```javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
```

**Four questions:**
1. SQL instinct: What approach would a SQL developer take?
2. MongoDB failure mode: What execution stage results?
3. ESR solution: Design optimal index + justify field order
4. Explain output: Before/after performance metrics

**Scoring:** KLI dimensions (Fluency, Induction, Sense-Making) via `/score-transfer-task`

---

## Comparison Framework

### What We're Measuring

| Aspect | Knowledge Injection | Lab Completion | Interpretation |
|---|---|---|---|
| **Fluency** | Index syntax correct? | Index syntax correct? | If equal → declarative knowledge covers syntax |
| **Induction** | Can apply E/S/R to novel domain? | Can apply E/S/R to novel domain? | If equal → rules transfer without procedural experience |
| **Sense-Making** | Can explain WHY field order matters? | Can explain WHY field order matters? | If equal → understanding achieved; if different → procedural adds confidence |

### Success Criteria

**Hypothesis: Knowledge is sufficient**
- ✓ All KLI scores match between conditions
- ✓ Agent answers all 4 questions identically or near-identically
- ✓ No substantive gaps between injected knowledge and lab experience

**Hypothesis: Procedure adds value**
- ✗ KLI scores differ, especially on Sense-Making
- ✗ Lab agent provides additional details (e.g., "I saw SORT stage drop from 27ms to 11ms")
- ✗ Lab agent shows confidence about failure modes through first-hand observation

**Hypothesis: Hybrid (both necessary)**
- ◐ Fluency and Induction match, Sense-Making differs
- ◐ Lab agent more confident about tradeoffs from having tried different approaches
- ◐ Knowledge provides foundation; procedure provides validation

---

## Current Status

| Condition | Status | Result |
|---|---|---|
| **Knowledge Injection** | ✓ Complete | 3/3 KLI (Fluency ✓, Induction ✓, Sense-Making ✓) |
| **Lab Completion** | ⏳ Pending | Awaiting `/run-learner-agent` execution |
| **Comparison Analysis** | ⏳ Pending | Ready after both conditions scored |

---

## Next Steps (Simple Sequence)

### Step 1: Run Lab Agent (5-10 min)
```bash
# In Copilot Chat: /run-learner-agent
# Input: lab name = "esr-indexing-strategy"
# Output: Learning report with transfer task response
```

### Step 2: Extract Lab Response (2 min)
- Find transfer task section in new learning report
- Copy agent's 4 answers to the same questions

### Step 3: Score Both Responses (10 min)
```bash
# In Copilot Chat: /score-transfer-task
# First scoring pass: Knowledge-injected response
# Second scoring pass: Lab completion response
# Compare KLI verdicts
```

### Step 4: Analyze Results (5 min)
- Do all three KLI dimensions match?
- Where do responses differ?
- Does lab agent cite procedural observations ("I ran explain() and saw...")?

---

## What Success Looks Like

### If Knowledge is Sufficient

**Evidence:**
- Knowledge-injected: "ESR index is {doctorId: 1, urgency: -1, appointmentDate: 1}"
- Lab agent: "ESR index is {doctorId: 1, urgency: -1, appointmentDate: 1}"
- Both score 3/3 KLI

**Implication:** KNOWLEDGE.json alone is sufficient for transfer. Lab completion adds minimal value.

### If Procedure Adds Value

**Evidence:**
- Knowledge-injected: "Urgency before range because MongoDB traverses left-to-right" (from rules)
- Lab agent: "I created {status: 1, price: 1, rating: -1} and saw SORT stage. Then {status: 1, rating: -1, price: 1} eliminated it. That's why field order matters." (from experience)
- Lab agent scores higher on Sense-Making

**Implication:** Procedural experience (running explain(), seeing changes, iterating) provides deeper understanding than declarative knowledge alone.

---

## Key Questions Answered by This Comparison

1. **Are lab stages necessary?** 
   - If knowledge-only matches → No, knowledge extraction sufficient
   - If knowledge-only < lab → Yes, procedural experience matters

2. **What's the minimum viable knowledge artifact?**
   - If 5 verified entries suffice → KNOWLEDGE.json schema is effective
   - If agent needs more → Schema needs refinement

3. **Does explain() matter?**
   - If lab agent cites actual explain() output → Procedural observation adds value
   - If lab agent generalizes from rules → Conceptual understanding sufficient

4. **Can knowledge transfer to novel domains?**
   - Both conditions answer hospital appointment question → Cross-domain transfer validated

---

## Files to Compare

| File | Purpose |
|---|---|
| `labs/reports/knowledge-transfer-test/knowledge-transfer-test.md` | Knowledge-injected condition (complete) |
| `labs/reports/esr-indexing-strategy/esr-indexing-strategy-env-eval-vN.md` | Lab completion condition (pending) |
| (Transfer task responses extracted from both) | Side-by-side comparison data |

---

## Summary

This is a **clean A/B comparison** of two learning strategies:

- **A (Knowledge injection):** Extract rules → inject into agent → test transfer
- **B (Lab procedure):** Have agent run through stages → test transfer

Both get the same novel problem. The question is simply: **Are the outcomes equivalent?**

Status: **A is complete, B pending, ready to compare.**
