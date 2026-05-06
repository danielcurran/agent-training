/**
 * Instruqt Browser Automation Adapter
 * 
 * Uses Playwright to automate the Instruqt web UI instead of the API.
 * Works with any Instruqt account (no API token required).
 * 
 * Usage:
 *   const browser = new InstruqtBrowserAdapter();
 *   await browser.launch();
 *   const challenges = await browser.getChallenges(trackSlug);
 *   await browser.close();
 */

const { chromium } = require('playwright');

class InstruqtBrowserAdapter {
  constructor(headless = true) {
    this.headless = headless;
    this.browser = null;
    this.page = null;
  }

  /**
   * Launch browser and navigate to Instruqt
   */
  async launch() {
    console.log('🌐 Launching browser...');
    this.browser = await chromium.launch({ headless: this.headless });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(30000); // 30s timeout
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Navigate to a track and get all challenges
   * Returns array of {id, slug, title, description}
   */
  async getChallenges(trackSlug) {
    console.log(`📍 Navigating to track: ${trackSlug}`);
    
    // Support multiple URL formats
    let trackUrl;
    if (trackSlug.startsWith('http')) {
      trackUrl = trackSlug; // Full URL provided
      // Convert /manage/ to /play/ if needed
      trackUrl = trackUrl.replace('/manage/', '/play/');
    } else {
      // Try the /play/mongodb/tracks/ format first
      trackUrl = `https://play.instruqt.com/play/mongodb/tracks/${trackSlug}`;
    }
    
    console.log(`   URL: ${trackUrl}`);
    
    try {
      await this.page.goto(trackUrl, { waitUntil: 'networkidle' });
    } catch (error) {
      throw new Error(`Failed to navigate to track. Check the track slug is correct: ${error.message}`);
    }

    // Wait for challenge elements to load
    await this.page.waitForSelector('[data-test="challenge"]', { timeout: 5000 }).catch(() => {
      // Fallback: look for common Instruqt selectors
    });

    // Debug: Get page title and text to see what loaded
    const pageTitle = await this.page.title();
    const pageText = await this.getPageText();
    
    if (pageText.includes("can't find") || pageText.includes("not found") || pageText.includes("404")) {
      console.log(`   ⚠️  Page returned error: ${pageText.substring(0, 100)}`);
    } else {
      console.log(`   ✓ Page loaded (title: "${pageTitle}")`);
    }

    // Extract challenge elements (try multiple selectors)
    const challenges = await this.page.evaluate(() => {
      const results = [];
      
      // Try multiple selector patterns
      const selectors = [
        '[data-test="challenge"]',
        '.challenge-item',
        '[class*="challenge"]',
        'a[href*="/challenges/"]',
        'a[href*="challenge"]',
        'button:has-text("Challenge")',
        'li a',
        'nav a'
      ];

      for (const selector of selectors) {
        let elements = [];
        try {
          elements = document.querySelectorAll(selector);
        } catch (e) {
          continue;
        }
        
        if (elements.length > 0) {
          elements.forEach(el => {
            const title = el.textContent?.trim() || el.innerText?.trim() || '';
            const href = el.getAttribute('href') || '';
            const id = href.split('/').pop() || href.split('?')[0].split('/').pop();
            
            if (title && id && title.length > 2 && id.length > 2) {
              results.push({
                id,
                title,
                slug: id.toLowerCase().replace(/\s+/g, '-'),
                url: href.startsWith('http') ? href : `https://play.instruqt.com${href}`
              });
            }
          });
        }
        if (results.length > 0) break;
      }

      return results;
    });

    if (challenges.length === 0) {
      throw new Error('No challenges found on this track. The page may not be a learner/player view. Try the `/play/` URL format.');
    }

    console.log(`✓ Found ${challenges.length} challenges`);
    return challenges;
  }

  /**
   * Get challenge details (description, instructions)
   */
  async getChallengeDetails(challengeUrl) {
    try {
      await this.page.goto(challengeUrl, { waitUntil: 'networkidle' });
    } catch (error) {
      throw new Error(`Failed to load challenge: ${error.message}`);
    }

    const details = await this.page.evaluate(() => {
      // Extract title
      const titleEl = document.querySelector('h1') || document.querySelector('[class*="title"]');
      const title = titleEl?.textContent?.trim() || 'Unknown';

      // Extract description
      const descriptionEl = document.querySelector('[class*="description"]') || 
                           document.querySelector('[class*="instruction"]') ||
                           document.querySelector('main p');
      const description = descriptionEl?.textContent?.trim() || '';

      // Extract any instructions or tabs
      const instructionElements = document.querySelectorAll('[role="tabpanel"]');
      const instructions = Array.from(instructionElements)
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join('\n\n');

      return { title, description, instructions };
    });

    return details;
  }

  /**
   * Check if a challenge is marked as complete on the UI
   */
  async isChallengeComplete() {
    const isComplete = await this.page.evaluate(() => {
      // Look for completion indicators
      const checkmark = document.querySelector('[class*="complete"]') ||
                       document.querySelector('[class*="success"]') ||
                       document.querySelector('svg[class*="check"]');
      
      const statusText = document.body.textContent;
      return (checkmark !== null) || 
             statusText.includes('Challenge Complete') ||
             statusText.includes('Challenge Passed');
    });

    return isComplete;
  }

  /**
   * Capture screenshot of current challenge
   */
  async screenshot(filename) {
    await this.page.screenshot({ path: filename });
    return filename;
  }

  /**
   * Get the current page text (for parsing challenge output)
   */
  async getPageText() {
    return await this.page.evaluate(() => document.body.innerText);
  }

  /**
   * Wait for a specific element or text
   */
  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click a button or link by text
   */
  async clickByText(text) {
    const buttons = await this.page.$$eval('button, a', els =>
      els.map(el => ({ text: el.textContent?.trim(), selector: el.outerHTML }))
    );

    const match = buttons.find(b => b.text?.includes(text));
    if (match) {
      await this.page.click(`text="${text}"`);
      return true;
    }
    return false;
  }

  /**
   * Fill a form field by label
   */
  async fillByLabel(label, value) {
    const input = await this.page.$(`label:has-text("${label}") ~ input`);
    if (input) {
      await input.fill(value);
      return true;
    }
    return false;
  }

  /**
   * Get all text from a specific section
   */
  async getSectionText(sectionLabel) {
    const text = await this.page.evaluate((label) => {
      const section = Array.from(document.querySelectorAll('*'))
        .find(el => el.textContent?.includes(label));
      
      if (section) {
        return section.textContent?.trim() || '';
      }
      return '';
    }, sectionLabel);

    return text;
  }

  /**
   * Execute a command and capture output (simulated)
   * In the browser, we look for terminal/output elements
   */
  async captureTerminalOutput() {
    const output = await this.page.evaluate(() => {
      // Look for terminal or output elements
      const selectors = [
        '[class*="terminal"]',
        '[class*="output"]',
        '[class*="console"]',
        'pre',
        'code'
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          return el.textContent?.trim() || '';
        }
      }

      return '';
    });

    return output;
  }

  /**
   * Get all available actions on current page
   */
  async getAvailableActions() {
    const actions = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'))
        .map(el => el.textContent?.trim())
        .filter(Boolean);

      const inputs = Array.from(document.querySelectorAll('input, textarea'))
        .map(el => el.placeholder || el.name || el.id)
        .filter(Boolean);

      return { buttons, inputs };
    });

    return actions;
  }
}

module.exports = InstruqtBrowserAdapter;
