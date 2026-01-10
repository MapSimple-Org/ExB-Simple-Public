/**
 * Map Feature Coordinates for Testing
 * 
 * These coordinates are used to click on specific map features during E2E tests.
 * They are viewport coordinates (pixels from top-left of browser window).
 * 
 * To capture new coordinates:
 * 1. Run test with enableMapCoordinateLogging()
 * 2. In browser console, run: window.startMapCoordinateCapture()
 * 3. Hover over map features and note the coordinates
 * 4. Update this file with the captured coordinates
 * 
 * Current map zoom level: [SPECIFY YOUR ZOOM LEVEL]
 * Current map center: [SPECIFY YOUR MAP CENTER]
 * Browser viewport: 1280x720 (default Playwright)
 */

export interface MapFeatureCoordinate {
  x: number;
  y: number;
  description: string;
  parcelId?: string; // For parcels, the PIN or parcel ID
  recordCount?: number; // How many records this feature should return
}

export const MAP_COORDINATES = {
  /**
   * Feature that corresponds to PIN 2223059013 (single parcel)
   * Captured coordinates: 2026-01-09
   * Map state: After searching for parcel 2223059013
   */
  PARCEL_2223059013: {
    x: 1063,
    y: 353,
    description: 'Single parcel (PIN: 2223059013)',
    parcelId: '2223059013',
    recordCount: 1
  } as MapFeatureCoordinate,

  /**
   * Feature that corresponds to PIN 5568900000 (single parcel)
   * TODO: Capture coordinates by hovering over this feature
   */
  PARCEL_5568900000: {
    x: 0, // TODO: Replace with actual X coordinate
    y: 0, // TODO: Replace with actual Y coordinate
    description: 'Single parcel (PIN: 5568900000)',
    parcelId: '5568900000',
    recordCount: 1
  } as MapFeatureCoordinate,

  /**
   * Any clickable map feature (for generic identify testing)
   * TODO: Capture coordinates of any feature
   */
  ANY_FEATURE: {
    x: 0, // TODO: Replace with actual X coordinate
    y: 0, // TODO: Replace with actual Y coordinate
    description: 'Generic map feature for identify testing',
    recordCount: 1
  } as MapFeatureCoordinate
};

/**
 * Validate that coordinates have been configured (not left at 0,0)
 */
export function validateCoordinates(coord: MapFeatureCoordinate): boolean {
  if (coord.x === 0 && coord.y === 0) {
    console.warn(`⚠️  Coordinates not configured for: ${coord.description}`);
    return false;
  }
  return true;
}
