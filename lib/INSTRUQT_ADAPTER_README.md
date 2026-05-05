# Instruqt Integration Architecture

## Overview

The learner agent integration with Instruqt Labs allows your learner.md agent to complete MongoDB training labs hosted on the Instruqt platform. The architecture bridges your local agent workflow with Instruqt's cloud-based lab environments.

```
┌─────────────────────────────────────┐
│   Learner Agent (learner.md)        │
│   - Completes stages sequentially   │
│   - Records learning progress       │
│   - Generates learning reports      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Run Script (run-learner-instruqt) │
│   - Orchestrates stage execution    │
│   - Maps challenges to stages       │
│   - Manages report generation       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Instruqt Adapter (instruqt.js)    │
│   - API communication               │
│   - Command execution in sandbox    │
│   - File I/O operations             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Instruqt API                      │
│   - Challenge metadata              │
│   - Sandbox command execution       │
│   - File operations                 │
└─────────────────────────────────────┘
```

## Components

### 1. InstruqtAdapter (`lib/instruqt-adapter.js`)

**Purpose:** Handles all communication with the Instruqt API

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `request()` | Low-level HTTPS communication with Instruqt API |
| `getEnvironment()` | Get challenge sandbox metadata |
| `executeCommand()` | Run a command in the sandbox |
| `readFile()` | Read a file from the sandbox |
| `writeFile()` | Write a file to the sandbox |
| `listChallenges()` | List all challenges in a track |
| `getChallengeDetails()` | Get challenge metadata |
| `mapStagesToChallenges()` | Auto-discover and map stages |
| `checkChallengeStatus()` | Check if a challenge is completed |

**Example Usage:**

```javascript
const InstruqtAdapter = require('./lib/instruqt-adapter');

const adapter = new InstruqtAdapter(apiToken, trackSlug);

// Map challenges
const stages = await adapter.mapStagesToChallenges();

// Execute command
const result = await adapter.executeCommand(challengeId, 'npm run check:dal');
console.log(result.stdout);

// Read file
const reflection = await adapter.readFile(challengeId, 'REFLECTION.md');
```

### 2. Run Script (`scripts/run-learner-instruqt.js`)

**Purpose:** Orchestrates the complete learner workflow with Instruqt

**Key Class:** `InstruqtLearnerRunner`

**Workflow:**

1. Initialize adapter with track slug and API token
2. Discover and map all challenges to learner stages
3. Verify environment connectivity
4. For each stage:
   - Read challenge instructions
   - Execute setup (first stage only)
   - Run validation checks
   - Capture MongoDB evidence
   - Record pass/fail status
   - Extract reflection artifacts
5. Generate learning report in standard format
6. Save to `labs/reports/[lab-name]/[lab-name]-env-eval-v[N].md`

**Example Usage:**

```bash
INSTRUQT_API_TOKEN=abc123 node scripts/run-learner-instruqt.js iizqgagh2ab4 memory-for-ai
```

### 3. Quick-Start Shell Script (`scripts/run-learner.sh`)

**Purpose:** Convenient wrapper for running the learner agent

**Features:**

- Loads environment variables from `.env`
- Validates required parameters
- Provides helpful error messages
- Locates and displays generated report

**Example Usage:**

```bash
source .env
./scripts/run-learner.sh iizqgagh2ab4 memory-for-ai
```

## Data Flow

### Stage Execution Flow

```
┌─────────────────────────┐
│ Start Stage             │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Get Challenge Details   │
│ (title, description)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Is First Stage?         │
└────┬────────────────┬───┘
     │ Yes            │ No
     ▼                ▼
  npm install    npm run check:[stage]
  npm run seed
     │                │
     └────────┬───────┘
              ▼
         ┌─────────────────────────┐
         │ Capture Command Output  │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │ Check: Passed? Failed?  │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │ Read Reflection Files   │
         │ (*.md artifacts)        │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │ Record Stage Summary    │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────┐
         │ Continue to Next Stage? │
         └─────────────────────────┘
```

### Report Generation

```
All Stages Complete
        │
        ▼
Collect Metadata
├─ Start date
├─ Lab name
├─ Learner state
└─ Stage summaries
        │
        ▼
Format Markdown
├─ Lab overview
├─ Stage-by-stage details
├─ Evidence (command output)
├─ Learning concepts
├─ Effectiveness scores
└─ Recommendations
        │
        ▼
Write Report File
└─ labs/reports/[lab]/[lab]-env-eval-v[N].md
```

## Integration Points

### With learner.md Agent

The InstruqtLearnerRunner implements the learner agent workflow:

