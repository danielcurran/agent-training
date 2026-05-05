# Running Learner Agent Against Instruqt Labs

This guide explains how to run your learner.md agent against your existing Instruqt labs.

## Prerequisites

- Instruqt account with lab tracks already created
- Instruqt API token (with read/write access to your tracks)
- Node.js 14+ installed locally
- Your lab tracks structured with challenges (stages) and validation scripts

## Setup

### 1. Get Your Instruqt API Token

1. Go to https://instruqt.com/dashboard
2. Click your profile → **API Tokens**
3. Click **New API Token**
4. Name it (e.g., "Learner Agent")
5. Copy the token — you'll use it in the next step

**Security:** Store this token safely. Use environment variables or secrets management, never commit it to git.

### 2. Install Dependencies

```bash
cd /path/to/agent-training
npm install
```

If `package.json` doesn't exist yet, create it:

```bash
npm init -y
```

### 3. Run the Learner Agent

**Command:**
```bash
INSTRUQT_API_TOKEN=your_api_token node scripts/run-learner-instruqt.js TRACK_SLUG LAB_NAME
```

**Example:**
```bash
INSTRUQT_API_TOKEN=a1b2c3d4e5f6 node scripts/run-learner-instruqt.js iizqgagh2ab4 memory-for-ai
```

**Parameters:**
- `TRACK_SLUG` — Your Instruqt track ID (e.g., `iizqgagh2ab4`)
- `LAB_NAME` — Name for your lab report (e.g., `memory-for-ai`)

**Output:**
- Learning report saved to: `labs/reports/[LAB_NAME]/[LAB_NAME]-env-eval-v1.md`
- (subsequent runs increment version: v2, v3, etc.)

---

## How It Works

The learner agent uses the Instruqt API to:

1. **Map challenges to stages** — Automatically discovers your Instruqt challenges and maps them to learner stages (schema, dal, vector, final, reflection)

2. **Execute setup** (first stage only):
   - `npm install` — Install dependencies
   - `npm run seed` — Load initial data

3. **Complete each stage**:
   - Read challenge instructions
   - Run validation checks (e.g., `npm run check:dal`)
   - Capture MongoDB command outputs as evidence
   - Record pass/fail status

4. **Generate report** — Creates a learning report following the standard format:
   - Stage-by-stage summary with evidence
   - MongoDB concepts learned
   - Learning effectiveness scores
   - Recommendations for spec improvements

---

## Instruqt Challenge Structure

Your Instruqt track should have challenges with these features:

### Challenge Configuration

Each challenge should have:

```yaml
title: "Stage Name (e.g., DAL Implementation)"
description: "Instructions for completing this stage"
notes: "Additional context (optional)"
```

### Validation Scripts

Each challenge should include npm scripts:

```bash
npm run check:schema    # For schema design stage
npm run check:dal       # For data access layer stage
npm run check:vector    # For vector/embedding stage
npm run check:final     # For final validation
npm run check:reflection # For reflection/debrief
```

The learner agent runs these automatically and captures output as evidence.

### Reflection Artifacts

If your lab creates reflection files, the learner agent will capture them:

- `REFLECTION.md` — General stage reflection
- `SCHEMA_NOTES.md` — Schema decisions
- `DAL_NOTES.md` — DAL implementation notes
- `INDEX_DECISIONS.md` — Indexing strategy notes

These are included in the learning report.

---

## Example Workflow

### Step 1: Run learner agent on your track

```bash
INSTRUQT_API_TOKEN=a1b2c3d4e5f6 node scripts/run-learner-instruqt.js iizqgagh2ab4 memory-for-ai
```

### Step 2: Monitor progress

The agent will print output like:

