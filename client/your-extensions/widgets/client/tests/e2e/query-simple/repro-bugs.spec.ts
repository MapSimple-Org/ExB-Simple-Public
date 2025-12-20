import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Bug Reproduction Suite (r017.40)
 * 
 * Target Bugs:
 * 1. Sticky Expansion: Switch hash from Expanded query to Collapsed query.
 * 2. Dirty Hash Switching: Switch hash values without full page reload.
 */

test.describe('QuerySimple Bug Reproduction (r017.40)', () => {
  let helpers: KCSearchHelpers;
  
  const WIDGET_2_ID = 'widget_15'; // QuerySimple (Isolated)
  const PIN_1 = '2223059013';
  const MAJOR_1 = '222305';

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    
    // Pipe browser console to terminal for analysis
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('QUERYSIMPLE')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should reproduce Sticky Expansion and Dirty Hash during rapid switching', async ({ page }) => {
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    
    // --- STEP 1: LOAD PARCEL HASH (Expected: Expanded) ---
    console.log(`🚀 Step 1: Loading Parcel hash (#pin=${PIN_1})`);
    await page.goto(`${baseURL}${APP_URL}#pin=${PIN_1}&debug=all`, { waitUntil: 'networkidle' });
    
    await helpers.waitForWidget(WIDGET_2_ID);
    await helpers.waitForResults(WIDGET_2_ID, 60000);
    
    // Check expansion state (Expect "Collapse all" button to be visible if expanded)
    const widget = helpers.getWidget(WIDGET_2_ID);
    const collapseBtn = widget.locator('button[aria-label*="collapse all" i]').first();
    const expandBtn = widget.locator('button[aria-label*="expand all" i]').first();
    
    const isExpandedStep1 = await collapseBtn.isVisible();
    console.log(`🔍 Step 1 Expansion: ${isExpandedStep1 ? 'Expanded (Correct)' : 'Collapsed'}`);
    
    // --- STEP 2: SWITCH TO MAJOR HASH (Expected: Collapsed) ---
    console.log(`🚀 Step 2: Switching to Major hash (#major=${MAJOR_1}) in same session`);
    
    // Update hash via evaluation to ensure same session (no full reload)
    await page.evaluate((val) => {
      window.location.hash = `#major=${val}&debug=all`;
    }, MAJOR_1);
    
    // Wait for query to trigger and results to appear
    console.log('⏳ Waiting for Step 2 results...');
    await page.waitForTimeout(5000); // Give it time to detect hash change and execute
    await helpers.waitForResults(WIDGET_2_ID, 60000);
    
    // Check expansion state again
    const isCollapsedStep2 = await expandBtn.isVisible();
    const isExpandedStep2 = await collapseBtn.isVisible();
    
    console.log(`🔍 Step 2 Expansion: ${isExpandedStep2 ? 'Expanded (STUCK BUG?)' : 'Collapsed (Correct)'}`);
    
    // Check for "Dirty" values in the search form
    const input = widget.locator('input.jimu-input-base, input:not([type="hidden"])').filter({ isVisible: true }).first();
    const inputValue = await input.inputValue();
    console.log(`🔍 Step 2 Search Value: ${inputValue} (Expected: ${MAJOR_1})`);
    
    if (inputValue === PIN_1) {
      console.log('⚠️ DIRTY HASH BUG DETECTED: Form still shows PIN_1 value!');
    }

    // Explicitly fail if bugs are detected so we know the repro worked
    expect(isExpandedStep2, 'Sticky Expansion bug detected! Should be collapsed.').toBe(false);
    expect(inputValue, 'Dirty Hash bug detected! Should show Major value.').toBe(MAJOR_1);
  });
});

