/**
 * Spatial Tab Content Component
 *
 * Provides two input modes for spatial queries:
 * - Operations: Uses accumulated query results as input geometry
 * - Draw: JimuDraw integration for drawing shapes on the map (multi-shape, continuous)
 *
 * Both modes share the Operations Panel: Buffer + Results Mode + Spatial Relationship +
 * Target Layers + Execute. Draw mode adds JimuDraw toolbar above the panel.
 *
 * Smart default: If accumulatedRecords exist → Operations, otherwise → Draw.
 * Re-evaluates each time user switches TO the Spatial tab (unless they've manually chosen).
 *
 * Key versions:
 * - r025.005–029: Initial layout, combobox, execution pipeline
 * - r025.030–040: Warnings, relationship labels, buffer preview integration
 * - r025.041: JimuDraw integration, mixed geometry buffer fix (group-by-type union)
 * - r025.044: Multi-shape draw mode (Continuous creation, geometry accumulation)
 *
 * Related:
 * - Requirements: docs/development/SPATIAL_TAB_REQUIREMENTS.md
 * - Architecture: docs/development/SPATIAL_TAB_ARCHITECTURE_READINESS.md
 * - Flow docs: docs/process-flows/FLOW-10, FLOW-11
 */
/** @jsx jsx */
import {
  React,
  jsx,
  css,
  hooks,
  moduleLoader,
  DataSourceManager,
  type FeatureLayerDataSource,
  type FeatureDataRecord
} from 'jimu-core'
import { Button, Select, Option, TextInput, Tooltip, AdvancedSelect } from 'jimu-ui'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import type * as jimuMap from 'jimu-ui/advanced/map'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

// r025.069: Esri spatial relationship SVG diagrams
import containsSvg from '../assets/spatial/contains.svg'
import intersectsSvg from '../assets/spatial/intersects.svg'
import overlapsSvg from '../assets/spatial/overlaps.svg'
import withinSvg from '../assets/spatial/within.svg'
import touchesSvg from '../assets/spatial/touches.svg'
import defaultMessage from '../translations/default'
import { createQuerySimpleDebugLogger, EntityStatusType, StatusIndicator, highlightConfigManager } from 'widgets/shared-code/mapsimple-common'
import { useBufferPreview } from '../managers/use-buffer-preview'
import { ResultsModeControl, type ResultsModeValue } from '../components/ResultsModeControl'

const debugLogger = createQuerySimpleDebugLogger()

export type SpatialMode = 'operations' | 'draw'

export interface SpatialTabContentProps {
  activeTab: 'query' | 'spatial' | 'results'
  accumulatedRecords?: FeatureDataRecord[]
  onClearResults?: () => void
  mapView?: __esri.MapView | __esri.SceneView
  jimuMapView?: JimuMapView  // r025.041: Required by JimuDraw for Draw mode
  widgetId: string
  isPanelVisible?: boolean  // r025.013: Buffer preview clear/restore on panel close/open
  targetLayerOptions?: Array<{ value: string | number; label: string }>  // r025.007: Real layers from widget config
  onExecuteSpatialQuery?: (params: {
    inputGeometry: __esri.Geometry
    selectedRelationship: string
    selectedLayers: Array<{ value: string | number; label: string }>
    bufferDistance: number
    bufferUnit: string
    resultsMode: ResultsModeValue
  }) => Promise<boolean>  // r025.029: Returns true if results were found
  queryErrorAlert?: { show: boolean; errorMessage: string; timestamp?: number } | null
  onDismissQueryErrorAlert?: () => void
  noResultsAlert?: { show: boolean; recordsRequested: number; queryValue: string; timestamp?: number } | null
  onDismissNoResultsAlert?: () => void
}

// Geometry dimension: point=0, polyline=1, polygon=2
type GeomDimension = 0 | 1 | 2
const GEOM_TYPE_DIMENSION: Record<string, GeomDimension> = {
  point: 0, multipoint: 0, polyline: 1, polygon: 2, extent: 2
}

interface SpatialRelationshipDef {
  id: string
  label: string
  description: string
  /** null = works with any combination. Otherwise: 'same' = same dimension only, 'different' = different dimensions only */
  dimensionConstraint: 'same' | 'different' | null
  /** Short warning shown when constraint is violated */
  constraintNote: string | null
}

const spatialRelationships: readonly SpatialRelationshipDef[] = [
  { id: 'contains', label: 'Within', description: 'Find features completely inside your search area', dimensionConstraint: null, constraintNote: null },
  { id: 'intersects', label: 'Intersects', description: 'Find features that share any part of your search area', dimensionConstraint: null, constraintNote: null },
  { id: 'envelope-intersects', label: 'Envelope intersects', description: 'Find features within the bounding rectangle of your search area', dimensionConstraint: null, constraintNote: null },
  { id: 'overlaps', label: 'Overlaps', description: 'Find features that partially cover your search area (same geometry type only)', dimensionConstraint: 'same', constraintNote: 'Overlaps only works between same geometry types (e.g., polygon-polygon)' },
  { id: 'within', label: 'Encloses search area', description: 'Find features large enough to completely surround your search area', dimensionConstraint: null, constraintNote: null },
  { id: 'touches', label: 'Touches', description: 'Find features that share a boundary but do not overlap', dimensionConstraint: null, constraintNote: null },
  { id: 'crosses', label: 'Crosses', description: 'Find features that pass through your search area (different geometry types only)', dimensionConstraint: 'different', constraintNote: 'Crosses only works between different geometry types (e.g., line-polygon)' }
] as const

