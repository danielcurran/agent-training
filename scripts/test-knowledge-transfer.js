#!/usr/bin/env node
/**
 * test-knowledge-transfer.js
 *
 * Tests whether an agent with injected KNOWLEDGE.json achieves the same
 * transfer task performance as an agent that completed the full lab.
 *
 * Workflow:
 * 1. Load KNOWLEDGE.json from esr-indexing-strategy
 * 2. Format knowledge context for injection
 * 3. Present the transfer task questions
 * 4. Save response in a format comparable to learner agent output
 * 5. Ready for scoring with /score-transfer-task
 *
 * Usage:
 *   node scripts/test-knowledge-transfer.js
 *   node scripts/test-knowledge-transfer.js --interactive
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const KNOWLEDGE_PATH = path.join(__dirname, '..', 'lab-test-env', 'esr-indexing-strategy', 'KNOWLEDGE.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'labs', 'reports', 'knowledge-transfer-test');
const TRANSFER_TASK = `
## Transfer Task

**Domain:** Hospital appointment scheduling system (no overlap with the product catalog domain used in this lab)

**Problem:** A hospital app runs this query thousands of times per day:

\`\`\`javascript
db.appointments.find({
  doctorId: "dr-smith",
  appointmentDate: { $gte: new Date("2026-05-01"), $lte: new Date("2026-05-31") }
}).sort({ urgency: -1 })
\`\`\`

The \`appointments\` collection has 500,000 documents. The query currently takes 800ms.

Answer the following in order:

**1. SQL instinct:** What would a SQL developer likely do when indexing this query? Name the specific column order they would choose and why.

**2. MongoDB failure mode:** What does that SQL-instinct index produce in MongoDB's query execution plan? Name the specific execution stage it introduces and explain why.

**3. ESR solution:** Design the optimal ESR index. Classify each field as E, S, or R, state the field order, and explain why placing sort before range eliminates the execution stage you named above.

**4. Explain output:** State what the explain output looks like before and after your index is applied.
`;

// ─── Load knowledge ────────────────────────────────────────────────────────

function loadKnowledge() {
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.error(`✗ KNOWLEDGE.json not found at ${KNOWLEDGE_PATH}`);
    console.error('  Run the ESR lab first: /run-learner-agent with lab name: esr-indexing-strategy');
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`✗ Failed to parse KNOWLEDGE.json: ${err.message}`);
    process.exit(1);
  }
}

// ─── Format knowledge context ────────────────────────────────────────────────

function formatKnowledgeContext(entries) {
  const lines = [
    '─'.repeat(70),
    'PRIOR KNOWLEDGE CONTEXT (Injected)',
    '─'.repeat(70),
    ''
  ];

  entries.forEach((entry, i) => {
    lines.push(`${i + 1}. ${entry.concept} [${entry.confidence}]`);
    lines.push(`   SQL instinct: ${entry.sql_instinct_overridden}`);
    lines.push(`   Rule: ${entry.rule}`);
    lines.push(`   When to apply: ${entry.when_to_apply}`);
    if (entry.source_check) {
      lines.push(`   Validated by: ${entry.source_check}`);
    }
    lines.push('');
  });

  lines.push('─'.repeat(70));
  lines.push('');

  return lines.join('\n');
}

// ─── Create test output document ───────────────────────────────────────────

function createTestReport(knowledge, responses) {
  const timestamp = new Date().toISOString();

  const report = `# Knowledge Transfer Test Report
Date: ${timestamp}
Test Type: Knowledge-Injected Agent (no lab completion)

## Baseline

**Knowledge Source:** \`lab-test-env/esr-indexing-strategy/KNOWLEDGE.json\`
**Entries:** ${knowledge.length}
**All Entries:** Confidence = verified (grounded in lab checks)

---

## Injected Knowledge Context

${formatKnowledgeContext(knowledge)}

---

## Transfer Task

${TRANSFER_TASK}

---

## Agent Response

### 1. SQL Instinct

${responses.sql_instinct || '[Awaiting response]'}

### 2. MongoDB Failure Mode

${responses.failure_mode || '[Awaiting response]'}

### 3. ESR Solution

${responses.esr_solution || '[Awaiting response]'}

### 4. Explain Output

${responses.explain_output || '[Awaiting response]'}

---

## Scoring Rubric

| Dimension | Criterion | Expected | Actual |
|---|---|---|---|
| **Fluency** | Index syntax is correct and error-free | \`{ doctorId: 1, urgency: -1, appointmentDate: 1 }\` | ? |
| **Induction** | Field order justified by E/S/R roles; not by analogy | Identifies E=doctorId, S=urgency, R=appointmentDate | ? |
| **Sense-Making** | Names SQL instinct + MongoDB SORT stage + ESR reasoning | Compares SQL approach to MongoDB execution plan | ? |

**Passing bar:** Fluency ✓, Induction ✓, Sense-Making ✓ (all three).

---

## Next Steps

1. **Manual scoring:** Compare this response to an agent's response after completing the full lab
2. **Automated scoring:** Run both through \`/score-transfer-task\` and compare KLI hypothesis verdicts
3. **Analysis:** Identify gaps between knowledge-injected and full-lab performance
`;

  return report;
}

// ─── Main ─────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const interactive = args.includes('--interactive');

  console.log('=== Knowledge Transfer Test Harness ===\n');

  // Load knowledge
  console.log('Loading KNOWLEDGE.json...');
  const knowledge = loadKnowledge();
  console.log(`✓ Loaded ${knowledge.length} verified knowledge entries\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Create initial report with knowledge context and transfer task
  const responses = interactive
    ? {
        sql_instinct: '[User to provide response]',
        failure_mode: '[User to provide response]',
        esr_solution: '[User to provide response]',
        explain_output: '[User to provide response]'
      }
    : {
        sql_instinct: '[Placeholder — ready for agent response]',
        failure_mode: '[Placeholder — ready for agent response]',
        esr_solution: '[Placeholder — ready for agent response]',
        explain_output: '[Placeholder — ready for agent response]'
      };

  const report = createTestReport(knowledge, responses);

  // Save report
  const outputPath = path.join(OUTPUT_DIR, 'knowledge-transfer-test.md');
  fs.writeFileSync(outputPath, report, 'utf8');
  console.log(`\n✓ Test report created: ${outputPath}\n`);

  // Print knowledge context
  console.log(formatKnowledgeContext(knowledge));

  // Print transfer task
  console.log('TRANSFER TASK (from ESR lab spec)');
  console.log(TRANSFER_TASK);

  // Instructions
  console.log('\n' + '='.repeat(70));
  console.log('NEXT STEPS');
  console.log('='.repeat(70));
  console.log(`
1. **Review the injected knowledge** above and the transfer task.

2. **Have an agent respond to the transfer task** using only the injected knowledge context.
   - In Copilot Chat, you can:
     a) Copy the knowledge context + transfer task
     b) Ask an agent to answer questions 1–4
     c) Paste the response into the test report

3. **Edit the test report** at: ${outputPath}
   - Replace "[Placeholder — ready for agent response]" with actual agent responses

4. **Compare to full-lab response** by:
   - Running the same transfer task after completing the full ESR lab
   - Scoring both with /score-transfer-task
   - Comparing KLI hypothesis verdicts (Fluency, Induction, Sense-Making)

5. **Hypothesis testing:**
   - If knowledge-injected matches full-lab on all KLI dimensions → knowledge is sufficient
   - If knowledge-injected < full-lab on Sense-Making → procedural experience adds value
  `);

  console.log(`Report location: ${outputPath}`);
  console.log('\nEdit the report and update responses, then compare scores.\n');
}

main();
