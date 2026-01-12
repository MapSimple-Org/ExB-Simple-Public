/**
 * Map Coordinate Capture Test
 * 
 * This test opens the app and enables coordinate logging so you can
 * capture map feature coordinates by hovering over them.
 * 
 * Usage:
 *   1. Run: npx playwright test map-identify-coordinate-capture.spec.ts --headed
 *   2. In browser console: window.startMapCoordinateCapture()
 *   3. Hover over map features to see coordinates
 *   4. Copy coordinates to /tests/e2e/fixtures/map-coordinates.ts
 * 
 * See MAP_COORDINATE_CAPTURE_GUIDE.md for full instructions.
 */

import { test } from '@playwright/test'
import { KCSearchHelpers } from '../fixtures/test-helpers'
import { MAP_COORDINATES } from '../fixtures/map-coordinates'

const WIDGET_ID = 'widget_12'
const WIDGET_LABEL = 'Enhanced Search'
const BASE_URL = process.env.TEST_BASE_URL || 'https://localhost:3001'
const APP_URL = process.env.TEST_APP_URL || '/experience/0'

test.describe('Map Coordinate Capture', () => {
  test('Enable coordinate capture for manual hovering', async ({ page }) => {
    const helpers = new KCSearchHelpers(page, WIDGET_ID, WIDGET_LABEL)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 MAP COORDINATE CAPTURE MODE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Step 1: Navigate to app
    console.log('1️⃣  Navigating to app...')
    await page.goto(`${BASE_URL}${APP_URL}`)
    await page.waitForLoadState('networkidle')
    console.log('   ✅ App loaded\n')

    // Step 2: Enable coordinate logging
    console.log('2️⃣  Enabling coordinate capture...')
    await helpers.enableMapCoordinateLogging()
    console.log('   ✅ Coordinate capture enabled\n')

    // Step 3: Instructions
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 INSTRUCTIONS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('1. Open browser DevTools (F12 or right-click > Inspect)')
    console.log('2. Go to Console tab')
    console.log('3. Run: window.startMapCoordinateCapture()')
    console.log('4. Hover over map features to see coordinates')
    console.log('5. Copy the "viewport" coordinates to map-coordinates.ts')
    console.log('6. Run: window.stopMapCoordinateCapture() when done')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 TARGET FEATURES:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('  1. Parcel 2223059013 (for Test 1 & 4)')
    console.log('  2. Parcel 5568900000 (for Test 2)')
    console.log('  3. Any clickable feature (for Test 3)')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Step 4: Keep browser open for manual coordinate capture
    console.log('⏳ Browser will stay open for 5 minutes...')
    console.log('   (Test will auto-close after timeout)\n')
    
    // Wait 5 minutes for manual coordinate capture
    await page.waitForTimeout(300000)

    console.log('✅ Coordinate capture session ended')
  })

  test('Quick coordinate verification', async ({ page }) => {
    const helpers = new KCSearchHelpers(page, WIDGET_ID, WIDGET_LABEL)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🧪 COORDINATE VERIFICATION TEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Navigate
    await page.goto(`${BASE_URL}${APP_URL}`)
    await page.waitForLoadState('networkidle')

    console.log('📍 Current Coordinates Configuration:')
    console.log('')
    console.log(`  PARCEL_2223059013: (${MAP_COORDINATES.PARCEL_2223059013.x}, ${MAP_COORDINATES.PARCEL_2223059013.y})`)
    console.log(`  PARCEL_5568900000: (${MAP_COORDINATES.PARCEL_5568900000.x}, ${MAP_COORDINATES.PARCEL_5568900000.y})`)
    console.log(`  ANY_FEATURE: (${MAP_COORDINATES.ANY_FEATURE.x}, ${MAP_COORDINATES.ANY_FEATURE.y})`)
    console.log('')

    // Test each coordinate
    for (const [name, coords] of Object.entries(MAP_COORDINATES)) {
      if (coords.x === 0 && coords.y === 0) {
        console.log(`⚠️  ${name}: NOT CONFIGURED (still at 0,0)`)
        continue
      }

      console.log(`🎯 Testing ${name} at (${coords.x}, ${coords.y})...`)
      
      // If this coordinate has a parcelId, execute the query first to zoom the map
      if (coords.parcelId) {
        console.log(`   📍 Executing query for parcel ${coords.parcelId} to zoom map...`)
        await helpers.openWidget(WIDGET_LABEL)
        await helpers.switchToQueryTab(WIDGET_ID)
        await helpers.enterQueryValue(coords.parcelId, WIDGET_ID)
        await helpers.clickApply(WIDGET_ID)
        await helpers.waitForResults(WIDGET_ID)
        console.log(`   ✅ Query executed, map should be zoomed to parcel`)
        await page.waitForTimeout(1000) // Wait for zoom animation
      }
      
      // Click on the coordinates
      await helpers.clickMapAtCoordinates(coords.x, coords.y)
      
      // Check if identify popup appears
      const popupAppeared = await helpers.waitForIdentifyPopup(3000)
      
      if (popupAppeared) {
        console.log(`   ✅ SUCCESS: Feature clicked, identify popup appeared`)
        await helpers.closeIdentifyPopup()
      } else {
        console.log(`   ❌ FAILED: No identify popup (check coordinates)`)
      }
      
      // Close widget for next test
      if (coords.parcelId) {
        await helpers.closeWidget(WIDGET_ID)
      }
      
      console.log('')
      await page.waitForTimeout(1000)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Verification complete')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
})
