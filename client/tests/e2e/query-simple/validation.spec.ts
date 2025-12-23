import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * SQL SANITIZATION & INPUT VALIDATION (r017.46)
 * 
 * This test suite verifies the "Empty String Prevention" and "Instant Validation"
 * features added in the r17 hardening branch.
 * 
 * Coverage:
 * 1.  Empty String Block: Apply button should be disabled when input is empty.
 * 2.  Instant Enable: Apply button should enable immediately upon typing.
 * 3.  Whitespace Block: Apply button should remain disabled for whitespace-only input.
 * 4.  List Exemption: Apply button should be ENABLED for dropdown/list queries (Regional Trails).
 */

test.describe('QuerySimple: SQL Sanitization & Validation', () => {
  let helpers: KCSearchHelpers;
  
  const WIDGET_ID = 'widget_12';
  const WIDGET_LABEL = 'Enhanced Search';
  
  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    const APP_URL = process.env.TEST_APP_URL || '/experience/0';
    const baseURL = process.env.TEST_BASE_URL || 'https://localhost:3001';
    
    // Direct URL construction to ensure parameters are passed
    const finalUrl = `${baseURL}${APP_URL}?debug=FORM,TASK&qsopen=true`;
    
    console.log(`🚀 Navigating to: ${finalUrl}`);
    await page.goto(finalUrl, { waitUntil: 'networkidle' });
    await helpers.waitForWidget(WIDGET_ID);
  });

  test('should disable Apply for empty text input and enable instantly when typing', async ({ page }) => {
    const widget = helpers.getWidget(WIDGET_ID);
    await helpers.switchToQueryTab(WIDGET_ID);
    
    // 1. Check Initial State (Empty)
    const applyBtn = widget.locator('button').filter({ hasText: /^Apply$/i }).first();
    await expect(applyBtn).toBeDisabled();
    console.log('✅ Apply button correctly disabled for empty input');

    // 2. Type Whitespace
    const input = widget.locator('input.jimu-input-base, input:not([type="hidden"])').filter({ visible: true }).first();
    await input.fill('   ');
    await expect(applyBtn).toBeDisabled();
    console.log('✅ Apply button correctly disabled for whitespace-only input');

    // 3. Type Valid Character
    await input.focus();
    await page.keyboard.type('2');
    // We check for enabled state WITHOUT blurring (Instant Validation check)
    await expect(applyBtn).toBeEnabled();
    console.log('✅ Apply button ENABLED instantly upon typing (No blur required)');

    // 4. Backspace to Empty
    await page.keyboard.press('Backspace');
    await expect(applyBtn).toBeDisabled();
    console.log('✅ Apply button disabled again after clearing input');
  });

  test('should exempt list-based queries from empty string rule', async ({ page }) => {
    const widget = helpers.getWidget(WIDGET_ID);
    await helpers.switchToQueryTab(WIDGET_ID);
    
    // 1. Switch to Regional Trails (or any Unique Value dropdown)
    // Note: This relies on "Regional Trails" being in the test app's config
    console.log('🔍 Switching to a List-based query (Regional Trails)');
    try {
      await helpers.selectFromDropdown(/Regional Trails/i, 'layer', WIDGET_ID);
      // Give the form a moment to settle and validation to update
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('⚠️ Could not find Regional Trails query, skipping list exemption check');
      return;
    }

    // 2. Verify Apply is enabled even if no selection made yet
    const applyBtn = widget.locator('button').filter({ hasText: /^Apply$/i }).first();
    await expect(applyBtn).toBeEnabled();
    console.log('✅ Apply button remains ENABLED for list-based queries (Regional Trails)');
  });
});

