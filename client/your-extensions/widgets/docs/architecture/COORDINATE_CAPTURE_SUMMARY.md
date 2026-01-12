# Map Coordinate Capture - Ready for You

## ✅ What's Implemented

I've created a complete automated testing framework for Map Identify functionality. It just needs **map coordinates** from you to run fully automated.

### Files Created:

1. **`/tests/e2e/fixtures/test-helpers.ts`** (updated)
   - ✅ `clickMapAtCoordinates(x, y)` - Automated map clicking
   - ✅ `waitForIdentifyPopup()` - Detects identify popup
   - ✅ `closeIdentifyPopup()` - Closes popup programmatically
   - ✅ `enableMapCoordinateLogging()` - Hover-to-capture coordinates

2. **`/tests/e2e/fixtures/map-coordinates.ts`** (new)
   - Configuration file for map feature coordinates
   - Currently set to (0, 0) - needs your real coordinates

3. **`/tests/e2e/query-simple/map-identify-restoration.spec.ts`** (updated)
   - 4 automated tests for Map Identify restoration
   - Will auto-skip until coordinates configured

4. **`/tests/e2e/query-simple/map-identify-coordinate-capture.spec.ts`** (new)
   - Helper test to capture coordinates
   - Opens browser and logs coordinates as you hover

5. **`/tests/e2e/MAP_COORDINATE_CAPTURE_GUIDE.md`** (new)
   - Complete instructions for capturing coordinates

---

## 🎯 What You Need to Do (5 minutes)

### Step 1: Run the coordinate capture test

```bash
cd /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client
npx playwright test tests/e2e/query-simple/map-identify-coordinate-capture.spec.ts --headed
```

### Step 2: In the browser that opens

1. Open DevTools (F12)
2. Go to Console tab
3. Run: `window.startMapCoordinateCapture()`
4. Hover over these features:
   - **Parcel 2223059013** (the one used in your test queries)
   - **Parcel 5568900000** (second test parcel)
   - Any other clickable feature

5. Console will show coordinates like:
   ```
   🗺️  Map Coords: viewport(652, 347) | relative(452, 247)
   ```
   **Use the `viewport` numbers** (652, 347 in this example)

6. Run: `window.stopMapCoordinateCapture()` when done

### Step 3: Update the config file

Edit `/tests/e2e/fixtures/map-coordinates.ts`:

```typescript
export const MAP_COORDINATES = {
  PARCEL_2223059013: {
    x: 652,  // ← Your captured X
    y: 347,  // ← Your captured Y
    description: 'Single parcel (PIN: 2223059013)',
    parcelId: '2223059013',
    recordCount: 1
  },

  PARCEL_5568900000: {
    x: 780,  // ← Your captured X
    y: 420,  // ← Your captured Y
    description: 'Single parcel (PIN: 5568900000)',
    parcelId: '5568900000',
    recordCount: 1
  },

  // ... etc
};
```

### Step 4: Verify coordinates work

```bash
npx playwright test tests/e2e/query-simple/map-identify-coordinate-capture.spec.ts --headed --grep "verification"
```

This will test each coordinate and tell you if it successfully triggered an identify popup.

---

## 🧪 Once Coordinates Are Configured

### Run the Map Identify tests:

```bash
npx playwright test tests/e2e/query-simple/map-identify-restoration.spec.ts --headed
```

### What the tests will do (fully automated):

1. **Test 1: New Mode**
   - Execute query for 2223059013
   - Click on map at your provided coordinates
   - Wait for identify popup
   - Close identify popup
   - **Verify:** Selection restores (or detect runtime error)

2. **Test 2: Add Mode**
   - Execute 2 queries (accumulated selection)
   - Click on map
   - Close identify popup
   - **Verify:** Both selections restore

3. **Test 3: Widget Closed**
   - Execute query
   - Close widget
   - Click on map
   - Close identify popup
   - **Verify:** No restoration (correct behavior)

4. **Test 4: Error Detection**
   - Execute query
   - Click on map
   - Close identify popup
   - **Capture:** Runtime error `this.addSelectionToMap is not a function`
   - **Documents the bug we discovered**

---

## 📊 Expected Results (r019.14 - Current State)

### If the bug exists:
- Tests 1-3: May pass or fail depending on error handling
- Test 4: **Should capture the runtime error** proving the bug exists

### After implementing Strategy 3 (stub methods):
- All 4 tests: **Should pass** (stubs delegate to manager)

### After implementing Section 3.3 (full migration):
- All 4 tests: **Should pass** (proper manager implementation)

---

## 🚀 Benefits of This Approach

### Before (Semi-Automated):
- ❌ Tests paused for manual map clicking
- ❌ Required human to be present during test
- ❌ Not repeatable
- ❌ Can't run in CI/CD

### After (With Your Coordinates):
- ✅ Fully automated
- ✅ Runs unattended
- ✅ Repeatable
- ✅ CI/CD ready
- ✅ Documents the bug with empirical test data

---

## 💡 Quick Test Without Coordinates

If you want to test NOW before capturing coordinates, use browser console:

1. Open your app: `https://localhost:3001/experience/0`
2. Execute a query in QuerySimple widget
3. Open browser console (F12)
4. Paste and run:

```javascript
const event = new CustomEvent('querysimple-restore-on-identify-close', {
  detail: {
    widgetId: 'widget_12',
    recordIds: ['123'],
    outputDsId: 'widget_12_output_3822694765645799',
    queryItemConfigId: 'query-item-1'
  }
})
window.dispatchEvent(event)
// Expected: Runtime error if bug exists
```

This directly triggers `handleRestoreOnIdentifyClose` without map clicking.

---

## 📝 Summary

**I've built the full automated testing framework.**  
**You just need to spend 5 minutes capturing coordinates.**  
**Then we'll have empirical data proving the bug exists (or doesn't).**

Ready to proceed?