// r025.069: Diagram SVGs and captions for info popover
const spatialRelationshipDiagrams: Record<string, { svg: string | null, caption: string }> = {
  contains: { svg: containsSvg, caption: 'Target must be completely inside the search area.' },
  intersects: { svg: intersectsSvg, caption: 'Any geometry that touches, overlaps, or falls inside.' },
  'envelope-intersects': { svg: null, caption: 'Uses the bounding rectangle of the search area. Faster but less precise than Intersects.' },
  overlaps: { svg: overlapsSvg, caption: 'Same geometry type only. Partial overlap — not fully inside or outside.' },
  within: { svg: withinSvg, caption: 'Target must completely surround the search area.' },
  touches: { svg: touchesSvg, caption: 'Boundary contact only — no interior overlap.' },
  crosses: { svg: null, caption: 'Different geometry types only. Line through polygon is the most common case.' }
}

const bufferUnits = [
  { value: 'feet', label: 'Feet' },
  { value: 'miles', label: 'Miles' },
  { value: 'meters', label: 'Meters' },
  { value: 'kilometers', label: 'Kilometers' }
]

// ─── Styles ────────────────────────────────────────────────────────

const containerStyle = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 16px;
  gap: 0;
  overflow: hidden;
`

const toggleGroupStyle = css`
  display: flex;
  flex-shrink: 0;
  gap: 0;
  margin-bottom: 8px;
  border: 1px solid var(--ref-palette-neutral-500);
  border-radius: 4px;
  overflow: hidden;

  button {
    flex: 1;
    border: none;
    border-radius: 0;
    padding: 6px 12px;
    font-size: 0.8125rem;
    background: var(--ref-palette-neutral-200);
    color: var(--ref-palette-neutral-1100);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:not(:last-child) {
      border-right: 1px solid var(--ref-palette-neutral-500);
    }

    &:hover {
      background: var(--ref-palette-neutral-300);
    }
  }
`

const toggleActiveStyle = css`
  && {
    background: var(--sys-color-primary-main);
    color: var(--ref-palette-white);
    font-weight: 500;

    &:hover {
      background: var(--sys-color-primary-dark);
    }
  }
`

const scrollableContentStyle = css`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const sectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const sectionTitleStyle = css`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ref-palette-neutral-1100);
  margin: 0;
`

const bufferRowStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

/**
 * Prevent iOS Safari auto-zoom on input focus.
 * iOS zooms when focusing any input/select with computed font-size < 16px.
 * 1024px covers both phones and tablets (iPadOS Safari has the same behavior).
 */
const mobileInputZoomFix = css`
  @media (max-width: 1024px) {
    input, select,
    .jimu-input, .jimu-input input,
    .jimu-numeric-input input,
    .jimu-select select {
      font-size: 16px !important;
    }
    calcite-combobox {
      font-size: 16px !important;
    }
  }
`

const disabledHintStyle = css`
  font-size: 0.8rem;
  line-height: 1.3;
  color: #b22222;
  background: var(--sys-color-surface);
  border-left: 3px solid #b22222;
  border-radius: 3px;
  padding: 4px 8px;
  margin: 0;
`

// ─── Component ─────────────────────────────────────────────────────

