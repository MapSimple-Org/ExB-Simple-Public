/**
 * Mobile popup behavior utilities shared across MapSimple widgets.
 *
 * Handles dock position, dock button visibility, action bar visibility,
 * and collapsed state for popups on mobile viewports (≤ 600px).
 * Restores JSAPI defaults on desktop-width viewports.
 *
 * Ported from FeedSimple's feed-layer-manager.ts for cross-widget reuse.
 */

import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'

/** Mobile breakpoint used across all MapSimple widgets. */
export const MOBILE_BREAKPOINT_PX = 600

/** Popup behavior params — matches config fields in both QS and FS. */
export interface MobilePopupParams {
  mobilePopupCollapsed?: boolean
  mobilePopupDockPosition?: string
  mobilePopupHideDockButton?: boolean
  mobilePopupHideActionBar?: boolean
}

/**
 * Apply mobile-specific popup behavior when viewport ≤ 600px.
 * Sets dockEnabled / dockOptions and visibleElements on the Popup instance.
 * Restores JSAPI defaults on desktop-width viewports.
 *
 * Does NOT handle collapsed state — that must be passed as an option
 * to popup.open() at call time. See buildPopupOpenOptions().
 */
export function applyMobilePopupBehavior (
  mapView: MapView | SceneView,
  params: MobilePopupParams
): void {
  if (!mapView?.popup) return
  const isMobile = mapView.width <= MOBILE_BREAKPOINT_PX

  if (isMobile && params.mobilePopupDockPosition) {
    mapView.popup.dockEnabled = true
    mapView.popup.dockOptions = {
      position: params.mobilePopupDockPosition,
      buttonEnabled: !params.mobilePopupHideDockButton
    } as any
  } else if (!isMobile) {
    // Restore JSAPI defaults for desktop
    mapView.popup.dockEnabled = false
    mapView.popup.dockOptions = {
      buttonEnabled: true,
      position: 'auto'
    } as any
  }

  // Hide action bar (zoom-to, etc.) on mobile if configured
  if (isMobile && params.mobilePopupHideActionBar) {
    mapView.popup.visibleElements = {
      ...mapView.popup.visibleElements as any,
      actionBar: false
    } as any
  } else if (!isMobile) {
    mapView.popup.visibleElements = {
      ...mapView.popup.visibleElements as any,
      actionBar: true
    } as any
  }
}

/**
 * Build the collapsed option for popup.open().
 * Returns true when mobile + mobilePopupCollapsed is enabled, undefined otherwise.
 * Use this to set collapsed in popup.open() options — do NOT assign popup.collapsed directly
 * (it is readonly in JSAPI 4.34+).
 */
export function getPopupCollapsedOption (
  mapView: MapView | SceneView,
  params: MobilePopupParams
): boolean | undefined {
  const isMobile = mapView.width <= MOBILE_BREAKPOINT_PX
  if (isMobile && params.mobilePopupCollapsed) {
    return true
  }
  return undefined
}
