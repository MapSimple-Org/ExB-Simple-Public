import { test, expect } from '@playwright/test';
import { KCSearchHelpers } from '../fixtures/test-helpers';

/**
 * Highlighting & Concurrency Hardening (r018.9)
 * Multi-widget, Multi-query session to verify:
 * 1. Sequential adds (121 + 163 = 284)
 * 2. Manual removals sync with Graphics Layer
 * 3. Restoration on Close/Open
 * 4. Multi-widget isolation (no interference)
 */
test.describe('Highlighting: Multi-Widget Mega Sync', () => {
  let helpers: KCSearchHelpers;
  const widget1Id = 'widget_12';
  let widget2Id: string | null = null;

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page);
    await page.goto('https://localhost:3001/experience/0?debug=GRAPHICS-LAYER,SELECTION,TASK,RESULTS-MODE,HASH&qsopen=true');
    await helpers.waitForWidget(widget1Id);
    
    // Discover second widget
    const widgets = await page.locator('[data-widgetid^="widget_"]').all();
    for (const w of widgets) {
      const id = await w.getAttribute('data-widgetid');
      if (id && id !== widget1Id && id !== 'widget_controller') {
        widget2Id = id;
        console.log(`📡 Discovered second widget: ${widget2Id}`);
        break;
      }
    }
  });

  test('Should maintain perfect sync across multi-query accumulation and manual removal', async ({ page }) => {
    const graphicsLogs: any[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[QUERYSIMPLE-GRAPHICS-LAYER]')) {
        try {
          const jsonMatch = text.match(/\{.*\}/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            graphicsLogs.push(data);
            if (data.event === 'addHighlightGraphics-complete' || data.event === 'addHighlightGraphics-aborted-concurrency') {
              console.log(`[GRAPHICS] ${data.event} - seq: ${data.seq} - final: ${data.finalGraphicsCount || 'aborted'}`);
            }
            if (data.event === 'clearGraphicsLayer-complete') {
              console.log(`[GRAPHICS] Cleared. Removed: ${data.graphicsRemoved}`);
            }
          }
        } catch (e) { }
      }
    });

    // --- STEP 1: Widget 1 - Search (121 records) ---
    console.log('🚀 STEP 1: Searching for 222305 (121 records) in Widget 1...');
    await helpers.selectFromDropdown(/King County Parcels/i, 'layer', widget1Id);
    await helpers.selectFromDropdown(/Major number/i, 'alias', widget1Id);
    await helpers.enterQueryValue('222305', widget1Id);
    await helpers.waitForResults(widget1Id);
    await page.waitForTimeout(3000); 

    const count1 = await helpers.getResultCount(widget1Id);
    console.log(`   UI Count: ${count1}`);
    expect(count1).toBe(121);

    // --- STEP 2: Widget 1 - Accumulate (163 records) ---
    console.log('🚀 STEP 2: Switching to ADD mode and searching 222306 (163 records)...');
    await helpers.setResultsMode('Add', widget1Id);
    await helpers.switchToQueryTab(widget1Id);
    await helpers.enterQueryValue('222306', widget1Id);
    await helpers.waitForResults(widget1Id);
    await page.waitForTimeout(5000); 

    const totalCount = await helpers.getResultCount(widget1Id);
    console.log(`   Accumulated UI Count: ${totalCount}`);
    expect(totalCount).toBe(284); // 121 + 163

    // --- STEP 3: Manual Removal ---
    console.log('🚀 STEP 3: Manually removing 4 records...');
    for (let i = 0; i < 4; i++) {
      console.log(`   Removing item ${i+1}...`);
      await helpers.removeResultItem(0, widget1Id);
      await page.waitForTimeout(1500);
    }

    const finalExpected = 280;
    const afterRemoveCount = await helpers.getResultCount(widget1Id);
    console.log(`   UI Count after removal: ${afterRemoveCount}`);
    expect(afterRemoveCount).toBe(finalExpected);

    // Verify Graphics Layer matches UI
    const lastLog = graphicsLogs.filter(l => l.event === 'addHighlightGraphics-complete').pop();
    console.log(`   Graphics Layer Count: ${lastLog?.finalGraphicsCount}`);
    expect(lastLog?.finalGraphicsCount).toBe(finalExpected);

    // --- STEP 4: Widget 2 Interaction (Isolation check) ---
    if (widget2Id) {
      console.log(`🚀 STEP 4: Opening Widget 2 (${widget2Id}) and searching for a single record...`);
      await helpers.openWidget('Enhanced Search', widget2Id);
      await helpers.waitForWidget(widget2Id);
      await helpers.selectFromDropdown(/King County Parcels/i, 'layer', widget2Id);
      await helpers.selectFromDropdown(/Major number/i, 'alias', widget2Id);
      await helpers.enterQueryValue('222305', widget2Id);
      await helpers.waitForResults(widget2Id);
      await page.waitForTimeout(3000);
      
      const w2Count = await helpers.getResultCount(widget2Id);
      console.log(`   Widget 2 UI Count: ${w2Count}`);
      expect(w2Count).toBeGreaterThan(0);
      
      // Check Widget 1 is still stable
      console.log('   Checking if Widget 1 is still stable...');
      await helpers.openWidget('Enhanced Search', widget1Id);
      const w1RestoredCount = await helpers.getResultCount(widget1Id);
      console.log(`   Widget 1 UI Count: ${w1RestoredCount}`);
      expect(w1RestoredCount).toBe(finalExpected);
    }

    // --- STEP 5: Close/Open Restoration ---
    console.log('🚀 STEP 5: Closing Widget 1 and verifying graphics purge...');
    await helpers.closeWidget();
    await page.waitForTimeout(2000);
    
    const purgeLog = graphicsLogs.filter(l => l.event === 'clearGraphicsLayer-complete' && l.widgetId === widget1Id).pop();
    console.log(`   Purged count: ${purgeLog?.graphicsRemoved}`);

    console.log('   Reopening Widget 1 and verifying restoration...');
    await helpers.openWidget('Enhanced Search', widget1Id);
    await page.waitForTimeout(4000);
    
    const restoredCount = await helpers.getResultCount(widget1Id);
    console.log(`   Restored Count: ${restoredCount}`);
    expect(restoredCount).toBe(finalExpected);

    const restoredLog = graphicsLogs.filter(l => l.event === 'addHighlightGraphics-complete' && l.widgetId === widget1Id).pop();
    console.log(`   Restored Graphics: ${restoredLog?.finalGraphicsCount}`);
    expect(restoredLog?.finalGraphicsCount).toBe(finalExpected);

    console.log('✅ MEGA SYNC TEST PASSED');
  });
});
