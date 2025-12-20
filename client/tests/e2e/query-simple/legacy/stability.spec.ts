import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Stability tests for QuerySimple
 * 
 * Verifies key persistence and recovery scenarios:
 * 1. Hash parameter consumption & active query persistence (Sticky Selection)
 * 2. Panel close/open restoration of selection
 * 3. Results clearing and UI cleanup
 * 4. Multi-widget isolation (interference check)
 */

test.describe('QuerySimple Stability & Persistence', () => {
  let helpers: KCSearchHelpers;
  const WIDGET_1_ID = 'widget_12'; // Enhanced Search (HS/Graphics)
  const WIDGET_2_ID = 'widget_15'; // QuerySimple (Isolated)
  const WIDGET_1_LABEL = 'Enhanced Search';
  const WIDGET_2_LABEL = 'QuerySimple';

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
  });

  test('should execute from hash and REMAINS in URL (Sticky Selection)', async ({ page }) => {
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    const pin = '2223059013';
    
    // 1. Navigate directly to URL with hash
    console.log(`🚀 Navigating to hash: #pin=${pin}`);
    await page.goto(`${baseURL}${APP_URL}?debug=all#pin=${pin}`, { waitUntil: 'networkidle' });
    
    // 2. Wait for Widget 1 to open and show results
    await helpers.waitForWidget(WIDGET_1_ID);
    await helpers.waitForResults(WIDGET_1_ID);

    // 3. Verify results are loaded
    const count = await helpers.getResultCount(WIDGET_1_ID);
    console.log(`📊 Found ${count} results in ${WIDGET_1_ID}`);
    expect(count).toBeGreaterThan(0);

    // 4. Verify hash REMAINS in URL (per user requirement)
    console.log('🧐 Verifying hash persistence...');
    const currentHash = await page.evaluate(() => window.location.hash);
    console.log(`   Current hash: ${currentHash}`);
    expect(currentHash).toContain(`pin=${pin}`);
    console.log('✅ Hash remained in URL');

    // 5. Verify selection remains sticky
    await helpers.switchToQueryTab(WIDGET_1_ID);
    
    // Use NTH approach for the alias dropdown (0 is Layer, 1 is Alias)
    const widget = helpers.getWidget(WIDGET_1_ID);
    const aliasDropdown = widget.locator('button[role="combobox"], [data-testid="dropdownBtn"]').nth(1);
    
    await expect(aliasDropdown).toContainText(/Parcel number/i);
    console.log('✅ Selection remained sticky');
  });

  test('should restore selection when panel is closed and reopened', async ({ page }) => {
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    await page.goto(`${baseURL}${APP_URL}?debug=all`, { waitUntil: 'networkidle' });

    // 1. Open Widget 1 and execute a query
    await helpers.openWidget(WIDGET_1_LABEL);
    await helpers.waitForWidget(WIDGET_1_ID);
    
    // Select Major number
    await helpers.selectFromDropdown('King County Parcels', 'layer', WIDGET_1_ID);
    await helpers.selectFromDropdown('Major number', 'alias', WIDGET_1_ID);
    
    await helpers.enterQueryValue('222305', WIDGET_1_ID);
    await helpers.clickApply(WIDGET_1_ID);
    await helpers.waitForResults(WIDGET_1_ID);
    
    const countBefore = await helpers.getResultCount(WIDGET_1_ID);
    console.log(`📊 Initial results: ${countBefore}`);

    // 2. Close the widget
    await helpers.closeWidget();
    
    // 3. Reopen the widget
    console.log('🔓 Reopening widget...');
    await helpers.openWidget(WIDGET_1_LABEL);
    await helpers.waitForWidget(WIDGET_1_ID);
    
    // 4. Verify results are restored
    await helpers.waitForResults(WIDGET_1_ID);
    const countAfter = await helpers.getResultCount(WIDGET_1_ID);
    console.log(`📊 Restored results: ${countAfter}`);
    expect(countAfter).toBe(countBefore);
    console.log('✅ Selection restored successfully');
  });

  test('should clear graphics and results when switching queries in New mode', async ({ page }) => {
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    await page.goto(`${baseURL}${APP_URL}?debug=all`, { waitUntil: 'networkidle' });

    await helpers.openWidget(WIDGET_1_LABEL);
    await helpers.waitForWidget(WIDGET_1_ID);

    // 1. Execute Query A (Major number)
    await helpers.selectFromDropdown('King County Parcels', 'layer', WIDGET_1_ID);
    await helpers.selectFromDropdown('Major number', 'alias', WIDGET_1_ID);
    await helpers.enterQueryValue('222305', WIDGET_1_ID);
    await helpers.clickApply(WIDGET_1_ID);
    await helpers.waitForResults(WIDGET_1_ID);

    // 2. Switch to Query B (Parcel number)
    console.log('🔄 Switching to Query B...');
    await helpers.switchToQueryTab(WIDGET_1_ID);
    await helpers.selectFromDropdown('Parcel number', 'alias', WIDGET_1_ID);
    
    // 3. Verify UI immediately clears (Virtual Clear)
    await helpers.verifyResultsCleared(WIDGET_1_ID);
    console.log('✅ Virtual clear successful');
  });

  test('should ensure widgets are isolated (interference check)', async ({ page }) => {
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    await page.goto(`${baseURL}${APP_URL}?debug=all`, { waitUntil: 'networkidle' });

    // 1. Open Widget 2 and execute query
    await helpers.openWidget(WIDGET_2_LABEL);
    await helpers.waitForWidget(WIDGET_2_ID);
    
    // Select Major number in Widget 2
    await helpers.selectFromDropdown('Parcels', 'layer', WIDGET_2_ID);
    await helpers.selectFromDropdown('Major', 'alias', WIDGET_2_ID); // Widget 2 might have different alias labels
    await helpers.enterQueryValue('222305', WIDGET_2_ID);
    await helpers.clickApply(WIDGET_2_ID);
    await helpers.waitForResults(WIDGET_2_ID);
    const count2 = await helpers.getResultCount(WIDGET_2_ID);
    console.log(`📊 Widget 2 results: ${count2}`);

    // 2. Open Widget 1
    await helpers.openWidget(WIDGET_1_LABEL);
    await helpers.waitForWidget(WIDGET_1_ID);
    
    // Widget 1 should be empty initially
    const count1 = await helpers.getResultCount(WIDGET_1_ID);
    console.log(`📊 Widget 1 initial results: ${count1}`);

    // 3. Trigger hash for Widget 1
    const pin = '2223059013';
    console.log(`🚀 Triggering hash for Widget 1: #pin=${pin}`);
    await page.waitForTimeout(2000);
    await page.evaluate((p) => { window.location.hash = `pin=${p}`; }, pin);
    await page.waitForTimeout(2000);
    
    // HelperSimple should open Widget 1 and execute
    await helpers.waitForResults(WIDGET_1_ID);
    const count1After = await helpers.getResultCount(WIDGET_1_ID);
    console.log(`📊 Widget 1 results after hash: ${count1After}`);
    expect(count1After).toBeGreaterThan(0);

    // 4. Verify Widget 2 is UNCHANGED (reopen it)
    await helpers.openWidget(WIDGET_2_LABEL);
    await helpers.waitForWidget(WIDGET_2_ID);
    const count2After = await helpers.getResultCount(WIDGET_2_ID);
    console.log(`📊 Widget 2 results after W1 action: ${count2After}`);
    expect(count2After).toBe(count2);
    console.log('✅ Isolation verified');
  });
});
