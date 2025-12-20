import { Page, expect, Locator } from '@playwright/test';

/**
 * Helper utilities for testing KC Search widget
 */
export class KCSearchHelpers {
  constructor(private page: Page) {}

  /**
   * Get a locator for the widget. 
   */
  getWidget(widgetId: string): Locator {
    return this.page.locator(`[data-widgetid="${widgetId}"]`).last();
  }

  /**
   * Click the widget controller to open a specific widget
   */
  async openWidget(label: string, widgetId?: string) {
    console.log(`🔍 Opening widget: "${label}" ${widgetId ? `(${widgetId})` : ''}`);
    
    // Priority 1: Use data-widgetid if we have it (most reliable in ExB)
    // Priority 2: Use the aria-label/text fallback
    const btn = widgetId 
      ? this.page.locator(`button[data-widgetid="${widgetId}"]`).first()
      : this.page.locator(`button[aria-label*="${label}" i], button:has-text("${label}")`).first();
    
    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`   🖱️ Clicking widget button for "${label}"`);
      await btn.click({ force: true });
      await this.page.waitForTimeout(2000); 
    } catch (e) {
      console.log(`   ❌ Could not find widget button with label "${label}". Listing all button labels for debug:`);
      const buttons = await this.page.locator('button[aria-label], button').all();
      for (const b of buttons) {
        const text = await b.textContent();
        const aria = await b.getAttribute('aria-label');
        if (text || aria) {
          console.log(`      - Button: text="${text?.trim()}", aria="${aria}"`);
        }
      }
      
      console.log(`   🔍 Trying fallback search for "${label}"...`);
      // Try to find ANY button that might be the controller
      const anyControllerBtn = this.page.locator('.widget-controller button, .jimu-widget-controller button').filter({ hasText: new RegExp(label, 'i') }).first();
      if (await anyControllerBtn.isVisible()) {
        await anyControllerBtn.click({ force: true });
        await this.page.waitForTimeout(2000);
      } else {
        throw new Error(`Could not find widget button for "${label}" ${widgetId ? `with ID ${widgetId}` : ''}`);
      }
    }
  }

  /**
   * Close a widget panel
   */
  async closeWidget() {
    console.log('✖️ Closing panel');
    const closeBtn = this.page.locator('button[aria-label="Close"], .jimu-floating-panel-header button[aria-label="Close"]').filter({ visible: true }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click({ force: true });
      await this.page.waitForTimeout(1000);
      console.log('✅ Widget closed');
    }
  }

  /**
   * Wait for widget content to be ready
   */
  async waitForWidget(widgetId: string) {
    console.log(`⏳ Waiting for ${widgetId}...`);
    const widget = this.getWidget(widgetId);
    await widget.waitFor({ state: 'attached', timeout: 30000 });
    await this.page.waitForTimeout(1000);
    console.log(`✅ ${widgetId} ready`);
  }

  /**
   * Select a query item from the dropdowns
   */
  async selectFromDropdown(itemName: string | RegExp, type: 'layer' | 'alias', widgetId: string) {
    const itemStr = itemName instanceof RegExp ? itemName.source : itemName;
    const widget = this.getWidget(widgetId);
    
    // Count available dropdowns to handle grouped vs ungrouped
    const dropdowns = widget.locator('button[role="combobox"], [data-testid="dropdownBtn"]');
    const dropdownCount = await dropdowns.count();
    console.log(`🔍 Selecting "${itemStr}" in ${widgetId} (${type}). Found ${dropdownCount} dropdowns.`);
    
    // For ungrouped widgets, the 'alias' is actually the first and only dropdown (0)
    // For grouped widgets, 'layer' is 0 and 'alias' is 1
    let dropdownIndex = 0;
    if (dropdownCount > 1) {
      dropdownIndex = type === 'layer' ? 0 : 1;
    } else if (type === 'layer') {
      console.log(`⚠️ Widget ${widgetId} only has 1 dropdown. Assuming it's the layer/alias dropdown.`);
      dropdownIndex = 0;
    }
    
    const dropdown = dropdowns.nth(dropdownIndex);
    
    await dropdown.waitFor({ state: 'attached', timeout: 15000 });
    
    const currentValue = await dropdown.textContent();
    if (currentValue && (itemName instanceof RegExp ? itemName.test(currentValue) : currentValue.includes(itemStr))) {
      console.log(`✅ Already selected: ${currentValue}`);
      return;
    }

    await dropdown.click({ force: true });
    await this.page.waitForTimeout(1500); 
    
    // Use a more generic locator for the item to handle different casing/labeling
    // EXPLICITLY exclude .query-result-item to avoid collision with results list
    const option = this.page.locator('.jimu-dropdown-item, .dropdown-item, [role="option"]:not(.query-result-item)').filter({ hasText: new RegExp(itemName, 'i') }).first();
    await option.waitFor({ state: 'attached', timeout: 15000 });
    await option.click({ force: true });
    
    // Wait for dropdown to reflect new value
    await this.page.waitForTimeout(1000);
    
    // Retry finding the dropdown if it was detached (sometimes happens during React renders)
    const activeDropdown = widget.locator('button[role="combobox"], [data-testid="dropdownBtn"]').nth(dropdownIndex);
    const newValue = await activeDropdown.textContent();
    console.log(`✅ Selection attempted: ${itemStr}. Current: ${newValue}`);
    
    // Verify selection actually happened
    if (newValue && !(itemName instanceof RegExp ? itemName.test(newValue) : newValue.includes(itemStr))) {
      console.log(`⚠️ Selection might have failed. Expected ${itemStr} but got ${newValue}. Retrying...`);
      await activeDropdown.click({ force: true });
      await this.page.waitForTimeout(1000);
      await option.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Enter query value into the search input
   */
  async enterQueryValue(value: string, widgetId: string) {
    console.log(`📝 [Step: enterQueryValue] Entering "${value}" in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    
    // 1. Ensure we are on the Query tab
    console.log('   🔍 Checking for Query tab...');
    const queryTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /Query/i }).first();
    const isActive = await widget.locator('.jimu-nav-link.active, button[role="tab"][aria-selected="true"]').filter({ hasText: /Query/i }).count() > 0;
    
    if (!isActive && await queryTab.isVisible()) {
      console.log('   📑 Switching to Query tab to expose input');
      await queryTab.click({ force: true });
      await this.page.waitForTimeout(1500); // Wait for tab transition
    }

    // 2. Find and fill the input
    console.log('   🔍 Searching for input field...');
    const input = widget.locator('input.jimu-input-base, input:not([type="hidden"])').filter({ visible: true }).first();
    
    try {
      await input.waitFor({ state: 'attached', timeout: 10000 });
      console.log('   ⌨️  Focusing and filling input');
      await input.focus();
      await input.fill(value);
      await input.dispatchEvent('input', { bubbles: true });
      await input.dispatchEvent('change', { bubbles: true });
      await input.press('Enter');
      console.log('   ✅ Input filled and Enter pressed');
    } catch (e) {
      console.log(`   ❌ [enterQueryValue] Failed: ${e.message}`);
      // Final attempt: wait longer and try simple fill
      await this.page.waitForTimeout(3000);
      await input.fill(value);
      await input.press('Enter');
    }
  }

  /**
   * Click Apply button in the search form
   */
  async clickApply(widgetId: string) {
    console.log(`🖱️ [Step: clickApply] Clicking Apply in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    
    // 1. Ensure we are actually on the Query tab before clicking Apply
    const queryTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /Query/i }).first();
    const isActive = await widget.locator('.jimu-nav-link.active, button[role="tab"][aria-selected="true"]').filter({ hasText: /Query/i }).count() > 0;
    
    if (!isActive && await queryTab.isVisible()) {
      console.log('   📑 Switching to Query tab to expose Apply button');
      await queryTab.click({ force: true });
      await this.page.waitForTimeout(1500);
    }

    // 2. Find and click Apply
    const applyBtn = widget.locator('button').filter({ hasText: /^Apply$/i }).first();
    
    try {
      await applyBtn.waitFor({ state: 'attached', timeout: 10000 });
      await applyBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500); // Settle
      console.log('   🖱️ Clicking Apply button');
      await applyBtn.click({ force: true });
      console.log('   ✅ Apply clicked');
    } catch (e) {
      console.log(`   ❌ [clickApply] Failed: ${e.message}`);
      // Fallback: try to find ANY button with Apply text even if not visible yet
      await applyBtn.click({ force: true }).catch(() => console.log('   ⚠️ Fallback click failed too'));
    }
  }

  /**
   * Wait for query results to appear, ensuring it's fresh data
   */
  async waitForResults(widgetId: string, timeout = 30000) {
    console.log(`⏳ Waiting for results in ${widgetId}...`);
    const widget = this.getWidget(widgetId);
    
    const results = widget.locator('.query-result-info, [class*="result-count"], .query-result-list').first();
    
    try {
      // Snappy check: Is it already there?
      if (await results.isVisible()) {
        console.log('✅ Results already visible');
        return;
      }

      // Otherwise wait for it
      await results.waitFor({ state: 'attached', timeout });
      // Tiny settle delay for React
      await this.page.waitForTimeout(500);
      console.log('✅ Results appeared');
    } catch (e) {
      console.log('⚠️ Results container timeout');
    }
  }

  /**
   * Get the displayed result count from the UI
   */
  async getResultCount(widgetId: string): Promise<number> {
    const widget = this.getWidget(widgetId);
    const info = widget.locator('.query-result-info, [class*="result-count"]').first();
    
    try {
      for (let i = 0; i < 5; i++) {
        const text = await info.textContent() || '';
        const matches = text.match(/(\d+)/g);
        if (matches) return parseInt(matches[0], 10);
        await this.page.waitForTimeout(1000);
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Switch to the Query tab
   */
  async switchToQueryTab(widgetId: string) {
    console.log(`📑 Switching to Query tab in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    const queryTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /Query/i }).first();
    await queryTab.click({ force: true });
    await this.page.waitForTimeout(1500);
  }

  /**
   * Switch to the Results tab
   */
  async switchToResultsTab(widgetId: string) {
    console.log(`📑 Switching to Results tab in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    const resultsTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /Results/i }).first();
    await resultsTab.click({ force: true });
    await this.page.waitForTimeout(1500);
  }

  /**
   * Set the results mode (New, Add, Remove)
   */
  async setResultsMode(mode: 'New' | 'Add' | 'Remove', widgetId: string) {
    console.log(`🎯 Setting results mode to: ${mode} in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    const modeButton = widget.locator('button').filter({ hasText: new RegExp(`^${mode}$`, 'i') }).first();
    await modeButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Ensure the results list is collapsed (compact mode)
   */
  async ensureResultsCollapsed(widgetId: string) {
    console.log(`📏 Ensuring results are collapsed in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    
    // Look for the "Collapse all" button. If it's present, it means things are expanded.
    const collapseBtn = widget.locator('button[aria-label*="collapse all" i]').first();
    
    if (await collapseBtn.isVisible()) {
      console.log('🤏 Records are expanded. Collapsing for reliable interaction...');
      await collapseBtn.click({ force: true });
      await this.page.waitForTimeout(1000); // Wait for the "shrink" animation
    } else {
      console.log('✅ Records already compact');
    }
  }

  /**
   * Click the Expand All button
   */
  async clickExpandAll(widgetId: string) {
    console.log(`↔️ Clicking Expand All in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    const expandBtn = widget.locator('button[aria-label*="expand all" i]').first();
    await expandBtn.waitFor({ state: 'attached', timeout: 5000 });
    await expandBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click the Collapse All button
   */
  async clickCollapseAll(widgetId: string) {
    console.log(`🤏 Clicking Collapse All in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    const collapseBtn = widget.locator('button[aria-label*="collapse all" i]').first();
    await collapseBtn.waitFor({ state: 'attached', timeout: 5000 });
    await collapseBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click the Clear Results button
   */
  async clickClearResults(widgetId: string) {
    console.log(`🧹 [Step: clickClearResults] Clicking Clear Results in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    
    // Ensure we are on the Results tab
    const resultsTab = widget.locator('.jimu-nav-link, button[role="tab"]').filter({ hasText: /Results/i }).first();
    const isActive = await widget.locator('.jimu-nav-link.active, button[role="tab"][aria-selected="true"]').filter({ hasText: /Results/i }).count() > 0;
    
    if (!isActive && await resultsTab.isVisible()) {
      console.log('   📑 Switching to Results tab to expose Clear button');
      await resultsTab.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    const clearBtn = widget.locator('button[aria-label*="clear results" i], button:has-text("Clear Results")').first();
    
    try {
      await clearBtn.waitFor({ state: 'attached', timeout: 10000 });
      await clearBtn.scrollIntoViewIfNeeded();
      console.log('   🖱️ Clicking Clear Results button');
      await clearBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
      console.log('   ✅ Results cleared');
    } catch (e) {
      console.log(`   ❌ [clickClearResults] Failed: ${e.message}`);
      // Fallback
      await clearBtn.click({ force: true }).catch(() => console.log('   ⚠️ Fallback clear failed'));
    }
  }

  /**
   * Click the map's "Clear selection" tool button (usually in the upper left)
   */
  async clearMapSelection() {
    console.log('🗺️ Clicking Map "Clear selection" tool');
    const clearBtn = this.page.locator('button[aria-label="Clear selection"], button[title="Clear selection"]').first();
    await clearBtn.waitFor({ state: 'visible', timeout: 10000 });
    await clearBtn.click({ force: true });
    await this.page.waitForTimeout(1500);
    console.log('✅ Map selection cleared');
  }

  /**
   * Execute a data action from the dropdown
   */
  async executeAction(widgetId: string, actionName: string) {
    console.log(`🚀 Executing action "${actionName}" in ${widgetId}`);
    const widget = this.getWidget(widgetId);
    
    // 1. Open the actions menu
    console.log('   🔍 Searching for actions menu button...');
    const actionMenuBtn = widget.locator('button.data-action-button, button[aria-label*="action" i], [data-testid="dropdownBtn"].data-action-button').first();
    
    try {
      await actionMenuBtn.waitFor({ state: 'attached', timeout: 10000 });
      await actionMenuBtn.scrollIntoViewIfNeeded();
      console.log('   🖱️ Clicking actions menu button');
      await actionMenuBtn.click({ force: true });
      await this.page.waitForTimeout(1500);
    } catch (e) {
      console.log(`   ❌ Failed to find or click actions menu button: ${e.message}`);
      // Fallback: try to find any button with "Actions" or the specific icon
      const fallbackBtn = widget.locator('button').filter({ hasText: /Actions/i }).first();
      if (await fallbackBtn.isVisible()) {
        console.log('   🖱️ Clicking fallback Actions button');
        await fallbackBtn.click({ force: true });
        await this.page.waitForTimeout(1500);
      } else {
        throw e;
      }
    }
    
    // 2. Click the specific action
    console.log(`   🖱️ Looking for action: "${actionName}"`);
    const actionItem = this.page.locator('.jimu-dropdown-item, .dropdown-item, [role="menuitem"], [role="option"]').filter({ hasText: new RegExp(actionName, 'i') }).first();
    await actionItem.waitFor({ state: 'attached', timeout: 10000 });
    await actionItem.click({ force: true });
    console.log(`   ✅ Action "${actionName}" clicked`);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Manually remove the Nth result item
   */
  async removeResultItem(n: number, widgetId: string) {
    console.log(`🗑️ Manually removing result item #${n} in ${widgetId}`);
    
    // 1. Ensure records are collapsed so we can see more of them
    await this.ensureResultsCollapsed(widgetId);
    
    const widget = this.getWidget(widgetId);
    const resultItem = widget.locator('.query-result-item').nth(n);
    
    // 2. Scroll the specific item into view
    await resultItem.scrollIntoViewIfNeeded();
    
    // 3. Find and click the trash icon
    const removeBtn = resultItem.locator('button[aria-label*="remove" i], button .jimu-icon-delete').first();
    await removeBtn.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify results are cleared (Virtual Clear)
   */
  async verifyResultsCleared(widgetId: string) {
    console.log(`🧐 Verifying results cleared in ${widgetId}`);
    const count = await this.getResultCount(widgetId);
    expect(count).toBe(0);
  }
}
