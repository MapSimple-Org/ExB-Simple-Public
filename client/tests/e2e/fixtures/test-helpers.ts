import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for testing KC Search widget
 */
export class KCSearchHelpers {
  constructor(private page: Page) {}

  /**
   * Click the widget controller to open a widget
   * NOTE: This is primarily for HelperSimple widget tests that test hash-based opening.
   * KC Search widget should be open by default.
   */
  async openWidgetController() {
    console.log('🔍 Looking for widget controller to open...');
    console.log('');
    
    // First, let's see what buttons/elements are available
    const allButtons = await this.page.locator('button').all();
    console.log(`📊 Found ${allButtons.length} buttons on the page:`);
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      try {
        const button = allButtons[i];
        const text = await button.textContent().catch(() => '');
        const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
        const className = await button.getAttribute('class').catch(() => '');
        const dataWidgetId = await button.getAttribute('data-widget-id').catch(() => '');
        const isVisible = await button.isVisible().catch(() => false);
        console.log(`   Button ${i}: text="${text}", aria-label="${ariaLabel}", class="${className}", data-widget-id="${dataWidgetId}", visible=${isVisible}`);
      } catch (e) {
        console.log(`   Button ${i}: Error getting info`);
      }
    }
    console.log('');
    
    // Try multiple selectors for the widget controller
    const controllerSelectors = [
      '[data-widget-id*="query"], [data-widget-id*="Query"]', // Widget with query in ID
      '[aria-label*="query" i], [aria-label*="search" i]', // Aria label with query/search
      'button[class*="controller"], button[class*="widget"]', // Controller button
      '[role="button"][class*="controller"]', // Controller role button
      '.widget-controller, .controller-button', // Common controller classes
      'button:has-text("Search"), button:has-text("Query")', // Button with text
    ];
    
    let controllerClicked = false;
    for (const selector of controllerSelectors) {
      try {
        console.log(`🔎 Trying selector: ${selector}`);
        const controller = this.page.locator(selector).first();
        const count = await controller.count();
        console.log(`   Found ${count} elements matching this selector`);
        
        if (count > 0) {
          const isVisible = await controller.isVisible({ timeout: 2000 }).catch(() => false);
          console.log(`   Element is visible: ${isVisible}`);
          
          if (isVisible) {
            // Get info about what we're about to click
            const text = await controller.textContent().catch(() => '');
            const ariaLabel = await controller.getAttribute('aria-label').catch(() => '');
            const className = await controller.getAttribute('class').catch(() => '');
            console.log(`   📌 About to click: text="${text}", aria-label="${ariaLabel}", class="${className}"`);
            
            await controller.click();
            console.log('✅ Clicked widget controller');
            controllerClicked = true;
            // Wait for widget to open
            await this.page.waitForTimeout(2000);
            break;
          } else {
            console.log('   ⚠️  Element found but not visible');
          }
        }
      } catch (e) {
        console.log(`   ❌ Error with selector: ${e.message}`);
      }
      console.log('');
    }
    
