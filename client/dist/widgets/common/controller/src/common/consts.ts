import { type ControllerPanelJson, FixedPosition } from 'jimu-core'
import type { FlipOptions, OffsetOptions, ShiftOptions, ControlPosition } from 'jimu-ui'

// Width of placeholder when dragging
export const DROP_ZONE_PLACEHOLDER_WIDTH = 5
// Widgets layout name in controller
export const BASE_LAYOUT_NAME = 'controller'

// Three sizes of widget cards
export const DEFAULT_ICON_SIZE = 16

// Height of label in widget card
export const LABEL_HEIGHT = 21

// Three sizes of widget cards
export const WIDGET_ITEM_SIZES = {
  sm: 24,
  default: 32,
  lg: 48
}

// Three sizes of widget buttons
export const WIDGET_BUTTON_SIZES = {
  sm: 26,
  default: 32,
  lg: 40
}

// Minimum size of open widget panel
export const MIN_PANEL_SIZE = { width: 150, height: 120 }
// The default size of the widget panel
export const DEFAULT_PANEL_SIZE = { width: 360, height: 360 }
// The starting position for widget panel of multiple mode
export const DEFAULT_WIDGET_START_POSITION: ControlPosition = {
  x: 70,
  y: 70
}
// Spacing between panels of multiple mode
export const DEFAULT_PANEL_SPACE = { x: 30, y: 30 }

export const DEFAULT_FIXED_LAYOUT_STYLE: ControllerPanelJson = {
  position: FixedPosition.TopRight,
  width: '360px',
  height: '480px',
  offsetX: 0,
  offsetY: 0
}

export const FlipVariationsOptions: FlipOptions = {
  flipAlignment: false
}

export const ShiftBodyOptions: ShiftOptions = {
  boundary: document.body,
  rootBoundary: 'document'
}

export const OffsetYOptions: OffsetOptions = 16
