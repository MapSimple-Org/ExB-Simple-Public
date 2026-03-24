/** @jsx jsx */
import {
  React,
  ReactRedux,
  jsx,
  css,
  type DataSource,
  type FeatureDataRecord,
  type IMState,
  classNames
} from 'jimu-core'
// r024.41: Removed Button, Tooltip, Popper, Icon - replaced with plain HTML to avoid Calcite overhead
import FeatureInfo from './components/feature-info'
import { ListDirection } from '../config'
import { createQuerySimpleDebugLogger, substituteTokens, convertTemplateToHtml } from 'widgets/shared-code/mapsimple-common'
import defaultMessages from './translations/default'
import { hooks } from 'jimu-core'
import Graphic from '@arcgis/core/Graphic'
import * as labelPointOperator from '@arcgis/core/geometry/operators/labelPointOperator.js'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * r024.25: Factory function to create CIM teardrop pin symbol structure
 * Creates the symbol ONCE and returns the data structure for reuse.
 * This avoids creating new symbol objects on every hover and every animation frame.
 * 
 * @param baseColor - RGBA array for the main pin color
 * @param lighterColor - RGBA array for the center circle (lighter variant)
 * @returns CIM symbol JSON structure
 */
function createCIMPinSymbolData(
  baseColor: [number, number, number, number],
  lighterColor: [number, number, number, number]
) {
  return {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      symbolLayers: [
        {
          type: 'CIMVectorMarker',
          enable: true,
          size: 28,
          anchorPointUnits: 'Relative',
          anchorPoint: { x: 0, y: -0.5 }, // Default resting position
          frame: { xmin: 0, ymin: 0, xmax: 24, ymax: 24 },
          markerGraphics: [
            {
              // Outer teardrop shape (Y-flipped for CIM)
              type: 'CIMMarkerGraphic',
              geometry: {
                rings: [[
                  [12, 22], [10.5, 22], [9, 21.5], [7.5, 20.5],
                  [6, 19], [5.5, 17.5], [5, 15],
                  [5, 13.5], [5.5, 11], [6.5, 8.5],
                  [8, 6], [10, 3.5], [12, 2],
                  [14, 3.5], [16, 6], [17.5, 8.5],
                  [18.5, 11], [19, 13.5],
                  [19, 15], [18.5, 17.5], [18, 19],
                  [16.5, 20.5], [15, 21.5], [13.5, 22], [12, 22]
                ]]
              },
              symbol: {
                type: 'CIMPolygonSymbol',
                symbolLayers: [
                  {
                    type: 'CIMSolidStroke',
                    enable: true,
                    width: 1.5,
                    color: [255, 255, 255, 255] // White outline
                  },
                  {
                    type: 'CIMSolidFill',
                    enable: true,
                    color: baseColor
                  }
                ]
              }
            },
            {
              // Inner circle "eye" (Y-flipped for CIM)
              type: 'CIMMarkerGraphic',
              geometry: {
                rings: [[
                  [12, 17.5], [13, 17.3], [13.8, 16.8],
                  [14.3, 16], [14.5, 15], [14.3, 14],
                  [13.8, 13.2], [13, 12.7], [12, 12.5],
                  [11, 12.7], [10.2, 13.2], [9.7, 14],
                  [9.5, 15], [9.7, 16], [10.2, 16.8],
                  [11, 17.3], [12, 17.5]
                ]]
              },
              symbol: {
                type: 'CIMPolygonSymbol',
                symbolLayers: [
                  {
                    type: 'CIMSolidStroke',
                    enable: true,
                    width: 1,
                    color: [255, 255, 255, 255] // White outline
                  },
                  {
                    type: 'CIMSolidFill',
                    enable: true,
                    color: lighterColor
                  }
                ]
              }
            }
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true
        }
      ]
    }
  }
}

/**
 * Trash icon as CSS background-image (r021.44 memory optimization)
 * Instead of creating 600 React component instances of <TrashOutlined>,
 * we use a single CSS style with SVG data-uri that's reused across all items.
 * This eliminates 600 component instances + 600 DOM nodes.
 * SVG source: jimu-icons/svg/outlined/editor/trash.svg
 */
