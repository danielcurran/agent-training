# Instruqt Browser Automation Setup

This guide sets up the **browser-based learner agent** (no API key needed).

## What Changed

Instead of using the Instruqt API (which had access issues), we now use **Playwright** to automate the web interface. This works with any Instruqt account.

## Quick Start

```bash
# 1. Browser automation is ready (Playwright already installed)

# 2. Run the learner agent
node scripts/run-learner-browser.js <track-slug> <lab-name>

# Example:
node scripts/run-learner-browser.js memory-for-ai-applications--implementing-long-term-memory memory-for-ai
```

## How It Works

1. **Launch browser** — Playwright opens a headless Chrome browser
2. **Navigate to Instruqt** — Goes to your track URL
3. **Discover challenges** — Parses the web page to find all challenges/stages
4. **Visit each challenge** — Navigates to each stage and extracts:
   - Challenge title and description
   - Instructions/learning objectives
   - Terminal output (if any)
   - Completion status
5. **Generate report** — Creates learner report in standard format

```
Track URL
    ↓
Browser loads page
    ↓
Playwright parses HTML
    ↓
Extract challenges
    ↓
For each challenge:
  - Navigate to page
  - Extract details
  - Capture status
  - Record evidence
    ↓
Generate report
    ↓
labs/reports/[lab-name]/[lab-name]-env-eval-v[N].md
```

## Usage

### Basic Usage

```bash
node scripts/run-learner-browser.js <track-slug> <lab-name>
```

- **track-slug** — Your Instruqt track slug (e.g., `memory-for-ai-applications--implementing-long-term-memory`)
- **lab-name** — Name for the report (e.g., `memory-for-ai`)

### Example

```bash
node scripts/run-learner-browser.js memory-for-ai-applications--implementing-long-term-memory memory-for-ai
```

### Output

Report saved to:
```
labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
```

View it with:
```bash
cat labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
```

## Finding Your Track Slug

1. Go to your Instruqt lab in your browser
2. Look at the URL: `https://play.instruqt.com/instruqt/tracks/YOUR_TRACK_SLUG`
3. Copy the slug
4. Use it in the command above

## Files

- **[lib/instruqt-browser-adapter.js](../lib/instruqt-browser-adapter.js)** — Playwright automation wrapper
- **[scripts/run-learner-browser.js](../scripts/run-learner-browser.js)** — Main orchestrator
- **[docs/INSTRUQT_BROWSER_README.md](INSTRUQT_BROWSER_README.md)** — Technical details

## Troubleshooting

### "No challenges found on this track"

**Causes:**
- Track slug is wrong
- Page didn't load properly
- Challenge selectors changed

**Solutions:**
1. Verify track slug from browser URL
2. Check internet connection
3. Try again (network timeout)

### "Failed to navigate to track"

**Causes:**
- Network issue
- Instruqt page changed

**Solutions:**
1. Check internet connection
2. Verify track URL in browser manually
3. Check track slug is exact

### "Headless mode not working"

If you see browser issues:

```bash
# Edit scripts/run-learner-browser.js, change:
this.adapter = new InstruqtBrowserAdapter(false); // Show browser window
```

Then you can see what's happening during automation.

## Performance

- **First run:** 20-30 seconds (includes browser launch)
- **Subsequent runs:** 10-15 seconds (page loads)
- **Per-challenge:** 2-5 seconds (depends on page size)

## Advanced Usage

### Run Multiple Labs

```bash
node scripts/run-learner-browser.js track1 lab1
node scripts/run-learner-browser.js track2 lab2
node scripts/run-learner-browser.js track3 lab3

# Then compare reports:
diff labs/reports/lab1/lab1-env-eval-v1.md \
     labs/reports/lab1/lab1-env-eval-v2.md
```

### Track Improvements

```bash
# After improving your labs, run again to get v2:
node scripts/run-learner-browser.js track lab

# This creates v2 automatically (doesn't overwrite v1)
# Compare improvement:
diff labs/reports/lab/lab-env-eval-v1.md \
     labs/reports/lab/lab-env-eval-v2.md
```

## How Browser Automation Works

The adapter uses **Playwright** (browser automation library) to:

1. **Launch headless Chrome** — No visible window (unless debugging)
2. **Navigate to URLs** — Simulates user browsing
3. **Wait for pages** — Lets content load fully
4. **Parse HTML** — Extracts challenge details
5. **Read text** — Captures terminal output, status
6. **Take screenshots** — Can save visual evidence

**Why this works better than API:**
- No API token needed
- Works with any Instruqt account
- Captures what users actually see
- More resilient to page changes

## Limitations

- **Headless only** — No manual interaction (yet)
- **Read-only** — Can navigate and read, not submit answers
- **Slower than API** — Browser overhead (~2-5 sec per page)
- **Fragile to UI changes** — If Instruqt redesigns, selectors may break

## Next Steps

1. **Run your first lab:**
   ```bash
   node scripts/run-learner-browser.js memory-for-ai-applications--implementing-long-term-memory memory-for-ai
   ```

2. **Review the report:**
   ```bash
   cat labs/reports/memory-for-ai/memory-for-ai-env-eval-v1.md
   ```

3. **Run against all your tracks:**
   ```bash
   # Generate baseline reports for each lab
   node scripts/run-learner-browser.js track1 lab1
   node scripts/run-learner-browser.js track2 lab2
   ```

4. **Improve and iterate:**
   - Review reports for gaps
   - Update labs
   - Re-run to generate v2, v3, etc.
   - Track improvement over time

---

## Technical Details

See [INSTRUQT_BROWSER_README.md](INSTRUQT_BROWSER_README.md) for:
- Architecture diagram
- Adapter API reference
- Debugging techniques
- Customization options
