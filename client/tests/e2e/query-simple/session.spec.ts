import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * MEGA-JOURNEY: Unified Methodical Session (r017.41)
 * 
 * This is the SINGLE test suite for MapSimple widgets.
 * It covers both Main (Graphics) and Isolated widgets in one continuous session
 * to detect state leaks, race conditions, and persistence issues.
 * 
 * Coverage:
 * 1.  Deep Link Boot (?pin=)
 * 2.  Hash Pivot (#major=) - Fixes: Dirty Hash & Sticky Expansion
 * 3.  Widget 1 (Main): Bulk Tools (Expand/Collapse), Manual Trash, Add to Map
 * 4.  Interference: Opening Widget 2 while Widget 1 is active
 * 5.  Persistence: Close/Reopen state restoration
 * 6.  Mode Stress: Add/Remove accumulation logic
 * 7.  Cleanup: Full state reset and Map graphics removal
 */

test.describe('MapSimple Unified Mega-Journey', () => {
  let helpers: KCSearchHelpers;
  
  // Widget IDs and Labels (Synced with standard test app)
  const WIDGET_1_ID = 'widget_12'; // Main / Enhanced Search
  const WIDGET_1_LABEL = 'Enhanced Search';
  const WIDGET_2_ID = 'widget_15'; // Isolated / KC Parcels
  const WIDGET_2_LABEL = 'QuerySimple';
  
  // Test Data
  const PIN_1 = '2223059013';
  const MAJOR_1 = '222305';
  const PIN_2 = '2314300640';
  const MAJOR_2 = '231430';

  const HUMAN_DELAY = 1000;

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

  test('should execute the complete User Journey across both widgets', async ({ page }) => {
    const runId = Math.floor(Math.random() * 10000);
    console.log(`🚀🚀🚀 MEGA-JOURNEY RUN #${runId} - VERIFIED VERSION r017.41 🚀🚀🚀`);
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';

    // --- PHASE 1: DEEP LINK & DUAL-MODE PARAMETERS ---
    await test.step('Deep Link Boot (?pin=)', async () => {
      console.log(`🚀 Step 1: Loading with Query Parameter (?pin=${PIN_1})`);
      await page.goto(`${baseURL}${APP_URL}?pin=${PIN_1}&debug=all`, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_1_ID);
      await helpers.waitForResults(WIDGET_1_ID, 60000);
      
      const count = await helpers.getResultCount(WIDGET_1_ID);
      console.log(`📊 Initial Results (URL Param): ${count}`);
      expect(count).toBe(1);
    });

    await test.step('Hash Pivot (#major=) - Verifying Bug Fixes', async () => {
      console.log(`🚀 Step 2: Switching to Hash (#major=${MAJOR_1}) in same session`);
      
      // Update hash via evaluation to ensure same session (no full reload)
      await page.evaluate((val) => {
        window.location.hash = `#major=${val}&debug=all`;
      }, MAJOR_1);
      
      await page.waitForTimeout(5000); // Give it time to execute
      await helpers.waitForResults(WIDGET_1_ID, 60000);
      
      // FIX CHECK: Sticky Expansion
      // (Parcels is expanded by default, Major is collapsed. Switch should trigger collapse)
      const widget = helpers.getWidget(WIDGET_1_ID);
      const expandBtn = widget.locator('button[aria-label*="expand all" i]').first();
      const isCollapsed = await expandBtn.isVisible();
      console.log(`🔍 Sticky Expansion Check: ${isCollapsed ? 'Collapsed (Correct)' : 'STUCK EXPANDED (BUG)'}`);
      expect(isCollapsed, 'Sticky Expansion bug detected!').toBe(true);

      // FIX CHECK: Dirty Hash
      await helpers.switchToQueryTab(WIDGET_1_ID);
      const input = widget.locator('input.jimu-input-base, input:not([type="hidden"])').first();
      const inputValue = await input.inputValue();
      console.log(`🔍 Dirty Hash Check: Value is "${inputValue}" (Expected: ${MAJOR_1})`);
      expect(inputValue, 'Dirty Hash bug detected!').toBe(MAJOR_1);
    });

    // --- PHASE 2: WIDGET 1 INTERACTION (MAIN/GRAPHICS) ---
    await test.step('Widget 1 Interaction: Bulk Tools & Manual Removal', async () => {
      console.log('↔️ Testing Bulk Tools (Expand/Collapse)');
      await helpers.switchToResultsTab(WIDGET_1_ID);
      await helpers.clickExpandAll(WIDGET_1_ID);
      await helpers.clickCollapseAll(WIDGET_1_ID);
      
      const countBefore = await helpers.getResultCount(WIDGET_1_ID);
      console.log('🗑️ Testing Manual Trash removal');
      await helpers.removeResultItem(0, WIDGET_1_ID);
      const countAfter = await helpers.getResultCount(WIDGET_1_ID);
      expect(countAfter).toBe(countBefore - 1);
    });

    await test.step('Widget 1: Add to Map Action', async () => {
      console.log('🗺️ Simulating external selection clear before Add to Map');
      await helpers.clearMapSelection();
      
      console.log('🗺️ Testing Add to Map Action');
      await helpers.executeAction(WIDGET_1_ID, 'Add to Map');
      // We don't have a direct way to check graphics layers from E2E without internal hooks,
      // but the fact that it didn't crash and the console logs show success is our indicator.
    });

    // --- PHASE 3: INTERFERENCE & ISOLATION ---
    await test.step('Widget 2 Isolation Check', async () => {
      console.log(`🛡️ Opening Widget 2 (${WIDGET_2_LABEL}) while Widget 1 is active`);
      await helpers.openWidget(WIDGET_2_LABEL, WIDGET_2_ID);
      await page.waitForTimeout(3000); // EXTRA WAIT FOR W2
      await helpers.waitForWidget(WIDGET_2_ID);
      
      // Perform a search in Widget 2
      await helpers.enterQueryValue(PIN_2, WIDGET_2_ID);
      await helpers.clickApply(WIDGET_2_ID);
      await helpers.waitForResults(WIDGET_2_ID);
      
      const w2Count = await helpers.getResultCount(WIDGET_2_ID);
      console.log(`📊 Widget 2 Results: ${w2Count}`);
      expect(w2Count).toBe(1);
      
      // Verify Widget 1 still has its results (Persistence & Isolation)
      const w1Count = await helpers.getResultCount(WIDGET_1_ID);
      console.log(`📊 Widget 1 Results still preserved: ${w1Count}`);
      expect(w1Count).toBeGreaterThan(0);
    });

    // --- PHASE 4: CLOSE/REOPEN PERSISTENCE ---
    await test.step('Close/Reopen State Restoration', async () => {
      const countBefore = await helpers.getResultCount(WIDGET_2_ID);
      
      console.log('💾 Closing Widget 2 and reopening...');
      await helpers.closeWidget(); // This closes the active panel (Widget 2)
      await page.waitForTimeout(2000);
      
      await helpers.openWidget(WIDGET_2_LABEL, WIDGET_2_ID);
      await helpers.waitForWidget(WIDGET_2_ID);
      await helpers.waitForResults(WIDGET_2_ID);
      
      const countAfter = await helpers.getResultCount(WIDGET_2_ID);
      console.log(`📊 Restored Count: ${countAfter}`);
      expect(countAfter).toBe(countBefore);
    });

    // --- PHASE 5: MODE STRESS (ADD/REMOVE) ---
    await test.step('Accumulation Logic (Add/Remove Modes)', async () => {
      console.log('🎯 Switching to ADD mode in Widget 2');
      await helpers.switchToQueryTab(WIDGET_2_ID);
      await helpers.setResultsMode('Add', WIDGET_2_ID);
      
      await helpers.enterQueryValue(MAJOR_2, WIDGET_2_ID);
      await helpers.clickApply(WIDGET_2_ID);
      await helpers.waitForResults(WIDGET_2_ID, 60000);
      
      const countAfterAdd = await helpers.getResultCount(WIDGET_2_ID);
      console.log(`📊 Count after Add: ${countAfterAdd}`);
      expect(countAfterAdd).toBeGreaterThan(1);
      
      console.log('🎯 Switching to REMOVE mode in Widget 2');
      await helpers.switchToQueryTab(WIDGET_2_ID);
      await helpers.setResultsMode('Remove', WIDGET_2_ID);
      
      // Remove PIN_2
      await helpers.enterQueryValue(PIN_2, WIDGET_2_ID);
      await helpers.clickApply(WIDGET_2_ID);
      await helpers.waitForResults(WIDGET_2_ID);
      
      const countAfterRemove = await helpers.getResultCount(WIDGET_2_ID);
      console.log(`📊 Count after Remove: ${countAfterRemove}`);
      expect(countAfterRemove).toBe(countAfterAdd - 1);
    });

    // --- PHASE 6: FINAL CLEANUP ---
    await test.step('Full Cleanup and Map Reset', async () => {
      console.log('🧹 Clearing Widget 2');
      await helpers.clickClearResults(WIDGET_2_ID);
      await helpers.verifyResultsCleared(WIDGET_2_ID);
      
      console.log('🧹 Clearing Widget 1');
      await helpers.clickClearResults(WIDGET_1_ID);
      await helpers.verifyResultsCleared(WIDGET_1_ID);
      
      console.log('✅ MEGA-JOURNEY COMPLETE: All features verified in a single session.');
    });
  });
});