// r024.41: Plain HTML icons - SVG data URIs instead of jimu-ui Icon components
// This eliminates Calcite shadow DOM overhead for 600+ result items

const trashIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6.5C6 6.22386 6.22386 6 6.5 6C6.77614 6 7 6.22386 7 6.5V12.5C7 12.7761 6.77614 13 6.5 13C6.22386 13 6 12.7761 6 12.5V6.5Z" fill="%236a6a6a"/><path d="M9.5 6C9.22386 6 9 6.22386 9 6.5V12.5C9 12.7761 9.22386 13 9.5 13C9.77614 13 10 12.7761 10 12.5V6.5C10 6.22386 9.77614 6 9.5 6Z" fill="%236a6a6a"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 0H5C4.44772 0 4 0.447715 4 1V3H0.5C0.223858 3 0 3.22386 0 3.5C0 3.77614 0.223858 4 0.5 4H2.1L2.90995 15.0995C2.96107 15.6107 3.39124 16 3.90499 16H12.095C12.6088 16 13.0389 15.6107 13.09 15.0995L13.9 4H15.5C15.7761 4 16 3.77614 16 3.5C16 3.22386 15.7761 3 15.5 3H12V1C12 0.447715 11.5523 0 11 0ZM11 3V1H5V3H11ZM12.895 4H3.10499L3.90499 15H12.095L12.895 4Z" fill="%236a6a6a"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

const zoomToIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 10.5V12C0 12.5523 0.447716 13 1 13H2.5V12H1L1 10.5H0ZM2.5 1H1C0.447715 1 0 1.44772 0 2V3.5H1V2L2.5 2V1ZM0 8.5H1V5.5H0V8.5ZM4.5 1V2H7.5V1H4.5ZM9.5 1V2H11V3.5H12V2C12 1.44772 11.5523 1 11 1H9.5ZM6.31802 13.682C7.95595 15.3199 10.5424 15.4312 12.3092 14.0159L14.1569 15.864L14.864 15.1569L13.0166 13.3085C14.4312 11.5416 14.3197 8.9557 12.682 7.31802C10.9246 5.56066 8.07538 5.56066 6.31802 7.31802C4.56066 9.07538 4.56066 11.9246 6.31802 13.682ZM7.02513 12.9749C5.65829 11.608 5.65829 9.39196 7.02513 8.02513C8.39196 6.65829 10.608 6.65829 11.9749 8.02513C13.3417 9.39196 13.3417 11.608 11.9749 12.9749C10.608 14.3417 8.39196 14.3417 7.02513 12.9749ZM9 13V11H7V10H9V8H10V10H12V11H10V13H9Z" fill="%236a6a6a"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

// r026.009: Pan/center icon — jimu HandOutlined (same SVG as Results Menu "Pan to")
const panToIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.169 5.309V3.048c0-.492.195-.963.543-1.311a1.853 1.853 0 011.311-.543c.489 0 .956.171 1.299.479.038-.048.079-.093.122-.137A1.853 1.853 0 017.731 1c.465 0 .934.177 1.287.536.103.104.194.222.27.351.333-.275.744-.411 1.151-.411.465 0 .934.177 1.287.536.164.167.297.367.393.596.308-.212.669-.317 1.027-.317.465 0 .934.177 1.287.536.353.358.562.868.567 1.488 0 .008.001.016.001.024V10.89c0 1.237-.399 2.277-1.143 3.008C13.115 14.627 12.078 15 10.89 15H6.719c-.646 0-1.262-.271-1.698-.747L1.606 10.528a2.237 2.237 0 01-.603-1.445 2.237 2.237 0 01.458-1.497l1.708-2.277zM7.156 2.238c-.15.153-.279.408-.279.809v1.805a.5.5 0 01-.748.434.497.497 0 01-.252-.434V2.943c0-.42-.328-.749-.854-.749a.854.854 0 00-.604.25.854.854 0 00-.25.604v2.399c.001.019.001.038 0 .058v2.677a.5.5 0 01-1 0V6.976l-.908 1.21a1.237 1.237 0 00-.26.848c.015.304.136.593.342.818l3.415 3.725c.246.269.595.423.961.423h4.17c.979 0 1.746-.304 2.267-.816.52-.51.843-1.275.843-2.294V4.358a.5.5 0 000-.021c0-.402-.129-.657-.28-.81a.648.648 0 00-.574-.238.648.648 0 00-.574.238c-.145.147-.274.394-.28.766v.56a.5.5 0 01-1 0v-.515a.5.5 0 01.001-.055V3.524c0-.402-.129-.657-.28-.81a.648.648 0 00-.574-.238c-.12 0-.236.025-.342.063a.648.648 0 00-.223.175 1.16 1.16 0 00-.184.283 1.39 1.39 0 00-.095.527v1.328a.5.5 0 01-1 0V3.047c0-.402-.129-.657-.28-.81A.648.648 0 007.731 2a.648.648 0 00-.575.238z" fill="%236a6a6a"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

