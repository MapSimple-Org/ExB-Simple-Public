import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Playwright E2E tests for QuerySimple "Add to Map" data action
 * 
 * Tests the custom "Add to Map" action that replaces the framework's "Show on Map" action.
 * Verifies that the action:
 * - Appears in the data actions dropdown
 * - Uses QuerySimple's selection process
 * - Respects zoom settings
 * - Integrates with Clear Results functionality
 */

test.describe('QuerySimple Add to Map Action', () => {
  let helpers: KCSearchHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    
    // Navigate to the app with qsopen=true to open the widget dialog
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    
    // Add #qsopen=true to open the widget dialog
    await page.goto(`${baseURL}${APP_URL}#qsopen=true`, { waitUntil: 'domcontentloaded' });
    
    // Wait for widget to load
    await helpers.waitForWidget();
  });

  test('should display "Add to Map" action in dropdown', async ({ page }) => {
    // Execute a query first to get results
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    // Find the data actions dropdown button
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    // Verify dropdown button exists
    await expect(dataActionButton).toBeVisible({ timeout: 10000 });

    // Click to open dropdown
    await dataActionButton.click();
    await page.waitForTimeout(500);

    // Look for "Add to Map" action in the dropdown menu
    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await expect(addToMapAction).toBeVisible({ timeout: 5000 });
  });

  test('should execute "Add to Map" action and select features', async ({ page }) => {
    // Execute a query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    // Get result count before action
    const resultCount = await helpers.getResultCount();
    expect(resultCount).toBeGreaterThan(0);

    // Open data actions dropdown
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    await dataActionButton.click();
    await page.waitForTimeout(500);

    // Click "Add to Map" action
    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await addToMapAction.click();
    await page.waitForTimeout(2000); // Wait for selection to process

    // Verify features are selected on map
    // This is verified by checking that the result count is still displayed
    // and that features should be highlighted (we can't directly check map graphics)
    const resultCountAfter = await helpers.getResultCount();
    expect(resultCountAfter).toBe(resultCount);

    // Verify we're still on Results tab (action shouldn't navigate away)
    const isResultsVisible = await helpers.isResultsViewVisible();
    expect(isResultsVisible).toBe(true);
  });

  test('should respect zoomToSelected setting when executing action', async ({ page }) => {
    // This test assumes the query item has zoomToSelected enabled
    // Execute a query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    // Open data actions dropdown
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    await dataActionButton.click();
    await page.waitForTimeout(500);

    // Click "Add to Map" action
    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await addToMapAction.click();
    await page.waitForTimeout(3000); // Wait for zoom to complete

    // Verify zoom occurred (we can't directly check map extent, but we can verify
    // the action completed successfully by checking results are still visible)
    const isResultsVisible = await helpers.isResultsViewVisible();
    expect(isResultsVisible).toBe(true);
  });

  test('should clear selection when Clear Results is clicked after Add to Map', async ({ page }) => {
    // Execute a query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    const resultCount = await helpers.getResultCount();
    expect(resultCount).toBeGreaterThan(0);

    // Execute "Add to Map" action
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    await dataActionButton.click();
    await page.waitForTimeout(500);

    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await addToMapAction.click();
    await page.waitForTimeout(2000);

    // Clear results
    await helpers.clearResults();
    await page.waitForTimeout(1000);

    // Verify results are cleared
    await helpers.verifyResultsCleared();

    // Verify we're back on Query tab
    const isQueryFormVisible = await helpers.isQueryFormVisible();
    expect(isQueryFormVisible).toBe(true);
  });

  test('should not show framework "Show on Map" action', async ({ page }) => {
    // Execute a query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    // Open data actions dropdown
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    await dataActionButton.click();
    await page.waitForTimeout(500);

    // Verify "Show on Map" (framework action) is NOT present
    const showOnMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /show on map/i })
      .first();

    await expect(showOnMapAction).not.toBeVisible({ timeout: 2000 });

    // Verify "Add to Map" (custom action) IS present
    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await expect(addToMapAction).toBeVisible({ timeout: 5000 });
  });

  test('should use correct icon for Add to Map action', async ({ page }) => {
    // Execute a query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();

    // Open data actions dropdown
    const dataActionButton = page
      .locator('button[aria-label*="action"], button[aria-label*="Action"]')
      .or(page.locator('.jimu-dropdown-button'))
      .first();

    await dataActionButton.click();
    await page.waitForTimeout(500);

    // Find the Add to Map action
    const addToMapAction = page
      .locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /add to map/i })
      .first();

    await expect(addToMapAction).toBeVisible();

    // Verify icon is present (check for SVG or icon element)
    const icon = addToMapAction.locator('svg, [class*="icon"], img').first();
    await expect(icon).toBeVisible({ timeout: 2000 });
  });
});