```
📚 Starting Learner Agent on Instruqt track: iizqgagh2ab4
   Lab: memory-for-ai
   Date: 2026-05-05T...

▶️  Mapping Instruqt challenges to learner stages...
✓ Found 5 stages:

  Stage 1: schema → "Design the Data Schema"
  Stage 2: dal → "Implement Data Access Layer"
  Stage 3: vector → "Add Vector Embeddings"
  Stage 4: final → "Final Integration"
  Stage 5: reflection → "Reflect on Learning"

▶️  Verifying Instruqt environment setup...
✓ Environment verified. Ready to start.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 1: SCHEMA — "Design the Data Schema"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶️  Reading challenge instructions...
   Goal: Design the Data Schema
   Instructions: Create a MongoDB schema...

▶️  Setting up environment (first stage)...
   Running: npm install
   ✓ Success
   Running: npm run seed
   ✓ Success

▶️  Running stage validation check...
   Running: npm run check:schema
   ✓ Check passed

✓ Stage 1 complete (1 attempt)
...
```

### Step 3: Review the report

```bash
cat labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
```

---

## Troubleshooting

### "API Error 401: Unauthorized"

- Check your API token is correct
- Verify token hasn't expired
- Generate a new token if needed

### "API Error 404: Track not found"

- Verify the track slug is correct
- Go to your Instruqt track URL and copy the ID from the URL

### "Command execution failed"

- Ensure your npm scripts exist in the challenge environment
- Verify `package.json` has the correct scripts defined
- Check that `npm install` ran successfully in stage 1

### "Failed to map stages"

- Make sure challenges exist in your track
- Verify challenge slugs contain standard stage names (`schema`, `dal`, `vector`, `final`, `reflection`)
- If using custom names, you can manually edit the mapping in the adapter

---

## Customization

### Change Stage Mapping

If your challenges have different names, edit [instruqt-adapter.js](../lib/instruqt-adapter.js):

```javascript
async mapStagesToChallenges() {
  const stageOrder = ['schema', 'dal', 'vector', 'final', 'reflection']; // Edit this
  // ... rest of mapping logic
}
```

### Adjust Timeouts

If commands take longer than 30 seconds, edit [run-learner-instruqt.js](../scripts/run-learner-instruqt.js):

```javascript
async executeCommand(challengeId, command, options = {}) {
  const timeout = options.timeout || 60000; // Change to 60s
  // ...
}
```

### Capture Different Files

If your lab creates different reflection files, edit the file list in `completeStage()`:

```javascript
const reflectionFiles = ['REFLECTION.md', 'CUSTOM_FILE.md', 'ANOTHER_FILE.md'];
```

---

## Next Steps

1. **Run against all your tracks** — Generate baseline reports for each lab
2. **Review reports** — Check for stages with low effectiveness scores
3. **Iterate specs** — Use learner feedback to improve lab design
4. **Compare versions** — Re-run after revisions to measure improvement (v1, v2, v3, etc.)

---

## API Reference

### InstruqtAdapter Methods

```javascript
// Get challenge metadata
await adapter.getEnvironment(challengeId)
await adapter.getChallengeDetails(challengeId)

// Execute commands in sandbox
await adapter.executeCommand(challengeId, 'npm run check:dal')

// File operations
await adapter.readFile(challengeId, 'REFLECTION.md')
await adapter.writeFile(challengeId, 'output.txt', 'content')

// Track exploration
await adapter.listChallenges()
await adapter.mapStagesToChallenges()

// Status checking
await adapter.checkChallengeStatus(challengeId)
```

---

## Limitations & Notes

- **Read-only API calls** — Currently uses GET/POST. PUT/PATCH not implemented (for modifying challenges).
- **Sandbox isolation** — Each challenge has its own sandbox; files don't persist between challenges unless they're checked into version control in the track.
- **Timeout handling** — Commands that take longer than the configured timeout will fail. Adjust as needed.
- **No web UI automation** — This uses the API directly, not browser automation. Faster and more reliable.

---

For questions or issues, review:
- [learner.md](../agents/learner.md) — Agent behaviors and expectations
- [instructional-design-rulebook.md](../standards/instructional-design-rulebook.md) — What makes a good lab