const moreIconStyle = css`
  width: 22px;
  height: 22px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="8" r="1.5" fill="%236a6a6a"/><circle cx="8" cy="8" r="1.5" fill="%236a6a6a"/><circle cx="13" cy="8" r="1.5" fill="%236a6a6a"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

// r024.41: Action button style - plain HTML button replacing jimu-ui Button
const actionButtonStyle = css`
  padding: 6px;
  min-width: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: 2px solid var(--sys-color-primary-main);
    outline-offset: 1px;
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.12);
  }
`

// r024.46: Dropdown menu base style - direction set dynamically via inline style
const dropdownMenuBaseStyle = css`
  position: absolute;
  right: 0;
  min-width: 140px;
  padding: 4px 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`

const menuItemStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  color: inherit;
  
  &:hover {
    background: var(--ref-palette-neutral-200);
  }
`

export interface ResultItemProps {
  widgetId: string
  popupTemplate: any
  defaultPopupTemplate: any
  data: FeatureDataRecord
  dataSource: DataSource
  hoverPinColor?: string // r022.106: Configurable hover pin color
  expandByDefault: boolean
  onClick: (record: FeatureDataRecord) => void
  onRemove: (record: FeatureDataRecord) => void
  /** r023.32: Zoom to single record. When provided, Zoom to appears in menu and (when expanded) as inline icon. */
  onZoomTo?: (record: FeatureDataRecord) => void
  /** r026.009: Pan to single record (center without zoom). */
  onPanTo?: (record: FeatureDataRecord) => void
  /** r024.46: When true, clicking a result already zooms, so zoom button is redundant */
  zoomOnResultClick?: boolean
  /** r026.009: When true, clicking a result pans without zoom, so pan button is redundant */
  panOnResultClick?: boolean
  /** r026.002: When true, render using our own {{field}} substitution + markdown instead of Esri Feature widget */
  isCustomTemplate?: boolean
  /** r026.005: Raw template string for card rendering (stored in cache, not on popupTemplate) */
  rawTemplate?: string
  // r022.106: Hover preview props
  mapView?: __esri.MapView | __esri.SceneView
}

const style = css`
  overflow: visible;  /* r024.41: Changed from auto to allow dropdown menu to extend outside */
  flex-flow: row;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 2rem;
  position: relative;
  transition: background-color 0.15s ease-in-out;
  
  /* r023.34: When expanded, stacked action icons (64px) + content need more height */
  &.result-item-expanded {
    min-height: 4.5rem;
  }
  
  /* Add right padding to prevent header text from running into action buttons */
  padding-right: 44px;  /* 32px button + buffer (vertical stack uses same width) */
  
  &.selected {
    outline: 2px solid var(--sys-color-primary-main);
  }
  
  /* r022.106: Hover preview - visual feedback in result row */
  &:hover {
    background-color: rgba(204, 0, 255, 0.08);  /* Neon purple tint */
  }
  
  .result-actions-menu {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 10;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }
  
  .result-actions-menu.result-actions-expanded {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }
  
  .result-actions-toggle {
    opacity: 1;
    color: var(--sys-color-on-surface);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: var(--sys-color-primary-main);
    }
    
    min-width: 32px;
    min-height: 32px;
  }
  
  /* Ensure the FeatureInfo component respects the padding */
  .feature-info-component {
    width: 100%;
  }
  
  /* Make the header wrap if it's still too long */
  .esri-feature__title {
    word-wrap: break-word;
    overflow-wrap: break-word;
    padding-right: 8px;
  }
`

