import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Methodical Session Tests for QuerySimple
 * 
 * Verifies accumulation and depletion logic in a single long-running session:
 * 1. New Selection mode establishment
 * 2. Add to Selection mode accumulation
 * 3. Remove from Selection mode depletion
 * 4. Manual record removal (Trash icon)
 * 5. Hash state consistency (hunting the "Dirty Hash" bug)
 * 6. Final restoration verification
 */

test.describe('QuerySimple Methodical Session', () => {
  let helpers: KCSearchHelpers;
  
  // Widget IDs and Labels
  const WIDGET_1_ID = 'widget_12'; // Enhanced Search (HS/Graphics)
  const WIDGET_1_LABEL = 'Enhanced Search';
  const WIDGET_2_ID = 'widget_15'; // QuerySimple (Isolated)
  const WIDGET_2_LABEL = 'QuerySimple';
  
  // Test Data
  const PIN_1 = '2223059013';
  const MAJOR_1 = '222305';
  const PIN_2 = '2314300640';
  const MAJOR_2 = '231430';

  const HUMAN_DELAY = 1000; // Delay to simulate human interaction

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    
    // Pipe browser console to terminal
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('QUERYSIMPLE')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  /**
   * Helper to run the methodical session on a specific widget
   */
  async function runMethodicalSession(page: any, widgetId: string, widgetLabel: string) {
    console.log(`🚀 Starting Methodical Session for ${widgetLabel} (${widgetId})`);
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    
    await page.goto(`${baseURL}${APP_URL}?debug=all`, { waitUntil: 'networkidle' });

    // Determine labels based on widgetId
    const layerLabel = widgetId === WIDGET_1_ID ? 'King County Parcels' : 'KC Parcels';
    const aliasLabel = widgetId === WIDGET_1_ID ? 'Parcel number' : 'PIN';
    const majorAliasLabel = widgetId === WIDGET_1_ID ? 'Major number' : 'MAJOR';

    // --- STEP 1: INITIAL SELECTION (New Mode) ---
    await test.step('Initial selection in New mode', async () => {
      await helpers.openWidget(widgetLabel);
      await helpers.waitForWidget(widgetId);
      
      await helpers.selectFromDropdown(layerLabel, 'layer', widgetId);
      await helpers.selectFromDropdown(aliasLabel, 'alias', widgetId);
      await helpers.enterQueryValue(PIN_1, widgetId);
      await page.waitForTimeout(HUMAN_DELAY); // Wait like a human
      await helpers.clickApply(widgetId);
      
      console.log('⏳ Waiting for Step 1 results (zoom)...');
      await page.waitForTimeout(5000); // WAIT FOR MAP ZOOM (increased for slow layers)
      await helpers.waitForResults(widgetId, 60000); // Increase timeout for slow queries
      
      const count = await helpers.getResultCount(widgetId);
      console.log(`📊 Step 1 Count: ${count}`);
      expect(count).toBe(1);
    });

    // --- STEP 2: ADD MODE ACCUMULATION ---
    await test.step('Accumulate results in Add mode', async () => {
      await helpers.switchToQueryTab(widgetId);
      await helpers.setResultsMode('Add', widgetId);
      await page.waitForTimeout(3000); // Give React plenty of time to settle and capture
      
      // Search for second PIN
      console.log(`📝 Searching for second PIN: ${PIN_2}`);
      await helpers.enterQueryValue(PIN_2, widgetId);
      await page.waitForTimeout(2000); // Wait like a human while typing
      await helpers.clickApply(widgetId);
      
      // Wait for results to change or finish loading
      console.log('⏳ Waiting for Step 2 results (accumulation + zoom)...');
      await page.waitForTimeout(5000); // WAIT FOR MAP ZOOM
      await helpers.waitForResults(widgetId, 60000);
      await page.waitForTimeout(3000); // EXTRA wait for accumulation sync
      
      let count = await helpers.getResultCount(widgetId);
      console.log(`📊 Step 2 Count (after 2nd PIN): ${count}`);
      
      if (count === 1) {
        console.log('⚠️ Count is still 1. This is the bug we are hunting.');
      }
      
      expect(count).toBe(2);

      // Bulk Add (Major 2)
      console.log(`📝 Bulk adding Major: ${MAJOR_2}`);
      await helpers.switchToQueryTab(widgetId);
      await helpers.selectFromDropdown(majorAliasLabel, 'alias', widgetId);
      await helpers.enterQueryValue(MAJOR_2, widgetId);
      await page.waitForTimeout(HUMAN_DELAY); // Wait like a human
      await helpers.clickApply(widgetId);
      
      console.log('⏳ Waiting for Step 2 results (bulk add + zoom)...');
      await page.waitForTimeout(10000); // WAIT LONGER FOR SLOW MAJOR QUERY
      await helpers.waitForResults(widgetId, 120000); // Massive timeout for Major query
      await page.waitForTimeout(5000); // Wait for results to settle
      
      count = await helpers.getResultCount(widgetId);
      console.log(`📊 Step 2 Count (after Bulk Add): ${count}`);
      expect(count).toBeGreaterThan(10); 
    });

    // --- STEP 3: REMOVE MODE DEPLETION ---
    await test.step('Deplete results in Remove mode', async () => {
      const countBefore = await helpers.getResultCount(widgetId);
      
      await helpers.switchToQueryTab(widgetId);
      await helpers.setResultsMode('Remove', widgetId);
      await page.waitForTimeout(2000); // Give React time to settle
      
      // Remove PIN_2 via query
      await helpers.selectFromDropdown(aliasLabel, 'alias', widgetId);
      await helpers.enterQueryValue(PIN_2, widgetId);
      await page.waitForTimeout(HUMAN_DELAY); // Wait like a human
      await helpers.clickApply(widgetId);
      
      console.log('⏳ Waiting for Step 3 results (removal + zoom)...');
      await page.waitForTimeout(4000); // WAIT FOR MAP ZOOM
      await helpers.waitForResults(widgetId);
      
      const countAfter = await helpers.getResultCount(widgetId);
      console.log(`📊 Step 3 Count: ${countAfter} (decreased from ${countBefore})`);
      expect(countAfter).toBe(countBefore - 1);
    });

    // --- STEP 4: MANUAL ENTROPY (Trash Icon) ---
    await test.step('Manual record removal and Hash Check', async () => {
      const countBefore = await helpers.getResultCount(widgetId);
      
      // Manually remove 5 records
      for (let i = 0; i < 5; i++) {
        await helpers.removeResultItem(0, widgetId);
        await page.waitForTimeout(200); // Quick delay between removals
      }
      
      const countAfter = await helpers.getResultCount(widgetId);
      console.log(`📊 Step 4 Count: ${countAfter} (manually removed 5)`);
      expect(countAfter).toBe(countBefore - 5);

      // HASH CHECK: Hunting for "Dirty Hash"
      console.log('🧐 Checking for "Dirty Hash"...');
      const currentHash = await page.evaluate(() => window.location.hash);
      console.log(`   Current Hash: ${currentHash}`);
      
      // Logic: If we are in Add/Remove mode and have manually interacted,
      // the hash shouldn't claim to be just one PIN if that's not the reality.
      if (currentHash.includes(PIN_2)) {
        console.log('⚠️ Hash still contains deep link after manual modifications!');
      }
    });

    // --- STEP 5: FINAL RESTORATION ---
    await test.step('Persistence check (Close/Reopen)', async () => {
      const countBefore = await helpers.getResultCount(widgetId);
      
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      console.log('🔓 Reopening widget for final verification...');
      await helpers.openWidget(widgetLabel);
      await helpers.waitForWidget(widgetId);
      await helpers.waitForResults(widgetId);
      
      const countAfter = await helpers.getResultCount(widgetId);
      console.log(`📊 Final Restored Count: ${countAfter}`);
      expect(countAfter).toBe(countBefore);
      console.log(`✅ Methodical Session for ${widgetLabel} Complete!`);
    });
  }

  test('should maintain consistent state in Widget 1 (Enhanced Search)', async ({ page }) => {
    await runMethodicalSession(page, WIDGET_1_ID, WIDGET_1_LABEL);
  });

  test('should maintain consistent state in Widget 2 (Isolated)', async ({ page }) => {
    await runMethodicalSession(page, WIDGET_2_ID, WIDGET_2_LABEL);
  });
});

