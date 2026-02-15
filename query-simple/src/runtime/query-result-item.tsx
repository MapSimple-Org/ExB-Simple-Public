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
import { Button, Tooltip, Popper, Icon } from 'jimu-ui'
import FeatureInfo from './components/feature-info'
import { ListDirection } from '../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import defaultMessages from './translations/default'
import { hooks } from 'jimu-core'
import Graphic from '@arcgis/core/Graphic'
import * as labelPointOperator from '@arcgis/core/geometry/operators/labelPointOperator.js'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Trash icon as CSS background-image (r021.44 memory optimization)
 * Instead of creating 600 React component instances of <TrashOutlined>,
 * we use a single CSS style with SVG data-uri that's reused across all items.
 * This eliminates 600 component instances + 600 DOM nodes.
 * SVG source: jimu-icons/svg/outlined/editor/trash.svg
 */
const moreIcon = require('jimu-icons/svg/outlined/application/more-horizontal.svg')
const zoomToIcon = require('./assets/icons/zoom-to.svg')

const trashIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6.5C6 6.22386 6.22386 6 6.5 6C6.77614 6 7 6.22386 7 6.5V12.5C7 12.7761 6.77614 13 6.5 13C6.22386 13 6 12.7761 6 12.5V6.5Z" fill="currentColor"/><path d="M9.5 6C9.22386 6 9 6.22386 9 6.5V12.5C9 12.7761 9.22386 13 9.5 13C9.77614 13 10 12.7761 10 12.5V6.5C10 6.22386 9.77614 6 9.5 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 0H5C4.44772 0 4 0.447715 4 1V3H0.5C0.223858 3 0 3.22386 0 3.5C0 3.77614 0.223858 4 0.5 4H2.1L2.90995 15.0995C2.96107 15.6107 3.39124 16 3.90499 16H12.095C12.6088 16 13.0389 15.6107 13.09 15.0995L13.9 4H15.5C15.7761 4 16 3.77614 16 3.5C16 3.22386 15.7761 3 15.5 3H12V1C12 0.447715 11.5523 0 11 0ZM11 3V1H5V3H11ZM12.895 4H3.10499L3.90499 15H12.095L12.895 4Z" fill="currentColor"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
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
  // r022.106: Hover preview props
  mapView?: __esri.MapView | __esri.SceneView
}

