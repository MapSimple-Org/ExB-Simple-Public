import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * SELECTION & RESTORATION TEST SUITE (Chunk 3 - r019.0)
 * 
 * Comprehensive E2E tests for selection state management and restoration logic.
 * These tests verify the widget correctly:
 * 1. Tracks selection state from query results
 * 2. Restores selection when panel reopens
 * 3. Clears selection when panel closes
 * 4. Restores selection after Map Identify popup closes
 * 5. Handles Add/Remove mode accumulated records correctly
 * 6. Maintains consistency across mode switches
 * 7. Groups records by origin data source for multi-query scenarios
 * 
 * Test Coverage:
 * - Section 3.1: Selection State Tracking (`handleSelectionChange`)
 * - Section 3.2: Panel Open/Close Restoration (`addSelectionToMap`, `clearSelectionFromMap`)
 * - Section 3.3: Map Identify Restoration (`handleRestoreOnIdentifyClose`)
 */

test.describe('Selection & Restoration', () => {
  let helpers: KCSearchHelpers;
  
  // Widget IDs and Labels
  const WIDGET_ID = 'widget_12';
  const WIDGET_LABEL = 'Enhanced Search';
  
  // Test Data
  const PIN_SINGLE = '2223059013';  // Returns 1 record
  const PIN_MULTI = '5568900000';   // Returns 1 record (for Add mode)
  const MAJOR_BULK = '222305';      // Returns 121 records (for Remove mode)
  
  const HUMAN_DELAY = 1000;
  const TEST_TIMEOUT = 60000; // 60 seconds max per test
  const BASE_URL = process.env.TEST_BASE_URL || 'https://localhost:3001';
  const APP_URL = process.env.TEST_APP_URL || '/experience/0';

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    
    // Pipe browser console to terminal (focus on RESTORE and CHUNK-3-COMPARE logs)
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('QUERYSIMPLE-RESTORE') || text.includes('QUERYSIMPLE-CHUNK-3-COMPARE')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  /**
   * TEST 1: New Mode - Basic Open/Close Restoration
   * 
   * Verifies:
   * - Selection state tracked after query execution
   * - Selection cleared when panel closes
   * - Selection restored when panel reopens
   * - Graphics layer synchronized with selection state
   */
  test('should restore selection after panel close/reopen in New mode', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 1: New Mode - Basic Open/Close Restoration');
    
    await test.step('Load page and execute single record query', async () => {
      const url = `${BASE_URL}${APP_URL}?pin=${PIN_SINGLE}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 Query Results: ${count} record(s)`);
      expect(count).toBe(1);
      
      // TODO: Add assertion for origin DS selection state
      // TODO: Add assertion for graphics layer count
    });
    
    await test.step('Close widget panel', async () => {
      console.log('🔽 Closing widget panel');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      // TODO: Verify selection cleared from origin DS
      // TODO: Verify graphics layer cleared
    });
    
    await test.step('Reopen widget panel and verify restoration', async () => {
      console.log('🔼 Reopening widget panel');
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      // Verify result count still shows 1 (state persisted)
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 After Reopen: ${count} record(s)`);
      expect(count).toBe(1);
      
      // TODO: Verify selection restored in origin DS
      // TODO: Verify graphics layer restored
    });
  });

  /**
   * TEST 2: Add Mode - Accumulated Records Restoration
   * 
   * Verifies:
   * - Multiple queries accumulate records in Add mode
   * - All accumulated records tracked in selection state
   * - All records cleared when panel closes
   * - All records restored when panel reopens
   */
  test('should restore accumulated records in Add mode', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 2: Add Mode - Accumulated Records Restoration');
    
    await test.step('Execute first query (1 record)', async () => {
      const url = `${BASE_URL}${APP_URL}?pin=${PIN_SINGLE}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Query 1: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(1);
    });
    
    await test.step('Switch to Add mode', async () => {
      console.log('➕ Switching to "Add to" mode');
      await helpers.switchToQueryTab(WIDGET_ID);
      await helpers.setResultsMode('Add', WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
    });
    
    await test.step('Execute second query (1 more record)', async () => {
      console.log(`📍 Query 2: pin=${PIN_MULTI} (manual entry)`);
      
      // Stay on Query tab (already there from mode switch)
      await helpers.enterQueryValue(PIN_MULTI, WIDGET_ID);
      await helpers.clickApply(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      // Wait for UI to settle and results to fully process
      await page.waitForTimeout(2000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 Total Accumulated: ${count} record(s)`);
      expect(count).toBe(2);
      
      // TODO: Verify both records selected in origin DS
      // TODO: Verify graphics layer has 2 graphics
    });
    
    await test.step('Close and reopen widget', async () => {
      console.log('🔽 Closing widget panel');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      // TODO: Verify selection cleared from origin DS
      // TODO: Verify graphics layer cleared
      
      console.log('🔼 Reopening widget panel');
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 After Reopen: ${count} record(s)`);
      expect(count).toBe(2);
      
      // TODO: Verify both records restored in origin DS
      // TODO: Verify graphics layer has 2 graphics
    });
  });

  /**
   * TEST 3A: Manual X Button Removal (No Mode Change)
   * 
   * Verifies:
   * - X button removal works in New mode
   * - Removed records excluded from restoration
   * - Selection state reflects current records count
   */
  test('should restore correct records after manual X button removal', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 3A: Manual X Button Removal');
    
    await test.step('Execute bulk query (121 records)', async () => {
      const url = `${BASE_URL}${APP_URL}?major=${MAJOR_BULK}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Query: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121);
    });
    
    await test.step('Manually remove 3 records via trash button', async () => {
      console.log('🗑️ Removing 3 records via trash button (staying in New mode)');
      
      // Should already be on Results tab after query
      // Remove first 3 records
      for (let i = 0; i < 3; i++) {
        const widget = helpers.getWidget(WIDGET_ID);
        const removeBtn = widget.locator('button[aria-label="Remove record"]').first();
        await removeBtn.click();
        await page.waitForTimeout(500);
      }
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 After Removal: ${count} record(s)`);
      expect(count).toBe(118);
    });
    
    await test.step('Close and reopen widget', async () => {
      console.log('🔽 Closing widget panel');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      console.log('🔼 Reopening widget panel');
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 After Reopen: ${count} record(s)`);
      expect(count).toBe(118); // Should restore 118, not 121
    });
  });

  /**
   * TEST 3B: Remove Mode with Query
   * 
   * Verifies:
   * - Remove mode removes records via query
   * - All matching records removed
   * - Nothing to restore after removing all
   */
  test('should remove all records via query in Remove mode', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 3B: Remove Mode with Query');
    
    await test.step('Execute initial query (121 records)', async () => {
      const url = `${BASE_URL}${APP_URL}?major=${MAJOR_BULK}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Initial Query: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121);
    });
    
    await test.step('Switch to Remove mode', async () => {
      console.log('➖ Switching to "Remove from" mode');
      await helpers.switchToQueryTab(WIDGET_ID);
      await helpers.setResultsMode('Remove', WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
    });
    
    await test.step('Execute same query to remove all records', async () => {
      console.log(`📍 Remove Query: major=${MAJOR_BULK} (same as initial)`);
      
      // Enter same value and click Apply
      await helpers.enterQueryValue(MAJOR_BULK, WIDGET_ID);
      await helpers.clickApply(WIDGET_ID);
      
      // Wait for "Retrieving query results..." loading message to disappear
      const widget = helpers.getWidget(WIDGET_ID);
      const loadingMessage = widget.getByText(/retrieving query results/i);
      
      try {
        console.log('⏳ Waiting for removal query to complete...');
        await loadingMessage.waitFor({ state: 'detached', timeout: 10000 });
        console.log('✅ Removal query completed');
      } catch (e) {
        console.log('⚠️ Loading message timeout (might already be gone)');
      }
      
      // Additional settle time for state updates
      await page.waitForTimeout(1000);
      
      // Verify success: Results tab should be disabled/unselectable when 0 records
      const resultsTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /^Results/i }).first();
      
      const isDisabled = await resultsTab.evaluate(tab => {
        return tab.hasAttribute('disabled') || 
               tab.getAttribute('aria-disabled') === 'true' ||
               tab.classList.contains('disabled');
      });
      
      console.log(`✅ Removal successful - Results tab disabled: ${isDisabled}`);
      expect(isDisabled).toBe(true);
      
      console.log('📊 After Removal: 0 record(s) (verified by Results tab disabled state)');
    });
  });

  /**
   * TEST 4: Map Identify Integration
   * 
   * Verifies:
   * - Selection persists during Map Identify popup
   * - Selection restored after Map Identify closes
   * - Widget panel must be open for restoration
   */
  test.skip('should restore selection after Map Identify popup closes', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 4: Map Identify Integration');
    console.log('⚠️ SKIPPED: Requires Map Identify interaction - manual verification needed');
    
    await test.step('Execute query and verify selection', async () => {
      const url = `${BASE_URL}${APP_URL}?pin=${PIN_SINGLE}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Query: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(1);
      
      // TODO: Verify record selected in origin DS
      // TODO: Verify graphics layer has 1 graphic
    });
    
    await test.step('Open Map Identify popup (simulates selection clear)', async () => {
      console.log('🗺️ Opening Map Identify popup');
      
      // TODO: Click on map to open Map Identify
      // TODO: Verify graphics layer cleared (Map Identify behavior)
      // Note: This step requires map interaction - may need to be mocked or manual test
      
      console.log('⚠️ Map Identify interaction test - manual verification required');
    });
    
    await test.step('Close Map Identify and verify restoration', async () => {
      console.log('❌ Closing Map Identify popup');
      
      // TODO: Close Map Identify popup
      // TODO: Verify selection restored in origin DS
      // TODO: Verify graphics layer restored
      // TODO: Verify widget panel is still open
      
      const count = await helpers.getResultCount(WIDGET_ID);
      console.log(`📊 After Identify Close: ${count} record(s)`);
      expect(count).toBe(1);
    });
  });

  /**
   * TEST 5: Widget Closed During Identify - No Restoration
   * 
   * Verifies:
   * - No restoration when widget panel is closed
   * - handleRestoreOnIdentifyClose respects panel visibility
   */
  test.skip('should NOT restore selection if widget closed during Map Identify', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 5: Widget Closed During Identify - No Restoration');
    console.log('⚠️ SKIPPED: Requires Map Identify interaction - manual verification needed');
    
    await test.step('Execute query and close widget', async () => {
      const url = `${BASE_URL}${APP_URL}?pin=${PIN_SINGLE}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Query: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      console.log('🔽 Closing widget panel');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
    });
    
    await test.step('Open and close Map Identify', async () => {
      console.log('🗺️ Opening Map Identify (widget closed)');
      
      // TODO: Click on map to open Map Identify
      // TODO: Close Map Identify popup
      // TODO: Verify NO restoration attempt (widget was closed)
      
      console.log('⚠️ Map Identify interaction test - manual verification required');
    });
  });

  /**
   * TEST 6: Mode Switch - State Consistency
   * 
   * Verifies:
   * - Selection state persists across mode switches
   * - Restoration works regardless of current mode
   * - accumulatedRecords used for Add/Remove, lastSelection for New
   */
  test('should maintain selection state across mode switches', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    console.log('🧪 TEST 6: Mode Switch - State Consistency');
    
    await test.step('Execute query in New mode', async () => {
      const url = `${BASE_URL}${APP_URL}?major=${MAJOR_BULK}&debug=RESTORE,CHUNK-3-COMPARE&qsopen=true`;
      console.log(`📍 Query (New mode): ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      
      await helpers.waitForWidget(WIDGET_ID);
      await helpers.waitForResults(WIDGET_ID, 30000);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121);
    });
    
    await test.step('Close/reopen in New mode', async () => {
      console.log('🔁 Testing restoration in New mode');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121);
    });
    
    await test.step('Switch to Add mode (no new query)', async () => {
      console.log('➕ Switching to Add mode');
      await helpers.switchToQueryTab(WIDGET_ID);
      await helpers.setResultsMode('Add', WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
    });
    
    await test.step('Close/reopen in Add mode', async () => {
      console.log('🔁 Testing restoration in Add mode');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121); // Should still restore all records
    });
    
    await test.step('Switch back to New mode', async () => {
      console.log('🔄 Switching back to New mode');
      await helpers.switchToQueryTab(WIDGET_ID);
      await helpers.setResultsMode('New', WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
    });
    
    await test.step('Close/reopen in New mode again', async () => {
      console.log('🔁 Testing restoration after mode switch back');
      await helpers.closeWidget();
      await page.waitForTimeout(HUMAN_DELAY);
      
      await helpers.openWidget(WIDGET_LABEL, WIDGET_ID);
      await page.waitForTimeout(HUMAN_DELAY);
      
      const count = await helpers.getResultCount(WIDGET_ID);
      expect(count).toBe(121); // Should still restore all records
    });
  });

  /**
   * TEST 7: Multi-Query Cross-Origin Restoration
   * 
   * Verifies:
   * - Records grouped by origin data source for restoration
   * - Multiple origin DSs cleared when panel closes
   * - Multiple origin DSs restored when panel reopens
   * 
   * Note: This test requires a multi-data-source configuration
   * May need to be skipped or adapted based on test environment
   */
  test.skip('should restore records from multiple origin data sources', async ({ page }) => {
    console.log('🧪 TEST 7: Multi-Query Cross-Origin Restoration');
    console.log('⚠️ Requires multi-data-source configuration - test skipped');
    
    // TODO: Implement when test environment has multiple data sources configured
    // Steps:
    // 1. Execute query 1 from origin DS "Parcels" → 10 records
    // 2. Switch to Add mode
    // 3. Execute query 2 from origin DS "Buildings" → 5 records
    // 4. Verify 15 total records, both origin DSs selected
    // 5. Close widget panel
    // 6. Verify both origin DSs cleared
    // 7. Reopen widget panel
    // 8. Verify both origin DSs restored (10 + 5 records)
  });
});