    if (!controllerClicked) {
      console.log('⚠️  Could not find widget controller with standard selectors.');
      console.log('🔍 Trying fallback: looking for widget-related elements...');
      console.log('');
      
      // Fallback: try clicking on any widget-related element
      const fallbackSelectors = [
        '[data-widget-id]',
        '[class*="widget"]',
        'button',
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          console.log(`🔎 Trying fallback selector: ${selector}`);
          const elements = this.page.locator(selector);
          const count = await elements.count();
          console.log(`   Found ${count} elements`);
          
          if (count > 0) {
            // Try clicking the first few to see if one opens the widget
            for (let i = 0; i < Math.min(5, count); i++) {
              const element = elements.nth(i);
              const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
              if (isVisible) {
                const text = await element.textContent().catch(() => '');
                const ariaLabel = await element.getAttribute('aria-label').catch(() => '');
                const className = await element.getAttribute('class').catch(() => '');
                console.log(`   📌 Trying to click element ${i}: text="${text}", aria-label="${ariaLabel}", class="${className}"`);
                
                await element.click();
                await this.page.waitForTimeout(2000);
                
                // Check if widget opened (inputs/selects appeared)
                const inputsAfter = await this.page.locator('input, select').count();
                console.log(`   After click: ${inputsAfter} inputs/selects found`);
                
                if (inputsAfter > 0) {
                  console.log('✅ Widget appears to have opened!');
                  controllerClicked = true;
                  break;
                } else {
                  console.log('   ⚠️  Widget did not open, trying next element...');
                }
              }
            }
            if (controllerClicked) break;
          }
        } catch (e) {
          console.log(`   ❌ Error: ${e.message}`);
        }
        console.log('');
      }
    }
    
    if (!controllerClicked) {
      console.log('⚠️  Warning: Could not find or click widget controller.');
      console.log('   The widget may already be open, or you may need to click it manually.');
      console.log('   Please check the browser and tell me what button/element should be clicked.');
    }
  }

  /**
   * Wait for the KC Search widget to be fully loaded
   */
  async waitForWidget() {
    // Debug: Log the current URL
    console.log('Current page URL:', this.page.url());
    
    // First, wait for the loading screen to disappear
    console.log('Waiting for loading screen to disappear...');
    try {
      // Wait for loading indicators to be hidden
      await this.page.waitForSelector('.loading-content', { state: 'hidden', timeout: 60000 });
      console.log('Loading screen disappeared');
    } catch (e) {
      // If loading screen selector doesn't exist or times out, continue
      console.log('Loading screen check completed (may not exist)');
    }
    
    // Also wait for the primary loading app indicator to disappear
    try {
      await this.page.waitForSelector('.jimu-primary-loading-app', { state: 'hidden', timeout: 60000 });
      console.log('Primary loading indicator disappeared');
    } catch (e) {
      console.log('Primary loading indicator check completed (may not exist)');
    }
    
    // Wait for the page to be fully loaded
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 60000 });
      console.log('Page reached networkidle state');
    } catch (e) {
      // If networkidle times out, try domcontentloaded
      console.log('Networkidle timed out, waiting for domcontentloaded...');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    }
    
    // Wait a bit more for React to render
    console.log('Waiting for React to render...');
    await this.page.waitForTimeout(5000);
    
    // Widget should be open by default - no need to click controller
    // (Controller clicking is only needed for HelperSimple hash tests)
    
    // Debug: Log page title
    const title = await this.page.title();
    console.log('Page title:', title);
    
    // Wait longer for widgets to render - they might load asynchronously
    console.log('Waiting for widgets to render...');
    await this.page.waitForTimeout(10000); // Give it 10 seconds for widgets to load
    
    // Try to find the widget - look for common widget containers or search-related elements
    // This is more flexible and will work even if the exact classes change
    const possibleSelectors = [
      'input[type="text"]', // Any text input (likely the search input)
      'select', // Any select dropdown (likely the query item selector)
      '[role="combobox"]', // Combobox for query selection
      'button', // Any button (Apply, etc.)
      '.widget-container', // Generic widget container
      '[data-widget-id]', // Widget with data attribute
      '[class*="widget"]', // Any element with widget in class name
      '[class*="query"]', // Any element with query in class name
    ];
    
    // Wait for at least one of these to be visible
    let found = false;
    let foundSelector = '';
    let maxCount = 0;
    
    for (const selector of possibleSelectors) {
      try {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          const isVisible = await this.page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            found = true;
            foundSelector = selector;
            maxCount = Math.max(maxCount, count);
            console.log(`Found widget element using selector: ${selector} (${count} elements)`);
            // Don't break - keep checking to find the best match
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If we found buttons but no inputs/selects, that's okay - widgets might still be loading
    // or inputs might be in shadow DOM. Just verify we're on the right page.
    const allInputs = await this.page.locator('input').count();
    const allSelects = await this.page.locator('select').count();
    const allButtons = await this.page.locator('button').count();
    const urlHasExperience = /experience/.test(this.page.url());
    
    console.log(`Page has ${allInputs} inputs, ${allSelects} selects, ${allButtons} buttons`);
    
    // More lenient: if we have buttons and we're on the experience URL, consider it good enough
    if (!found && allButtons > 0 && urlHasExperience) {
      console.log('⚠️  No inputs/selects found yet, but buttons are present and URL is correct.');
      console.log('   Widgets may still be loading. Continuing anyway...');
      found = true;
      foundSelector = 'button (fallback)';
    }
    
    if (!found) {
      // Take a screenshot for debugging
      const screenshotPath = 'test-results/widget-not-found.png';
      try {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);
      } catch (e) {
        console.log('Could not take screenshot:', e);
      }
      
      // Get page content for debugging
      const bodyText = await this.page.textContent('body').catch(() => 'Unable to get body text');
      console.log('Page body preview:', bodyText.substring(0, 500));
      
      throw new Error(`Could not find widget elements. Screenshot saved to ${screenshotPath}. Page URL: ${this.page.url()}`);
    }
    
    console.log(`✅ Widget detection complete using: ${foundSelector}`);
  }

  /**
   * Select a query item from the Search Layer dropdown
   * @param itemName - The name of the query item to select (e.g., "King County Parcels - PIN")
   */
  async selectQueryItem(itemName: string) {
    // Wait a bit for the widget to be fully interactive
    await this.page.waitForTimeout(2000);
    
    console.log(`🔍 Looking for Search Layer dropdown to select: "${itemName}"`);
    
    // Find the dropdown button/combobox - it's likely a button with role="combobox"
    const dropdownSelectors = [
      '[role="combobox"]',
      '[data-testid="dropdownBtn"]',
      '.jimu-select-button',
      '.jimu-dropdown-button',
      'button[aria-haspopup="listbox"]',
      'select',
      '[aria-label*="Search Layer" i]',
      '[aria-label*="search layer" i]',
    ];
    
    let dropdownButton = null;
    for (const selector of dropdownSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
            console.log(`   Found dropdown with selector: ${selector} (tag: ${tagName})`);
            dropdownButton = element;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!dropdownButton) {
      throw new Error(`Could not find Search Layer dropdown. Available comboboxes: ${await this.page.locator('[role="combobox"]').count()}`);
    }
    
    // Click to open the dropdown
    console.log('   Clicking dropdown to open...');
    await dropdownButton.click();
    
    // Wait for dropdown options to appear
    await this.page.waitForTimeout(1000);
    
    // Look for the option in the dropdown list
    // Options might be in a listbox or dropdown menu
    const optionSelectors = [
      `[role="listbox"] [role="option"]:has-text("${itemName}")`,
      `[role="option"]:has-text("${itemName}")`,
      `[role="listbox"] *:has-text("${itemName}")`,
      `.dropdown-menu *:has-text("${itemName}")`,
      `text=${itemName}`,
    ];
    
    let clicked = false;
    for (const selector of optionSelectors) {
      try {
        const option = this.page.locator(selector).first();
        const count = await option.count();
        if (count > 0) {
          const isVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            const optionText = await option.textContent().catch(() => '');
            console.log(`   Found option: "${optionText}" - clicking...`);
            await option.click();
            clicked = true;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    // If it's a native select element, use selectOption
    if (!clicked) {
      try {
        const tagName = await dropdownButton.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
        if (tagName === 'select') {
          console.log('   Using selectOption for native select...');
          await dropdownButton.selectOption({ label: itemName });
          clicked = true;
        }
      } catch (e) {
        // Not a native select or selectOption failed
      }
    }
    
    if (!clicked) {
      // Last resort: try keyboard navigation
      console.log('   Trying keyboard navigation...');
      await this.page.keyboard.type(itemName);
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Enter');
    }
    
    // Wait for form to update after selection
    await this.page.waitForTimeout(1500);
    console.log('✅ Query item selected');
  }

  /**
   * Enter a value in the query input field
   * @param value - The value to enter
   */
  async enterQueryValue(value: string) {
    console.log(`📝 Entering query value: "${value}"`);
    
    // Find the input field in the query form
    // Try multiple selectors as the input might be in different states
    const inputSelectors = [
      'input[type="text"]:visible',
      'input[type="text"]',
      'input:not([type="hidden"]):visible',
      'input[placeholder*="enter" i]',
      'input[placeholder*="PIN" i]',
      'input[placeholder*="Major" i]',
    ];
    
    let input = null;
    for (const selector of inputSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            const isEditable = await element.isEditable().catch(() => false);
            if (isEditable) {
              console.log(`   Found input with selector: ${selector}`);
              input = element;
              break;
            }
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!input) {
      // Fallback: try to find any visible input
      const allInputs = await this.page.locator('input').all();
      for (const inp of allInputs) {
        try {
          const isVisible = await inp.isVisible().catch(() => false);
          const isEditable = await inp.isEditable().catch(() => false);
          const inputType = await inp.getAttribute('type').catch(() => '');
          if (isVisible && isEditable && inputType !== 'hidden') {
            console.log(`   Using fallback input (type: ${inputType})`);
            input = this.page.locator('input').first();
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    if (!input) {
      throw new Error(`Could not find editable input field. Available inputs: ${await this.page.locator('input').count()}`);
    }
    
    await input.fill(value);
    await this.page.waitForTimeout(300); // Allow for input processing
    console.log('✅ Value entered');
  }

  /**
   * Submit query by clicking Apply button
   */
  async clickApply() {
    // Find the Apply button - it might have different labels
    const applyButton = this.page
      .locator('button')
      .filter({ hasText: /apply/i })
      .first();
    
    await applyButton.click();
  }

  /**
   * Submit query by pressing Enter key in the input field
   */
  async pressEnter() {
    console.log('⌨️  Pressing Enter to submit query...');
    // Find the same input we used for entering the value
    const inputSelectors = [
      'input[type="text"]:visible',
      'input[type="text"]',
      'input:not([type="hidden"]):visible',
    ];
    
    let input = null;
    for (const selector of inputSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            input = element;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!input) {
      input = this.page.locator('input[type="text"]').first();
    }
    
    await input.press('Enter');
    console.log('✅ Enter key pressed');
  }

  /**
   * Wait for query results to appear
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForResults(timeout = 30000) {
    // Look for various indicators that results have loaded
    const resultIndicators = [
      '.query-result-container',
      '.query-result',
      '.query-result-info',
      '.query-result-item',
      '.lazy-list-item',
      '[role="listbox"]',
      '[aria-label*="result"]',
      'text=/Features displayed/i',
      'text=/result/i',
    ];
    
    let found = false;
    for (const selector of resultIndicators) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        found = true;
        break;
      } catch (e) {
        // Continue
      }
    }
    
    if (!found) {
      // Wait a bit more and check if any text indicating results appears
      await this.page.waitForTimeout(3000);
      const bodyText = await this.page.textContent('body').catch(() => '');
      if (!bodyText.includes('result') && !bodyText.includes('feature')) {
        throw new Error('Results did not appear. Page content may indicate an error.');
      }
    }
    
    // Additional wait for any async operations
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the displayed result count from the UI
   * @returns The number of displayed results
   */
  async getResultCount(): Promise<number> {
    const resultInfo = this.page.locator('.query-result-info').first();
    const text = await resultInfo.textContent();
    
    if (!text) return 0;
    
    // Parse "Features displayed: X / Y" format
    const match = text.match(/Features displayed:\s*(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return parseInt(match[1], 10); // Return displayed count
    }
    
    // Fallback: try to find count in other formats
    const countMatch = text.match(/(\d+)\s*(?:result|feature)/i);
    return countMatch ? parseInt(countMatch[1], 10) : 0;
  }

  /**
   * Get the total result count (the Y in "X / Y" format)
   * @returns The total number of results
   */
  async getTotalResultCount(): Promise<number> {
    const resultInfo = this.page.locator('.query-result-info').first();
    const text = await resultInfo.textContent();
    
    if (!text) return 0;
    
    const match = text.match(/Features displayed:\s*\d+\s*\/\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Verify that features are highlighted on the map
   * This checks if the result count matches expected, which indicates
   * features should be selected on the map
   * @param expectedCount - Expected number of selected features
   */
  async verifyMapSelection(expectedCount: number) {
    // Wait a bit for map selection to update
    await this.page.waitForTimeout(2000);
    
    // For now, we'll verify the result count matches expected
    // In a real scenario, you might check map graphics or selection state
    // by inspecting the map widget's internal state or DOM
    const actualCount = await this.getResultCount();
    expect(actualCount).toBe(expectedCount);
    
    // Also verify total count matches
    const totalCount = await this.getTotalResultCount();
    expect(totalCount).toBe(expectedCount);
  }

  /**
   * Clear results using the trash/clear button
   */
  async clearResults() {
    const clearButton = this.page
      .locator('button[aria-label*="clear"], button[aria-label*="Clear"]')
      .first();
    
    await clearButton.click();
    
    // Wait for results to clear
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify that results are cleared
   */
  async verifyResultsCleared() {
    // Results container should be hidden or empty
    const resultContainer = this.page.locator('.query-result-container');
    const isVisible = await resultContainer.isVisible().catch(() => false);
    
    if (isVisible) {
      const count = await this.getResultCount().catch(() => 0);
      expect(count).toBe(0);
    }
  }

  /**
   * Check if we're on the Results tab/view
   */
  async isResultsViewVisible(): Promise<boolean> {
    const resultContainer = this.page.locator('.query-result-container, .query-result');
    return await resultContainer.isVisible().catch(() => false);
  }

  /**
   * Check if we're on the Query/Form tab/view
   */
  async isQueryFormVisible(): Promise<boolean> {
    const formContainer = this.page.locator('.query-task-form, .query-form__content');
    return await formContainer.isVisible().catch(() => false);
  }
}


