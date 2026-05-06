# Instruqt Browser Adapter - Technical Reference

## Overview

The browser adapter uses **Playwright** (headless Chrome) to automate the Instruqt web interface. No API token required.

## Architecture

```
┌─────────────────────────────────────┐
│  Learner Agent (run-learner-browser) │
│  - Orchestrates stage completion    │
│  - Generates learning report        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Browser Adapter                    │
│  - Page navigation                  │
│  - HTML parsing                     │
│  - Element extraction               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Playwright (Chromium)              │
│  - Headless browser                 │
│  - Page automation                  │
│  - JavaScript evaluation            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Instruqt Web Interface             │
│  - Play.instruqt.com                │
│  - Track and challenge pages        │
└─────────────────────────────────────┘
```

## Class: InstruqtBrowserAdapter

### Constructor

```javascript
const adapter = new InstruqtBrowserAdapter(headless = true);
```

- **headless** — If true, browser runs without UI (faster, headless mode)
- If false, shows browser window (useful for debugging)

### Methods

#### `launch()`

```javascript
await adapter.launch();
```

Launch Chromium browser and prepare for page navigation.

**Returns:** Nothing (sets internal state)

**Throws:** Error if launch fails

#### `close()`

```javascript
await adapter.close();
```

Gracefully close browser and free resources.

#### `getChallenges(trackSlug)`

```javascript
const challenges = await adapter.getChallenges('track-slug-here');
// Returns:
// [
//   { id: 'ch1', slug: 'challenge-1', title: 'Challenge Title', url: 'https://...' },
//   { id: 'ch2', slug: 'challenge-2', title: 'Another Challenge', url: 'https://...' }
// ]
```

Navigate to track and extract all challenges.

**Parameters:**
- `trackSlug` — Instruqt track identifier

**Returns:** Array of challenge objects

**Throws:** Error if track not found or page failed to load

#### `getChallengeDetails(challengeUrl)`

```javascript
const details = await adapter.getChallengeDetails('https://...');
// Returns:
// {
//   title: 'Challenge Title',
//   description: 'Challenge description...',
//   instructions: 'Full instructions text...'
// }
```

Get detailed information about a specific challenge.

**Parameters:**
- `challengeUrl` — Full URL to challenge page

**Returns:** Object with title, description, instructions

#### `isChallengeComplete()`

```javascript
const complete = await adapter.isChallengeComplete();
```

Check if challenge shows completion indicators on the page.

**Returns:** Boolean

#### `screenshot(filename)`

```javascript
await adapter.screenshot('challenge-01.png');
```

Capture screenshot of current page.

**Parameters:**
- `filename` — Where to save PNG

**Returns:** Filename

#### `getPageText()`

```javascript
const text = await adapter.getPageText();
```

Get all visible text from current page.

**Returns:** String

#### `waitForElement(selector, timeout)`

```javascript
const found = await adapter.waitForElement('button', 5000);
```

Wait for an element to appear on page.

**Parameters:**
- `selector` — CSS selector
- `timeout` — Milliseconds to wait (default 5000)

**Returns:** Boolean (true if found, false if timeout)

#### `clickByText(text)`

```javascript
const clicked = await adapter.clickByText('Next');
```

Click button or link by visible text.

**Parameters:**
- `text` — Text to search for

**Returns:** Boolean (true if clicked, false if not found)

#### `fillByLabel(label, value)`

```javascript
const filled = await adapter.fillByLabel('Email', 'test@example.com');
```

Fill form field by associated label.

**Parameters:**
- `label` — Label text
- `value` — Value to enter

**Returns:** Boolean

#### `captureTerminalOutput()`

```javascript
const output = await adapter.captureTerminalOutput();
```

Extract text from terminal/output elements on page.

**Returns:** String

#### `getAvailableActions()`

```javascript
const actions = await adapter.getAvailableActions();
// Returns:
// {
//   buttons: ['Next', 'Submit', 'Back'],
//   inputs: ['email', 'password']
// }
```

Get all clickable buttons and input fields available.

**Returns:** Object with buttons array and inputs array

## Using in Your Code

### Basic Example

```javascript
const InstruqtBrowserAdapter = require('./lib/instruqt-browser-adapter');

async function example() {
  const adapter = new InstruqtBrowserAdapter(true); // headless
  
  try {
    await adapter.launch();
    
    // Get all challenges
    const challenges = await adapter.getChallenges('track-slug');
    console.log(`Found ${challenges.length} challenges`);
    
    // Process each challenge
    for (const challenge of challenges) {
      const details = await adapter.getChallengeDetails(challenge.url);
      console.log(`Challenge: ${details.title}`);
      
      const complete = await adapter.isChallengeComplete();
      console.log(`Complete: ${complete}`);
    }
  } finally {
    await adapter.close();
  }
}

example().catch(console.error);
```

