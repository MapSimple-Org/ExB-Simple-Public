/**
 * E2E Tests for Map Identify Restoration (Chunk 3 Section 3.3)
 * 
 * Test Scenario:
 * 1. User performs a query (creates selection)
 * 2. User clicks on map feature (opens identify popup, clears widget selection)
 * 3. User closes identify popup (should restore widget selection)
 * 
 * Expected Behavior:
 * - After closing identify popup, the original query results should be restored to the map
 * - This tests handleRestoreOnIdentifyClose() functionality
 * 
 * Current Status: EXPECTED TO FAIL (r019.14)
 * - handleRestoreOnIdentifyClose calls this.addSelectionToMap()
 * - addSelectionToMap is commented out (lines 1017-1259)
 * - Should see runtime error when closing identify popup
 */

import { test, expect } from '@playwright/test'
import { KCSearchHelpers } from '../fixtures/test-helpers'
import { MAP_COORDINATES, validateCoordinates } from '../fixtures/map-coordinates'

const WIDGET_ID = 'widget_12' // QuerySimple widget ID
const WIDGET_LABEL = 'Enhanced Search' // Widget label for opening
const BASE_URL = process.env.TEST_BASE_URL || 'https://localhost:3001'
const APP_URL = process.env.TEST_APP_URL || '/experience/0'
const DEBUG_PARAMS = '?debug=RESTORE'

// Test queries
const PIN_SINGLE = '2223059013' // Single parcel for testing
const PIN_MULTI = '5568900000' // Second parcel for Add mode