/**
 * QueryResultItem - displays a single query result record.
 *
 * r023.32-33: Result actions (Zoom to, Remove) adapt to expand state:
 * - When expanded: Inline icons stacked vertically (Zoom to, Remove) for quick access.
 * - When collapsed: Three-dot menu to save space; same actions in dropdown.
 * - Horizontal layout (no collapse): Always shows inline icons.
 *
 * zoomOnResultClick (r023.31) defaults to false; Zoom to is explicit via menu or inline icon.
 * No manual cleanup needed: state, Popper, and callbacks are React-managed.
 */
/**
 * Helper: Convert hex color to RGB array for CIM symbols
 * @param hex - Hex color string (e.g., '#EA4335' or 'EA4335')
 * @returns RGB array [r, g, b, alpha] for CIM symbol (e.g., [234, 67, 53, 230])
 */
function hexToRgb(hex: string, alpha: number = 230): [number, number, number, number] {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  
  return [r, g, b, alpha]
}

export const QueryResultItem = (props: ResultItemProps) => {
  const { widgetId, data, dataSource, popupTemplate, defaultPopupTemplate, onClick, onRemove, onZoomTo, onPanTo, zoomOnResultClick, panOnResultClick, isCustomTemplate, rawTemplate, expandByDefault = false, mapView, hoverPinColor } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuDropUp, setMenuDropUp] = React.useState(false)
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  const [isExpanded, setIsExpanded] = React.useState(expandByDefault)

  // r023.33 / r024.19: Sync with expandByDefault when parent toggles Expand All / Collapse All
  // Only update if value actually changed to avoid unnecessary re-renders
  React.useEffect(() => {
    setIsExpanded(prev => {
      if (prev !== expandByDefault) {
        return expandByDefault
      }
      return prev  // No change, no re-render
    })
  }, [expandByDefault])
  
  const recordId = data.getId()
  
  // r022.106: Hover preview - refs for hover graphic management
  const hoverGraphicRef = React.useRef<__esri.Graphic | null>(null)
  const hoverTimeoutRef = React.useRef<number | null>(null)
  const animationRef = React.useRef<number | null>(null) // r022.108: Spring animation ID
  
  // r024.25: Memoized CIM symbol data to avoid creating new objects on every hover/animation frame
  // The symbol data is created ONCE when color changes, not on every hover
  const memoizedSymbolData = React.useMemo(() => {
    const baseColor = hexToRgb(hoverPinColor || '#EA4335', 230)
    const lighterColor: [number, number, number, number] = [
      Math.min(255, Math.round(baseColor[0] * 1.2)),
      Math.min(255, Math.round(baseColor[1] * 1.2)),
      Math.min(255, Math.round(baseColor[2] * 1.2)),
      255
    ]
    return createCIMPinSymbolData(baseColor, lighterColor)
  }, [hoverPinColor])
  
  // r024.25: Ref to hold the live symbol data during animation (mutable)
  // This allows us to update anchorPoint without cloning the entire structure
  const symbolDataRef = React.useRef<ReturnType<typeof createCIMPinSymbolData> | null>(null)
  
  // Log when QueryResultItem renders
  React.useEffect(() => {
    debugLogger.log('EXPAND-COLLAPSE', {
      event: 'QueryResultItem-render',
      recordId,
      expandByDefault,
      timestamp: Date.now()
    })
  }, [recordId, expandByDefault])
  
  // Check if this record is currently selected
  const selected = ReactRedux.useSelector((state: IMState) =>
    state.dataSourcesInfo?.[dataSource.id]?.selectedIds?.includes(data.getId())
  )
  
  // Determine if list is displayed vertically (affects FeatureInfo expandability)
  const isVerticalAlign = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection !== ListDirection.Horizontal
  })

  /**
   * Handle clicking on the result item.
   * Triggers zoom and popup opening (handled in toggleSelection callback).
   * r022.106: Also hides hover graphic on click
   * r022.108: Cancel spring animation on click
   */
  const handleClickResultItem = React.useCallback((e: React.MouseEvent) => {
    // Don't trigger zoom/popup if clicking the actions menu or menu button
    if ((e.target as HTMLElement).closest('.result-actions-menu') || (e.target as HTMLElement).closest('.result-actions-toggle')) {
      return
    }
    
    // r022.108: Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // r022.106: Hide hover graphic on click (Option 1 behavior)
    if (hoverGraphicRef.current) {
      hoverGraphicRef.current.visible = false
      debugLogger.log('HOVER-PREVIEW', {
        event: 'hover-graphic-hidden-on-click',
        recordId,
        timestamp: Date.now()
      })
    }
    
    onClick(data)
  }, [onClick, data, recordId])

  // Handle clicking the remove menu item
  const handleRemove = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setMenuOpen(false)
    onRemove(data)
  }, [onRemove, data])

  // Handle clicking the zoom to menu item
  const handleZoomTo = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setMenuOpen(false)
    onZoomTo?.(data)
  }, [onZoomTo, data])

  // r026.009: Handle clicking the pan to menu item
  const handlePanTo = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setMenuOpen(false)
    onPanTo?.(data)
  }, [onPanTo, data])

  const onKeyUp = React.useCallback((evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault()
      evt.stopPropagation()
      handleClickResultItem(evt as any)
    }
  }, [handleClickResultItem])

  // r022.106: Hover preview - cleanup on unmount
  React.useEffect(() => {
    return () => {
      // r022.108: Cancel any running animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      
      // Remove hover graphic from map
      if (hoverGraphicRef.current && mapView?.graphics) {
        try {
          mapView.graphics.remove(hoverGraphicRef.current)
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-removed-on-unmount',
            recordId,
            timestamp: Date.now()
          })
        } catch (error) {
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-remove-error-on-unmount',
            recordId,
            error: error?.toString(),
            timestamp: Date.now()
          })
        }
        hoverGraphicRef.current = null
      }
    }
  }, [mapView, recordId])

  /**
   * r022.106: Handle mouse enter - show hover preview pin on map
   * r024.25: Optimized to use memoized CIMSymbol - no cloning on every animation frame
   * Debounced to 100ms to prevent flicker when moving across list items
   */
  const handleMouseEnter = React.useCallback(() => {
    // Skip if no mapView
    if (!mapView?.graphics) {
      return
    }
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current)
    }
    
    // Debounce: Wait 100ms before showing graphic
    hoverTimeoutRef.current = window.setTimeout(() => {
      try {
        const geometry = data.getJSAPIGeometry()
        
        if (!geometry) {
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-skipped-no-geometry',
            recordId,
            timestamp: Date.now()
          })
          return
        }
        
        // Calculate label point (same as popup logic)
        const labelPoint = labelPointOperator.execute(geometry)
        
        if (!labelPoint) {
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-skipped-no-labelpoint',
            recordId,
            geometryType: geometry.type,
            timestamp: Date.now()
          })
          return
        }
        
        // r024.25: Create a deep copy of the memoized symbol data for this graphic's animation.
        // This copy is made ONCE per hover start, not on every animation frame.
        // We use JSON parse/stringify for a clean deep copy since this is plain JSON data.
        symbolDataRef.current = JSON.parse(JSON.stringify(memoizedSymbolData))
        
        // Create or update hover graphic
        if (!hoverGraphicRef.current) {
          // r024.25: Set initial suspended position
          symbolDataRef.current.symbol.symbolLayers[0].anchorPoint = { x: 0, y: -1.2 }
          
          const cimSymbol = {
            type: 'cim',
            data: symbolDataRef.current
          }
          
          hoverGraphicRef.current = new Graphic({
            geometry: labelPoint,
            symbol: cimSymbol as any
          })
          mapView.graphics.add(hoverGraphicRef.current)
          
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-created',
            recordId,
            geometryType: geometry.type,
            symbolType: 'CIMSymbol-GooglePin-Animated-Optimized',
            color: hoverPinColor || '#EA4335',
            location: { x: labelPoint.x, y: labelPoint.y },
            timestamp: Date.now()
          })
          
          // r022.108 / r024.25: Start spring drop animation (optimized - no cloning)
          let start = null
          const targetY = -0.5  // Final resting position
          const initialY = -1.2 // Starting suspended height
          let currentY = initialY
          let velocity = 0
          
          const animate = (timestamp: number) => {
            if (!start) start = timestamp
            
            // Spring physics calculation
            const force = (targetY - currentY) * 0.15  // Stiffness
            velocity = (velocity + force) * 0.8         // Damping
            currentY += velocity
            
            // r024.25: Update anchor directly in the stored data ref (no cloning)
            if (hoverGraphicRef.current && mapView?.graphics && symbolDataRef.current) {
              try {
                // Mutate the stored data directly
                symbolDataRef.current.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
                
                // Create a new symbol wrapper to trigger ESRI's change detection
                // The data object is reused, only the wrapper is new (minimal allocation)
                hoverGraphicRef.current.symbol = {
                  type: 'cim',
                  data: symbolDataRef.current
                } as any
              } catch (error) {
                debugLogger.log('HOVER-PREVIEW', {
                  event: 'animation-update-error',
                  recordId,
                  error: error?.toString(),
                  timestamp: Date.now()
                })
              }
            }
            
            // Continue until settled
            if (Math.abs(velocity) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
              animationRef.current = requestAnimationFrame(animate)
            } else {
              debugLogger.log('HOVER-PREVIEW', {
                event: 'animation-complete',
                recordId,
                finalY: currentY,
                timestamp: Date.now()
              })
              animationRef.current = null
            }
          }
          
          animationRef.current = requestAnimationFrame(animate)
          
        } else {
          // Reuse existing graphic - update geometry and restart animation
          hoverGraphicRef.current.geometry = labelPoint
          hoverGraphicRef.current.visible = true
          
          // r022.108: Cancel any existing animation before starting new one
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }
          
          // r024.25: Reset anchor to suspended position for new animation
          if (symbolDataRef.current) {
            symbolDataRef.current.symbol.symbolLayers[0].anchorPoint = { x: 0, y: -1.2 }
          }
          
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-reused',
            recordId,
            geometryType: geometry.type,
            location: { x: labelPoint.x, y: labelPoint.y },
            timestamp: Date.now()
          })
          
          // r022.108 / r024.25: Restart spring drop animation (optimized - no cloning)
          let start = null
          const targetY = -0.5
          const initialY = -1.2
          let currentY = initialY
          let velocity = 0
          
          const animate = (timestamp: number) => {
            if (!start) start = timestamp
            
            const force = (targetY - currentY) * 0.15
            velocity = (velocity + force) * 0.8
            currentY += velocity
            
            // r024.25: Update anchor directly (no cloning)
            if (hoverGraphicRef.current && mapView?.graphics && symbolDataRef.current) {
              try {
                symbolDataRef.current.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
                hoverGraphicRef.current.symbol = {
                  type: 'cim',
                  data: symbolDataRef.current
                } as any
              } catch (error) {
                debugLogger.log('HOVER-PREVIEW', {
                  event: 'animation-update-error-reuse',
                  recordId,
                  error: error?.toString(),
                  timestamp: Date.now()
                })
              }
            }
            
            if (Math.abs(velocity) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
              animationRef.current = requestAnimationFrame(animate)
            } else {
              debugLogger.log('HOVER-PREVIEW', {
                event: 'animation-complete-reuse',
                recordId,
                finalY: currentY,
                timestamp: Date.now()
              })
              animationRef.current = null
            }
          }
          
          animationRef.current = requestAnimationFrame(animate)
        }
      } catch (error) {
        debugLogger.log('HOVER-PREVIEW', {
          event: 'hover-graphic-error',
          recordId,
          error: error?.toString(),
          timestamp: Date.now()
        })
      }
    }, 100) // 100ms debounce
  }, [mapView, data, recordId, hoverPinColor, memoizedSymbolData])

  /**
   * r022.106: Handle mouse leave - hide hover preview pin
   * r022.108: Cancel spring animation
   */
  const handleMouseLeave = React.useCallback(() => {
    // r022.108: Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    // Hide hover graphic (don't destroy - reuse it)
    if (hoverGraphicRef.current) {
      hoverGraphicRef.current.visible = false
      
      debugLogger.log('HOVER-PREVIEW', {
        event: 'hover-graphic-hidden',
        recordId,
        timestamp: Date.now()
      })
    }
  }, [recordId])

  return (
    <div
      className={classNames('query-result-item', { selected, 'result-item-expanded': isExpanded || !isVerticalAlign })}
      onClick={handleClickResultItem}
      onKeyUp={onKeyUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      css={style}
      role='option'
      aria-selected={selected}
      tabIndex={0}
    >
      {/* r026.002: CustomTemplate mode — our own {{field}} substitution + markdown rendering.
          Bypasses Esri Feature widget but matches FeatureInfo's DOM structure exactly. */}
      {isCustomTemplate && rawTemplate ? (
        <div
          className={classNames('feature-info-component d-flex align-items-center', { 'feature-info-expanded': isExpanded })}
          style={{ padding: '3px 4px' }}
          css={css`
            border: 1px solid var(--sys-color-divider-secondary);
            &.feature-info-expanded { min-height: 4.5rem; }
            .esri-widget__heading {
              font-size: 0.875rem !important;
              font-weight: 500 !important;
              margin: 0;
              color: var(--sys-color-surface-paper-text);
            }
            .esri-feature__text {
              font-size: 0.875rem;
              color: var(--sys-color-surface-paper-text);
              p { margin: 0; }
              p:last-child { margin-bottom: 0; }
              h3 { font-size: 1rem; font-weight: 600; font-style: normal; margin: 0 0 4px 0; }
              h4 { font-size: 0.9rem; font-weight: 600; font-style: normal; margin: 0 0 4px 0; }
              h5 { font-size: 0.85rem; font-weight: 600; font-style: normal; margin: 0 0 3px 0; }
              h6 { font-size: 0.8rem; font-weight: 600; font-style: normal; margin: 0 0 3px 0; }
              ul { margin: 2px 0 6px 0; padding-left: 20px; }
              li { margin: 1px 0; }
              hr { border: none; border-top: 1px solid var(--ref-palette-neutral-500); margin: 6px 0; }
              strong { font-weight: 700; }
              em { font-style: italic; }
              a { color: var(--sys-color-primary-main); text-decoration: none; }
              a:hover { text-decoration: underline; }
              img { max-width: 100%; height: auto; }
            }
          `}
        >
          {isVerticalAlign && (
            <button
              className='jimu-outline-inside flex-shrink-0'
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
              aria-label={isExpanded ? 'collapse' : 'expand'}
              css={css`
                background: none;
                border: none;
                cursor: pointer;
                min-width: 32px;
                min-height: 32px;
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                align-self: flex-start;
                border-radius: 2px;
                color: inherit;
                &:hover {
                  background-color: var(--sys-color-action-hover, rgba(0, 0, 0, 0.04));
                }
              `}
            >
              <div css={isExpanded
                ? css`width: 16px; height: 16px; background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4L8 12L2 4L14 4Z" fill="currentColor"/></svg>'); background-size: contain; background-repeat: no-repeat; background-position: center; display: inline-block;`
                : css`width: 16px; height: 16px; background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2L12 8L4 14V2Z" fill="currentColor"/></svg>'); background-size: contain; background-repeat: no-repeat; background-position: center; display: inline-block;`
              } aria-hidden='true' />
            </button>
          )}
          <div className='flex-grow-1' dangerouslySetInnerHTML={{ __html: (() => {
            const attributes = data.feature?.attributes || {}
            let substituted = substituteTokens(rawTemplate, attributes)
            substituted = substituted.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
              const val = attributes[field]
              return val != null ? String(val) : ''
            })
            const html = convertTemplateToHtml(substituted)
            // Match Esri Feature widget DOM: title heading + text content
            const titleTemplate = popupTemplate.title || ''
            let title = substituteTokens(titleTemplate, attributes)
            title = title.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
              const val = attributes[field]
              return val != null ? String(val) : ''
            })
            const titleHtml = title ? `<div class="esri-widget__heading">${title}</div>` : ''
            const contentHtml = isExpanded || !isVerticalAlign ? `<div class="esri-feature__text">${html}</div>` : ''
            return `${titleHtml}${contentHtml}`
          })() }} />
        </div>
      ) : (
        <FeatureInfo
          graphic={data.feature as __esri.Graphic}
          popupTemplate={popupTemplate}
          defaultPopupTemplate={defaultPopupTemplate}
          togglable={isVerticalAlign}
          expandByDefault={expandByDefault}
          onExpandChange={isVerticalAlign ? setIsExpanded : undefined}
          dataSource={dataSource}
        />
      )}
      {/* r024.41: Plain HTML action buttons - NO jimu-ui, NO Calcite, NO click-outside listener */}
      {/* r024.46: When zoomOnResultClick is on, skip zoom button entirely.
          If collapsed and no zoom button, show trash directly (no three-dot menu needed). */}
      <div className={classNames('result-actions-menu', { 'result-actions-expanded': (isExpanded || !isVerticalAlign) })}>
        {(isExpanded || !isVerticalAlign) ? (
          <>
            {onZoomTo && !zoomOnResultClick && (
              <button
                type="button"
                className="result-actions-toggle"
                css={actionButtonStyle}
                onClick={handleZoomTo}
                aria-label={getI18nMessage('zoomToRecord')}
                title={getI18nMessage('zoomToRecord')}
              >
                <span css={zoomToIconStyle} aria-hidden="true" />
              </button>
            )}
            {onPanTo && !panOnResultClick && (
              <button
                type="button"
                className="result-actions-toggle"
                css={actionButtonStyle}
                onClick={handlePanTo}
                aria-label={getI18nMessage('panToRecord')}
                title={getI18nMessage('panToRecord')}
              >
                <span css={panToIconStyle} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="result-actions-toggle"
              css={actionButtonStyle}
              onClick={handleRemove}
              aria-label={getI18nMessage('removeResult')}
              title={getI18nMessage('removeResult')}
            >
              <span css={trashIconStyle} aria-hidden="true" />
            </button>
          </>
        ) : ((zoomOnResultClick || !onZoomTo) && (panOnResultClick || !onPanTo)) ? (
          /* r024.46/r026.009: Both zoom and pan are either default-click or absent — just show trash directly */
          <button
            type="button"
            className="result-actions-toggle"
            css={actionButtonStyle}
            onClick={handleRemove}
            aria-label={getI18nMessage('removeResult')}
            title={getI18nMessage('removeResult')}
          >
            <span css={trashIconStyle} aria-hidden="true" />
          </button>
        ) : (
          <div 
            css={css`position: relative;`}
            onBlur={(e) => {
              // Close menu when focus leaves the container (click elsewhere)
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setMenuOpen(false)
              }
            }}
          >
            <button
              ref={menuButtonRef}
              type="button"
              className="result-actions-toggle"
              css={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (!menuOpen && menuButtonRef.current) {
                  // r024.46: Check if there's room below. Menu is ~80px tall.
                  const scrollParent = menuButtonRef.current.closest('.query-result-container')
                  if (scrollParent) {
                    const scrollRect = scrollParent.getBoundingClientRect()
                    const btnRect = menuButtonRef.current.getBoundingClientRect()
                    const spaceBelow = scrollRect.bottom - btnRect.bottom
                    setMenuDropUp(spaceBelow < 90)
                  }
                }
                setMenuOpen(!menuOpen)
              }}
              aria-label={getI18nMessage('resultActions')}
              title={getI18nMessage('resultActions')}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span css={moreIconStyle} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div css={dropdownMenuBaseStyle} style={menuDropUp ? { bottom: '36px' } : { top: '36px' }} role="menu" tabIndex={-1}>
                {onZoomTo && !zoomOnResultClick && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleZoomTo}
                    css={menuItemStyle}
                  >
                    <span css={css`${zoomToIconStyle}; width: 16px; height: 16px;`} aria-hidden="true" />
                    {getI18nMessage('zoomToRecord')}
                  </button>
                )}
                {onPanTo && !panOnResultClick && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handlePanTo}
                    css={menuItemStyle}
                  >
                    <span css={css`${panToIconStyle}; width: 16px; height: 16px;`} aria-hidden="true" />
                    {getI18nMessage('panToRecord')}
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleRemove}
                  css={menuItemStyle}
                >
                  <span css={css`${trashIconStyle}; width: 16px; height: 16px;`} aria-hidden="true" />
                  {getI18nMessage('removeResult')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
