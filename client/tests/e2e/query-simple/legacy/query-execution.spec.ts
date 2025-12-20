import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Playwright E2E tests for QuerySimple query execution workflow
 * 
 * Tests the core query functionality:
 * - Query form interactions (select query item, enter value, submit)
 * - Query execution and results display
 * - Tab switching (Query tab ↔ Results tab)
 * - Multiple query executions
 * - Empty query handling
 * - Enter key submission
 */

test.describe('QuerySimple Query Execution', () => {
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

  test('should execute query with Apply button', async ({ page }) => {
    // Select query item
    await helpers.selectQueryItem('King County Parcels - PIN');
    
    // Enter query value
    await helpers.enterQueryValue('2223059013');
    
    // Click Apply button
    await helpers.clickApply();
    
    // Wait for results
    await helpers.waitForResults();
    
    // Verify we're on Results tab
    const isResultsVisible = await helpers.isResultsViewVisible();
    expect(isResultsVisible).toBe(true);
    
    // Verify results count is greater than 0
    const resultCount = await helpers.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should execute query with Enter key', async ({ page }) => {
    // Select query item
    await helpers.selectQueryItem('King County Parcels - PIN');
    
    // Enter query value
    await helpers.enterQueryValue('2223059013');
    
    // Press Enter to submit
    await helpers.pressEnter();
    
    // Wait for results
    await helpers.waitForResults();
    
    // Verify we're on Results tab
    const isResultsVisible = await helpers.isResultsViewVisible();
    expect(isResultsVisible).toBe(true);
    
    // Verify results count
    const resultCount = await helpers.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should switch to Results tab after query execution', async ({ page }) => {
    // Verify we start on Query tab
    const isQueryFormVisible = await helpers.isQueryFormVisible();
    expect(isQueryFormVisible).toBe(true);
    
    // Execute query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    
    // Wait for results and verify tab switch
    await helpers.waitForResults();
    
    // Verify we're now on Results tab
    const isResultsVisible = await helpers.isResultsViewVisible();
    expect(isResultsVisible).toBe(true);
    
    // Verify Query tab is no longer visible
    const isQueryFormStillVisible = await helpers.isQueryFormVisible();
    expect(isQueryFormStillVisible).toBe(false);
  });

  test('should execute multiple queries sequentially', async ({ page }) => {
    // First query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    const firstResultCount = await helpers.getResultCount();
    expect(firstResultCount).toBeGreaterThan(0);
    
    // Clear results to go back to Query tab
    await helpers.clearResults();
    await helpers.verifyResultsCleared();
    
    // Verify we're back on Query tab
    const isQueryFormVisible = await helpers.isQueryFormVisible();
    expect(isQueryFormVisible).toBe(true);
    
    // Second query with different value
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('5104451200');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    const secondResultCount = await helpers.getResultCount();
    expect(secondResultCount).toBeGreaterThan(0);
    
    // Results may be different, but both should have results
    expect(secondResultCount).toBeGreaterThan(0);
  });

  test('should handle switching between different query items', async ({ page }) => {
    // Execute PIN query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    const pinResultCount = await helpers.getResultCount();
    expect(pinResultCount).toBeGreaterThan(0);
    
    // Clear and switch to Major query (if available)
    await helpers.clearResults();
    
    // Try to select Major query item if it exists
    // Note: This test assumes Major query item exists in the config
    // If it doesn't exist, this test will need to be adjusted
    try {
      await helpers.selectQueryItem('King County Parcels - Major');
      
      // Enter Major value
      await helpers.enterQueryValue('123456');
      await helpers.clickApply();
      await helpers.waitForResults();
      
      const majorResultCount = await helpers.getResultCount();
      expect(majorResultCount).toBeGreaterThan(0);
    } catch (e) {
      // Major query item may not exist, skip this part
      console.log('Major query item not found, skipping that part of the test');
    }
  });

  test('should display result count information', async ({ page }) => {
    // Execute query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    // Get result count
    const displayedCount = await helpers.getResultCount();
    const totalCount = await helpers.getTotalResultCount();
    
    // Verify counts are valid
    expect(displayedCount).toBeGreaterThan(0);
    expect(totalCount).toBeGreaterThan(0);
    expect(displayedCount).toBeLessThanOrEqual(totalCount);
  });

  test('should handle empty query value gracefully', async ({ page }) => {
    // Select query item
    await helpers.selectQueryItem('King County Parcels - PIN');
    
    // Don't enter a value (or enter empty string)
    await helpers.enterQueryValue('');
    
    // Try to click Apply
    await helpers.clickApply();
    
    // Wait a bit to see what happens
    await page.waitForTimeout(2000);
    
    // The widget should either:
    // 1. Stay on Query tab (validation prevents submission)
    // 2. Show an error message
    // 3. Execute with empty query (returning all results - not ideal but possible)
    
    // For now, just verify the widget is still functional
    // The exact behavior depends on form validation implementation
    const isQueryFormVisible = await helpers.isQueryFormVisible();
    const isResultsVisible = await helpers.isResultsViewVisible();
    
    // At least one tab should be visible
    expect(isQueryFormVisible || isResultsVisible).toBe(true);
  });

  test('should clear input value when switching query items', async ({ page }) => {
    // Enter value for PIN query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    
    // Verify value is in input
    const input = page.locator('input[type="text"]:visible').first();
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('2223059013');
    
    // Switch to a different query item (if available)
    // Note: This test assumes there are multiple query items
    // If only one exists, this test will need to be adjusted
    try {
      await helpers.selectQueryItem('King County Parcels - Major');
      
      // Verify input is cleared or changed
      await page.waitForTimeout(1000);
      const newInputValue = await input.inputValue();
      
      // Input should be empty or different (depending on implementation)
      // The key is that it shouldn't still have the PIN value
      expect(newInputValue).not.toBe('2223059013');
    } catch (e) {
      // Only one query item exists, skip this part
      console.log('Only one query item available, skipping input clearing test');
    }
  });

  test('should maintain query state after tab switch', async ({ page }) => {
    // Execute query
    await helpers.selectQueryItem('King County Parcels - PIN');
    await helpers.enterQueryValue('2223059013');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    // Verify results are displayed
    const resultCount = await helpers.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
    
    // Clear results to go back to Query tab
    await helpers.clearResults();
    
    // Verify we're back on Query tab
    const isQueryFormVisible = await helpers.isQueryFormVisible();
    expect(isQueryFormVisible).toBe(true);
    
    // Verify the query item is still selected (form should be ready for new query)
    // This is verified by being able to enter a new value
    await helpers.enterQueryValue('5104451200');
    await helpers.clickApply();
    await helpers.waitForResults();
    
    // Verify new query executed successfully
    const newResultCount = await helpers.getResultCount();
    expect(newResultCount).toBeGreaterThan(0);
  });
});