### Advanced: With Debugging

```javascript
async function debugExample() {
  const adapter = new InstruqtBrowserAdapter(false); // Show browser
  
  try {
    await adapter.launch();
    await adapter.page.goto('https://play.instruqt.com/instruqt/tracks/track-slug');
    
    // Take screenshot for inspection
    await adapter.screenshot('debug.png');
    
    // Get page text to see structure
    const text = await adapter.getPageText();
    console.log(text.substring(0, 500));
    
    // Get available buttons
    const actions = await adapter.getAvailableActions();
    console.log('Buttons:', actions.buttons);
  } finally {
    await adapter.close();
  }
}
```

## Selectors Used

The adapter tries multiple selectors to be resilient:

### Challenge Discovery
```
[data-test="challenge"]
.challenge-item
[class*="challenge"]
a[href*="/challenges/"]
```

### Output/Terminal
```
[class*="terminal"]
[class*="output"]
[class*="console"]
pre
code
```

### Completion Indicators
```
[class*="complete"]
[class*="success"]
svg[class*="check"]
"Challenge Complete" (text match)
"Challenge Passed" (text match)
```

## Timeouts

All page operations have sensible defaults:

```javascript
page.setDefaultTimeout(30000); // 30 seconds
await page.goto(url, { waitUntil: 'networkidle' }); // Wait for network
```

You can adjust in `launch()` if needed for slow networks.

## Error Handling

All methods throw meaningful errors:

```javascript
try {
  await adapter.getChallenges('bad-slug');
} catch (error) {
  console.error(error.message);
  // "Failed to navigate to track. Check the track slug is correct: ..."
}
```

## Debugging

### Show Browser Window

Edit in `run-learner-browser.js`:
```javascript
this.adapter = new InstruqtBrowserAdapter(false); // headless=false
```

### Inspect HTML

```javascript
const text = await adapter.getPageText();
console.log(text); // See what the browser sees
```

### Take Screenshots

```javascript
await adapter.screenshot('stage-1.png');
await adapter.screenshot('stage-2.png');
// Check the PNG files to see page state
```

### Use Browser DevTools

```javascript
await adapter.page.pause(); // Pauses execution, opens DevTools
// Interact manually, then close DevTools to continue
```

## Performance Characteristics

| Operation | Time |
|-----------|------|
| Launch browser | 3-5s |
| Navigate to track | 2-5s |
| Extract challenges | <1s |
| Navigate to challenge | 1-3s |
| Get challenge details | <1s |
| Capture terminal output | <1s |
| Close browser | <1s |

**Total per lab:** 20-40 seconds depending on challenges

## Limitations & Workarounds

### Limitation: Limited Interaction

Currently, the adapter is **read-only** (extracts info, doesn't submit).

**Workaround:** If you need to click buttons:
```javascript
await adapter.clickByText('Next');
await adapter.page.waitForNavigation();
```

### Limitation: JavaScript-Heavy Pages

Some Instruqt pages load dynamically.

**Workaround:** Wait for content:
```javascript
await adapter.waitForElement('[data-test="content"]', 10000);
```

### Limitation: Selectors Break on Redesign

If Instruqt updates UI, selectors may fail.

**Workaround:** Update selectors in `getChallenges()` and other methods.

## Extension Ideas

### 1. Login Support (if private tracks)

```javascript
async login(email, password) {
  await this.page.goto('https://play.instruqt.com/login');
  await this.fillByLabel('Email', email);
  await this.fillByLabel('Password', password);
  await this.clickByText('Sign In');
  await this.page.waitForNavigation();
}
```

### 2. Answer Submission

```javascript
async submitAnswer(answerText) {
  await this.page.fill('textarea', answerText);
  await this.clickByText('Submit');
  await this.page.waitForNavigation();
}
```

### 3. Challenge Validation

```javascript
async runValidation() {
  await this.clickByText('Check');
  await this.page.waitForSelector('[class*="success"]', { timeout: 10000 });
  return await this.isChallengeComplete();
}
```

## Testing the Adapter

```bash
node -e "
const Adapter = require('./lib/instruqt-browser-adapter');

(async () => {
  const a = new Adapter(true);
  await a.launch();
  const challenges = await a.getChallenges('memory-for-ai-applications--implementing-long-term-memory');
  console.log('Challenges:', challenges);
  await a.close();
})().catch(console.error);
"
```

---

For usage examples, see [INSTRUQT_BROWSER_SETUP.md](INSTRUQT_BROWSER_SETUP.md)
