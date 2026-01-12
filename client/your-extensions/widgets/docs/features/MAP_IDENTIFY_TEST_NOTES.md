# Map Identify Restoration Test Notes

## Test File Created
`/client/tests/e2e/query-simple/map-identify-restoration.spec.ts`

## Test Scenarios (4 tests)
1. **New mode restoration** - Single query, identify click, close → should restore
2. **Add mode restoration** - Accumulated queries, identify click, close → should restore both
3. **Widget closed** - Identify shouldn't restore when widget is closed
4. **Runtime error capture** - Should detect `this.addSelectionToMap is not a function` error

## ⚠️ Critical Limitation: Tests Require Manual Interaction

**Problem:** Automated map clicking is not yet implemented.

### What These Tests Currently Do:
- ✅ Open widget
- ✅ Execute queries
- ✅ Verify results
- ⚠️ **PAUSE for manual map clicking** (5-10 second timeout)
- ⚠️ **PAUSE for manual identify popup close** (2 second timeout)
- ✅ Verify restoration (if manual steps were completed)

### What Would Be Needed for Full Automation:
```typescript
// Not yet implemented:
await helpers.clickMapFeature(x, y) // Click on map to open identify
await helpers.waitForIdentifyPopup() // Wait for popup to appear
await helpers.closeIdentifyPopup() // Close the popup programmatically
```

## Current Testing Approach

### Option 1: Semi-Automated (Recommended for Now)
1. Run test in headed mode: `npx playwright test map-identify-restoration.spec.ts --headed`
2. When test pauses with "MANUAL STEP REQUIRED", manually:
   - Click on a map feature (opens identify popup)
   - Close the identify popup
3. Test continues and verifies restoration

### Option 2: Browser Console Testing
Instead of E2E test, trigger the code path directly:
```javascript
// In browser console:
const widget = document.querySelector('[data-widgetid="widget_12"]')
const event = new CustomEvent('querysimple-restore-on-identify-close', {
  detail: {
    widgetId: 'widget_12',
    recordIds: ['123'],
    outputDsId: 'widget_12_output_3822694765645799',
    queryItemConfigId: 'query-item-1'
  }
})
window.dispatchEvent(event)
// Expected: Runtime error "this.addSelectionToMap is not a function"
```

### Option 3: Implement Map Click Automation (Future Work)
Would require:
- Playwright's `page.mouse.click(x, y)` at map coordinates
- Knowledge of where clickable features are located
- Wait for ExB's identify popup to appear
- Locate and click popup close button

## Test Execution Command

```bash
# Semi-automated (headed mode for manual interaction)
npx playwright test tests/e2e/query-simple/map-identify-restoration.spec.ts --headed --reporter=line

# Automated (will timeout on manual steps, but shows what's testable)
npx playwright test tests/e2e/query-simple/map-identify-restoration.spec.ts --reporter=line
```

## Expected Results (r019.14 - Current Buggy State)

### Test 1-3: Manual interaction required
- If manually completed: ❓ Unknown (depends on whether error is caught)
- If not manually completed: ⏭️ Tests skip manual steps, may pass without testing restoration

### Test 4: Runtime error capture
- **Expected:** Should detect error when `handleRestoreOnIdentifyClose` is triggered
- **Captures:** Console errors and page errors during manual interaction window
- **Assertion:** `expect(hasExpectedError).toBe(true)` - documents the bug

## Recommendation

**For immediate validation:**
Use browser console testing (Option 2) to directly trigger the event and observe the error.

**For production testing:**
Implement map click automation (Option 3) as part of Section 3.3 work.

**For documenting the bug:**
Test 4 provides a framework to capture the error if manual interaction is performed.