export function SpatialTabContent (props: SpatialTabContentProps) {
  const { activeTab, accumulatedRecords, onClearResults, mapView, jimuMapView, widgetId, isPanelVisible, targetLayerOptions, onExecuteSpatialQuery, queryErrorAlert, onDismissQueryErrorAlert, noResultsAlert, onDismissNoResultsAlert } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const hasResults = accumulatedRecords && accumulatedRecords.length > 0

  // Smart default: Operations if results exist, Draw if not
  const [spatialMode, setSpatialMode] = React.useState<SpatialMode>(
    hasResults ? 'operations' : 'draw'
  )
  const [selectedRelationship, setSelectedRelationship] = React.useState<string | null>(null)
  const [resultsMode, setResultsMode] = React.useState<ResultsModeValue>('new')
  const [bufferDistance, setBufferDistance] = React.useState('')
  const [bufferUnit, setBufferUnit] = React.useState('feet')
  const [selectedLayers, setSelectedLayers] = React.useState<Array<{ value: string | number; label: string }>>([])
  const [showRelInfo, setShowRelInfo] = React.useState(false) // r025.069: Hover-driven spatial relationship info popover

  // r025.041: JimuDraw module (lazy-loaded) and drawn geometry state
  const [mapModule, setMapModule] = React.useState<typeof jimuMap>(null)
  const [drawnGeometries, setDrawnGeometries] = React.useState<__esri.Geometry[]>([])
  const hasDrawnGeometry = drawnGeometries.length > 0
  const getDrawLayerRef = React.useRef<(() => __esri.GraphicsLayer | __esri.MapNotesLayer) | null>(null)

  // r025.052: Reset resultsMode to 'new' when accumulated records are cleared while on 'remove'
  // Matches Query tab behavior — Remove stays disabled AND deselected when nothing to remove from
  React.useEffect(() => {
    if (resultsMode === 'remove' && (!accumulatedRecords || accumulatedRecords.length === 0)) {
      setResultsMode('new')
    }
  }, [accumulatedRecords, resultsMode])

  // r025.029: Spatial query execution state
  const [isExecuting, setIsExecuting] = React.useState(false)

  // r025.041: Lazy-load JimuDraw module (same pattern as interactive-draw-tool.tsx)
  hooks.useEffectOnce(() => {
    moduleLoader.loadModule<typeof jimuMap>('jimu-ui/advanced/map').then((result) => {
      debugLogger.log('TASK', {
        event: 'spatial-draw-module-loaded',
        hasJimuDraw: !!result?.JimuDraw,
        moduleKeys: result ? Object.keys(result).slice(0, 10) : [],
        widgetId
      })
      setMapModule(result)
    }).catch((error) => {
      debugLogger.log('TASK', {
        event: 'spatial-draw-module-load-error',
        error: error?.toString(),
        widgetId
      })
    })
  })

  // r025.051: Configurable draw symbols — color from widget settings via singleton
  const [drawSymbols, setDrawSymbols] = React.useState<any>(null)
  hooks.useEffectOnce(() => {
    loadArcGISJSAPIModules([
      'esri/symbols/SimpleMarkerSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol'
    ]).then(([SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol]) => {
      const color = highlightConfigManager.getDrawColor(widgetId)
      setDrawSymbols({
        pointSymbol: new SimpleMarkerSymbol({
          color: [...color, 0.85],
          size: 10,
          style: 'circle',
          outline: { color: [255, 255, 255], width: 1.5 }
        }),
        polylineSymbol: new SimpleLineSymbol({
          color,
          width: 2.5,
          style: 'solid'
        }),
        polygonSymbol: new SimpleFillSymbol({
          color: [...color, 0.15],
          style: 'solid',
          outline: { color, width: 2 }
        })
      })
    })
  })

  // r025.022: Reset buffer distance when results are cleared
  React.useEffect(() => {
    if (!hasResults) {
      setBufferDistance('')
    }
  }, [hasResults])

  // r025.041: Store array of input geometries (grouped by type, unioned within each group).
  // Supports mixed geometry types (e.g., points + polygons from different layers).
  // Each element is one unioned geometry per type group.
  const [allInputGeometries, setAllInputGeometries] = React.useState<__esri.Geometry[]>([])

  // Derived single inputGeometry for warnings and query execution (highest dimension type)
  const inputGeometry = React.useMemo<__esri.Geometry | null>(() => {
    if (allInputGeometries.length === 0) return null
    if (allInputGeometries.length === 1) return allInputGeometries[0]
    // Mixed types: use highest-dimension geometry for warning evaluation
    const sorted = [...allInputGeometries].sort((a, b) =>
      (GEOM_TYPE_DIMENSION[b.type] || 0) - (GEOM_TYPE_DIMENSION[a.type] || 0)
    )
    return sorted[0]
  }, [allInputGeometries])

  React.useEffect(() => {
    // Resolve raw geometries from current mode
    let geometries: __esri.Geometry[]
    if (spatialMode === 'draw') {
      geometries = drawnGeometries
    } else {
      if (!hasResults) {
        setAllInputGeometries([])
        return
      }
      geometries = (accumulatedRecords
        ?.map(r => r.feature?.geometry)
        .filter(Boolean) || []) as __esri.Geometry[]
    }

    if (geometries.length === 0) {
      setAllInputGeometries([])
      return
    }

    if (geometries.length === 1) {
      setAllInputGeometries(geometries)
      return
    }

    // r025.041 + r025.050: Group by type, union within each group (unionOperator requires same type).
    // Both Draw and Operations modes union same-type geometries so the spatial query
    // receives one geometry per type (e.g., 3 drawn points → 1 multipoint).
    let cancelled = false
    loadArcGISJSAPIModules([
      'esri/geometry/operators/unionOperator'
    ]).then(modules => {
      if (cancelled) return
      const operator: (typeof __esri.unionOperator) = modules[0]

      const byType = new Map<string, __esri.Geometry[]>()
      for (const g of geometries) {
        const arr = byType.get(g.type) || []
        arr.push(g)
        byType.set(g.type, arr)
      }

      const unionedParts: __esri.Geometry[] = []
      for (const [, geoms] of byType) {
        if (geoms.length === 1) {
          unionedParts.push(geoms[0])
        } else {
          unionedParts.push(operator.executeMany(geoms))
        }
      }

      setAllInputGeometries(unionedParts)

      debugLogger.log('TASK', {
        event: 'buffer-input-geometries-grouped',
        widgetId,
        mode: spatialMode,
        totalGeometries: geometries.length,
        typeGroups: [...byType.entries()].map(([type, geoms]) => ({ type, count: geoms.length })),
        unionedPartCount: unionedParts.length,
        mixedTypes: byType.size > 1,
        timestamp: Date.now()
      })
    }).catch(error => {
      debugLogger.log('TASK', {
        event: 'buffer-input-geometry-union-error',
        widgetId,
        error: error?.toString(),
        geometryCount: geometries.length,
        geometryTypes: [...new Set(geometries.map(g => g.type))],
        timestamp: Date.now()
      })
    })

    return () => { cancelled = true }
  }, [hasResults, spatialMode, accumulatedRecords, widgetId, drawnGeometries])

  // Real-time buffer preview on the map
  // r025.020: Panel close/reopen handled imperatively by selection-restoration-manager
  // (clearSelectionFromMap clears buffer, addSelectionToMap restores stored graphic).
  // The hook handles initial compute, distance/unit changes, and unmount cleanup only.
  const bufferedGeometry = useBufferPreview({
    mapView,
    widgetId,
    inputGeometries: allInputGeometries,
    bufferDistance: parseFloat(bufferDistance) || 0,
    bufferUnit,
    enabled: !!mapView && (parseFloat(bufferDistance) || 0) !== 0 && isPanelVisible !== false
  })

  // r025.030: Resolve target layer geometry types for compatibility warnings
  const [targetGeometryTypes, setTargetGeometryTypes] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!selectedLayers || selectedLayers.length === 0) {
      setTargetGeometryTypes({})
      return
    }

    const dsManager = DataSourceManager.getInstance()
    const types: Record<string, string> = {}

    for (const layer of selectedLayers) {
      const layerId = String(layer.value)
      try {
        const ds = dsManager.getDataSource(layerId) as FeatureLayerDataSource
        if (ds?.layer) {
          types[layerId] = (ds.layer as __esri.FeatureLayer).geometryType || 'unknown'
        }
      } catch {
        // DataSource not yet loaded — skip
      }
    }

    setTargetGeometryTypes(types)
  }, [selectedLayers])

  // r025.030 / r025.040: Check geometry compatibility between source, target, and selected relationship
  // When a buffer is active, the effective source geometry is a polygon (dimension 2)
  const compatibilityWarning = React.useMemo<string | null>(() => {
    if (!selectedRelationship || !inputGeometry) return null

    const relDef = spatialRelationships.find(r => r.id === selectedRelationship)
    if (!relDef || !relDef.dimensionConstraint) return null

    const hasBuffer = bufferDistance && parseFloat(bufferDistance) > 0
    // Buffer converts any geometry to polygon (dimension 2)
    const effectiveDim = hasBuffer ? 2 : GEOM_TYPE_DIMENSION[inputGeometry.type]
    if (effectiveDim === undefined) return null

    const incompatibleLayers: string[] = []
    for (const layer of selectedLayers) {
      const geomType = targetGeometryTypes[String(layer.value)]
      if (!geomType || geomType === 'unknown') continue

      const targetDim = GEOM_TYPE_DIMENSION[geomType]
      if (targetDim === undefined) continue

      const sameDim = effectiveDim === targetDim
      if (relDef.dimensionConstraint === 'same' && !sameDim) {
        incompatibleLayers.push(`${layer.label} (${geomType})`)
      } else if (relDef.dimensionConstraint === 'different' && sameDim) {
        incompatibleLayers.push(`${layer.label} (${geomType})`)
      }
    }

    if (incompatibleLayers.length === 0) return null

    const sourceLabel = hasBuffer ? `buffered ${inputGeometry.type} (polygon)` : inputGeometry.type
    return `${relDef.constraintNote}. Source is ${sourceLabel}, but ${incompatibleLayers.join(', ')} will return 0 results.`
  }, [selectedRelationship, inputGeometry, selectedLayers, targetGeometryTypes, bufferDistance])

  // r025.040: Context-aware warnings for relationship + geometry + buffer combinations
  const relationshipWarning = React.useMemo<string | null>(() => {
    if (!selectedRelationship || !inputGeometry) return null

    const hasBuffer = bufferDistance && parseFloat(bufferDistance) > 0
    const geomType = inputGeometry.type // 'point' | 'polyline' | 'polygon' | etc.

    // --- Within (JSAPI 'contains'): source must have area to contain anything ---
    if (selectedRelationship === 'contains') {
      if (!hasBuffer && geomType === 'point') {
        return 'Within requires an area to search inside. A point has no area, so no features can be within it. Add a buffer distance or use Intersects instead.'
      }
      if (!hasBuffer && geomType === 'polyline') {
        return 'Within requires an area to search inside. A line has no area, so no features can be within it. Add a buffer distance or use Intersects instead.'
      }
    }

    // --- Touches: shared boundary without overlap ---
    if (selectedRelationship === 'touches') {
      if (hasBuffer) {
        return 'Touches finds features sharing a boundary without overlapping. A buffer creates a filled area that overlaps rather than touches, so this will likely return 0 results.'
      }
      if (geomType === 'point') {
        return 'Touches finds features sharing a boundary without overlapping. A point must land exactly on a feature boundary to qualify, which is unlikely to return results.'
      }
    }

    // --- Crosses: requires different geometry types, points can never cross ---
    if (selectedRelationship === 'crosses') {
      if (geomType === 'point' && !hasBuffer) {
        return 'Crosses requires a geometry that can pass through a feature. A point has no length, so it cannot cross anything. Use Intersects instead.'
      }
      if (hasBuffer && (geomType === 'point' || geomType === 'polyline')) {
        return 'Crosses requires different geometry types (e.g., line vs polygon). A buffer converts your search area into a polygon, making it the same type as polygon targets — this will return 0 results.'
      }
    }

    return null
  }, [selectedRelationship, inputGeometry, bufferDistance])

  // Track whether user has manually chosen a mode this session
  const userHasChosenModeRef = React.useRef(false)

  // Calcite combobox ref — web component events require addEventListener (not React onChange)
  const spatialRelComboboxRef = React.useRef<any>(null)

  React.useEffect(() => {
    const el = spatialRelComboboxRef.current
    if (!el) return

    const handleChange = () => {
      setSelectedRelationship(el.value || null)
    }

    el.addEventListener('calciteComboboxChange', handleChange)
    return () => el.removeEventListener('calciteComboboxChange', handleChange)
  }, [])

  const handleModeChange = React.useCallback((mode: SpatialMode) => {
    userHasChosenModeRef.current = true
    setSpatialMode(mode)

    // r025.041: Show/hide draw layer graphics when switching modes
    if (getDrawLayerRef.current) {
      const drawLayer = getDrawLayerRef.current() as __esri.GraphicsLayer
      if (drawLayer) {
        drawLayer.visible = mode === 'draw'
      }
    }
  }, [])

  // r025.041: JimuDraw callbacks (same pattern as interactive-draw-tool.tsx)
  const handleDrawToolCreated = React.useCallback((descriptor: jimuMap.JimuDrawCreatedDescriptor) => {
    getDrawLayerRef.current = descriptor.getGraphicsLayer
  }, [])

  const handleDrawStart = React.useCallback(() => {
    // r025.044: Multi-shape mode — don't clear previous graphics
  }, [])

  const handleDrawEnd = React.useCallback((graphic: __esri.Graphic) => {
    if (graphic?.geometry) {
      // r025.044: Accumulate drawn geometries (multi-shape mode)
      setDrawnGeometries(prev => [...prev, graphic.geometry])
      debugLogger.log('TASK', {
        event: 'spatial-draw-end',
        geometryType: graphic.geometry.type,
        widgetId
      })
    }
  }, [widgetId])

  // r025.050: Track geometry edits (move, vertex changes, deletions via select tool)
  const handleDrawUpdate = React.useCallback((res: { type: string, graphics: __esri.Graphic[] }) => {
    // Rebuild drawnGeometries from all graphics currently on the draw layer.
    // This covers moves, vertex edits, and individual shape deletions.
    const drawLayer = getDrawLayerRef.current?.()
    if (drawLayer) {
      const geometries: __esri.Geometry[] = []
      drawLayer.graphics.forEach(g => {
        if (g.geometry) geometries.push(g.geometry)
      })
      setDrawnGeometries(geometries)
      debugLogger.log('TASK', {
        event: 'spatial-draw-updated',
        type: res.type,
        geometryCount: geometries.length,
        widgetId
      })
    }
  }, [widgetId])

  const handleDrawCleared = React.useCallback(() => {
    setDrawnGeometries([])
    debugLogger.log('TASK', {
      event: 'spatial-draw-cleared',
      widgetId
    })
  }, [widgetId])

  // Smart default: re-evaluate when user switches TO the Spatial tab
  const prevActiveTabRef = React.useRef(activeTab)
  React.useEffect(() => {
    const wasNotSpatial = prevActiveTabRef.current !== 'spatial'
    const isNowSpatial = activeTab === 'spatial'
    prevActiveTabRef.current = activeTab

    if (wasNotSpatial && isNowSpatial && !userHasChosenModeRef.current) {
      const smartDefault: SpatialMode = hasResults ? 'operations' : 'draw'
      debugLogger.log('TASK', {
        event: 'spatial-smart-default',
        smartDefault,
        hasResults,
        accumulatedCount: accumulatedRecords?.length || 0
      })
      setSpatialMode(smartDefault)
    }
  }, [activeTab, hasResults, accumulatedRecords?.length])

  // In Operations mode, operations are enabled when results exist
  // In Draw mode, operations are disabled until a geometry is drawn
  const operationsEnabled = spatialMode === 'operations'
    ? hasResults
    : hasDrawnGeometry

  // Can execute when: operations enabled + relationship selected + at least one layer selected + geometry exists
  const canExecute = operationsEnabled && selectedRelationship && (selectedLayers?.length ?? 0) > 0 && !!inputGeometry

  return (
    <div css={containerStyle}>
      {/* Two-way toggle */}
      <div css={toggleGroupStyle} role='group' aria-label='Spatial mode'>
        <button
          css={spatialMode === 'operations' ? toggleActiveStyle : undefined}
          onClick={() => handleModeChange('operations')}
          aria-pressed={spatialMode === 'operations'}
          title={getI18nMessage('spatialModeOperationsTitle')}
        >
          {getI18nMessage('spatialModeOperations')}
        </button>
        <button
          css={spatialMode === 'draw' ? toggleActiveStyle : undefined}
          onClick={() => handleModeChange('draw')}
          aria-pressed={spatialMode === 'draw'}
          title={getI18nMessage('spatialModeDrawTitle')}
        >
          {getI18nMessage('spatialModeDraw')}
        </button>
      </div>

      {/* r025.061: Mode description text */}
      <div css={css`
        margin-bottom: 6px;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 0.8rem;
        line-height: 1.3;
        background: var(--sys-color-surface);
        color: var(--sys-color-text-secondary);
        border-left: 3px solid var(--sys-color-primary-main);
      `}>
        {spatialMode === 'operations'
          ? getI18nMessage('spatialModeOperationsDesc')
          : getI18nMessage('spatialModeDrawDesc')
        }
      </div>

      {/* Header row — Clear All button */}
      {hasResults && (
        <div css={css`
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
          margin-top: -4px;
        `}>
          <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
            <Button
              size='sm'
              type='tertiary'
              aria-label={getI18nMessage('clearResult')}
              icon
              onClick={() => { onClearResults?.() }}
            >
              <TrashOutlined />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Scrollable content area */}
      <div css={scrollableContentStyle}>

        {/* Draw section — only in Draw mode, above operations */}
        {spatialMode === 'draw' && (
          <div css={sectionStyle}>
            <h4 css={sectionTitleStyle}>{getI18nMessage('spatialModeDraw')}</h4>
            {jimuMapView && mapModule?.JimuDraw ? (
              <mapModule.JimuDraw
                jimuMapView={jimuMapView}
                operatorWidgetId={widgetId}
                disableSymbolSelector
                defaultSymbols={drawSymbols}
                drawingOptions={{
                  creationMode: mapModule.JimuDrawCreationMode.Continuous,
                  updateOnGraphicClick: false,
                  visibleElements: {
                    createTools: {
                      point: true,
                      polyline: true,
                      polygon: true,
                      rectangle: true,
                      circle: true,
                      freehandPolyline: true,
                      freehandPolygon: true
                    },
                    selectionTools: {
                      'lasso-selection': false,
                      'rectangle-selection': true
                    },
                    settingsMenu: false,
                    undoRedoMenu: false,
                    deleteButton: true
                  } as any
                }}
                uiOptions={{
                  isHideBorder: true
                }}
                onJimuDrawCreated={handleDrawToolCreated}
                onDrawingStarted={handleDrawStart}
                onDrawingFinished={handleDrawEnd}
                onDrawingUpdated={handleDrawUpdate}
                onDrawingCleared={handleDrawCleared}
              />
            ) : (
              <StatusIndicator statusType={EntityStatusType.Loading} />
            )}
          </div>
        )}

        {/* ─── Operations Panel ─── */}

        {/* 1. Source Indicator — mode-aware (r025.041) */}
        {(() => {
          const hasSource = spatialMode === 'draw' ? hasDrawnGeometry : hasResults
          const sourceLabel = spatialMode === 'draw'
            ? (hasDrawnGeometry
              ? (() => {
                  const types = [...new Set(drawnGeometries.map(g => g.type))]
                  return `${drawnGeometries.length} drawn shape${drawnGeometries.length > 1 ? 's' : ''} (${types.join(', ')})`
                })()
              : 'No shape drawn')
            : (hasResults
              ? getI18nMessage('spatialSourceFeatures').replace('{count}', String(accumulatedRecords.length))
              : getI18nMessage('spatialSourceNoFeatures'))

          return (
            <div css={css`
              padding: 6px 12px;
              border-radius: 4px;
              background: ${hasSource ? 'rgba(59, 130, 246, 0.08)' : 'var(--ref-palette-neutral-200)'};
              border: 1px solid ${hasSource ? 'rgba(59, 130, 246, 0.25)' : 'var(--ref-palette-neutral-400)'};
              font-size: 0.8125rem;
              color: ${hasSource ? '#1e40af' : 'var(--ref-palette-neutral-800)'};
              font-weight: ${hasSource ? '500' : '400'};
              transition: all 0.15s ease;
            `}>
              {sourceLabel}
            </div>
          )
        })()}

        {/* 2. Buffer Distance */}
        <div css={[sectionStyle, mobileInputZoomFix]}>
          <h4 css={sectionTitleStyle}>Buffer distance</h4>
          <div css={bufferRowStyle}>
            <TextInput
              css={css`width: 70px;`}
              type='number'
              placeholder='0'
              value={bufferDistance}
              onChange={(e) => setBufferDistance(e.target.value)}
              aria-label='Buffer distance'
            />
            <Select
              css={css`flex: 1; min-width: 0;`}
              value={bufferUnit}
              onChange={(e) => setBufferUnit(e.target.value)}
              aria-label='Buffer unit'
            >
              {bufferUnits.map(u => (
                <Option key={u.value} value={u.value}>{u.label}</Option>
              ))}
            </Select>
            <Button
              size='sm'
              type='default'
              disabled={!bufferDistance}
              onClick={() => setBufferDistance('')}
              aria-label='Reset buffer distance'
              css={css`flex-shrink: 0; white-space: nowrap; line-height: 1.5;`}
            >
              Reset
            </Button>
          </div>
          <span css={css`font-size: 0.6875rem; color: var(--ref-palette-neutral-700);`}>
            Live preview will render on map as distance changes
          </span>
        </div>

        {/* 3. Results Mode — shared component (r025.008) */}
        <div css={sectionStyle}>
          <h4 css={sectionTitleStyle}>{getI18nMessage('resultsMode')}</h4>
          <ResultsModeControl
            value={resultsMode}
            onChange={setResultsMode}
            removeDisabled={!accumulatedRecords || accumulatedRecords.length === 0}
            getI18nMessage={getI18nMessage}
          />
        </div>

        {/* 4. Spatial Relationship — Calcite combobox (searchable by label + description) */}
        <div css={[sectionStyle, mobileInputZoomFix]}>
          <h4 css={sectionTitleStyle}>{getI18nMessage('spatialRelationship')}</h4>
          {spatialMode === 'draw' && !hasDrawnGeometry && (
            <p css={disabledHintStyle}>{getI18nMessage('spatialDrawHint')}</p>
          )}
          {spatialMode === 'operations' && !hasResults && (
            <p css={disabledHintStyle}>{getI18nMessage('spatialNoResults')}</p>
          )}
          <div css={css`display: flex; align-items: center; gap: 4px;`}>
            <calcite-combobox
              ref={spatialRelComboboxRef}
              selectionMode='single'
              placeholder='Search or select a relationship...'
              disabled={!operationsEnabled || undefined}
              scale='m'
              overlayPositioning='fixed'
              label={getI18nMessage('spatialRelationship')}
              css={css`flex: 1;`}
            >
              {spatialRelationships.map((rel) => (
                <calcite-combobox-item
                  key={rel.id}
                  value={rel.id}
                  textLabel={rel.label}
                  description={rel.description}
                  selected={selectedRelationship === rel.id || undefined}
                />
              ))}
            </calcite-combobox>
            {/* r025.069: Info icon — hover shows spatial relationship diagram popover */}
            {selectedRelationship && (
              <div
                onMouseEnter={() => setShowRelInfo(true)}
                onMouseLeave={() => setShowRelInfo(false)}
              >
                <Button size='sm' icon type='tertiary' id='spatial-rel-info-btn'>
                  <InfoOutlined color='var(--sys-color-primary-main)' size='s' />
                </Button>
              </div>
            )}
          {/* r025.069: Spatial relationship info popover — hover-driven, pops above */}
          {selectedRelationship && (
            <calcite-popover
              referenceElement='spatial-rel-info-btn'
              placement='top'
              open={showRelInfo || undefined}
              overlayPositioning='fixed'
              triggerDisabled
              pointerDisabled
              css={css`
                --calcite-popover-border-color: var(--ref-palette-neutral-400);
                --calcite-color-foreground-1: var(--ref-palette-white);
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
              `}
            >
              <div
                css={css`padding: 10px 12px; max-width: 320px;`}
                onMouseEnter={() => setShowRelInfo(true)}
                onMouseLeave={() => setShowRelInfo(false)}
              >
                <h5 css={css`margin: 0 0 6px; font-size: 0.8125rem; font-weight: 600;`}>
                  {spatialRelationships.find(r => r.id === selectedRelationship)?.label ?? 'Spatial Relationship'}
                </h5>
                {spatialRelationshipDiagrams[selectedRelationship]?.svg && (
                  <img
                    src={spatialRelationshipDiagrams[selectedRelationship].svg}
                    alt={spatialRelationships.find(r => r.id === selectedRelationship)?.label ?? ''}
                    css={css`width: 100%; max-width: 288px; margin-bottom: 6px;`}
                  />
                )}
                <p css={css`margin: 0; font-size: 0.8rem; color: var(--ref-palette-neutral-1000); line-height: 1.4;`}>
                  {spatialRelationshipDiagrams[selectedRelationship]?.caption ?? ''}
                </p>
              </div>
            </calcite-popover>
          )}
        </div>

        {/* 5. Target Layers */}
        <div css={[sectionStyle, mobileInputZoomFix]}>
          <h4 css={sectionTitleStyle}>Target layers</h4>
          <AdvancedSelect
            staticValues={targetLayerOptions || []}
            selectedValues={selectedLayers}
            isMultiple
            onChange={(items) => setSelectedLayers(items || [])}
            placeholder='Select target layers...'
            size='sm'
            sortList={false}
            hideBottomTools={false}
            aria-label='Target layers'
          />
        </div>

        {/* 6. Compatibility / buffer warnings (r025.030, r025.040) */}
        {(compatibilityWarning || relationshipWarning) && (
          <div css={css`
            display: flex;
            flex-direction: column;
            gap: 6px;
          `}>
            {compatibilityWarning && (
              <div css={css`
                padding: 8px 12px;
                border-radius: 4px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.35);
                font-size: 0.8125rem;
                color: #92400e;
                line-height: 1.4;
              `}>
                {compatibilityWarning}
              </div>
            )}
            {relationshipWarning && (
              <div css={css`
                padding: 8px 12px;
                border-radius: 4px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.35);
                font-size: 0.8125rem;
                color: #92400e;
                line-height: 1.4;
              `}>
                {relationshipWarning}
              </div>
            )}
          </div>
        )}

        {/* 7. Execute + Reset Buttons (r025.029, r025.056) */}
        <div className='d-flex align-items-center' css={css`gap: 8px; flex-shrink: 0;`}>
          <Button
            id='spatial-execute-btn'
            type='primary'
            disabled={!canExecute || isExecuting}
            onClick={async () => {
              if (!canExecute || !inputGeometry || !selectedRelationship || !onExecuteSpatialQuery) return

              setIsExecuting(true)
              // Dismiss any previous alerts
              if (onDismissQueryErrorAlert) onDismissQueryErrorAlert()
              if (onDismissNoResultsAlert) onDismissNoResultsAlert()

              try {
                // When buffer is active, use the client-side buffered geometry directly
                // so spatial relationships (within, crosses, etc.) evaluate against the
                // actual buffered shape instead of relying on server-side query.distance
                const parsedBuffer = parseFloat(bufferDistance) || 0
                const useBufferedGeometry = parsedBuffer > 0 && bufferedGeometry
                const queryFoundResults = await onExecuteSpatialQuery({
                  inputGeometry: useBufferedGeometry ? bufferedGeometry : inputGeometry,
                  selectedRelationship,
                  selectedLayers,
                  bufferDistance: useBufferedGeometry ? 0 : parsedBuffer,
                  bufferUnit,
                  resultsMode
                })
                // Only reset buffer/draw when results were found — preserve on zero results so user can adjust
                if (queryFoundResults) {
                  setBufferDistance('')
                  // Clear drawn features from map (same cleanup pattern as buffer)
                  if (spatialMode === 'draw') {
                    setDrawnGeometries([])
                    if (getDrawLayerRef.current) {
                      const drawLayer = getDrawLayerRef.current() as __esri.GraphicsLayer
                      drawLayer?.removeAll()
                    }
                  }
                }
              } catch {
                // Error already handled via SET_QUERY_ERROR_ALERT dispatch — buffer preserved
              } finally {
                setIsExecuting(false)
              }
            }}
          >
            {isExecuting ? 'Running...' : getI18nMessage('apply')}
          </Button>
          <Button
            disabled={bufferDistance === '' && drawnGeometries.length === 0 && selectedRelationship === null && selectedLayers.length === 0}
            onClick={() => {
              setBufferDistance('')
              setSelectedRelationship(null)
              setSelectedLayers([])
              setDrawnGeometries([])
              if (getDrawLayerRef.current) {
                const drawLayer = getDrawLayerRef.current() as __esri.GraphicsLayer
                drawLayer?.removeAll()
              }
              if (onDismissQueryErrorAlert) onDismissQueryErrorAlert()
              if (onDismissNoResultsAlert) onDismissNoResultsAlert()
            }}
          >
            {getI18nMessage('reset')}
          </Button>
        </div>

        {/* r025.063: Centered invisible anchor for popover alignment */}
        <div id='spatial-feedback-anchor' css={css`height: 0; width: 100%;`} />

        {/* r025.031: Calcite popover for spatial query errors — same pattern as Query tab */}
        {queryErrorAlert?.show && (
          <calcite-popover
            key={`spatial-error-${queryErrorAlert.timestamp}`}
            referenceElement="spatial-feedback-anchor"
            placement="top"
            flipDisabled={true}
            overlayPositioning="fixed"
            triggerDisabled={true}
            autoClose
            closable
            label={getI18nMessage('queryErrorAlertLabel')}
            open={queryErrorAlert.show}
            onCalcitePopoverClose={() => {
              if (onDismissQueryErrorAlert) onDismissQueryErrorAlert()
            }}
            style={{
              '--calcite-popover-max-size-x': '320px',
              maxWidth: '320px',
              width: '100%',
              '--calcite-color-foreground-1': '#fef2f2'
            } as React.CSSProperties}
          >
            <div style={{ padding: '12px', maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#991b1b' }}>
                <calcite-icon icon="exclamation-mark-triangle" scale="s" style={{ color: '#dc2626' }} />
                Spatial query failed
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
                {queryErrorAlert?.errorMessage || getI18nMessage('queryErrorAlertMessage')}
              </div>
            </div>
          </calcite-popover>
        )}

        {/* r025.034: Calcite popover for zero spatial results — same pattern as Query tab */}
        {noResultsAlert?.show && (
          <calcite-popover
            key={`spatial-no-results-${noResultsAlert.timestamp}`}
            referenceElement="spatial-feedback-anchor"
            placement="top"
            flipDisabled={true}
            overlayPositioning="fixed"
            triggerDisabled={true}
            autoClose
            closable
            label={getI18nMessage('noResultsAlertLabel')}
            open={noResultsAlert.show}
            onCalcitePopoverClose={() => {
              if (onDismissNoResultsAlert) onDismissNoResultsAlert()
            }}
            style={{
              '--calcite-popover-max-size-x': '320px',
              maxWidth: '320px',
              width: '100%',
              '--calcite-color-foreground-1': '#fffbeb'
            } as React.CSSProperties}
          >
            <div style={{ padding: '12px', maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#92400e' }}>
                <calcite-icon icon="information" scale="s" style={{ color: '#d97706' }} />
                {getI18nMessage('noResultsAlertTitle')}
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
                {getI18nMessage('noResultsAlertMessage')}
              </div>
            </div>
          </calcite-popover>
        )}

      </div>{/* end scrollable content */}
    </div>
  )
}
