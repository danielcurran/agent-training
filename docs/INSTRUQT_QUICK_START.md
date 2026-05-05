# Instruqt Integration: Quick Start

This guide gets you running your learner agent against Instruqt labs in 5 minutes.

## Prerequisites Check ✓

- [ ] You have an Instruqt account and existing lab tracks
- [ ] You have admin/owner access to generate API tokens
- [ ] Node.js 14+ is installed locally
- [ ] You're in the agent-training directory

## Step 1: Get Your API Token (2 min)

1. Go to: https://instruqt.com/dashboard
2. Click your avatar → **Settings** → **API Tokens**
3. Click **New API Token**
4. Name it: `learner-agent`
5. Copy the token to a safe place

## Step 2: Set Up Environment (1 min)

```bash
# In agent-training directory
cp .env.example .env

# Edit .env with your token
# macOS/Linux:
nano .env

# Windows:
notepad .env
```

Add your token:
```
INSTRUQT_API_TOKEN=your_token_here
```

## Step 3: Run Against Your Lab (1 min)

```bash
# Load environment
source .env

# Run learner agent
./scripts/run-learner.sh YOUR_TRACK_SLUG YOUR_LAB_NAME
```

**Where to find YOUR_TRACK_SLUG:**

Go to your Instruqt lab URL: `https://play.instruqt.com/instruqt/tracks/YOUR_TRACK_SLUG`

**Example:**

```bash
source .env
./scripts/run-learner.sh iizqgagh2ab4 memory-for-ai
```

## Step 4: Review the Report (1 min)

The report will be saved to:
```
labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
```

Open it and review:
- What you learned about MongoDB
- Learning effectiveness scores
- Where the learner got stuck
- Recommendations for improving the lab

## What Happens Behind the Scenes

1. **Discovers challenges** — Finds all stages in your track
2. **Maps to learner framework** — Matches challenges to schema/dal/vector/final/reflection stages
3. **Executes each stage** — Runs validation checks and captures output
4. **Records evidence** — Saves MongoDB command results
5. **Generates report** — Creates the standard learner evaluation format

## Common Issues

### "API Error 401"
- Token is wrong or expired
- Generate a new token in Instruqt dashboard

### "Track not found"
- Double-check track slug from your Instruqt URL

### "npm scripts not found"
- Ensure your Instruqt challenges have `package.json` with scripts like `npm run check:dal`

## Next Steps

**One track working?**

Run it against all your labs to get baseline reports:
```bash
./scripts/run-learner.sh track-slug-1 lab-name-1
./scripts/run-learner.sh track-slug-2 lab-name-2
./scripts/run-learner.sh track-slug-3 lab-name-3
```

**Ready to iterate?**

After reviewing reports and improving your labs:
```bash
./scripts/run-learner.sh track-slug lab-name
# Generates v2, v3, etc. automatically
```

Compare versions to see improvement:
```bash
diff labs/reports/lab-name/lab-name-env-eval-v1.md \
     labs/reports/lab-name/lab-name-env-eval-v2.md
```

## Full Documentation

- [INSTRUQT_INTEGRATION.md](INSTRUQT_INTEGRATION.md) — Comprehensive setup and troubleshooting
- [lib/INSTRUQT_ADAPTER_README.md](../lib/INSTRUQT_ADAPTER_README.md) — Technical architecture
- [agents/learner.md](../agents/learner.md) — Learner agent behaviors

## Architecture Overview

```
Your Instruqt Lab Track
         │
         ▼
Instruqt API ←──── run-learner.sh
                   (orchestrator)
                         │
                         ▼
                  instruqt-adapter.js
                  (API wrapper)
                         │
                         ▼
              ┌──────────────────────┐
              │ Complete each stage: │
              │ - Setup (npm i/seed) │
              │ - Run check script   │
              │ - Capture output     │
              │ - Read .md files     │
              └──────────────────────┘
                         │
                         ▼
              Learning Report (Markdown)
              → labs/reports/...
```

## Support

**Still stuck?** Check:
- Is your `.env` file loaded? (`source .env`)
- Is the token valid? (try generating a new one)
- Does your track have challenges? (check Instruqt dashboard)
- Are your challenges set up with npm scripts? (check docker-compose.yml or setup)

---

**Ready? Run this:**

```bash
source .env
./scripts/run-learner.sh iizqgagh2ab4 memory-for-ai
```

Then check your report:
```bash
cat labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
```
