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
 * - r028.100: JimuDraw stays mounted across mode switches so drawn graphics persist
 *   and stay visible on the map (fixes vanished-line / phantom-buffer on Operations<->Draw)
 * - r028.101: Apply passes ALL input geometries (one per type) to executeSpatialQuery
 *   instead of only the highest-dimension part, so a no-buffer mixed-type query no longer
 *   drops the other types ([bufferedGeometry] when buffered, allInputGeometries otherwise)
 * - r028.108: spatial relationship selector hardened to single-select — change handler
 *   collapses to one selection (defends against calcite desync), Apply guards against a
 *   multi/invalid spatialRel reaching the server, and Reset clears the combobox imperatively
 * - r028.118: Draw mode "Also include current results" checkbox (TODO #29) — shown only
 *   once a shape is drawn AND results exist; when on, folds accumulatedRecords geometries
 *   into the draw input so a drawn shape and selected results buffer/query together
 * - r028.119: input-geometry assembly made EVENT-DRIVEN. The r028.118 spread made the
 *   assembly useEffect emit a new array reference on every run; re-running on post-query
 *   accumulatedRecords changes redrew the buffer after it was cleared. allInputGeometries
 *   is now recomputed only on real input events (draw end/edit/clear, toggle, mode change,
 *   smart-default). Draw mode no longer reacts to results; one prop-sync effect remains for
 *   operations mode (results ARE its input). Removed the r028.118 reset useEffect.
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
import { Button, Select, Option, TextInput, Tooltip, AdvancedSelect, Checkbox } from 'jimu-ui'
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
import { createQuerySimpleDebugLogger, EntityStatusType, StatusIndicator, widgetConfigManager } from 'widgets/shared-code/mapsimple-common'
import { useBufferPreview } from '../managers/use-buffer-preview'
import { ResultsModeControl, type ResultsModeValue } from '../components/ResultsModeControl'
import { SpatialModeHelp } from '../components/tab-help'
import { buildAnnouncement } from '../announce-utils'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type Geometry from '@arcgis/core/geometry/Geometry'
/** JSAPI 5.0 exports GeometryUnion from geometry/types; 4.x does not. Cast-only usage. */
type GeometryUnion = any
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapNotesLayer from '@arcgis/core/layers/MapNotesLayer'
import type Graphic from '@arcgis/core/Graphic'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'

const debugLogger = createQuerySimpleDebugLogger()

export type SpatialMode = 'operations' | 'draw'

export interface SpatialTabContentProps {
  activeTab: 'query' | 'spatial' | 'results'
  /** r028.138 TODO #38: announce a context change to the widget's shared SR live region. */
  onAnnounce?: (message: string) => void
  accumulatedRecords?: FeatureDataRecord[]
  onClearResults?: () => void
  mapView?: MapView | SceneView
  jimuMapView?: JimuMapView  // r025.041: Required by JimuDraw for Draw mode
  widgetId: string
  isPanelVisible?: boolean  // r025.013: Buffer preview clear/restore on panel close/open
  targetLayerOptions?: Array<{ value: string | number; label: string }>  // r025.007: Real layers from widget config
  onExecuteSpatialQuery?: (params: {
    inputGeometries: Geometry[]
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

// r028.100: Hide the Draw section in the panel WITHOUT unmounting JimuDraw.
// Keeping JimuDraw mounted across mode switches preserves its draw GraphicsLayer
// (and any drawn graphics), so they survive Operations<->Draw toggles. display:none
// only hides the panel UI; the map draw layer is independent and stays visible.
const drawSectionHiddenStyle = css`
  display: none;
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
  const { activeTab, accumulatedRecords, onClearResults, mapView, jimuMapView, widgetId, isPanelVisible, targetLayerOptions, onExecuteSpatialQuery, queryErrorAlert, onDismissQueryErrorAlert, noResultsAlert, onDismissNoResultsAlert, onAnnounce } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const hasResults = accumulatedRecords && accumulatedRecords.length > 0

  // r027.014: Filter spatial relationships via singleton config
  const allowedRelationshipIds = widgetConfigManager.getSpatialTabRelationships(widgetId)
  const visibleRelationships = allowedRelationshipIds
    ? spatialRelationships.filter(r => allowedRelationshipIds.includes(r.id))
    : spatialRelationships

  // r028.060: SETTINGS log for spatial tab config
  debugLogger.log('SETTINGS', {
    event: 'singletonConfigRead',
    source: 'spatial-tab',
    widgetId,
    spatialTabRelationships: allowedRelationshipIds,
    drawColor: widgetConfigManager.getDrawColor(widgetId),
    bufferColor: widgetConfigManager.getBufferColor(widgetId)
  })

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
  const [drawnGeometries, setDrawnGeometries] = React.useState<Geometry[]>([])
  const hasDrawnGeometry = drawnGeometries.length > 0
  // r028.118: Draw-mode opt-in to fold the current result geometries into the
  // draw input (so a drawn shape AND already-selected results buffer/query together).
  const [includeResultsInput, setIncludeResultsInput] = React.useState(false)
  // r028.119: refs mirror current state so the event-driven input assembly below can
  // read the latest values synchronously, without an effect re-subscribing. spatialMode
  // and the toggle are render-synced; drawnGeometries flows through updateDrawnGeometries.
  const drawnGeometriesRef = React.useRef<Geometry[]>(drawnGeometries)
  const spatialModeRef = React.useRef(spatialMode)
  spatialModeRef.current = spatialMode
  const includeResultsInputRef = React.useRef(includeResultsInput)
  includeResultsInputRef.current = includeResultsInput
  const getDrawLayerRef = React.useRef<(() => GraphicsLayer | MapNotesLayer) | null>(null)
  // r028.100: Hold the JimuDraw Sketch so we can cancel an armed create operation
  // when leaving Draw mode. JimuDraw now stays mounted across modes, and its Sketch
  // keeps capturing map clicks even when the toolbar is hidden — without this a stray
  // click could draw while in Operations mode.
  const drawSketchRef = React.useRef<jimuMap.JimuDrawCreatedDescriptor['sketch'] | null>(null)

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
      const color = widgetConfigManager.getDrawColor(widgetId)
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
  const [allInputGeometries, setAllInputGeometries] = React.useState<Geometry[]>([])

  // Derived single inputGeometry for warnings and query execution (highest dimension type)
  const inputGeometry = React.useMemo<Geometry | null>(() => {
    if (allInputGeometries.length === 0) return null
    if (allInputGeometries.length === 1) return allInputGeometries[0]
    // Mixed types: use highest-dimension geometry for warning evaluation
    const sorted = [...allInputGeometries].sort((a, b) =>
      (GEOM_TYPE_DIMENSION[b.type] || 0) - (GEOM_TYPE_DIMENSION[a.type] || 0)
    )
    return sorted[0]
  }, [allInputGeometries])

  // ── r028.119: Event-driven input-geometry assembly ──
  // Replaces the prior useEffect that watched [drawnGeometries, accumulatedRecords,
  // hasResults, includeResultsInput, spatialMode, ...] and rebuilt allInputGeometries
  // whenever ANY of them changed. That let a post-query accumulatedRecords change emit a
  // NEW array reference and spuriously redraw the buffer (the r028.118 regression): the
  // buffer hook keys on inputGeometries by reference, so a fresh-but-equal array looked
  // like "the input changed." Now allInputGeometries is recomputed only when an actual
  // input event fires — a shape is drawn/edited/cleared, the include-results toggle
  // flips, the mode changes, or (operations mode) the results prop changes.

  // Group raw geometries by type, union within each group (one geometry per type), and
  // publish to allInputGeometries. The seq guard drops an out-of-order async union result.
  const assembleSeqRef = React.useRef(0)
  const assembleInputGeometries = React.useCallback(async (rawGeometries: Geometry[]) => {
    const seq = ++assembleSeqRef.current
    if (!rawGeometries || rawGeometries.length === 0) {
      if (seq === assembleSeqRef.current) setAllInputGeometries([])
      return
    }
    if (rawGeometries.length === 1) {
      if (seq === assembleSeqRef.current) setAllInputGeometries(rawGeometries)
      return
    }
    // r025.041 + r025.050: Group by type, union within each group (unionOperator requires
    // same type) so the spatial query receives one geometry per type (3 points → 1 multipoint).
    try {
      const modules = await loadArcGISJSAPIModules(['esri/geometry/operators/unionOperator'])
      if (seq !== assembleSeqRef.current) return // a newer assemble superseded this one
      const operator: typeof import('@arcgis/core/geometry/operators/unionOperator') = modules[0]

      const byType = new Map<string, Geometry[]>()
      for (const g of rawGeometries) {
        const arr = byType.get(g.type) || []
        arr.push(g)
        byType.set(g.type, arr)
      }

      const unionedParts: Geometry[] = []
      for (const [, geoms] of byType) {
        if (geoms.length === 1) {
          unionedParts.push(geoms[0])
        } else {
          // r027.077: executeMany() typed as GeometryUnion[] in JSAPI 5.0; runtime values
          // are always GeometryUnion members so the cast is safe.
          unionedParts.push(operator.executeMany(geoms as GeometryUnion[]))
        }
      }

      setAllInputGeometries(unionedParts)
      debugLogger.log('TASK', {
        event: 'buffer-input-geometries-grouped',
        widgetId,
        totalGeometries: rawGeometries.length,
        typeGroups: [...byType.entries()].map(([type, geoms]) => ({ type, count: geoms.length })),
        unionedPartCount: unionedParts.length,
        mixedTypes: byType.size > 1,
        timestamp: Date.now()
      })
    } catch (error) {
      debugLogger.log('TASK', {
        event: 'buffer-input-geometry-union-error',
        widgetId,
        error: error?.toString(),
        geometryCount: rawGeometries.length,
        geometryTypes: [...new Set(rawGeometries.map(g => g.type))],
        timestamp: Date.now()
      })
    }
  }, [widgetId])

  // Draw-mode input = drawn shapes, plus the current result geometries when the
  // "Also include current results" toggle is on (and a shape is actually drawn).
  const assembleForDraw = React.useCallback((drawList: Geometry[], includeResults: boolean) => {
    let raw = drawList
    if (includeResults && drawList.length > 0 && accumulatedRecords && accumulatedRecords.length > 0) {
      const resultGeometries = (accumulatedRecords
        .map(r => r.feature?.geometry)
        .filter(Boolean)) as Geometry[]
      raw = drawList.concat(resultGeometries)
    }
    assembleInputGeometries(raw)
  }, [accumulatedRecords, assembleInputGeometries])

  // Operations-mode input = the accumulated result geometries.
  const assembleForOperations = React.useCallback(() => {
    const resultGeometries = (accumulatedRecords
      ?.map(r => r.feature?.geometry)
      .filter(Boolean) || []) as Geometry[]
    assembleInputGeometries(resultGeometries)
  }, [accumulatedRecords, assembleInputGeometries])

  // Single mutation path for drawn geometries: keep state + ref in sync and recompute
  // the draw-mode input from this real change (no effect watching from the outside).
  const updateDrawnGeometries = React.useCallback((next: Geometry[]) => {
    drawnGeometriesRef.current = next
    setDrawnGeometries(next)
    assembleForDraw(next, includeResultsInputRef.current)
  }, [assembleForDraw])

  // The ONE legitimate prop-sync: operations-mode input IS the accumulatedRecords prop,
  // so it must track that prop. Draw mode is deliberately absent here — that decoupling
  // is exactly what stops a post-query results change from touching the draw-mode buffer.
  // Draw + toggle-on is the single cross-case where results feed the draw input.
  React.useEffect(() => {
    if (spatialModeRef.current === 'operations') {
      assembleForOperations()
    } else if (spatialModeRef.current === 'draw' && includeResultsInputRef.current) {
      assembleForDraw(drawnGeometriesRef.current, true)
    }
  }, [accumulatedRecords, assembleForOperations, assembleForDraw])

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
          types[layerId] = (ds.layer as FeatureLayer).geometryType || 'unknown'
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
      // r028.108: calcite single-select can desync and leave more than one chip.
      // Collapse to one selection on every change event: keep calcite's reported value
      // (fall back to the last selected item) and deselect everything else.
      const items: any[] = Array.from(el.selectedItems ?? [])
      const keep = el.value || (items.length ? items[items.length - 1].value : null)
      items.forEach((item) => { if (item.value !== keep) item.selected = false })
      setSelectedRelationship(keep || null)
    }

    el.addEventListener('calciteComboboxChange', handleChange)
    return () => el.removeEventListener('calciteComboboxChange', handleChange)
  }, [])

  const handleModeChange = React.useCallback((mode: SpatialMode) => {
    userHasChosenModeRef.current = true
    spatialModeRef.current = mode
    setSpatialMode(mode)
    // r028.138 TODO #38: announce the mode change to the shared SR live region. The toggle
    // changes the active help inside the tab with no focus event carrying it, so this is the
    // only signal a screen-reader user gets that the help re-targeted.
    onAnnounce?.(buildAnnouncement({ type: 'mode', mode }, getI18nMessage))
    // r028.119: recompute the spatial input for the new mode from this real event
    // (instead of an effect watching spatialMode).
    if (mode === 'draw') {
      assembleForDraw(drawnGeometriesRef.current, includeResultsInputRef.current)
    } else {
      assembleForOperations()
    }
    // r028.100: Drawn graphics now persist AND stay visible on the map in both modes
    // (user preference). JimuDraw stays mounted, so we no longer toggle drawLayer.visible.
    // Disarming the Sketch when leaving Draw mode is handled by the effect below, which
    // also covers the smart-default path that sets spatialMode without calling this.
  }, [assembleForDraw, assembleForOperations, onAnnounce, getI18nMessage])

  // r025.041: JimuDraw callbacks (same pattern as interactive-draw-tool.tsx)
  const handleDrawToolCreated = React.useCallback((descriptor: jimuMap.JimuDrawCreatedDescriptor) => {
    getDrawLayerRef.current = descriptor.getGraphicsLayer
    drawSketchRef.current = descriptor.sketch // r028.100: keep Sketch ref for disarming
  }, [])

  // r028.100: Cancel any active/armed Sketch create operation whenever we leave Draw
  // mode. JimuDraw stays mounted across modes (so drawings persist), but the Sketch
  // keeps listening to map clicks even with its toolbar hidden — without this a stray
  // map click could draw while in Operations mode. Covers both the toggle button
  // (handleModeChange) and the smart-default path that sets spatialMode directly.
  React.useEffect(() => {
    if (spatialMode !== 'draw') {
      try {
        drawSketchRef.current?.cancel()
      } catch {
        // Sketch may be idle or not yet created — safe to ignore
      }
    }
  }, [spatialMode])

  const handleDrawStart = React.useCallback(() => {
    // r025.044: Multi-shape mode — don't clear previous graphics
  }, [])

  const handleDrawEnd = React.useCallback((graphic: Graphic) => {
    if (graphic?.geometry) {
      // r025.044: Accumulate drawn geometries (multi-shape mode)
      // r028.119: route through updateDrawnGeometries (syncs ref + recomputes input)
      const next = [...drawnGeometriesRef.current, graphic.geometry]
      updateDrawnGeometries(next)
      debugLogger.log('TASK', {
        event: 'spatial-draw-end',
        geometryType: graphic.geometry.type,
        widgetId
      })
    }
  }, [updateDrawnGeometries, widgetId])

  // r025.050: Track geometry edits (move, vertex changes, deletions via select tool)
  const handleDrawUpdate = React.useCallback((res: { type: string, graphics: Graphic[] }) => {
    // Rebuild drawnGeometries from all graphics currently on the draw layer.
    // This covers moves, vertex edits, and individual shape deletions.
    // r027.077: Cast to GraphicsLayer (matches the established pattern in
    // this file at lines 571/1031/1053). The factory ref type is the broader
    // union GraphicsLayer | MapNotesLayer; only GraphicsLayer is ever set in
    // practice, and only GraphicsLayer exposes .graphics.
    const drawLayer = getDrawLayerRef.current?.() as GraphicsLayer | undefined
    if (drawLayer) {
      const geometries: Geometry[] = []
      drawLayer.graphics.forEach(g => {
        if (g.geometry) geometries.push(g.geometry)
      })
      updateDrawnGeometries(geometries) // r028.119: syncs ref + recomputes input
      debugLogger.log('TASK', {
        event: 'spatial-draw-updated',
        type: res.type,
        geometryCount: geometries.length,
        widgetId
      })
    }
  }, [updateDrawnGeometries, widgetId])

  const handleDrawCleared = React.useCallback(() => {
    // r028.119: reset the toggle in the actual clear event (this replaces the old
    // reset useEffect), then recompute the now-empty draw input via the mutation path.
    includeResultsInputRef.current = false
    setIncludeResultsInput(false)
    updateDrawnGeometries([])
    debugLogger.log('TASK', {
      event: 'spatial-draw-cleared',
      widgetId
    })
  }, [updateDrawnGeometries, widgetId])

  // Smart default: re-evaluate when user switches TO the Spatial tab
  const prevActiveTabRef = React.useRef(activeTab)
  React.useEffect(() => {
    const wasNotSpatial = prevActiveTabRef.current !== 'spatial'
    const isNowSpatial = activeTab === 'spatial'
    prevActiveTabRef.current = activeTab

    if (wasNotSpatial && isNowSpatial && !userHasChosenModeRef.current) {
      const smartDefault: SpatialMode = hasResults ? 'operations' : 'draw'
      spatialModeRef.current = smartDefault
      setSpatialMode(smartDefault)
      // r028.119: seed the input for the defaulted mode (event = entering the Spatial tab)
      if (smartDefault === 'draw') {
        assembleForDraw(drawnGeometriesRef.current, includeResultsInputRef.current)
      } else {
        assembleForOperations()
      }
      debugLogger.log('TASK', {
        event: 'spatial-smart-default',
        smartDefault,
        hasResults,
        accumulatedCount: accumulatedRecords?.length || 0
      })
    }
  }, [activeTab, hasResults, accumulatedRecords?.length, assembleForDraw, assembleForOperations])

  // r027.024: Scroll the popover anchor into view whenever a no-results or
  // error alert fires. The popover is anchored to the (invisible) feedback
  // anchor inside the scrollable spatial form. On smaller screens with the
  // form scrolled to the top, the popover renders below the fold — the user
  // sees nothing fire when they click Apply. Scrolling the anchor into view
  // guarantees the popover is visible regardless of viewport height.
  React.useEffect(() => {
    if (!noResultsAlert?.show && !queryErrorAlert?.show) return
    const anchor = document.getElementById(`spatial-feedback-anchor-${widgetId}`)
    if (!anchor) return
    // Defer one frame so the popover has time to mount before we scroll
    requestAnimationFrame(() => {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [noResultsAlert?.show, noResultsAlert?.timestamp, queryErrorAlert?.show, queryErrorAlert?.timestamp, widgetId])

  // In Operations mode, operations are enabled when results exist
  // In Draw mode, operations are disabled until a geometry is drawn
  const operationsEnabled = spatialMode === 'operations'
    ? hasResults
    : hasDrawnGeometry

  // Can execute when: operations enabled + relationship selected + at least one layer selected + geometry exists
  const canExecute = operationsEnabled && selectedRelationship && (selectedLayers?.length ?? 0) > 0 && !!inputGeometry

  // r028.136 TAB_HELP_SPEC Phase 4: gates the aria-describedby on the mode buttons so
  // it never points at description spans that SpatialModeHelp is not rendering.
  const tabHelpEnabled = widgetConfigManager.getTabHelpEnabled(widgetId)

  return (
    <div css={containerStyle}>
      {/* Two-way toggle + r028.136 mode help "?" (replaces the r025.061 description line) */}
      <div css={css`display: flex; align-items: center; gap: 4px; margin-bottom: 8px;`}>
        <div css={[toggleGroupStyle, css`flex: 1; margin-bottom: 0;`]} role='group' aria-label='Spatial mode'>
          <button
            css={spatialMode === 'operations' ? toggleActiveStyle : undefined}
            onClick={() => handleModeChange('operations')}
            aria-pressed={spatialMode === 'operations'}
            aria-describedby={tabHelpEnabled ? `${widgetId}-tab-help-desc-operations` : undefined}
            title={getI18nMessage('spatialModeOperationsTitle')}
          >
            {getI18nMessage('spatialModeOperations')}
          </button>
          <button
            css={spatialMode === 'draw' ? toggleActiveStyle : undefined}
            onClick={() => handleModeChange('draw')}
            aria-pressed={spatialMode === 'draw'}
            aria-describedby={tabHelpEnabled ? `${widgetId}-tab-help-desc-draw` : undefined}
            title={getI18nMessage('spatialModeDrawTitle')}
          >
            {getI18nMessage('spatialModeDraw')}
          </button>
        </div>
        <SpatialModeHelp
          widgetId={widgetId}
          spatialMode={spatialMode}
          getI18nMessage={getI18nMessage}
        />
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

        {/* Draw section — JimuDraw stays mounted in BOTH modes (r028.100) so its draw
            GraphicsLayer and any drawn graphics survive Operations<->Draw switches. In
            Operations mode the panel section is hidden via CSS; the map draw layer stays
            visible so drawn shapes remain on the map. */}
        <div css={spatialMode === 'draw' ? sectionStyle : [sectionStyle, drawSectionHiddenStyle]}>
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

        {/* r028.118: Draw mode — fold current results into the draw input. Shown only
            once a shape is drawn AND results exist; reset to off when it hides. */}
        {spatialMode === 'draw' && hasDrawnGeometry && hasResults && (
          <label className='d-flex align-items-center' css={css`
            font-size: 0.8125rem;
            margin: 2px 0 0;
            cursor: pointer;
          `}>
            <Checkbox
              className='mr-2'
              checked={includeResultsInput}
              onChange={(_, checked) => {
                // r028.119: recompute the draw input immediately from this toggle event
                includeResultsInputRef.current = checked
                setIncludeResultsInput(checked)
                assembleForDraw(drawnGeometriesRef.current, checked)
              }}
            />
            {getI18nMessage('spatialIncludeResults').replace('{count}', String(accumulatedRecords.length))}
          </label>
        )}

        {/* 2. Buffer Distance */}
        <div css={[sectionStyle, mobileInputZoomFix]}>
          <h4 css={sectionTitleStyle}>Buffer distance</h4>
          <div css={bufferRowStyle}>
            <TextInput
              css={css`width: 70px;`}
              placeholder='0'
              value={bufferDistance}
              onChange={(e) => setBufferDistance(e.target.value)}
              aria-label='Buffer distance'
              inputMode='numeric'
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
              {visibleRelationships.map((rel) => (
                <calcite-combobox-item
                  key={rel.id}
                  value={rel.id}
                  heading={rel.label}
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
                <Button size='sm' icon type='tertiary' id={`spatial-rel-info-btn-${widgetId}`}>
                  <InfoOutlined color='var(--sys-color-primary-main)' size='s' />
                </Button>
              </div>
            )}
          </div>
          {/* r025.069: Spatial relationship info popover — hover-driven, pops above */}
          {selectedRelationship && (
            <calcite-popover
              referenceElement={`spatial-rel-info-btn-${widgetId}`}
              placement='top'
              open={showRelInfo || undefined}
              overlayPositioning='fixed'
              triggerDisabled
              pointerDisabled
              label='Spatial relationship information'
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
              // r028.108: block a desynced multi/invalid relationship from reaching the
              // server (it rejects 'spatialRel'). Require exactly one known relationship id.
              const relIsValid = !!selectedRelationship && spatialRelationships.some(r => r.id === selectedRelationship)
              if (!canExecute || !inputGeometry || !relIsValid || !onExecuteSpatialQuery) return

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
                // r028.101: Pass ALL input geometries (one per type) so each type is
                // queried and the results combined. The buffered case is already a
                // single unioned polygon covering every part, so it stays one query;
                // the no-buffer case sends the per-type array so mixed types aren't dropped.
                const inputGeometries = useBufferedGeometry ? [bufferedGeometry] : allInputGeometries
                const queryFoundResults = await onExecuteSpatialQuery({
                  inputGeometries,
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
                    // r028.119: route through updateDrawnGeometries so the input (and buffer)
                    // clear too; reset the toggle since the drawing is gone.
                    includeResultsInputRef.current = false
                    setIncludeResultsInput(false)
                    updateDrawnGeometries([])
                    if (getDrawLayerRef.current) {
                      const drawLayer = getDrawLayerRef.current() as GraphicsLayer
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
              // r028.108: declarative deselect (selectedRelationship=null) isn't honored by
              // calcite for desynced chips, so clear the combobox imperatively too.
              const relEl: any = spatialRelComboboxRef.current
              if (relEl) {
                Array.from(relEl.selectedItems ?? []).forEach((item: any) => { item.selected = false })
                try { relEl.value = '' } catch { /* value may be read-only mid-state */ }
              }
              setSelectedLayers([])
              // r028.119: clear the draw input through the single mutation path; reset toggle
              includeResultsInputRef.current = false
              setIncludeResultsInput(false)
              updateDrawnGeometries([])
              if (getDrawLayerRef.current) {
                const drawLayer = getDrawLayerRef.current() as GraphicsLayer
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
        <div id={`spatial-feedback-anchor-${widgetId}`} css={css`height: 0; width: 100%;`} />

        {/* r025.031: Calcite popover for spatial query errors — same pattern as Query tab */}
        {queryErrorAlert?.show && (
          <calcite-popover
            key={`spatial-error-${queryErrorAlert.timestamp}`}
            referenceElement={`spatial-feedback-anchor-${widgetId}`}
            placement="top"
            flipDisabled={true}
            overlayPositioning="fixed"
            triggerDisabled={true}
            autoClose
            closable
            label={getI18nMessage('queryErrorAlertLabel')}
            open={queryErrorAlert.show}
            oncalcitePopoverClose={() => {
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
            referenceElement={`spatial-feedback-anchor-${widgetId}`}
            placement="top"
            flipDisabled={true}
            overlayPositioning="fixed"
            triggerDisabled={true}
            autoClose
            closable
            label={getI18nMessage('noResultsAlertLabel')}
            open={noResultsAlert.show}
            oncalcitePopoverClose={() => {
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