const style = css`
  overflow: auto;
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
 * @param hex - Hex color string (e.g., '#FFC107' or 'FFC107')
 * @returns RGB array [r, g, b, alpha] for CIM symbol (e.g., [255, 193, 7, 230])
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
  const { widgetId, data, dataSource, popupTemplate, defaultPopupTemplate, onClick, onRemove, onZoomTo, expandByDefault = false, mapView, hoverPinColor } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  const [isExpanded, setIsExpanded] = React.useState(expandByDefault)

  // r023.33: Sync with expandByDefault when parent toggles Expand All / Collapse All
  React.useEffect(() => {
    setIsExpanded(expandByDefault)
  }, [expandByDefault])
  
  const recordId = data.getId()
  
  // r022.106: Hover preview - refs for hover graphic management
  const hoverGraphicRef = React.useRef<__esri.Graphic | null>(null)
  const hoverTimeoutRef = React.useRef<number | null>(null)
  const animationRef = React.useRef<number | null>(null) // r022.108: Spring animation ID
  
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
        
        // r022.106: Convert configured color to RGB for CIM symbol
        const baseColor = hexToRgb(hoverPinColor || '#FFC107', 230) // Main pin color
        // Create lighter variant for center circle (increase each RGB component by 20%)
        const lighterColor: [number, number, number, number] = [
          Math.min(255, Math.round(baseColor[0] * 1.2)),
          Math.min(255, Math.round(baseColor[1] * 1.2)),
          Math.min(255, Math.round(baseColor[2] * 1.2)),
          255 // Full opacity for center
        ]
        
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
        
        // Create or update hover graphic
        if (!hoverGraphicRef.current) {
          // First hover - create new graphic using user's simplified teardrop pin SVG
          // User's SVG path (viewBox 0 0 24 24):
          // M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z 
          // M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z
          // Y-FLIPPED for CIM (new_y = 24 - old_y): Point should be at top, circle at bottom
          
          const cimSymbol = {
            type: 'cim',
            data: {
              type: 'CIMSymbolReference',
              symbol: {
                type: 'CIMPointSymbol',
                symbolLayers: [
                  {
                    type: 'CIMVectorMarker',
                    enable: true,
                    size: 28,
                    anchorPointUnits: 'Relative',
                    anchorPoint: { x: 0, y: -0.5 }, // Anchor halfway up to position tip correctly
                    frame: { xmin: 0, ymin: 0, xmax: 24, ymax: 24 },
                    markerGraphics: [
                      {
                        // Outer teardrop shape (Y-flipped: 24-y for each coordinate)
                        type: 'CIMMarkerGraphic',
                        geometry: {
                          rings: [[
                            // Starting from top (was bottom Y=22, now Y=2)
                            [12, 22], [10.5, 22], [9, 21.5], [7.5, 20.5],
                            [6, 19], [5.5, 17.5], [5, 15],
                            // Going up in visual (was down, Y=9 now Y=15)
                            [5, 13.5], [5.5, 11], [6.5, 8.5],
                            [8, 6], [10, 3.5], [12, 2],
                            // Right side (was bottom Y=22, now Y=2)
                            [14, 3.5], [16, 6], [17.5, 8.5],
                            [18.5, 11], [19, 13.5],
                            // Top curve (was Y=9, now Y=15)
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
                              color: baseColor // Configured hover pin color
                            }
                          ]
                        }
                      },
                      {
                        // Inner circle "eye" (Y-flipped: was Y=9 center, now Y=15 center)
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
                              color: lighterColor // Lighter variant for center circle
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
          
          // r022.108: Start with pin suspended high (will animate down with spring physics)
          cimSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: -1.2 }
          
          hoverGraphicRef.current = new Graphic({
            geometry: labelPoint,
            symbol: cimSymbol as any
          })
          mapView.graphics.add(hoverGraphicRef.current)
          
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-created',
            recordId,
            geometryType: geometry.type,
            symbolType: 'CIMSymbol-GooglePin-Animated',
            color: hoverPinColor || '#FFC107',
            colorRgb: baseColor,
            location: { x: labelPoint.x, y: labelPoint.y },
            timestamp: Date.now()
          })
          
          // r022.108: Start spring drop animation
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
            
            // Update the graphic symbol anchor
            if (hoverGraphicRef.current && mapView?.graphics) {
              try {
                const currentSymbol = hoverGraphicRef.current.symbol as any
                const newSymbol = currentSymbol.clone()
                newSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
                newSymbol.data.symbol.symbolLayers[0].anchorPointUnits = 'Relative'
                hoverGraphicRef.current.symbol = newSymbol
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
          
          debugLogger.log('HOVER-PREVIEW', {
            event: 'hover-graphic-reused',
            recordId,
            geometryType: geometry.type,
            location: { x: labelPoint.x, y: labelPoint.y },
            timestamp: Date.now()
          })
          
          // r022.108: Restart spring drop animation
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
            
            if (hoverGraphicRef.current && mapView?.graphics) {
              try {
                const currentSymbol = hoverGraphicRef.current.symbol as any
                const newSymbol = currentSymbol.clone()
                newSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
                newSymbol.data.symbol.symbolLayers[0].anchorPointUnits = 'Relative'
                hoverGraphicRef.current.symbol = newSymbol
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
  }, [mapView, data, recordId, hoverPinColor])

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
      <FeatureInfo
        graphic={data.feature as __esri.Graphic}
        popupTemplate={popupTemplate}
        defaultPopupTemplate={defaultPopupTemplate}
        togglable={isVerticalAlign}
        expandByDefault={expandByDefault}
        onExpandChange={isVerticalAlign ? setIsExpanded : undefined}
        dataSource={dataSource}
      />
      {/* r023.32-33: Expanded = inline icons (vertical stack); collapsed = three-dot menu */}
      <div className={classNames('result-actions-menu', { 'result-actions-expanded': (isExpanded || !isVerticalAlign) })}>
        {(isExpanded || !isVerticalAlign) ? (
          <>
            {onZoomTo && (
              <Tooltip title={getI18nMessage('zoomToRecord')} placement="bottom">
                <Button
                  className="result-actions-toggle"
                  icon
                  size="sm"
                  variant="text"
                  color="inherit"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onZoomTo(data) }}
                  aria-label={getI18nMessage('zoomToRecord')}
                  css={css`padding: 6px; min-width: 32px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;`}
                >
                  <Icon icon={zoomToIcon} size={18} />
                </Button>
              </Tooltip>
            )}
            <Tooltip title={getI18nMessage('removeResult')} placement="bottom">
              <Button
                className="result-actions-toggle"
                icon
                size="sm"
                variant="text"
                color="inherit"
                onClick={handleRemove}
                aria-label={getI18nMessage('removeResult')}
                css={css`padding: 6px; min-width: 32px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;`}
              >
                <div css={trashIconStyle} aria-hidden="true" />
              </Button>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title={getI18nMessage('resultActions')} placement="bottom">
              <Button
                ref={menuButtonRef}
                className="result-actions-toggle"
                icon
                size="sm"
                variant="text"
                color="inherit"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpen(!menuOpen) }}
                aria-label="Result actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                css={css`padding: 6px; min-width: 32px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;`}
              >
                <Icon icon={moreIcon} size={22} />
              </Button>
            </Tooltip>
            <Popper
              open={menuOpen}
              reference={menuButtonRef.current}
              placement="bottom-end"
              toggle={() => setMenuOpen(false)}
              trapFocus={false}
            >
              <div
                css={css`
                  min-width: 140px;
                  padding: 4px 0;
                  background: var(--ref-palette-neutral-0);
                  border: 1px solid var(--ref-palette-neutral-400);
                  border-radius: 4px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                `}
              >
                {onZoomTo && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleZoomTo}
                    css={css`
                      display: flex; align-items: center; gap: 8px; width: 100%;
                      padding: 8px 12px; border: none; background: none; font-size: 0.875rem;
                      cursor: pointer; text-align: left;
                      &:hover { background: var(--ref-palette-neutral-200); }
                    `}
                  >
                    <Icon icon={zoomToIcon} size={16} />
                    {getI18nMessage('zoomToRecord')}
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleRemove}
                  css={css`
                    display: flex; align-items: center; gap: 8px; width: 100%;
                    padding: 8px 12px; border: none; background: none; font-size: 0.875rem;
                    cursor: pointer; text-align: left;
                    &:hover { background: var(--ref-palette-neutral-200); }
                  `}
                >
                  <div css={trashIconStyle} aria-hidden="true" style={{ width: 16, height: 16 }} />
                  {getI18nMessage('removeResult')}
                </button>
              </div>
            </Popper>
          </>
        )}
      </div>
    </div>
  )
}
