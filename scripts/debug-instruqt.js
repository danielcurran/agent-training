#!/usr/bin/env node

/**
 * Debug script to inspect Instruqt track page structure
 */

const InstruqtBrowserAdapter = require('../lib/instruqt-browser-adapter');
const fs = require('fs');

async function debug() {
  const adapter = new InstruqtBrowserAdapter(false); // Show browser
  
  try {
    console.log('Launching browser (you should see it open)...\n');
    await adapter.launch();
    
    const trackSlug = 'memory-for-ai-applications--implementing-long-term-memory';
    console.log(`Navigating to track: ${trackSlug}`);
    
    const trackUrl = `https://play.instruqt.com/instruqt/tracks/${trackSlug}`;
    await adapter.page.goto(trackUrl, { waitUntil: 'networkidle' });
    
    console.log('Page loaded! Waiting 3 seconds for dynamic content...\n');
    await adapter.page.waitForTimeout(3000);
    
    // Get all text
    const text = await adapter.getPageText();
    console.log('=== PAGE TEXT (first 1000 chars) ===');
    console.log(text.substring(0, 1000));
    console.log('\n');
    
    // Get HTML structure for challenges
    console.log('=== LOOKING FOR CHALLENGE ELEMENTS ===\n');
    
    const structure = await adapter.page.evaluate(() => {
      console.log('Evaluating page...');
      
      // Try all possible selectors and log what we find
      const selectors = [
        '[data-test="challenge"]',
        '.challenge-item',
        '[class*="challenge"]',
        'a[href*="/challenges/"]',
        '[role="tab"]',
        '[role="button"]',
        'button',
        'a[href*="challenge"]'
      ];
      
      const results = {};
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results[selector] = {
            count: elements.length,
            examples: Array.from(elements).slice(0, 2).map(el => ({
              html: el.outerHTML.substring(0, 100),
              text: el.textContent?.trim().substring(0, 50),
              href: el.href
            }))
          };
        }
      }
      
      return results;
    });
    
    console.log(JSON.stringify(structure, null, 2));
    
    // Take screenshot
    console.log('\nTaking screenshot...');
    const screenshotPath = 'debug-screenshot.png';
    await adapter.screenshot(screenshotPath);
    console.log(`✓ Screenshot saved to: ${screenshotPath}`);
    
    // Check page title
    const title = await adapter.page.title();
    console.log(`\nPage title: ${title}`);
    
    // Get URL
    const url = adapter.page.url();
    console.log(`Current URL: ${url}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
  } finally {
    console.log('\nClosing browser...');
    await adapter.close();
  }
}

debug();
