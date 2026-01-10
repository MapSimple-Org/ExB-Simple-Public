# Map Coordinate Capture Guide

## Purpose
Capture map feature coordinates so E2E tests can automatically click on map features to trigger identify popups.

## Quick Start

### Option 1: Using Playwright Test (Recommended)

1. **Run the coordinate capture test:**
   ```bash
   npx playwright test tests/e2e/query-simple/map-identify-coordinate-capture.spec.ts --headed
   ```

2. **In the browser that opens:**
   - Wait for the test to navigate to your app
   - Open browser DevTools (F12 or right-click > Inspect)
   - Go to Console tab
   - You'll see: `📍 Map coordinate capture ready!`

3. **Start capturing:**
   ```javascript
   // In browser console:
   window.startMapCoordinateCapture()
   ```

4. **Hover over map features:**
   - Move your mouse slowly over the map
   - Console will log coordinates like:
     ```
     🗺️  Map Coords: viewport(652, 347) | relative(452, 247)
     ```
   - **Use the `viewport` coordinates** (these are what Playwright needs)

5. **Find your target features:**
   - Parcel with PIN `2223059013`
   - Parcel with PIN `5568900000`
   - Any other clickable feature

6. **Stop capturing:**
   ```javascript
   // In browser console:
   window.stopMapCoordinateCapture()
   ```

7. **Update the coordinates file:**
   Edit `/tests/e2e/fixtures/map-coordinates.ts`:
   ```typescript
   PARCEL_2223059013: {
     x: 652,  // ← Your captured X
     y: 347,  // ← Your captured Y
     description: 'Single parcel (PIN: 2223059013)',
     parcelId: '2223059013',
     recordCount: 1
   }
   ```

---

### Option 2: Manual Browser Testing

1. **Open your ExB app:**
   ```
   https://localhost:3001/experience/0
   ```

2. **Open browser DevTools** (F12)

3. **Paste coordinate capture script:**
   ```javascript
   // Enable coordinate logging
   let isLogging = false;
   const mapContainer = document.querySelector('.esri-view-surface');
   
   mapContainer.addEventListener('mousemove', (e) => {
     if (!isLogging) return;
     const x = Math.round(e.clientX);
     const y = Math.round(e.clientY);
     console.log(`🗺️  Coords: (${x}, ${y})`);
   });
   
   window.startCapture = () => {
     isLogging = true;
     console.log('✅ Capture STARTED');
   };
   
   window.stopCapture = () => {
     isLogging = false;
     console.log('⏹️  Capture STOPPED');
   };
   
   console.log('Run: window.startCapture()');
   ```

4. **Start and capture:**
   ```javascript
   window.startCapture()
   // Hover over features, note coordinates
   window.stopCapture()
   ```

---

## What Coordinates to Capture

### Required Features (for Map Identify tests):

1. **Parcel 2223059013** (used in test query)
   - Location: [describe where this parcel is on your map]
   - Expected result: 1 record
   - Used in: Test 1 (New mode), Test 4 (error capture)

2. **Parcel 5568900000** (used in Add mode test)
   - Location: [describe where this parcel is on your map]
   - Expected result: 1 record
   - Used in: Test 2 (Add mode)

3. **Any clickable feature** (generic test)
   - Location: Any feature that opens identify popup
   - Expected result: 1+ records
   - Used in: Test 3 (widget closed)

---

## Tips for Accurate Capture

### 1. **Center the feature in viewport**
   - Zoom to a comfortable level
   - Center the feature before capturing
   - This ensures coordinates are consistent

### 2. **Hover slowly**
   - Move mouse slowly over the feature
   - Coordinates update rapidly
   - Pick coordinates near the center of the feature

### 3. **Verify coordinates work**
   After updating `map-coordinates.ts`, test them:
   ```bash
   npx playwright test tests/e2e/query-simple/map-identify-restoration.spec.ts --headed
   ```
   Watch if the automated click hits the feature correctly.

### 4. **Account for browser viewport**
   - Playwright's default viewport: **1280x720**
   - If your manual capture uses a different size, coordinates may be off
   - To match Playwright's viewport in manual testing:
     ```javascript
     window.resizeTo(1280, 720)
     ```

---

## Troubleshooting

### "Coordinates captured but click doesn't hit feature"

**Possible causes:**
1. **Map zoom changed** - Capture at the same zoom level every time
2. **Map center changed** - Re-center before capturing
3. **Browser size different** - Use 1280x720 viewport
4. **Feature moved** - Map data may have updated

**Solution:**
- Document your map zoom level in `map-coordinates.ts`
- Document your map center coordinates
- Re-capture if map configuration changes

### "Identify popup doesn't appear after click"

**Possible causes:**
1. **Wrong coordinates** - Feature not at that location
2. **Feature not clickable** - May not be configured for identify
3. **Timing issue** - Need longer wait after click

**Solution:**
- Manually verify feature is clickable in that location
- Increase timeout in `waitForIdentifyPopup()`
- Check browser console for JavaScript errors

### "Coordinates are (0, 0) in tests"

**You haven't updated the config file yet!**

Edit `/tests/e2e/fixtures/map-coordinates.ts` with your captured coordinates.

---

## Example Workflow

```bash
# Step 1: Capture coordinates
npx playwright test tests/e2e/query-simple/map-identify-coordinate-capture.spec.ts --headed

# In browser console:
window.startMapCoordinateCapture()
# Hover over Parcel 2223059013, note coordinates: (652, 347)
# Hover over Parcel 5568900000, note coordinates: (780, 420)
window.stopMapCoordinateCapture()

# Step 2: Update config file
# Edit /tests/e2e/fixtures/map-coordinates.ts
# Replace x: 0, y: 0 with captured values

# Step 3: Run tests
npx playwright test tests/e2e/query-simple/map-identify-restoration.spec.ts --headed

# Step 4: Verify clicks are hitting features correctly
# Watch the automated browser - does it click on the right features?
```

---

## Once Coordinates Are Captured

The tests will run fully automated:
1. ✅ Click on map feature (using your coordinates)
2. ✅ Wait for identify popup
3. ✅ Close identify popup
4. ✅ Verify selection restoration
5. ✅ Detect runtime errors (the bug we're documenting)

**No more manual interaction needed!**