| Learner Behavior | Implementation |
|------------------|-----------------|
| Read README | Get challenge details from API |
| Orient to task | Call `getChallengeDetails()` |
| Run validation checks | Call `executeCommand('npm run check:...')` |
| Record evidence | Capture stdout from validation commands |
| Create artifacts | Call `readFile()` for .md files |
| Generate report | Compile learner report format |

### With lab-test-env Labs

While designed for Instruqt, the adapter can support local labs too:

```javascript
// Could extend to local Docker Compose environments
async executeCommandLocal(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}
```

## API Reference

### InstruqtAdapter

```javascript
class InstruqtAdapter {
  constructor(apiToken, trackSlug)
  
  // Core operations
  async request(method, path, body)
  async executeCommand(challengeId, command, options)
  
  // Challenge operations
  async getEnvironment(challengeId)
  async listChallenges()
  async getChallengeDetails(challengeId)
  async checkChallengeStatus(challengeId)
  
  // File operations
  async readFile(challengeId, filePath)
  async writeFile(challengeId, filePath, content)
  
  // Utility
  async mapStagesToChallenges()
}
```

### InstruqtLearnerRunner

```javascript
class InstruqtLearnerRunner {
  constructor(trackSlug, labName, apiToken)
  
  async run()                        // Main entry point
  async completeStage(mapping)       // Execute one stage
  async generateReport()             // Create learning report
}
```

## Configuration

### Environment Variables

```bash
INSTRUQT_API_TOKEN    # Required: API token from Instruqt
LAB_OUTPUT_DIR        # Optional: Where to save reports
DEBUG                 # Optional: Enable debug output
```

### Stage Mapping

Configure in `instruqt-adapter.js`:

```javascript
const stageOrder = ['schema', 'dal', 'vector', 'final', 'reflection'];
```

Challenges are matched by slug. If your challenges don't follow this naming, customize the mapping.

### Timeouts

Configure in `run-learner-instruqt.js`:

```javascript
const timeout = options.timeout || 30000; // milliseconds
```

Increase for slower labs or networks.

## Error Handling

### API Errors

```
Error: Instruqt API error (401): Unauthorized
→ Check INSTRUQT_API_TOKEN is valid

Error: Instruqt API error (404): Track not found
→ Check track slug is correct

Error: Command execution failed: Connection timeout
→ Increase timeout or check network
```

### Sandbox Errors

```
Error: npm install failed
→ Check package.json exists in challenge
→ Check Node.js is installed in sandbox

Error: npm run check:dal failed
→ Check script exists in package.json
→ Check MongoDB is running
```

## Extending the Adapter

### Add Support for PUT/PATCH

```javascript
async updateChallenge(challengeId, updates) {
  return await this.request('PATCH', `/challenges/${challengeId}`, updates);
}
```

### Add Support for Local Labs

```javascript
class LocalLabAdapter extends InstruqtAdapter {
  async executeCommand(labPath, command) {
    // Run locally with exec() instead of API
  }
}
```

### Add Custom Stage Logic

```javascript
async completeCustomStage(mapping) {
  // Override completeStage for special handling
}
```

## Debugging

### Enable Debug Output

```bash
DEBUG=instruqt:* INSTRUQT_API_TOKEN=... node scripts/run-learner-instruqt.js ...
```

### Check API Calls

Add logging to `instruqt-adapter.js`:

```javascript
async request(method, path, body) {
  console.log(`[API] ${method} ${path}`);
  if (body) console.log(`[BODY] ${JSON.stringify(body)}`);
  // ... rest of method
}
```

### Verify Track Setup

```bash
node -e "
const InstruqtAdapter = require('./lib/instruqt-adapter');
const adapter = new InstruqtAdapter(process.env.INSTRUQT_API_TOKEN, 'iizqgagh2ab4');
adapter.listChallenges().then(ch => console.log(JSON.stringify(ch, null, 2)));
"
```

## Performance Considerations

- **API Rate Limits:** Instruqt has rate limits. Avoid rapid repeated calls.
- **Sandbox Startup:** First command on a challenge may take 5-10s to initialize sandbox
- **Command Timeouts:** Long-running operations should increase timeout
- **Parallel Execution:** Could parallelize independent stages (not implemented yet)

## Security

- **API Token:** Store in environment variables, never commit to git
- **Credentials:** Don't log API tokens or responses
- **Sandbox Isolation:** Each challenge has isolated filesystem
- **API Access:** Token should have minimal necessary permissions

---

For usage examples, see [INSTRUQT_INTEGRATION.md](../docs/INSTRUQT_INTEGRATION.md)