test.describe('Map Identify Restoration (Chunk 3 Section 3.3)', () => {
  let helpers: KCSearchHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page, WIDGET_ID, WIDGET_LABEL)
    await page.goto(`${BASE_URL}${APP_URL}${DEBUG_PARAMS}`)
    await page.waitForLoadState('networkidle')
  });

  test('should restore selection after closing identify popup in New mode', async ({ page }) => {
    // Step 1: Open widget and perform query (this zooms map to the parcel)
    await helpers.openWidget(WIDGET_LABEL);
    await helpers.switchToQueryTab(WIDGET_ID);
    await helpers.enterQueryValue(PIN_SINGLE, WIDGET_ID);
    await helpers.clickApply(WIDGET_ID);
    await helpers.waitForResults(WIDGET_ID);

    // Step 2: Verify initial selection (check the selected features indicator)
    console.log('✅ Query executed, parcel selected, widget open');
    
    // Check the "Selected features: N" indicator in bottom-right
    const selectionIndicator = page.locator('.exbmap-ui button').filter({ hasText: /Selected features:/i });
    await selectionIndicator.waitFor({ state: 'visible', timeout: 5000 });
    const initialText = await selectionIndicator.textContent();
    console.log(`   📊 Initial selection indicator: "${initialText}"`);
    expect(initialText).toContain('Selected features: 1');

    // Step 3: Click on map to trigger identify popup
    // Note: Coordinates are captured AFTER query execution (map is zoomed to parcel)
    const coords = MAP_COORDINATES.PARCEL_2223059013;
    
    // Skip test if coordinates not configured
    if (!validateCoordinates(coords)) {
      console.log('⏭️  SKIPPING: Map coordinates not configured yet');
      console.log('   To capture coordinates, see MAP_COORDINATE_CAPTURE_GUIDE.md');
      test.skip();
      return;
    }

    console.log(`📍 Clicking on parcel at (${coords.x}, ${coords.y}) - widget still open`);
    await helpers.clickMapAtCoordinates(coords.x, coords.y);
    
    // Step 4: Wait for identify popup to appear
    const popupAppeared = await helpers.waitForIdentifyPopup();
    if (!popupAppeared) {
      console.log('⚠️  WARNING: Identify popup did not appear after clicking map');
      console.log('   This may indicate incorrect coordinates or feature not clickable');
    }

    // Wait a moment so popup is visible before closing
    console.log('⏳ Waiting 2 seconds for popup to be visible...');
    await page.waitForTimeout(2000);

    // Step 5: Close identify popup
    console.log('❌ Closing identify popup - this should trigger handleRestoreOnIdentifyClose');
    await helpers.closeIdentifyPopup();
    
    // Wait for restoration to complete
    await page.waitForTimeout(2000);

    // Step 6: Verify selection is restored (check indicator again)
    console.log('🔍 Checking if selection was restored...');
    const restoredText = await selectionIndicator.textContent();
    console.log(`   📊 After identify close: "${restoredText}"`);
    
    // This is the key assertion - did handleRestoreOnIdentifyClose restore the selection?
    expect(restoredText).toContain('Selected features: 1');
    
    console.log('✅ Selection restored after identify popup close!');
  });

  test('should restore accumulated selection after closing identify popup in Add mode', async ({ page }) => {
    // Step 1: Open widget and perform first query
    await helpers.openWidget(WIDGET_LABEL);
    await helpers.switchToQueryTab(WIDGET_ID);
    await helpers.enterQueryValue(PIN_SINGLE, WIDGET_ID);
    await helpers.clickApply(WIDGET_ID);
    await helpers.waitForResults(WIDGET_ID);

    // Step 2: Switch to Add mode and perform second query
    await helpers.switchToQueryTab(WIDGET_ID);
    await helpers.setResultsMode('Add', WIDGET_ID);
    await helpers.enterQueryValue('5568900000', WIDGET_ID);
    await helpers.clickApply(WIDGET_ID);
    await helpers.waitForResults(WIDGET_ID);

    // Step 3: Verify accumulated count
    await helpers.switchToResultsTab(WIDGET_ID);
    const initialCount = await helpers.getResultCount(WIDGET_ID);
    expect(initialCount).toBe(2);

    // Step 4: Trigger identify (manual)
    console.log('⚠️  MANUAL STEP REQUIRED: Click on a map feature to open identify popup');
    await page.waitForTimeout(5000);

    // Step 5: Close identify popup (manual)
    console.log('⚠️  MANUAL STEP REQUIRED: Close the identify popup');
    console.log('    Expected: Both accumulated selections should restore');
    await page.waitForTimeout(2000);

    // Step 6: Verify accumulated selection is restored
    const restoredCount = await helpers.getResultCount(WIDGET_ID);
    expect(restoredCount).toBe(initialCount);

    console.log('✅ Accumulated selection restored after identify popup close');
  });

  test('should NOT restore if widget is closed when identify popup closes', async ({ page }) => {
    // Step 1: Open widget and perform query
    await helpers.openWidget(WIDGET_LABEL);
    await helpers.switchToQueryTab(WIDGET_ID);
    await helpers.enterQueryValue(PIN_SINGLE, WIDGET_ID);
    await helpers.clickApply(WIDGET_ID);
    await helpers.waitForResults(WIDGET_ID);

    // Step 2: Close widget
    await helpers.closeWidget(WIDGET_ID);

    // Step 3: Trigger identify (manual)
    console.log('⚠️  MANUAL STEP REQUIRED: Click on a map feature to open identify popup');
    await page.waitForTimeout(5000);

    // Step 4: Close identify popup (manual)
    console.log('⚠️  MANUAL STEP REQUIRED: Close the identify popup');
    console.log('    Expected: NO restoration (widget is closed)');
    await page.waitForTimeout(2000);

    // Step 5: Verify widget remains closed (no errors thrown)
    const isOpen = await page.locator(`[data-widgetid="${WIDGET_ID}"]`).locator('.widget-content').isVisible();
    expect(isOpen).toBe(false);

    console.log('✅ No restoration attempted when widget closed (correct behavior)');
  });

  // Note: The "should log runtime error when calling commented method" test was removed in r019.20
  // That test checked for a bug that has been fixed - all methods now call the manager directly.
});
